/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://vimeo.com/api/v2/video/{:id}.json',
       regex: /(?:https?:\/\/)?(?:.*\.)?vimeo\.com\/(?:.*#|.*\/videos\/)?(\d+)/i,
       shortcuts: 'vimeo',
};

