//Initializing calls
const createPlaylistModal = new bootstrap.Modal(document.getElementById('addPlaylist'))
const delPlaylistModal = new bootstrap.Modal(document.getElementById('delPlaylist'))
const addSongModal = new bootstrap.Modal(document.getElementById('addSongPlaylist'))
const opsTemplate = '<button class="icon float-end" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg></button><ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="dropdownMenuButton1"><li><a class="dropdown-item" href="javascript:enqueue({id})">Enqueue</a></li><li><a class="dropdown-item" href="javascript:addSong({id}, {name}, {artist})">Add to playlist</a></li><li><a class="dropdown-item" href="javascript:delSong({id})">Remove from playlist</a></li></ul>'
let playlistOpen = false

window.playlist.listAll()

const resize = (transition=false) => {
    container.style.height = `${window.innerHeight - nav.getBoundingClientRect().height}px`
    const pc = document.getElementById("playlist-content")
    const bounds = content.getBoundingClientRect()
    pc.style.width = `${bounds.width}px`
    pc.style.height = `${bounds.height}px`
    transition ? pc.classList.add("playlist-transition") : pc.classList.remove("playlist-transition")
    pc.style.left = `${playlistOpen ? bounds.left : bounds.right}px`
}
resize()

//Event listeners
window.addEventListener("resize", () => resize())

addPlaylist.addEventListener("hidden.bs.modal", () => {
    addName.value = ""
    addImage.value = ""
})

addPlaylist.addEventListener("show.bs.modal", () => document.getElementById("missing-alert").style.visibility = "hidden")
addPlaylist.addEventListener("shown.bs.modal", () => addName.focus())

//Helper functions
const createPlaylist = () => {
    if(addName.value == "" || addImage.value == "") {
        document.getElementById("missing-field").innerText = addName.value == "" ? "name" : "image"
        document.getElementById("missing-alert").style.visibility = "visible"
        return
    }
    window.playlist.create(addName.value, addImage.files[0].path)
    createPlaylistModal.hide()
}

const editPlaylist = (name) => {
    const e = document.getElementById(`${name}-edit`)
    e.readOnly = false
    e.focus()
}

const delPlaylist = (name) => {
    document.getElementById("confirm-delete").innerText = name
    delPlaylistModal.show()
}

const confirmDelete = () => {
    delPlaylistModal.hide()
    const name = document.getElementById("confirm-delete").innerText
    const e = document.getElementById(`${name}-playlist`)
    e.remove()
    window.playlist.delete(name)
}

const openPlaylist = async (playlistContainer) => {
    playlistContainer.style.pointerEvents = "none"
    setTimeout(() => playlistContainer.style.pointerEvents = "", 400)
    playlistOpen = true
    const title = playlistContainer.id.substring(0, playlistContainer.id.indexOf("-playlist"))
    const playlist = await window.playlist.get(title)
    document.getElementById("playlist-title").innerText = title
    document.getElementById("playlist-img").src = playlist.thumbnail
    resize(transition=true)
    insertSongs(playlist.songs)
}

const closePlaylist = () => {
    playlistOpen = false
    resize(transition=true)
}

const insertSongs = (songs) => {
    document.getElementById("song-container").replaceChildren()
    Object.keys(songs).forEach((song, i) => {
        insertSong(songs[song], song, i)
    })
}

const insertSong = (song, songID, i) => {
    let ops = opsTemplate.replaceAll("{id}", `'${songID}'`)
    ops = ops.replace("{name}", `'${song.name}'`)
    ops = ops.replaceAll("{artist}", `'${song.artist}'`)
    const row = document.createElement("tr")
    row.id = songID
    row.setAttribute("class", "song")
    row.innerHTML = `<td class="text-overflow">${i+1}</td><td class="text-overflow">${song.name}</td><td class="text-overflow">${song.artist}</td>` + 
                    `<td class="text-overflow dropdown" style="overflow:visible">${ops}</td>`
    document.getElementById("song-container").appendChild(row)
}

const delSong = (songID) => {
    document.getElementById(songID).remove()
    window.song.remove(songID, document.getElementById("playlist-title").innerText)
}

const addSong = async (songID, name, artist) => {
    document.getElementById("add-song-name").innerText = name
    const submit = document.getElementById("add-song-submit")
    submit.dataset.id = songID
    submit.dataset.name = name
    submit.dataset.artist = artist
    const playlists = await window.playlist.getAll()
    document.getElementById("playlist-select").replaceChildren()
    Object.keys(playlists).forEach(playlist => {
        const op = document.createElement("option")
        op.value = playlist
        op.innerText = playlist
        document.getElementById("playlist-select").appendChild(op)
    })
    addSongModal.show()
}

const confirmAddSong = () => {
    const submit = document.getElementById("add-song-submit")
    const playlist = document.getElementById("playlist-select").value
    window.song.add(submit.dataset.id, submit.dataset.name, submit.dataset.artist, playlist)
}

const enqueue = (songID) => window.song.enqueue(songID)
