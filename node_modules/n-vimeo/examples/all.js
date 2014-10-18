var vimeo = require('../index').vimeo;

// Throw a error
vimeo('user','numbusLLC','videos',function(err,data){
  console.log(err || data);
});
vimeo('user','brad','videos',function(err,data){
  console.log(err || data);
});