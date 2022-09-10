//Controller Icons
const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
const pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>'
const volHiIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-volume-up-fill" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/><path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/></svg>'
const volLoIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-volume-down-fill" viewBox="0 0 16 16"><path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zm3.025 4a4.486 4.486 0 0 1-1.318 3.182L10 10.475A3.489 3.489 0 0 0 11.025 8 3.49 3.49 0 0 0 10 5.525l.707-.707A4.486 4.486 0 0 1 12.025 8z"/></svg>'
const volMuteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-volume-mute-fill" viewBox="0 0 16 16"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/></svg>'
var stream //Details for currently playing audio
var repeat
var shuffle

//Event listeners
player.onpause = () => playBtn.innerHTML = playIcon
player.onplay = () => playBtn.innerHTML = pauseIcon
let timeDragging = false
player.ontimeupdate = () => {
    if(!timeDragging){
        time.value = `${player.currentTime / stream.length * 1000}`
        timeLo.innerText = timeToStr(player.currentTime)
    }
}
player.onended = async () => {
    if(repeat){
        player.currentTime = 0
        player.play()
    }else{
        next()
    }
}

time.oninput = () => {
    timeDragging = true
    player.muted = true
    player.currentTime = time.value / 1000 * stream.length
    timeLo.innerText = timeToStr(player.currentTime)
}
time.onmouseup = () => {
    timeDragging = false
    player.muted = false
}

volume.oninput = () => {
    player.volume = volume.value / 100
    console.log(volume.value, volume.value > 50)
    if(volume.value > 50){
        volc.firstElementChild.innerHTML = volHiIcon
    }else if(volume.value > 0){
        volc.firstElementChild.innerHTML = volLoIcon
    }else{
        volc.firstElementChild.innerHTML = volMuteIcon
    }
}

repeatBtn.onclick = () => {
    repeat ? repeatBtn.style.color = "" : repeatBtn.style.color = "var(--brand)"
    repeat = !repeat
}

shuffleBtn.onclick = () => {
    shuffle ? shuffleBtn.style.color = "" : shuffleBtn.style.color = "var(--brand)"
    shuffle = !shuffle
}

//Helper functions
const startSong = async (row) => {
    let nextSong = row
    let clear = true
    let name
    if(row.parentNode.id == "song-container"){
        name = document.getElementById("playlist-title").innerText
    }else if(row.parentNode.id == "lt"){
        name = "Search"
    }else if(row.parentNode.id == "st"){
        name = "Saved Songs"
    }

    while(nextSong){
        const song = {
            id: nextSong.id,
            name: nextSong.children[2].innerText,
            artist: nextSong.children[3].innerText,
            thumb: nextSong.children[1].firstElementChild.src
        }
        window.song.enqueue(song, false, clear, name)
        nextSong = nextSong.nextElementSibling
        clear = false
    }
    play(await window.song.next(priority=false))
}

const play = async (id) => {
    stream = await window.song.getStream(id)
    stream["id"] = id
    timeHi.innerText = timeToStr(stream.length)
    preview.src = stream.thumb
    document.getElementById("song-name-highlight").innerText = stream.name
    const mc = document.getElementById("media-controls")
    if(mc.style.display != "flex"){
        mc.style.display = "flex"
        resize()
    }
    buildQueue()
    highlightSong()
    player.src = stream.stream
    player.play()
}

const next = async () => play(await window.song.next())
const prev = async () => play(await window.song.prev())

const timeToStr = (seconds) => {
    const minutes = parseInt(seconds / 60)
    const s = parseInt(seconds % 60)
    return `${minutes < 10 ? `0${minutes}` : minutes}:${s < 10 ? `0${s}` : s}`
}

const highlightSong = () => {
    if(stream){
        const songs = [...st.children, ...lt.children, ...document.getElementById("song-container").children,
                        ...document.getElementById("prio-container").children, ...document.getElementById("q-container").children]
        songs.forEach((song) => {
            song.style.color = song.id == stream.id ? "var(--brand)" : ""
        })
    }
}