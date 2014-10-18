/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://api.justin.tv/api/clip/show/{:id}.json',
       regex: /(?:https?:\/\/)?(?:.*\.)?justin\.tv\/(?:.+)\/b\/(\d+)/i,
       shortcuts: ['jtvc','jclip'],
};
