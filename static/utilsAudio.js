//Controller Icons
const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>'
const pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>'
var stream //Details for currently playing audio

//Event listeners
player.onpause = () => playBtn.innerHTML = playIcon
player.onplay = () => playBtn.innerHTML = pauseIcon
player.ontimeupdate = () => {
    time.value = `${player.currentTime / stream.length * 1000}`
}

//Helper functions
const startSong = (row) => {
    let nextSong = row.nextElementSibling
    while(nextSong){
        window.song.enqueue(nextSong.id)
        nextSong = nextSong.nextElementSibling
    }
    play(row.id)
}

const play = async (id) => {
    stream = await window.song.getStream(id)
    player.src = stream.stream
    player.play()
}