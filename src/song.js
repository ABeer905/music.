/**
 *  Manages song library and audio operations not directly related to the audio player itself
 */

const youtube = require("./youtube")

exports.init = (keys) => youtube.init(keys)
exports.search = (query) => youtube.search(query) 