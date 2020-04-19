function save(e) {
    e.preventDefault();
    browser.storage.sync.set({
        "key": document.querySelector("#key").value,
        "token": document.querySelector("#token").value
    });
}

function load() {
    function setSettings(data){
        document.querySelector("#key").value = data.key || "";
        document.querySelector("#token").value = data.token || "";
    }

    function onError(err){
        console.log(`Error: ${err}`);
    }

    var setting = browser.storage.sync.get(["key", "token"]);
    setting.then(setSettings, onError);
}

document.addEventListener("DOMContentLoaded", load);
document.querySelector("form").addEventListener("submit", save);
console.log(document.querySelector("form"));

