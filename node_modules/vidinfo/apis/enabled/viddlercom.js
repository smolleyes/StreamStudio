/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.viddler.com/oembed/?url={:id}&format=json',
       regex: /(?:http:\/\/)?(?:.*\.)?viddler\.com\/v\/(?:.+)/i,
       fullurl: true,
       shortcuts: ['vidd','viddler'],
};
