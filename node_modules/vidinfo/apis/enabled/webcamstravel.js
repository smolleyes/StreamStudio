/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://api.webcams.travel/rest?method=wct.webcams.get_details&devid={:apikey}&webcamid={:id}&format=json',
       regex: /(?:http:\/\/)?(?:.*\.)?webcams\.travel\/webcam\/(\d+)/i,
       needkey: true,
       shortcuts: ['wct','webtra','wtravel'],
};
