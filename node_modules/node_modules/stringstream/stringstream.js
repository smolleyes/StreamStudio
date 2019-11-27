'use strict'

const util = require('util')
const Transform = require('stream').Transform

module.exports = StringStream

const CHAR_ALIGN = {
  'hex': 2,
  'base64': 4,
}

function StringStream(from, to, options) {
  if (!(this instanceof StringStream)) return new StringStream(from, to, options)

  Transform.call(this, options)

  if (typeof to !== 'string') {
    options = to
    to = from || 'utf8'
    from = null
  }
  this.setEncoding(to)
  this.fromEncoding = from
  this.fromBuffer = ''
  this.fromAlign = CHAR_ALIGN[this.fromEncoding]
}
util.inherits(StringStream, Transform)

StringStream.prototype._transform = function(chunk, encoding, cb) {
  if (!this.fromEncoding) {
    return cb(null, chunk)
  }
  let str = '' + chunk
  if (!this.fromAlign) {
    return cb(null, Buffer.from(str, this.fromEncoding))
  }
  this.fromBuffer += str
  if (this.fromBuffer.length < this.fromAlign) {
    return cb()
  }
  const len = this.fromBuffer.length - (this.fromBuffer.length % this.fromAlign)
  str = this.fromBuffer.slice(0, len)
  this.fromBuffer = this.fromBuffer.slice(len)
  cb(null, Buffer.from(str, this.fromEncoding))
}

StringStream.prototype._flush = function(cb) {
  if (this.fromBuffer) {
    const str = Buffer.from(this.fromBuffer, this.fromEncoding)
    str && this.push(str)
  }
  cb() // Can only supply data to callback from Node.js v7.0 onwards
}
