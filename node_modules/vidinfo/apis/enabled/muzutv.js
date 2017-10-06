/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Requires xml2json (https://npmjs.org/package/xml2json)
*/
module.exports = {
       url: "http://www.muzu.tv/api/video/details/?muzuid={:apikey}&id={:id}",
       regex: /(?:https?:\/\/)?(?:.*\.)?muzu\.tv\/(?:.+)\/(\d+)/i,
       needkey: true,
       shortcuts: 'muzu',
       type: "xml",
       formatter: function (data, error, cb) {
            if (error || !('rss' in data)) {
               cb({error:true,message:'No results.'},true);
             } else {
               cb(data['rss']['channel']['item'],false);
            };
       },
};
