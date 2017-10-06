/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'https://api.twitch.tv/kraken/channels/{:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?twitch\.tv\/(.[^\/#]+)/i,
       shortcuts: ['ttvs','tstream'],
};
