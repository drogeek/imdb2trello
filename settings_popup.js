import {initializeTrelloView} from "./trello_settings.js";

function saveSettings(e) {
    e.preventDefault();
    browser.storage.sync.set({
        "key": document.querySelector("#key").value,
        "token": document.querySelector("#token").value,
        "username": document.querySelector("#username").value
    });
    loadSettings();
}


function setSettings(data){
    if (data.key === undefined && data.key !== ""){
        console.log("key hasn't been set yet");
    }
    else{
        key = data.key;
    }

    if (data.token === undefined && data.token !== ""){
        console.log("token hasn't been set yet");
    }
    else{
        token = data.token;
    }
    
    if (data.username === undefined && data.token !== ""){
        console.log("username hasn't been set yet");
    }
    else{
        username = data.username;
    }

    if (data.key !== undefined && data.token !== undefined && data.username !== undefined){
        //getTrelloBoard();
        //document.querySelector("#trello_boards").onchange = selectedBoardChanged;
    }
    document.querySelector("#username").value = username;
    document.querySelector("#key").value = key;
    document.querySelector("#token").value = token;
}
function loadSettings() {
    

    function onError(err){
        console.log(`Error: ${err}`);
    }

    var setting = browser.storage.sync.get(["key", "token", "username"]);
    setting.then(setSettings, onError);
    initializeTrelloView(document);

}

document.addEventListener("DOMContentLoaded", loadSettings);
document.querySelector("form").addEventListener("submit", saveSettings);

