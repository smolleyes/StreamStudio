/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 TODO: A lot... this API is huge, so for now I'm going to just do summery for TV shows and Movies.
*/
module.exports = {
       //   https://api.trakt.tv/{:method}/summary.json/{:apikey}/{:title}/extended
       url: 'https://api.trakt.tv/{:0}/summary.json/{:2}/{:1}/extended',
       regex: /(?:https?:\/\/)?(?:.*\.)?trakt\.tv\/(show|movie)\/([^\/]+)/,
       shortcuts: 'trakt',
       matches: true,
       needkey: true,
};
