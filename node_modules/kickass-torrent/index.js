var getJson=require('load-json')
var BASE_URL='http://kickass.to'

/**
 * {String|Object} query string or options f.x {}
 * avaliable options are any url options that kickass.to accepts
 * f.x. {field:'seeders', order:'desc', q: 'test',page: 2}
 * http://kickass.to/json.php?q=test&field=seeders&order=desc&page=2
 */
module.exports=function(options, callback){
    if(typeof options==='string')
        options={q: options}
    if(!options.q)
        return callback(new Error('Search term "q" must be defined'))
    var url=(options.url || BASE_URL) + '/json.php';
    getJson(url, options, function(e, response){
        if(e)
            return callback(e)
        callback(null, response)
    })
}
