const { app, BrowserWindow, ipcMain } = require("electron")
const song = require("./song")
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
        keys = []
        save = {
            playlists: {}
        }
        write(save)
    }
    song.init(save.keys)
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
    /*******Playlist API*******/
    ipcMain.handle("getPlaylistData", (e, name) => save.playlists[name])
    ipcMain.handle("getAllPlaylists", () => save.playlists)
    ipcMain.handle("createPlaylist", (e, args) => {
        if(save.playlists.hasOwnProperty(args[0])) return null
        save.playlists[args[0]] = {
            thumbnail: args[1],
            songs: {}
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

    /*******Song API*******/
    ipcMain.handle("removeSong", (e, args) => {
        delete save.playlists[args[1]].songs[args[0]]
        write(save)
    })
    ipcMain.handle("addSong", (e, args) => {
        save.playlists[args[4]].songs[args[0]] = {
            "name": args[1],
            "artist": args[2],
            "thumbnail": args[3]
        }
        write(save)
    })
    ipcMain.handle("enqueue", (e, args) => song.enqueue(args[0], args[1], args[2]))
    ipcMain.handle("nextSong", () => song.next())
    ipcMain.handle("prevSong", () => song.prev())
    ipcMain.handle("searchSong", (e, query) => song.search(query))
    ipcMain.handle("getStream", async (e, songID) => await song.getStream(songID))
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