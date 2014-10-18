/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://noembed.com/embed?url={:id}',
       regex: /(?:http:\/\/)(?:.*\.)?ted\.com\/talks\/(?:.[^\?]+)/i,
       fullurl: true,
       shortcuts: 'ted',
};
