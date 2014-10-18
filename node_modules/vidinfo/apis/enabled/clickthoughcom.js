/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.clikthrough.com/services/oembed?url={:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?clikthrough\.com\/theater\/video\/(?:.[^\?]+)/i,
       fullurl: true,
       shortcuts: ['cthrough','clickthrough'],
};
