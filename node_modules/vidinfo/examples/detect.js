/*
 vidinfo/examples/detect.js

 This file is part of the 'VidInfo' project.
 https://github.com/LouisT/VidInfo
*/
var vidinfo = require('../')();
vidinfo.detect('http://www.dailymotion.com/embed/video/xycczk_top-10-supergroups_music#.UU35k1GNNAs',function (obj) {
   console.log('(detect) dailymotion: '+JSON.stringify(obj)+'\n\n');
});
vidinfo.detect('http://vimeo.com/61969130',function (obj) {
   console.log('(detect) vimeo: '+JSON.stringify(obj)+'\n\n');
});
vidinfo.detect('http://www.youtube.com/watch?v=QK8mJJJvaes',function (obj) {
   console.log('(detect) youtube: '+JSON.stringify(obj)+'\n\n');
});
vidinfo.detect('http://on.aol.com/video/study--comet-caused-mass-extinction-517720327?icid=OnHomepageC1_Img#_videoid=517675925',function (obj) {
   console.log('(detect) onaol: '+JSON.stringify(obj)+'\n\n');
});
vidinfo.detect('http://bambuser.com/v/3453034',function (obj) {
   console.log('(detect) bambuser: '+JSON.stringify(obj)+'\n\n');
},{apikey:'APIKEY'});
vidinfo.detect('http://bambuser.com/v/3453034',function (obj) {
   console.log('(detect/nokey) bambuser: '+JSON.stringify(obj)+'\n\n');
});

// console.log(vidinfo.detect('http://www.youtube.com/watch?v=QK8mJJJvaes'));
