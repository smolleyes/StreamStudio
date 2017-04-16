/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://www.giantbomb.com/api/video/2300-{:id}/?api_key={:apikey}&format=json',
       regex: /(?:https?:\/\/)?(?:.*\.)?giantbomb\.com\/videos\/(?:.+)\/2300-(\d+)/i,
       needkey: true,
       shortcuts: ['gbomb','giantbomb'],
};
