/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://qik.com/api/oembed.json?url={:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?qik\.com\/video\/(?:.+)/i,
       fullurl: true,
       shortcuts: 'qik',
};
