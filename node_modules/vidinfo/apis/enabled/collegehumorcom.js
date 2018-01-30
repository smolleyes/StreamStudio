/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.collegehumor.com/oembed.json?url={:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?collegehumor\.com\/video\/(?:.+)/i,
       fullurl: true,
       shortcuts: 'hulu',
};
