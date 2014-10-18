/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 This uses YQL for XML to JSON. This could/should change later. (http://developer.yahoo.com/yql/console/)
 This is experimental! - See README.md
*/
module.exports = {
       url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fsimpleapi"+
            ".traileraddict.com%2Ftrailer%2F{:id}'&format=json",
       regex: /(?:http:\/\/)?(?:.*\.)?traileraddict\.com\/trailer\/(.+[^\/])/i,
       shortcuts: ['tadd','taddict','traileraddict'],
       formatter: function (data, error, cb) {
            if (!('results' in data['query'])) {
               cb({error:true,message:'No results.'},true);
             } else {
               cb(data['query']['results'],error);
            };
       },
};
