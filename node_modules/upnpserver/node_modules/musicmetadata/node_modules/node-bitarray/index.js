'use strict';

/*!
 * Module dependencies.
 */

var slice = Array.prototype.slice

/*!
 * Array proxy methods.
 */

var methods = ['concat', 'every', 'filter', 'forEach', 'indexOf', 
, 'join', 'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight'
, 'reverse', 'shift', 'slice', 'some', 'sort', 'splice', 'unshift'
]

/**
 * Utility: Find the longest array or string in argument list
 *
 * @param {...} arrays or strings to check
 * @return {Array} longest array
 * @api private
 */

function longest() {
  var args = slice.call(arguments)
    , len = 0, resp, arg
  for (var i = 0; i < args.length; i++) {
    arg = args[i]
    if (arg.length >= len) {
      len = arg.length
      resp = arg
    }
  }
  return resp
}

/**
 * BitArray constructor
 *
 * @param {Buffer} buffer of 32bit integers
 * @param {Number} set length of bits
 * @return {BitArray} new BitArray instance
 */

function BitArray(x, len, oct) {
  this.__bits = BitArray.parse(x, oct)
  this.__defineGetter__('length', function() {
    return this.__bits.length
  })
  len && this.fill(len)
  this.__len = len
}

/*!
 * Current library version, should match `package.json`
 */

BitArray.VERSION = '0.0.2'

/*!
 * Max length or size for a bit array (2^32 - 1)
 */

BitArray.max = Math.pow(2, 32) - 1

/*!
 * Utilities.
 */

/**
 * Factory method for help with Array.map calls
 *
 * @param {Buffer} buffer of 32bit integers
 * @param {Number} set length of bits
 * @return {BitArray} new BitArray instance
 */

BitArray.factory = function(x, len, oct) {
  return new BitArray(x, len, oct)
}

/**
 * Ensure the given array is in the form of an octet, or, has
 * a length with a multiple of 8, zero fill missing indexes
 *
 * @param {Array} target
 * @return {Array} zero filled octet array
 */

BitArray.octet = function(arr) {
  var len = arr.length
    , fill = len + (8 - len % 8)
  
  if (len !== 0 && len % 8 === 0) {
    return arr
  }
  for (var i = len; i < fill; i++) {
    arr[i] = 0
  }
  return arr
}

/**
 * Cast a 32bit integer or an array or buffer of 32bit integers into a bitmap 
 * array, ensuring that they are a full octet length if specified
 *
 * @param {Number|Array|Buffer} 32bit integer or array or buffer of 32bit ints
 * @param {Boolean} ensure octet
 * @return {Array} bitmap array
 */

BitArray.parse = function(x, oct) {
  var bits = []
    , tmp = x

  if (typeof x === 'undefined') {
    return bits
  }
  // Check for binary string
  if (typeof x === 'string') {
    for (var i = 0; i < x.length; i++) {
      bits.push(+x[i])
    }
    return bits.reverse()
  }
  // Check for single 32bit integer
  if (typeof x === 'number') {
    while (tmp > 0) {
      bits.push(tmp % 2)
      tmp = Math.floor(tmp / 2)
    }
    oct && (bits = BitArray.octet(bits))
    return bits.reverse()
  }
  // Check for direct bit array
  if (Array.isArray(x)) {
    return x
  }
  // Assumed to be array / buffer of 32bit integers
  for (var i = 0; i < x.length; i++) {
    bits = bits.concat(BitArray.parse(x[i], true))
  }
  return bits
}

/**
 * Perform an equality check on two bit arrays, they are equal if
 * all bits are the same
 *
 * @param {BitArray} first
 * @param {BitArray} second
 * @return {Boolean} equal
 */

BitArray.equals = function(a, b) {
  if (a.__bits.length !== b.__bits.length) return false
  for (var i = 0; i < a.__bits.length; i++) {
    if (a.__bits[i] !== b.__bits[i]) return false
  }
  return true
}

/*!
 * Instantiation methods.
 */

/**
 * Create a new BitArray instance from a binary string
 *
 * @param {String} binary data
 * @return {BitArray} new instance
 */

BitArray.fromBinary = function(str) {
  var bits = []
  for (var i = 0; i < str.length; i++) {
    bits.push(+str[i])
  }
  return new BitArray().set(bits.reverse())
}

/**
 * Create a new BitArray instance setting values from offsets
 *
 * @param {Array} offset positions
 * @return {BitArray} new instance
 */

BitArray.fromOffsets = function(offs) {
  var bits = new BitArray()
  for (var i = 0; i < offs.length; i++) {
    bits.set(offs[i], 1)
  }
  return bits
}

/**
 * Create a new BitArray instance converting from a base 10 number
 *
 * @param {Number|String} number value
 * @return {BitArray} new instance
 */

