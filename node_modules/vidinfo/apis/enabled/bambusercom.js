/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
module.exports = {
       url: 'http://api.bambuser.com/broadcast/{:id}.json?api_key={:apikey}',
       regex: /(?:https?:\/\/)?bambuser\.com\/v\/(\d+)/i,
       needkey: true,
       shortcuts: ['bam','bambuser'],
};
