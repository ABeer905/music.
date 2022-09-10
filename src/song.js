/**
 *  Manages song library and audio operations not directly related to the audio player itself
 */

const youtube = require("./youtube")
const priorityQueue = []
var queuedSong
var queueTail

exports.init = (keys) => youtube.init(keys)
exports.search = (query) => youtube.search(query) 
exports.getStream = async (songID) => await youtube.getStream(songID)

exports.enqueue = (songID, deep, clear) => {
    if(queueTail && !clear){
        queueTail.next = {id: songID, next: null, prev: queueTail}
        queueTail = queueTail.next
    }else{
        queuedSong = {id: songID, next: null, prev: null}
        queueTail = queuedSong
    }
}

exports.next = () => {
    if(queuedSong && queuedSong.next){
        const id = queuedSong.id
        queuedSong = queuedSong.next
        return id
    }
}

exports.prev = () => {
    if(queuedSong && queuedSong.prev){
        const id = queuedSong.prev.prev ? queuedSong.prev.prev.id : queuedSong.prev.id
        queuedSong = queuedSong.prev
        console.log(queuedSong.id)
        return id
    }
}

