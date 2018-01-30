/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.ted.com/talks/oembed.json?url={:id}',
       regex: /(?:https?:\/\/)(?:.*\.)?ted\.com\/talks\/(?:.[^\?]+)/i,
       fullurl: true,
       shortcuts: 'ted',
};
