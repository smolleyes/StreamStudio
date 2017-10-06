var _xhr = require('./core')

module.exports = function xhr(url, options) {
  if (typeof url === 'object')
    options = url, url = null
  if (!url)
    url = options.url
  if (!options)
    options = {}
  return _xhr(url, options)
}
