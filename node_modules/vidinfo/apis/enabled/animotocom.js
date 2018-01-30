/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://animoto.com/oembeds/create/?url={:id}&format=json',
       regex: /(?:https?:\/\/)?(?:.*\.)?animoto\.com\/play\/(?:.[^\?]+)/i,
       fullurl: true,
       shortcuts: ['ani','amimoto'],
};
