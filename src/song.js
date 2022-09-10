/**
 *  Manages song library and audio operations not directly related to the audio player itself
 */

const youtube = require("./youtube")
var queue = []
var prioQueue = []
var history = []
var trackingHistoryIndex = -1
var playlistName = ""

exports.init = (keys) => youtube.init(keys)
exports.search = (query) => youtube.search(query) 
exports.getStream = async (songID) => await youtube.getStream(songID)

exports.enqueue = (song, prio, clear, name) => {
    if(name) playlistName = name
    if(clear){
        queue = []
        history = []
    }

    if(prio){
        prioQueue.push(song)
    }else{
        queue.push(song)
    }
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
        const id = (prioQueue.length && priority) ? prioQueue.shift().id : queue.shift().id
        history.push(id)
        return id 
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

exports.getQueue = () => {
    return {
        priority: prioQueue,
        standard: queue,
        name: playlistName
    }
}

