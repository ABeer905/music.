/**
 *  Manages song library and audio operations not directly related to the audio player itself
 */

const youtube = require("./youtube")
var queue = []
var prioQueue = []
var shuffleQueue = []
var history = []
var trackingHistoryIndex = -1
var playlistName = ""
var isShuffle = false

exports.init = (keys) => youtube.init(keys)
exports.search = (query) => youtube.search(query) 
exports.getStream = async (songID) => await youtube.getStream(songID)

exports.enqueue = (song, prio, clear, name) => {
    if(name) playlistName = name
    if(clear){
        queue = []
        shuffleQueue = []
        history = []
    }

    if(prio){
        prioQueue.push(song)
    }else{
        queue.push(song)
    }
}

exports.dequeue = (i, priority) => {
    priority ? prioQueue.splice(i, 1) : queue.splice(i, 1)
}

exports.next = (priority) => {
    if(trackingHistoryIndex >= 0){
        trackingHistoryIndex++
        if(trackingHistoryIndex >= history.length){
            trackingHistoryIndex = -1
            next()
        }else{
            return history[trackingHistoryIndex].id
        }
    }else if(prioQueue.length || queue.length){
        var song
        if(prioQueue.length && priority){
            song = prioQueue.shift()
        }else if(isShuffle){
            song = shuffleQueue.shift()
        }else{
            song = queue.shift()
        }
        history.push(song)
        return song.id 
    }
}

exports.prev = () => {
    if(history.length > 1){
        if(trackingHistoryIndex == -1){
            trackingHistoryIndex = history.length - 2
            return history[trackingHistoryIndex].id
        }else if(trackingHistoryIndex > 0){
            trackingHistoryIndex--
            return history[trackingHistoryIndex].id
        }else{
            return history[trackingHistoryIndex].id
        }
    }
}

exports.shuffle = (shouldShuffle) => {
    if(shouldShuffle){
        isShuffle = true
        shuffleQueue = queue.slice(0)
        for (let i = shuffleQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffleQueue[i], shuffleQueue[j]] = [shuffleQueue[j], shuffleQueue[i]];
        }
    }else{
        isShuffle = false
    }
}

exports.getQueue = () => {
    return {
        priority: prioQueue,
        standard: isShuffle ? shuffleQueue : queue,
        name: playlistName
    }
}

