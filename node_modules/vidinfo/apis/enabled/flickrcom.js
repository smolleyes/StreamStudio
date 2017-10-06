/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key={:apikey}&photo_id={:id}&format=json&nojsoncallback=1',
       regex: [/(?:http:\/\/)?(?:.*\.)?flickr\.com\/photos\/(?:.+)\/(\d+)/i,/(?:http:\/\/)?flic\.kr\/p\/(.+)/i],
       needkey: true,
       shortcuts: 'flickr',
};
