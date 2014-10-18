/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://revision3.com/api/oembed/?url={:id}&format=json',
       regex: /(?:http?:\/\/)?(?:.*\.)?revision3\.com\/(?:.[^\/]+)\/(?:.[^\?]+)/i,
       fullurl: true,
       shortcuts: ['revis','revision3'],
};
