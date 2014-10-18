/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Not really a direct video link, but video information nevertheless.
 This uses a 3rd party API. IMDB does not have an API.
*/
module.exports = {
       url: 'http://imdbapi.org/?id={:id}&type=json&plot=full&episode=1&lang=en-US&aka=simple&release=simple',
       regex: /http:\/\/(?:.*\.)?imdb\.com\/title\/(tt(\d+))\/?/i,
       shortcuts: 'imdb',
};
