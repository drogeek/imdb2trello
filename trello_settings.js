var BASE_URL = "https://api.trello.com/1";

function reverseMapping(mapping){
    return Object.fromEntries(Object.entries(mapping).map(([key, value]) => [value, key]))
}

function clearHtmlOption(select){
    while(select.firstChild){
        select.removeChild(select.lastChild);
    }
}

function addHtmlOption(select, name, value){
    var option = document.createElement("option");
    option.setAttribute("value", value);
    var text = document.createTextNode(name);
    option.appendChild(text);
    select.appendChild(option);
}


async function getTrelloBoards(username, api_key, token){
    return fetch(`${BASE_URL}/members/${username}/boards?key=${api_key}&token=${token}`)
            .then(response => response.json())
}

function getBoardIdMapping(boards) {
    var board_mapping = {};
    for (var key in boards){
        board_mapping[boards[key].name] = boards[key].shortLink;
    }
    return board_mapping;
}

async function fillTrelloBoardsElement(username, api_key, token, previously_selected_board_id){
    console.log("Filling the trello board list")
    var board_elem = document.querySelector("#trello_boards");
    //clearOption(board_elem);
    const boards = await getTrelloBoards(username, api_key, token);
    const board_mapping = getBoardIdMapping(boards);
    const reversed_board_mapping = reverseMapping(board_mapping)
    Object.entries(board_mapping).forEach(([board_id, board_name]) => {
        addHtmlOption(board_elem, board_id, board_name);
    });
    if (previously_selected_board_id !== undefined && previously_selected_board_id in reversed_board_mapping) {
        console.log("Already stored board id:", reversed_board_mapping[previously_selected_board_id])
        board_elem.value = previously_selected_board_id;
    }
    else{
        console.log("No board id found")
        await browser.storage.sync.set({"board_id": board_elem.value})
    }
}


async function getTrelloLists(board_id, api_key, token) {
    return fetch(`${BASE_URL}/boards/${board_id}/lists/open?key=${api_key}&token=${token}`)
        .then(response => response.json())
}

function getTrelloListsMapping(trello_lists) {
    var mapping = {}
    for (var key in trello_lists){
        mapping[trello_lists[key].name] = trello_lists[key].id;
    }
    return mapping
}

async function fillTrelloListsElement(board_id, api_key, token, previously_selected_list_id){
    console.log("Filling the trello list list")
    var list_elem = document.querySelector("#trello_lists");

    const trello_lists = await getTrelloLists(board_id, api_key, token);
    const trello_lists_mapping = getTrelloListsMapping(trello_lists);
    const reversed_lists_mapping = reverseMapping(trello_lists_mapping);
    Object.entries(trello_lists_mapping).forEach(([list_name, list_id]) => {
        addHtmlOption(list_elem, list_name, list_id);
    })
    if (previously_selected_list_id !== undefined && previously_selected_list_id in reversed_lists_mapping) {
        console.log("Already stored list id:", reversed_lists_mapping[previously_selected_list_id])
        list_elem.value = previously_selected_list_id;
    }
    else{
        console.log("No list id found")
        await browser.storage.sync.set({"list_id": list_elem.value})
    }
}

function fillUpTrelloData(){
    Promise.resolve(browser.storage.sync.get(["key", "token", "username", "board_id", "list_id"])).then(setting => {
        fillTrelloBoardsElement(setting.username, setting.key, setting.token, setting.board_id);
        fillTrelloListsElement(setting.board_id, setting.key, setting.token, setting.list_id);
    });
}

/* exported functions */


export function initializeTrelloView(document){
    fillUpTrelloData();
    document.querySelector("#trello_boards").onchange = selectedBoardChanged;
    document.querySelector("#trello_lists").onchange = selectedListChanged;
}


/* callbacks */
function selectedListChanged(event){
    console.log("selectedListChanged");
    const lists_elem = event.target;
    browser.storage.sync.set({"list_id": lists_elem.value});
}

function selectedBoardChanged(event){
    console.log("selectedBoardChanged");
    const boards_elem = event.target;
    var list_elem = document.querySelector("#trello_lists");
    clearHtmlOption(list_elem);

    Promise.resolve(browser.storage.sync.get(["key", "token", "username"])).then(setting => {
        browser.storage.sync.set({"board_id": boards_elem.value,"list_id": undefined}).then(
            () => { fillTrelloListsElement(boards_elem.value, setting.key, setting.token); }
        )
    });
}