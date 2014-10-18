/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 This uses YQL for XML to JSON. This could/should change later. (http://developer.yahoo.com/yql/console/)
 This is experimental! - See README.md
*/
module.exports = {
       url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.muzu.tv"+
            "%2Fapi%2Fvideo%2Fdetails%2F{:id}%3Fmuzuid%3D{:apikey}%26format%3Dxml'&format=json",
       regex: /(?:https?:\/\/)?(?:.*\.)?muzu\.tv\/(?:.+)\/(\d+)/i,
       needkey: true,
       shortcuts: 'muzu',
       formatter: function (data, error, cb) {
            if (!('results' in data['query'])) {
               cb({error:true,message:'No results.'},true);
             } else {
               cb(data['query']['results'],false);
            };
       },
};
