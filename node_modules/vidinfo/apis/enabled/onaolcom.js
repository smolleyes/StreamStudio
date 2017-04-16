/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://api.5min.com/video/{:id}/info.json',
       regex: /(?:https?:\/\/)?on\.aol\.com\/video\/(?:.+)-(\d+)/i,
       shortcuts: 'onaol',
};
