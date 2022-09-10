/**
 *  Manages song library and audio operations not directly related to the audio player itself
 */

const youtube = require("./youtube")
var queue = []
var prioQueue = []
var history = []
var trackingHistoryIndex = -1

exports.init = (keys) => youtube.init(keys)
exports.search = (query) => youtube.search(query) 
exports.getStream = async (songID) => await youtube.getStream(songID)

exports.enqueue = (songID, prio, clear) => {
    if(clear){
        queue = []
        history = []
    }

    if(prio){
        prioQueue.push(songID)
    }else{
        queue.push(songID)
    }
}

exports.next = (priority) => {
    if(trackingHistoryIndex >= 0){
        trackingHistoryIndex++
        if(trackingHistoryIndex >= history.length){
            trackingHistoryIndex = -1
            next()
        }else{
            return history[trackingHistoryIndex]
        }
    }else if(prioQueue.length || queue.length){
        const id = (prioQueue.length && priority) ? prioQueue.shift() : queue.shift()
        history.push(id)
        return id 
    }
}

exports.prev = () => {
    if(history.length > 1){
        if(trackingHistoryIndex == -1){
            trackingHistoryIndex = history.length - 2
            return history[trackingHistoryIndex]
        }else if(trackingHistoryIndex > 0){
            trackingHistoryIndex--
            return history[trackingHistoryIndex]
        }else{
            return history[trackingHistoryIndex]
        }
    }
}

