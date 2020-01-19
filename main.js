const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const DataStore = require("./utils/DataStore");
let updatedTracks = [];

const myStore = new DataStore({
    name: "Music Data"
})
// console.log(app.getPath('userData'));

app.on("ready", () => {

    let mainWindow = new BrowserWindow({
        width: 600,
        height: 600,
        title: "音乐播放器",
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });
    mainWindow.setMenu(null);
    mainWindow.loadFile("./renderer/index.html");
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.send("init-data", {
            tracks: myStore.getTracks(),
            volume: myStore.getVolume()
        });
    });
    
//    mainWindow.webContents.openDevTools();

    let addWindow;
    ipcMain.on("set-volume",(event,args)=>{
        myStore.setVolume(args);
    })
    ipcMain.on("add", (event, args) => {
        addWindow = createAddWindow(500, 400, "添加歌曲", mainWindow);
    });
    ipcMain.on("select-music", (event, args) => {
        dialog.showOpenDialog({
            title: "选择音乐",
            properties: ["openFile", "multiSelections"],
            filters: [{ name: 'music', extensions: ['mp3'] }],
            buttonLabel: "选择"
        }).then(files => {
            if (files) event.sender.send("select-files", files);
        });
    });
    ipcMain.on("add-music", (event, args) => {
        if (args.length <= 0) return;
        updatedTracks = myStore.addTracks(args).getTracks();
        mainWindow.send("init-data", updatedTracks);
        addWindow.close();
    });
    ipcMain.on("delete-music", (event, id) => {
        if (id == null) return;
        updatedTracks = myStore.deleteTracks(id).getTracks();
        mainWindow.send("init-data", updatedTracks);
    });
})

function createAddWindow(width, height, title, parent) {
    let win = new BrowserWindow({
        width,
        height,
        title,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        },
        parent,
        modal: true,
        show: false
    });
    win.setMenu(null);
    win.loadFile("./renderer/add.html");
    win.once("ready-to-show", () => {
        win.show();
    });
    return win;
    // addWindow.webContents.openDevTools();
}