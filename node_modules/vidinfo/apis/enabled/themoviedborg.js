/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Not really a direct video link, but video information nevertheless.
*/
module.exports = {
       url: 'http://api.themoviedb.org/3/movie/{:id}?api_key={:apikey}',
       regex: /(?:https?:\/\/)?(?:.*\.)?themoviedb\.org\/movie\/(\d+)/i,
       needkey: true,
       shortcuts: ['tdb','tmdb','themoviedb'],
};
