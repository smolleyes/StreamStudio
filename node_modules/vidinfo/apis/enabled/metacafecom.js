/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Requires xml2json (https://npmjs.org/package/xml2json)
*/
module.exports = {
       url: "http://www.metacafe.com/api/item/{:id}/",
       regex: /(?:https?:\/\/)?(?:.*\.)?metacafe\.com\/watch\/(\d+)/i,
       shortcuts: ['meta','mcafe','metacafe'],
       type: "xml",
       formatter: function (data, error, cb) {
            if (error || !('rss' in data)) {
               cb({error:true,message:'No results.'},true);
             } else {
               cb(data['rss']['channel']['item'],error);
            };
       },
};
