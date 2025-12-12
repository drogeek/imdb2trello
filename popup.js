
import {initializeTrelloView} from "./trello_settings.js";

document.addEventListener("DOMContentLoaded", async () =>{
    const input_elem = document.getElementById("note");
    const submit_elem = document.getElementById("submit");
    const send_value = () => {
        browser.runtime.sendMessage({
            action: "note_popup",
            note_value: input_elem.value
        });
        window.close();
    }

    input_elem.addEventListener("keydown", (e) =>{
        if (e.key === "Enter"){
            send_value();
        }
    });
    submit_elem.addEventListener("click", send_value);
    input_elem.focus();

    const toggleHeader = document.getElementById("boards_toggle");
    const boardsWrapper = document.getElementById("trello_parameters");

    toggleHeader.addEventListener("click", () => {
        const isOpen = toggleHeader.classList.toggle("open");
        boardsWrapper.style.display = isOpen ? "block" : "none";
    });

    initializeTrelloView(document);


    
});
