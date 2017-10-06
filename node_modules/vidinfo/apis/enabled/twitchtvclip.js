/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'https://api.twitch.tv/kraken/videos/c{:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?twitch\.tv\/(?:.+)\/c\/(\d+)/i,
       shortcuts: ['ttvc','tclip'],
};
