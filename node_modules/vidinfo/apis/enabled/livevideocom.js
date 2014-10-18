/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 This uses YQL for XML to JSON. This could/should change later. (http://developer.yahoo.com/yql/console/)
 This is experimental! - See README.md
*/
module.exports = {
       url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.livevideo.com"+
            "%2Fapi%2FGetVideoDetails.ashx%3FvideoId%3D{:id}%26developerId%3D{:apikey}'&format=json",
       regex: /(?:http:\/\/)?(?:.*\.)?livevideo\.com\/video(?:\/.+)?\/([A-Z0-9]{32})/i,
       needkey: true,
       shortcuts: ['lvid','lvideo','livevideo'],
       formatter: function (data, error, cb) {
            if (!('results' in data['query'])) {
               cb({error:true,message:'No results.'},true);
             } else {
               cb(data['query']['results'],error);
            };
       },
};
