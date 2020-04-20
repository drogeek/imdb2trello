BASE_URL = "https://api.trello.com/1/cards";

//on receiving info about the movie, make a first request to create the trello card, then a second request to add the image to it
browser.runtime.onMessage.addListener( (data, sender, sendResponse) => {
    var setting = browser.storage.sync.get(["key", "token", "list_id"]);
    setting.then(sendRequest.bind(null, data), onError);
    console.log(`${BASE_URL}?idList=${LIST_ID}&key=${KEY}&token=${TOKEN}&name=${data.title}&desc=score:${data.rating_value} rating_nbr:${data.rating_count}`);
});

function onError(error){
    console.error(`Error: ${error}`);
}

function sendRequest(data, setting){
    KEY = setting.key;
    TOKEN = setting.token;
    LIST_ID = setting.list_id;

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

}



function setTabId(tabs){
    console.log("setTabId called");
    console.log(tabs);
    tab_id = tabs[0].id;
    //browser.pageAction.hide(tab_id);
}

browser.pageAction.onClicked.addListener(() => {
        browser.tabs.query({
                currentWindow: true,
                active: true
            }).then((tabs) => {
                browser.tabs.sendMessage(tabs[0].id, "");
                console.log(`clicked, sending a message to ${tabs[0].id}`); 
            }).catch(onError);
     });

