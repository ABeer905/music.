//Initializing calls
const createPlaylistModal = new bootstrap.Modal(document.getElementById('addPlaylist'))
const delPlaylistModal = new bootstrap.Modal(document.getElementById('delPlaylist'))
const addSongModal = new bootstrap.Modal(document.getElementById('addSongPlaylist'))
const opsTemplate = '<button class="icon float-end" type="button" onclick="event.stopPropagation()" data-bs-toggle="dropdown" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg></button><ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="dropdownMenuButton1"><li><a class="dropdown-item" href="javascript:enqueue({id}, {name}, {artist}, {thumb})">Enqueue</a></li>{dequeue}<li><a class="dropdown-item" href="javascript:addSong({id}, {name}, {artist}, {thumb})">Add to playlist</a></li><li><a class="dropdown-item" href="javascript:delSong({id})">Remove from playlist</a></li></ul>'
const dequeueOption = '<li><a class="dropdown-item" href="#" onclick="dequeue({i}, this)">Dequeue</a></li>'
let playlistOpen = false
let queueOpen = false

window.playlist.listAll()

const resize = (transition=false) => {
    container.style.height = `${window.innerHeight - nav.getBoundingClientRect().height}px`
    const pc = document.getElementById("playlist-content")
    const pq = document.getElementById("queue-content")
    const sc = document.getElementById("search-content")
    const bounds = content.getBoundingClientRect()
    if(transition){
        pc.classList.add("playlist-transition")
        pq.classList.add("queue-transition")
    }else{
        pc.classList.remove("playlist-transition")
        pq.classList.remove("queue-transition")
    }

    pc.style.width = `${bounds.width}px`
    pc.style.height = `${bounds.height}px`
    pc.style.left = `${playlistOpen ? bounds.left : bounds.right}px`
    sc.style.width = `${bounds.width}px`
    sc.style.height = `${bounds.height}px`
    preview.style.bottom = `${window.innerHeight - document.getElementById("media-controls").getBoundingClientRect().top + 10}px`
    preview.style.left = `${document.getElementById("song-name-highlight").getBoundingClientRect().left}px`
    preview.style.width = `${document.getElementById("song-name-highlight").getBoundingClientRect().width}px`
    pq.style.bottom = `${queueOpen ? window.innerHeight - document.getElementById("media-controls").getBoundingClientRect().top : window.innerHeight - nav.getBoundingClientRect().bottom}px`
    pq.style.width = `${bounds.width}px`
    pq.style.height = `${bounds.height}px`
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
    event.stopPropagation()
    const e = document.getElementById(`${name}-edit`)
    e.readOnly = false
    e.focus()
}

const delPlaylist = (name) => {
    event.stopPropagation()
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
    queueOpen = false
    document.getElementById("search-content").style.display = "none"
    resize(transition=true)
}

const insertSongs = (songs) => {
    document.getElementById("song-container").replaceChildren()
    Object.keys(songs).forEach((song, i) => {
        const html = htmlFromSong(songs[song], song, i)
        document.getElementById("song-container").appendChild(html)
    })
    highlightSong()
}

const htmlFromSong = (song, songID, i, showDequeue=false) => {
    let ops = opsTemplate.replaceAll("{id}", `'${songID}'`)
    ops = ops.replace("{dequeue}", showDequeue ? dequeueOption : "")
    ops = ops.replace("{i}", i)
    ops = ops.replaceAll("{name}", `'${song.name.replaceAll(/(&#39;|')/g, "\\\'")}'`)
    ops = ops.replaceAll("{artist}", `'${song.artist.replaceAll(/(&#39;|')/g, "\\\'")}'`)
    ops = ops.replaceAll("{thumb}", `'${song.thumbnail.replaceAll(/(&#39;|')/g, "\\\'")}'`)

    const row = document.createElement("tr")
    row.id = songID
    row.setAttribute("onclick", "if(event.target.nodeName != 'A')startSong(this)")
    row.setAttribute("class", "song")
    row.innerHTML = `<td class="text-overflow">${i+1}</td>` +
                    `<td><img src="${song.thumbnail}" width="40" height="40"/></td>` + 
                    `<td class="text-overflow">${song.name}</td>` +
                    `<td class="text-overflow">${song.artist}</td>` + 
                    `<td class="text-overflow dropdown" style="overflow:visible">${ops}</td>`
    return row
}