BitArray.fromDecimal =
BitArray.fromNumber = function(num) {
  var bits = [], tmp = +num
  while (tmp > 0) {
    bits.push(tmp % 2)
    tmp = Math.floor(tmp / 2)
  }
  return new BitArray().set(bits)
}

/**
 * Create a new BitArray instance converting from a base 16 number
 *
 * @param {Number|String} hexidecimal value
 * @return {BitArray} new instance
 */

BitArray.fromHex =
BitArray.fromHexadecimal = function(hex) {
  hex = ('' + hex).toLowerCase()
  if (!~(hex).indexOf('0x')) hex = '0x' + hex
  return BitArray.fromDecimal(+hex)
}

/**
 * Create a new BitArray instance from a 32bit integer
 *
 * @param {Number} 32bit integer
 * @return {BitArray} new instance
 */

BitArray.from32Integer = function(num) {
  var bits = []
    , tmp = num
  
  while (tmp > 0) {
    bits.push(tmp % 2)
    tmp = Math.floor(tmp / 2)
  }
  bits = BitArray.octet(bits)
  return new BitArray().set(bits.reverse())
}

/**
 * Create a new BitArray instance from a node Buffer
 *
 * @param {Buffer} buffer of 32bit integers
 * @return {BitArray} new instance
 */

BitArray.fromRedis =
BitArray.fromBuffer = function(buf) {
  var bits = []
  for (var i = 0; i < buf.length; i++) {
    bits = bits.concat(BitArray.from32Integer(buf[i]).toJSON())
  }
  return new BitArray().set(bits)
}

/**
 * Find the offsets of all flipped bits
 *
 * @param {Array} bit array
 * @return {Array} list of offsets
 */

BitArray.toOffsets = function(bits) {
  var offs = []
  for (var i = 0; i < bits.length; i++) {
    bits[i] === 1 && offs.push(i)
  }
  return offs
}

/*!
 * Output methods.
 */

/**
 * Convert a bit array to a node Buffer object
 *
 * @param {Array} bit array
 * @return {Buffer} buffer of 32bit integers
 */

BitArray.toBuffer = function(bits) {
  var buf = [], int32, tmp
  for (var i = 0; i < bits.length; i += 8) {
    int32 = 0
    tmp = bits.slice(i, i + 8)
    for (var k = 0; k < tmp.length; k++) {
      int32 = (int32 * 2) + tmp[k]
    }
    buf.push(int32)
  }
  return new Buffer(buf)
}

/**
 * Convert a bit array into a base 10 number
 *
 * @param {Array} bit array
 * @return {Number} base 10 conversion
 */

BitArray.toNumber = function(bits) {
  var num = 0
  for (var i = 0; i < bits.length; i++) {
    if (bits[i]) num += Math.pow(2, i)
  }
  return num
}

/**
 * Convert a bit array into hexadecimal
 *
 * @param {Array} bit array
 * @return {String} hexadecimal conversion
 */

BitArray.toHex =
BitArray.toHexadecimal = function(bits) {
  return BitArray.toNumber(bits).toString(16)
}

/*!
 * Bitwise operations.
 */

/**
 * Perform a bitwise intersection, `AND` of bit arrays
 *
 * @param {...} any number of bit arrays
 * @return {Array} intersected bit array
 */

BitArray.and =
BitArray.intersect = function() {
  var args = slice.call(arguments)
    , src = longest.apply(null, arguments)
    , len = args.length
    , bits = [], aLen

  for (var i = 0; i < src.length; i++) {
    aLen = args.filter(function(x) {
      return x[i] === 1
    }).length
    bits.push(aLen === len ? 1 : 0)
  }
  return bits
}

/**
 * Perform a bitwise union, `OR` of bit arrays
 *
 * @param {...} any number of bit arrays
 * @return {Array} unioned bit array
 */

BitArray.or =
BitArray.union = function() {
  var args = slice.call(arguments)
    , src = longest.apply(null, args)
    , bits = [], aLen

  for (var i = 0; i < src.length; i++) {
    aLen = args.filter(function(x) {
      return x[i] === 1
    }).length
    bits.push(aLen ? 1 : 0)
  }
  return bits
}

/**
 * Perform a bitwise difference, `XOR` of two bit arrays
 *
 * @param {...} any number of bit arrays
 * @return {Array} difference array
 */

BitArray.xor =
BitArray.difference = function() {
  var args = slice.call(arguments)
    , aLen = args.length
    , src = longest.apply(null, args)
    , bits = [], bLen

  for (var i = 0; i < src.length; i++) {
    var bit = src[i]
    bLen = args.filter(function(x) {
      return x[i] === 1
    }).length
    bits.push(bLen === 1 || bLen === aLen ? 1 : 0)
  }
  return bits
}

/**
 * Perform a bitwise `NOT` operation on a single bit array
 *
 * @param {Array} bit array
 * @return {Array} bit array
 */

