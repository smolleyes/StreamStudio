/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Not really a direct video link, but video information nevertheless.
 This uses a 3rd party API. IMDB does not have an API.
 Please see http://mymovieapi.com/#notes for more information.
*/
module.exports = {
       url: 'http://mymovieapi.com/?id={:id}&type=json&plot=full&episode=1&lang=en-US&aka=simple&release=simple',
       regex: /http:\/\/(?:.*\.)?imdb\.com\/title\/(tt(\d+))\/?/i,
       shortcuts: 'imdb',
};