const delSong = (songID) => {
    document.getElementById(songID).remove()
    window.song.remove(songID, document.getElementById("playlist-title").innerText)
}

const addSong = async (songID, name, artist, image) => {
    document.getElementById("add-song-name").innerText = name
    const submit = document.getElementById("add-song-submit")
    submit.dataset.id = songID
    submit.dataset.name = name
    submit.dataset.artist = artist
    submit.dataset.img = image
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
    window.song.add(submit.dataset.id, submit.dataset.name, submit.dataset.artist, submit.dataset.img, playlist)
}

const enqueue = (songID, name, artist, thumb) => window.song.enqueue({
    id: songID,
    name: name,
    artist: artist,
    thumb: thumb
}, true, false)

const dequeue = async (i, node) => {
    const row = node.parentNode.parentNode.parentNode.parentNode
    const priority = document.getElementById("prio-container").children[i] == row
    await window.song.dequeue(i, priority)
    buildQueue()
}

const search = async (event) => {
    const query = searchbar.value.toLowerCase()
    document.getElementById("search-content").style.display =  query == "" ? "none" : "flex"
    const playlists = await window.playlist.getAll()
    let playlistFound = false
    let songFound = false
    let i = 0
    pt.replaceChildren()
    st.replaceChildren()
    Object.keys(playlists).forEach((playlist) => {
        if(playlist.toLowerCase().includes(query)){
            playlistFound = true
            const row = document.createElement("tr")
            row.setAttribute("style", "cursor:pointer")
            row.innerHTML = `<td><img src="${playlists[playlist].thumbnail}" width="48" height="48"/></td><td class="text-overflow w-100">${playlist}</td>`
            pt.appendChild(row)
        }
        const songs = playlists[playlist].songs
        Object.keys(songs).forEach((song) => {
            if(songs[song].name.toLowerCase().includes(query) || songs[song].artist.toLowerCase().includes(query)){
                songFound = true
                const html = htmlFromSong(songs[song], song, i)
                i++
                st.appendChild(html)
            }
        })
    })

    if(!songFound){
        document.getElementById("no-songs").innerText = query
        ns.style.visibility = "visible"
        stParent.style.display = "none"
    }else{
        stParent.style.display = ""
        ns.style.visibility = "hidden"
    }

    if(!playlistFound){
        document.getElementById("no-playlists").innerText = query
        np.style.visibility = "visible"
        ptParent.style.display = "none"
    }else{
        ptParent.style.display = ""
        np.style.visibility = "hidden"
    }
    ltParent.style.display = "none"
    enter.style.display = ""
    if(event.key == "Enter"){
        lt.replaceChildren()
        const songs = await window.song.search(query)
        if(songs.length == 0){
            noLt.innerText = query
            nl.style.visibility = "visible"
            ltParent.style.display = "none"
        }else{
            enter.style.display = "none"
            ltParent.style.display = ""
            nl.style.visibility = "hidden"
        }
        songs.forEach((song, i) => {
            lt.appendChild(htmlFromSong(song, song.id, i))
        })
    }
    highlightSong()
}

const showQueue = () => {
    const pq = document.getElementById("queue-content")
    queueOpen = !queueOpen
    resize(true)
    if(queueOpen) buildQueue()
}

const buildQueue = async () => {
    const queue = await window.song.getQueue()
    document.getElementById("next-spot").innerText = queue.name
    const pq = document.getElementById("prio-container")
    const qc = document.getElementById("q-container")
    pq.replaceChildren()
    qc.replaceChildren()
    queue.priority.forEach((song, i) => {
        pq.appendChild(htmlFromSong({
            name: song.name,
            artist: song.artist,
            thumbnail: song.thumb
        }, song.id, i, showDequeue=true))
    })
    queue.standard.forEach((song, i) => {
        qc.appendChild(htmlFromSong({
            name: song.name,
            artist: song.artist,
            thumbnail: song.thumb
        }, song.id, i, showDequeue=true))
    })
    highlightSong()

    if(pq.children.length > 0){
        npq.style.visibility = "hidden"
        pqt.style.display = ""
    }else{
        npq.style.visibility = "visible"
        pqt.style.display = "none"
    }

    qt.style.display = qc.children.length > 0 ? "" : "none"
}