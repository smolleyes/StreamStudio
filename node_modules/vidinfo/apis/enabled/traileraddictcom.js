/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Requires xml2json (https://npmjs.org/package/xml2json) 
*/
module.exports = {
       url: "http://simpleapi.traileraddict.com/trailer/{:id}",
       regex: /(?:http:\/\/)?(?:.*\.)?traileraddict\.com\/trailer\/(.+[^\/])/i,
       shortcuts: ['tadd','taddict','traileraddict'],
       type: "xml",
       formatter: function (data, error, cb) {
            if (error || !('trailers' in data)) {
               cb({error:true,message:'No results.'},true);
             } else {
               cb(data['trailers']['trailer'],error);
            };
       },
};
