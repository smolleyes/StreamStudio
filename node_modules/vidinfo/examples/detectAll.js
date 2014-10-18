/*
 vidinfo/examples/detectAll.js

 This file is part of the 'VidInfo' project.
 https://github.com/LouisT/VidInfo
*/
var vidinfo = require('../')();

var string = "This is   a string. http://www.dailymotion.com/embed/video/xycczk_top-10-supergroups_music#.UU35k1GNNAs "+
             "http://vimeo.com/61969130 http://www.youtube.com/watch?v=QK8mJJJvaes http://bambuser.com/v/3453034 --"+
             "  It will scan the entire thing.  http://www.youtube.com/watch?v=QK8mJJJvaes http://www.youtube.com/watch?v=ZRAr354usf8";

vidinfo.detectAll(string,function (obj) {
   console.log('(detectAll) '+JSON.stringify(obj)+'\n\n');
},{keys:{bambusercom:'EXAMPLE-KEY'}});

vidinfo.detectAll(string,function (obj) {
   console.log('(detectAll (nocheck)) '+JSON.stringify(obj)+'\n\n');
},{keys:{bambusercom:'EXAMPLE-KEY'},nocheck:true});
