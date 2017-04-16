/*
 vidinfo/examples/byurl.js

 This file is part of the 'VidInfo' project.
 https://github.com/LouisT/VidInfo
*/
var vidinfo = require('../')();
vidinfo.byURL('http://www.dailymotion.com/embed/video/xycczk_top-10-supergroups_music#.UU35k1GNNAs',function (obj) {
   console.log('(byURL) dailymotion: '+JSON.stringify(obj)+'\n\n');
});
vidinfo.byURL('http://vimeo.com/61969130',function (obj) {
   console.log('(byURL) vimeo: '+JSON.stringify(obj)+'\n\n');
});
vidinfo.byURL('http://www.youtube.com/watch?v=QK8mJJJvaes',function (obj) {
   console.log('(byURL) youtube: '+JSON.stringify(obj)+'\n\n');
});
vidinfo.byURL('http://on.aol.com/video/study--comet-caused-mass-extinction-517720327?icid=OnHomepageC1_Img#_videoid=517675925',function (obj) {
   console.log('(byURL) onaol: '+JSON.stringify(obj)+'\n\n');
});
vidinfo.byURL('http://bambuser.com/v/3453034',function (obj) {
   console.log('(byURL) bambuser: '+JSON.stringify(obj)+'\n\n');
},{apikey:'APIKEY'});
vidinfo.byURL('https://www.flickr.com/photos/94717151@N07/8624747855/',function (obj) {
   console.log('(byURL) flickr: '+JSON.stringify(obj)+'\n\n');
},{apikey:'APIKEY'});
vidinfo.byURL('http://flic.kr/p/e9964e',function (obj) {
   console.log('(byURL) flickr - shorturl: '+JSON.stringify(obj)+'\n\n');
},{apikey:'APIKEY'});
vidinfo.byURL('https://www.facebook.com/photo.php?v=10101580633888836&set=vb.225034700870481&type=3&theater',function (obj) {
   console.log('(byURL) facebook: '+JSON.stringify(obj)+'\n\n');
},{apikey:'ACCESS TOKEN'});
