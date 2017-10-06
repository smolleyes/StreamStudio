/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Requires xml2json (https://npmjs.org/package/xml2json) 
*/
module.exports = {
       url: "http://api.movieclips.com/v2/videos/{:id}",
       regex: /(?:https?:\/\/)?(?:.*\.)?movieclips\.com\/(.[^-]+)/i,
       shortcuts: ['mclips','movieclips'],
       type: "xml",
       formatter: function (data, error, cb) {
            if (error || !('entry' in data)) {
               cb({error:true,message:'No results.'},true);
             } else {
               cb(data['entry'],error);
            };
       },
};
