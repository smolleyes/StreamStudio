/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Not really a direct video link, but video information nevertheless.
 This uses a 3rd party API. IMDB does not have an API.
 Please see http://www.omdbapi.com/ for more information.
*/
module.exports = {
       url: 'http://www.omdbapi.com/?i={:id}&r=json&plot=full&tomatoes=true',
       regex: /http:\/\/(?:.*\.)?imdb\.com\/title\/(tt(\d+))\/?/i,
       shortcuts: 'imdb',
};
