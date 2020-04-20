BASE_URL = "https://api.trello.com/1";

function fillTrelloLists(){
    list = document.querySelector("#trello_lists");
    clearOption(list);
    var r = new XMLHttpRequest();
    r.open('GET', `${BASE_URL}/boards/${board}/lists/open?key=${key}&token=${token}`);
    r.onload = () => {
        var result = JSON.parse(r.response);
        for (var key in result){
            addOption(list, result[key].name, result[key].id);
        }
    };
    r.send(null);
    list.onchange = selectedListChanged;
}

function selectedBoardChanged(e){
    var boards = document.querySelector("#trello_boards");
    browser.storage.sync.set({"board": boards.value});
    board = boards.value;
    getTrelloList();
}

function selectedListChanged(e){
    console.log("selectedListChanged");
    var lists = document.querySelector("#trello_lists");
    console.log(lists.value);
    browser.storage.sync.set({"list_id": lists.value});
    list = lists.value;
}

function getTrelloList(){
    console.log("getTrelloList");
    fillTrelloLists();
    var list_storage = browser.storage.sync.get("list");
    list_storage.then((l) => {
        if (l.list !== undefined){
           list = l.list;
        }
    });
}

function makeOptionDefault(select, value){
    console.log(select.querySelector(`option[value = ${board}]`));
}

function getTrelloBoard(){
    fillBoards();
    var board_storage = browser.storage.sync.get("board");
    board_storage.then((b) => { 
        if (b.board !== undefined){
            board = b.board;
            var osef= document.querySelector("#trello_boards");
            console.log(osef.querySelector("option"));
            console.log(osef.querySelector(`option[value = "f2eGWA9A"]`));
            makeOptionDefault(document.querySelector("#trello_boards"), board);
        }
    });
}

function addOption(select, name, value){
    var option = document.createElement("option");
    option.setAttribute("value", value);
    var text = document.createTextNode(name);
    option.appendChild(text);
    select.appendChild(option);
}

function clearOption(select){
    while (select.firstChild){
        select.removeChild(select.lastChild);
    }
}

function fillBoards(){
    console.log("fillBoards");
    var board = document.querySelector("#trello_boards");
    clearOption(board);
    var r = new XMLHttpRequest();
    r.open('GET', `${BASE_URL}/members/${username}/boards?key=${key}&token=${token}`);
    r.onload = () => {
        result = JSON.parse(r.response);
        for (var key in result){
            addOption(board, result[key].name, result[key].shortLink);
        }
    };
    r.send(null);
}

function saveSettings(e) {
    e.preventDefault();
    browser.storage.sync.set({
        "key": document.querySelector("#key").value,
        "token": document.querySelector("#token").value,
        "username": document.querySelector("#username").value
    });
    loadSettings();
}

function loadSettings() {
    //!\\ we make key, token and username global
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
            getTrelloBoard();
            document.querySelector("#trello_boards").onchange = selectedBoardChanged;
        }
        document.querySelector("#username").value = username;
        document.querySelector("#key").value = key;
        document.querySelector("#token").value = token;
    }

    function onError(err){
        console.log(`Error: ${err}`);
    }

    var setting = browser.storage.sync.get(["key", "token", "username"]);
    setting.then(setSettings, onError);
}

document.addEventListener("DOMContentLoaded", loadSettings);
document.querySelector("form").addEventListener("submit", saveSettings);