BitArray.not = 
BitArray.reverse = function(arr) {
  var bits = []
  for (var i = 0; i < arr.length; i++) {
    bits.push(arr[i] === 1 ? 0 : 1)
  }
  return bits
}

/**
 * Find cardinality from a 32bit integer, a bit array, or a node buffer of 32bit
 * integers, which will buffer 4 octects at a time for performance increase.
 *
 * @param {Number|Array|Buffer} 32bit integer, bitarray, buffered 32bit integers
 * @return {Number} cardinality
 */

BitArray.count =
BitArray.population =
BitArray.bitcount =
BitArray.cardinality = function(x) {
  var val = 0
    , tmp = 0
  // Check for 32bit integer
  if (typeof x === 'number') {
    x -= ((x >> 1) & 0x55555555)
    x = (((x >> 2) & 0x33333333) + (x & 0x33333333))
    x = (((x >> 4) + x) & 0x0f0f0f0f)
    x += (x >> 8)
    x += (x >> 16)
    return(x & 0x0000003f)
  }
  // Check for array of bits
  if (Array.isArray(x)) {
    for (var i = 0; i < x.length; i++) {
      if (x[i]) val += 1
    }
    return val
  }
  // Assumed to be a buffer
  for (var i = 0; i < x.length ; i+=4) {
    tmp = x[i];
    tmp += x[i + 1] << 8
    tmp += x[i + 2] << 16
    tmp += x[i + 3] << 24
    val += BitArray.cardinality(tmp)
  }
  return val
}

/*!
 * Instance methods.
 */

/**
 * Zerofill the current bit array to a given offset
 *
 * @param {Number} offset index
 */

BitArray.prototype.fill = function(idx) {
  while (idx > this.__bits.length) {
    this.__bits.push(0)
  }
  return this
}

/**
 * Copy the current bits into a new BitArray instance
 *
 * @return {BitArray} cloned instance
 */

BitArray.prototype.clone =
BitArray.prototype.copy = function() {
  return new BitArray().set(this.toBits())
}

/**
 * Reset to factory defaults
 */

BitArray.prototype.clear =
BitArray.prototype.reset = function() {
  this.__bits = []
  this.__len && this.fill(this.__len)
  return this
}

/**
 * Perform an equality check against another bit array
 *
 * @param {BitArray} compare
 * @return {Boolean} equal
 */

BitArray.prototype.equals = function(b) {
  return BitArray.equals(this, b)
}

/**
 * Set the bit for a given offset
 *
 * @param {Number} offset index
 * @param {Number} bit value
 */

BitArray.prototype.set = function(idx, val) {
  if (Array.isArray(idx)) {
    this.__bits = idx
    this.__len && this.fill(this.__len)
    return this
  }
  this.fill(idx)
  this.__bits[idx] = val ? 1 : 0
  return this
}

/**
 * Get the bit at a given offset
 *
 * @param {Number} offset index
 * @param {Number} bit value
 */

BitArray.prototype.get = function(idx, val) {
  this.fill(idx)
  return this.__bits[idx]
}

/**
 * Find the cardinality of the current bit array
 *
 * @return {Number} cardinality
 */

BitArray.prototype.count =
BitArray.prototype.population =
BitArray.prototype.bitcount =
BitArray.prototype.cardinality = function() {
  return BitArray.cardinality(this.__bits)
}

/**
 * Find the offsets of all flipped bits
 *
 * @return {Array} list of offsets
 */

BitArray.prototype.toOffsets = function() {
  return BitArray.toOffsets(this.__bits)
}

/**
 * Get the binary value of the current bits
 *
 * @return {String} binary conversion
 */

BitArray.prototype.toString = function() {
  return this.__bits.slice().reverse().join('')
}

/**
 * Get the bitmap array of the current bits
 *
 * @return {Array} bit array
 */

BitArray.prototype.toBits =
BitArray.prototype.toArray =
BitArray.prototype.toJSON = function() {
  return this.__bits.slice()
}

/**
 * Convert the current bit array into a base 10 number
 *
 * @return {Number} base 10 conversion
 */

BitArray.prototype.valueOf =
BitArray.prototype.toNumber = function() {
  return BitArray.toNumber(this.__bits)
}

/**
 * Convert the current bit array into hexadecimal
 *
 * @return {String} hexadecimal conversion
 */

BitArray.prototype.toHex = function() {
  return BitArray.toHex(this.__bits)
}

/**
 * Convert the current bits into a node Buffer
 *
 * @return {Buffer} buffer of 32bit integers
 */

BitArray.prototype.toBuffer = function() {
  return BitArray.toBuffer(this.__bits)
}

/*!
 * Proxy all Array methods to the current bits
 */

methods.forEach(function(method) {
  BitArray.prototype[method] = function() {
    return Array.prototype[method].apply(this.__bits, arguments)
  }
})

/*!
 * Module exports.
 */

module.exports = BitArray
