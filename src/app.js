const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")

const savePath = path.join(__dirname, "save.json")
let fileLock = false
let fileQueue = []

function createWindow (save) {
    const win = new BrowserWindow({
        minWidth: 900,
        minHeight: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })

    registerAPI(save)
    win.maximize()
    win.loadFile(path.join("templates", "index.html"))
    win.webContents.openDevTools()
}

app.whenReady().then(() => {
    let save;
    if(fs.existsSync(savePath)){
        save = require(savePath)
    }else{
        save = {
            playlists: {}
        }
        write(save)
    }
    createWindow(save)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

const registerAPI = (save) => {
    ipcMain.handle("getAllPlaylists", () => save.playlists)
    ipcMain.handle("createPlaylist", (e, args) => {
        if(save.playlists.hasOwnProperty(args[0])) return null
        save.playlists[args[0]] = {
            thumbnail: args[1]
        }
        write(save)
        return save.playlists[args[0]]
    })
    ipcMain.handle("editPlaylist", (e, args) => {
        if(save.playlists.hasOwnProperty(args[1])) return null
        save.playlists[args[1]] = save.playlists[args[0]]
        delete save.playlists[args[0]]
        write(save)
    })
    ipcMain.handle("deletePlaylist", (e, name) => {
        delete save.playlists[name]
        write(save)
    })
}

const write = (save) => {
    if(!fileLock){
        fileLock = true
        fs.writeFile(savePath, JSON.stringify(save), e => {
            if(e) console.error(e)
            fileLock = false
            if(fileQueue.length > 0) write(fileQueue.pop())
        })
    }else{
        fileQueue.push(save)
    }
}