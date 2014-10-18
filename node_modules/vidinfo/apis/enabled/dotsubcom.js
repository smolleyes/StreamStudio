/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://dotsub.com/services/oembed?url={:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?dotsub\.com\/view\/(?:.[^\?]+)/i,
       fullurl: true,
       shortcuts: 'dotsub',
};
