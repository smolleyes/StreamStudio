var test = require('tap').test
var deviceType = require('../index.js');

var mobile = [
  "Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03O) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
  ,"Mozilla/5.0 (Android; Mobile; rv:16.0) Gecko/16.0 Firefox/16.0"
  ,"Opera/9.80 (Android 2.3.3; Linux; Opera Mobi/ADR-1111101157; U; es-ES) Presto/2.9.201 Version/11.50"
  ,"Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16"
]

var tablet = [
"Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03S) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19"
,"Mozilla/5.0 (Android; Tablet; rv:16.0) Gecko/16.0 Firefox/16."
];

test("can detect tablets",function(t){
  tablet.forEach(function(ua){
    t.equals(deviceType(ua),"tablet",ua+" should be tablet");
  });
  t.end();
});

test("can detect mobile devices",function(t){
  mobile.forEach(function(ua){
    t.equals(deviceType(ua),"phone",ua+" should be phone");
  });
  t.end();
});





