LIST_ID = "5e81ef932a12620391c2884f";
KEY = null;
TOKEN = null;
BASE_URL = "https://api.trello.com/1/cards";
tab_id = null;

//on receiving info about the movie, make a first request to create the trello card, then a second request to add the image to it
browser.runtime.onMessage.addListener( (data, sender, sendResponse) => {
    console.log(`${BASE_URL}?idList=${LIST_ID}&key=${KEY}&token=${TOKEN}&name=${data.title}&desc=score:${data.rating_value} rating_nbr:${data.rating_count}`);
    var r = new XMLHttpRequest();
    r.open('POST', `${BASE_URL}?idList=${LIST_ID}&key=${KEY}&token=${TOKEN}&name=${data.title}&desc=score:${data.rating_value} rating_nbr:${data.rating_count}`);
    r.onload = () => {
        var cardId = JSON.parse(r.response).id;
        var r2 = new XMLHttpRequest();
        r2.open('POST', `${BASE_URL}/${cardId}/attachments?idList=${LIST_ID}&key=${KEY}&token=${TOKEN}&url=${data.poster_url}`);
        console.log(`${BASE_URL}/${cardId}/attachments?idList=${LIST_ID}&key=${KEY}&token=${TOKEN}&url=${data.poster_url}`);
        r2.onload = () => {
            //TODO: add a notification that everything went well?
            console.log("ok");
        };
        r2.onerror = () => {
            //TODO: add a notification that something went wrong?
            console.log("error during second request");
        };

        r2.send(null);
    };
    r.onerror = () => {
        //TODO: add a notification that something went wrong?
        console.log("error during first request");
    };

    r.send(null);

    console.log(data);
});

function onError(error){
    console.error(`Error: ${error}`);
}

browser.tabs.query({
    currentWindow: true,
    active: true
}).then(setTabId).catch(onError);

var setting = browser.storage.sync.get(["key", "token"]);
setting.then(init, onError);



function setTabId(tabs){
    tab_id = tabs[0].id;
    //browser.pageAction.hide(tab_id);
}

function init(setting) {
    KEY = setting.key;
    TOKEN = setting.token;
    //browser.pageAction.show(tab_id);
    browser.pageAction.onClicked.addListener(() => {
        browser.tabs.sendMessage(tab_id, "");
    });
}

