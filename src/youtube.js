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
    console.log(res.status)
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
        return false
    }
}

const rotate_key = () => keyIndex = keyIndex == keys.length ? 0 : keyIndex++ 