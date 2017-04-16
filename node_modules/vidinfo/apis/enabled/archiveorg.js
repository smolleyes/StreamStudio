/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://archive.org/details/{:id}?output=json',
       regex: /(?:https?:\/\/)?(?:.*\.)?archive\.org\/details\/(.[^\/#\?&]+)/i,
       shortcuts: ['arch','archive'],
};
