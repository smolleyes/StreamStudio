/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.funnyordie.com/oembed.json?url={:id}',
       regex: /(?:http:\/\/)?(?:.*\.)?funnyordie\.com\/(m|videos)\/(?:.[^\?]+)/i,
       fullurl: true,
       shortcuts: ['ford','funnyor','funnyordie'],
};
