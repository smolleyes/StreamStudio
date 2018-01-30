/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://coub.com/api/oembed.json?url={:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?coub\.com\/(?:view|embed)\/(?:.+)/i,
       fullurl: true,
       shortcuts: 'coub',
};
