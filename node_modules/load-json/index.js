var http=require('http')
var qs=require('querystring')

module.exports=function(url, query, callback){
  if(!url)
    return callback(new Error('"url" must be defined'))
    
  if(query){
    //avoid duplicate '?'
    url=url.substr(-1)==='?' ? url.substr(0,-1) : url
    url+='?'+qs.stringify(query)
  }
  http.get(url, function(res) {
    var body=''

    res.setEncoding('utf-8')
    res.on('data', function(chunk) {
        body+=chunk
    })
    res.on('end', function() {
        var response
        try{
             response=JSON.parse(body)
        }catch(e){
            return callback(e)
        }
        callback(null, response)
    })
    res.on('error', function(e) {
        callback(e)
    })
  }).on('error', function(e) {
      callback(e)
  })
}
