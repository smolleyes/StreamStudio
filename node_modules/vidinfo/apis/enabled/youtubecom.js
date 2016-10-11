/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://gdata.youtube.com/feeds/api/videos/{:id}?v=2&alt=json',
       regex: /(?:https?:\/\/)?(?:.*\.)?youtu(?:\.be\/|be\.com\/(?:watch\?.*?v=)?)([^\?#&\s\[\]\(\)]+)/i,
       shortcuts: ['yt','youtube'],
};
