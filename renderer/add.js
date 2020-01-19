const { ipcRenderer } = require("electron");
const path = require("path");
let musicFilesPath = [];

document.getElementById("select").addEventListener("click", e => {
    e.preventDefault();
    ipcRenderer.send("select-music", musicFilesPath);
});

document.getElementById("add").style.display="none";

document.getElementById("add").addEventListener("click", e => {
    e.preventDefault();
    if(musicFilesPath.length<=0) return;
    ipcRenderer.send("add-music",musicFilesPath);
});

ipcRenderer.on("select-files", (event, args) => {
    const list = document.getElementById("panel-list");
    const { filePaths } = args;
    if (filePaths && filePaths.length > 0) {
        musicFilesPath = filePaths;
        list.innerHTML = filePaths.reduce((html, item) => {
            return html += createItem(item);
        }, "");
        document.getElementById("add").style.display="block";
    }
});

function createItem(pt) {
    const name = path.basename(pt);
    return `<li class="list-group-item">${name}</li>`;
}