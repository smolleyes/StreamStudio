/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 This uses YQL for XML to JSON. This could/should change later. (http://developer.yahoo.com/yql/console/)
 This is experimental! - See README.md
*/
module.exports = {
       url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'"+
            "http%3A%2F%2Fapi.movieclips.com%2Fv2%2Fvideos%2F{:id}'&format=json",
       regex: /(?:https?:\/\/)?(?:.*\.)?movieclips\.com\/(.[^-]+)/i,
       shortcuts: ['mclips','movieclips'],
       formatter: function (data, error, cb) {
            if (!('results' in data['query'])) {
               cb({error:true,message:'No results.'},true);
             } else {
               cb(data['query']['results'],error);
            };
       },
};
