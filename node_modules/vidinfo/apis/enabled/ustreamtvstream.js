/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://api.ustream.tv/json/channel/{:id}/getInfo',
       regex: /(?:https?:\/\/)?(?:.*\.)?ustream\.tv\/channel\/(.[^\/]+)/i,
       shortcuts: ['utvs','ustream'],
};
