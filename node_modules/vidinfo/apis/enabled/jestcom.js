/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.jest.com/oembed.json?url={:id}',
       regex: /(?:https?:\/\/)?(?:.*\.)?jest\.com\/embed\/(?:.+)/i,
       fullurl: true,
       shortcuts: 'jest',
};
