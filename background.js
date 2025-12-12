BASE_URL = "https://api.trello.com/1/cards";


function updateActionForTab(tabId, url) {
    const allowed = [
        /https:\/\/.*\.imdb\.com\/.*\/?title\/.*/,
    ];

    const shouldEnable = allowed.some(regex => regex.test(url));

    if (shouldEnable) {
        browser.action.enable(tabId);
    } else {
        browser.action.disable(tabId);
    }
}

// When a tab updates (navigation, reload, URL change)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading" || changeInfo.url) {
        updateActionForTab(tabId, tab.url ?? changeInfo.url ?? "");
    }
});

// When switching tabs
browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);
    updateActionForTab(activeInfo.tabId, tab.url ?? "");
});


//on receiving info about the movie, make a first request to create the trello card, then a second request to add the image to it
browser.runtime.onMessage.addListener( (data) => {
    if (data.action === "send_to_trello") {
        console.log("send to trello");
        var setting = browser.storage.sync.get(["key", "token", "list_id"]);
        setting.then(sendRequest.bind(null, data), onError);
    }
});


browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action === "fetchPage") {
        // IMPORTANT: return the Promise directly
        return fetchImageFromPage(msg.url);
    }
});

// Must be top-level async function
async function fetchImageFromPage(url) {
    // 1. Open hidden tab
    console.log("Opening tab on url ", url)
    const tab = await browser.tabs.create({ url, active: false });

    // 2. Wait for loading
    await new Promise(resolve => {
        const listener = (tabId, changeInfo) => {
            if (tabId === tab.id && changeInfo.status === "complete") {
                browser.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        };
        browser.tabs.onUpdated.addListener(listener);
    });

    // 3. Execute XPath
    const results = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            return document.evaluate(
                '//div[@data-testid="media-viewer"]//img/@src',
                document,
                null,
                XPathResult.STRING_TYPE,
            ).stringValue;
        }
    });

    const imgUrl = results[0].result;

    // 4. Close tab
    await browser.tabs.remove(tab.id);

    // 5. Return the value back to content.js
    return imgUrl;
}

function onError(error){
    console.error(`Error: ${error}`);
}

function generate_trello_card_title(movie_title, movie_rating, personal_note){
    var title = movie_title + ' - IMDb: ' + movie_rating;
    if (personal_note) {
        title += ' (' + personal_note.trim() + ')';
    }
    return title;
}

function sendRequest(data, setting){
    var api_key = setting.key;
    var token = setting.token;
    var list_id = setting.list_id;

    
    var trello_card_title = generate_trello_card_title(data.title, data.rating_value, data.note_value);

    fetch(`${BASE_URL}?idList=${list_id}&key=${api_key}&token=${token}&name=${trello_card_title}&desc=score:${data.rating_value}`, {method: "POST"})
        .then(response => response.json())
        .then(card_info => {
            const card_id = card_info.id;
            fetch(`${BASE_URL}/${card_id}/attachments?idList=${list_id}&key=${api_key}&token=${token}&url=${data.poster_url}`, {method: "POST"});
        }
    );
}

browser.runtime.onMessage.addListener((msg) => {
    if (msg.action === "note_popup"){
        browser.tabs.query({
            currentWindow: true,
            active: true
        }).then((tabs) => {
            const tab = tabs[0];

            if (!tab || !tab.url || !tab.url.startsWith("http")) {
                console.warn("No content script possible on this tab.");
                return;
            }

            browser.tabs.sendMessage(tab.id, msg.note_value).catch(err => {
                console.warn("Content script not available:", err);
            });

        }).catch(onError);
    }
});

