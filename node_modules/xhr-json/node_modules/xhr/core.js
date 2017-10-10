var hop = ({}).hasOwnProperty
  , Promise = require('promise')
  , http = require('http')
  , https = require('https')
  , Url = require('url')

module.exports =
function xhr(url, options) {
  var _options = Url.parse(url)
  _options.agent = false
  _options.method = options.method || 'GET'
  if (options.headers)
    _options.headers = options.headers

  return new Promise(function(resolve, reject) {
    var req = (_options.protocol === 'https:' ? https : http).request(_options, onRes)
    req.on('error', reject)
    if (options.data)
      req.write(options.data)
    req.end()
    function onRes(_res) {
      if (options.encoding)
        _res.setEncoding(options.encoding)

      if (_res.statusCode < 400)
        augment({}, resolve)
      else
        augment(new Error('Server responded with a status of ' + _res.statusCode), reject)

      function augment(res, cb) {
        res.status = _res.statusCode
        res.headers = _res.headers
        res.body = ''
        _res
          .on('data', function(data) { res.body += data })
          .on('end', function() { cb(res) })
          .resume()
      }
    }
  })
}
