/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.screenr.com/api/oembed.json?url={:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?screenr\.com\/(?:.[^\/\?]+)/i,
       fullurl: true,
       shortcuts: ['scrn','screenr'],
};
