/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://api.videolog.tv/video/{:id}.json',
       regex: /(?:http:\/\/)?(?:.*\.)?videolog\.tv\/video\.php\?id=(\d+)/i,
       shortcuts: ['vlog','videolog'],
};
