/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.nfb.ca/remote/services/oembed/?url={:id}&format=json',
       regex: /(?:http:\/\/)(?:.*\.)?nfb\.ca\/film\/(?:.[^\?]+)/i,
       fullurl: true,
       shortcuts: 'nfb',
};
