var xhr = require('xhr')
  , Json
if (typeof JSON === 'object') Json = JSON
if (!Json) try { Json = require('jsonify') } catch(e) {}
if (!Json) Json = require('json')

module.exports = 
function xhrJSON(url, options) {
  if (typeof url === 'object')
    options = url, url = undefined 
  if (!options)
    options = {}
  if (!options.headers)
    options.headers = {}
  options.headers['content-type'] = 'application/json'
  if ('data' in options) {
    options.data = Json.stringify(options.data)
  }

  return xhr(url, options).then(parse, parseErr)
  function parse(res) {
    res.body = Json.parse(res.body)
    return res
  }
  function parseErr(res) {
    if (res.body) try { parse(res) } catch(e) {}
    throw res
  }
}
