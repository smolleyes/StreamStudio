var vimeo = require('../index').vimeo;

vimeo('video', '33544767','', function(err,data){
  // Data is Exposed with raw as the whole response, or thumb, username.
  if (err) console.log(err)
  else {
    console.log(data.raw);
    console.log(data.thumb);
    console.log(data.username.name);
  }
});
