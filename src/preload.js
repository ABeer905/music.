const { contextBridge, ipcRenderer, contentTracing } = require('electron')
const playlistTemplateHTML = '<img src="{src}" width="64" height="64" style="margin-right:1.7rem"/><input id="{name}-edit" class="display-6 flex-grow-1 text-start text-overflow edit-input" value="{name}" readonly/><button class="icon" data-name="{name}" onclick="editPlaylist(this.dataset.name)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg></button><button class="icon" data-name="{name}" onclick="delPlaylist(this.dataset.name)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16"><path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/></svg></button>' 

contextBridge.exposeInMainWorld("playlist", {
    get: (name) => ipcRenderer.invoke("getPlaylistData", name),
    getAll: () => ipcRenderer.invoke("getAllPlaylists"),
    listAll: async () => loadPlaylists(await ipcRenderer.invoke("getAllPlaylists")),
    create: async (name, image) => loadNewPlaylist(name, await ipcRenderer.invoke("createPlaylist", [name, image])),
    delete: (name) => ipcRenderer.invoke("deletePlaylist", name)
})

contextBridge.exposeInMainWorld("song", {
    remove: (songID, playlistName) => ipcRenderer.invoke("removeSong", [songID, playlistName]),
    add: (songID, name, artist, image, playlist) => ipcRenderer.invoke("addSong", [songID, name, artist, image, playlist]),
    enqueue: (songID) => ipcRenderer.invoke("enqueue", songID),
    search: (query) => ipcRenderer.invoke("searchSong", query)
})

const loadPlaylists = (playlists) => {
    Object.keys(playlists).forEach(key => {
        loadNewPlaylist(key, playlists[key])
    })
}

const loadNewPlaylist = (name, playlist) => {
    if(playlist == null) return
    const playlistContainer = document.createElement("div")
    playlistContainer.id = `${name}-playlist`
    playlistContainer.setAttribute("onclick", "openPlaylist(this)")
    playlistContainer.setAttribute("class", "w-75 resize-50 playlist btn btn-secondary bg-dark d-flex align-items-center py-3 rounded-3")
    playlistContainer.setAttribute("style", "border:none;margin-top:1rem")
    
    let playlistContent = playlistTemplateHTML.replace("{src}", playlist.thumbnail)
    playlistContent = playlistContent.replaceAll("{name}", name)
    playlistContainer.innerHTML = playlistContent
    
    content.appendChild(playlistContainer)

    const e = document.getElementById(`${name}-edit`)
    e.addEventListener("blur", () => {
        e.readOnly = true
        ipcRenderer.invoke("editPlaylist", [e.nextElementSibling.dataset.name, e.value])
        e.id = `${e.value}-edit`//update identity 
        playlistContainer.id = `${e.value}-playlist`
        e.nextElementSibling.dataset.name = e.value
        e.nextElementSibling.nextElementSibling.dataset.name = e.value
    })
    e.addEventListener("keyup", (event) => event.key == "Enter" ? e.blur() : null)
}