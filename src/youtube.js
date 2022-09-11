/**
 * Manages interaction with youtube and deciphering "encrypted" stream urls
 */
const axios = require('axios').default;
const searchURL = "https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q={query}&key={API_KEY}";
let keys;
let keyIndex = 0;

exports.init = (apiKeys) => keys = apiKeys

exports.search = async (query) => {
    let url = searchURL.replace("{query}", query)
    url = url.replace("{API_KEY}", keys[keyIndex])
    const res = await axios.get(url)
    if(res.status == 200){
        const data = res.data
        const searchResults = []
        data.items.forEach(e => {
            searchResults.push({
                id: e.id.videoId,
                name: e.snippet.title,
                artist: e.snippet.channelTitle,
                thumbnail: e.snippet.thumbnails.default.url
            })
        })
        return searchResults
    }else{
        rotate_key()
        search()
    }
}

exports.getStream = async (songID) => {
    const url = `https://youtube.com/watch?v=${songID}`
    const res =  await axios.get(url)
    if(res.status == 200){
        const html = res.data
        return await getStreamDetails(html)
    } 
}

const getStreamDetails = async (html) => {
    const raw = html.match(/var ytInitialPlayerResponse = ({.*}}}})/)[0].substring(30)
    const audioInfo = JSON.parse(raw)
    for(var streamObject of audioInfo.streamingData.adaptiveFormats){
        if(streamObject.mimeType.includes("audio/mp4") && streamObject.audioQuality == "AUDIO_QUALITY_MEDIUM"){
            return {
                stream: streamObject.hasOwnProperty("url") ? streamObject.url : await decipherStreamData(html, streamObject.signatureCipher),
                length: parseInt(streamObject.approxDurationMs) / 1000,
                name: audioInfo.videoDetails.title,
                thumb: audioInfo.videoDetails.thumbnail.thumbnails[audioInfo.videoDetails.thumbnail.thumbnails.length - 1].url
            }
        }
    }
}

const decipherStreamData = async (html, signatureCipher) => {
    const regex = /=\"\/s\/.*\/player_ias\.vflset\/en_US\/base.js/ //URL containing script to decode signature cipher
    const url = `https://youtube.com${html.match(regex)[0].substring(2)}`
    const res =  await axios.get(url)
    if(res.status == 200){
        const baseJS = res.data
        const decipherFunc = baseJS.match(/function\(a\){a=a.split\(""\);.*return a.join\(""\)};/)[0]
        const decipherDefinitions = baseJS.match(/var QB={Fl:(.|\n)*[a-zA-Z][a-zA-Z][:]function\(a\){.*}};/)[0]
        eval(decipherDefinitions)
        eval(`var decipherCode = ${decipherFunc}`)
        
        let cipherCode = signatureCipher.match(/s=.*&/)[0]
        cipherCode = decodeURIComponent(cipherCode.substring(2, cipherCode.length - 8))
        cipherCode = decipherCode(cipherCode)

        let streamURL = signatureCipher.match('https.*')[0]
        streamURL = `${decode(streamURL)}&sig=${cipherCode}`
        return streamURL
    }
}

const decode = (url) => {
    while(url.includes("%")){
        url = decodeURIComponent(url)
    }
    return url
}

const rotate_key = () => keyIndex = keyIndex == keys.length ? 0 : keyIndex++ 