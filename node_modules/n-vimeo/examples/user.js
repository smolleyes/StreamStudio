var api = require('../')
  , user = api.user;

user('brad','albums',function(err,req){
  console.log(err || req);
});
