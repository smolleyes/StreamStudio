'use strict';

var assert = require('assert')
  , ase = assert.strictEqual
  , ade = assert.deepEqual
  , BitArray = require('./index')
  , info = require('./package.json')

describe('BitArray v' + info.version, function() {

  describe('Static methods', function() {

    it('#version', function() {
      ase(info.version, BitArray.VERSION)
    })

    it('#factory()', function() {
      var a = [255, 128].map(BitArray.factory).map(String)
      ase(a[0], '11111111')
      ase(a[1], '00000001')
    })

    it('#octet()', function() {
      var oct = BitArray.octet([])
      ase(oct.length, 8)
      oct.push(1)
      var oct2 = BitArray.octet(oct)
      ase(oct2.length, 16)
    })

    it('#parse()', function() {
      ade(BitArray.parse('100101'), [1,0,1,0,0,1])
      ase(new BitArray(new BitArray(128).toString()).toString(), '00000001')
      ade(BitArray.parse(), [])
      ade(BitArray.parse([1,0]), [1,0])
      ade(BitArray.parse(144), [1,0,0,1,0,0,0,0])
      ade(BitArray.parse(), [])
      ade(BitArray.parse(0), [])
      ade(BitArray.parse(0, true), [0,0,0,0,0,0,0,0])
    })

    it('#equals()', function() {
      var a = new BitArray('00001001')
        , b = new BitArray(144)
        , c = new BitArray([ 1, 0, 0, 1, 0, 0, 0, 0 ])
        , d = new BitArray([ 1, 1, 1, 1, 1, 1, 1, 1 ])
        , e = new BitArray(255)

      ase(BitArray.equals(a, b), true)
      ase(BitArray.equals(a, c), true)
      ase(BitArray.equals(b, c), true)
      ase(BitArray.equals(a, d), false)
      ase(BitArray.equals(b, d), false)
      ase(BitArray.equals(c, e), false)
      ase(BitArray.equals(d, e), true)
    })

    it('#push()', function() {
      var bits = new BitArray()
      bits.push(1)
      bits.push(0)
      bits.push(1)
      ase(bits.pop(), 1)
      ase(bits.pop(), 0)
    })

    it('#fromBinary()', function() {
      ade(BitArray.fromBinary('1010').toJSON(), [0,1,0,1])
    })

    it('#fromOffsets()', function() {
      var offs = [1, 5, 10]
        , ba = BitArray.fromOffsets(offs)
      ase(ba.length, 11)
      ase(ba.toString(), '10000100010')
    })

    it('#fromNumber()', function() {
      var bits = BitArray.fromDecimal(12)
      ase(bits.length, 4)
      ase(bits.toString(), (12).toString(2))
      ade(bits.toJSON(), [0, 0, 1, 1])
      var bits = BitArray.fromNumber(15)
      ade(bits.toJSON(), [1,1,1,1])
    })

    it('#fromHex()', function() {
      var bits = BitArray.fromHex('f0')
      ase(bits.toString(), '11110000')
      var bits = BitArray.fromHex(10)
      ase(bits.toString(), '10000')
      var bits = BitArray.fromHex('Fa')
      ade(bits.toJSON(), [0, 1, 0, 1, 1, 1, 1, 1])
    })

    it('#from32Integer()', function() {
      var bits = BitArray.from32Integer(144)
      ade(bits.toJSON(), [1,0,0,1,0,0,0,0])
      bits.set()
    })

    it('#fromBuffer()', function() {
      var buf = new Buffer([128, 144, 255])
      , bits = BitArray.fromBuffer(buf)
      ade(bits.toJSON(), [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1])
    })

    it('#toOffsets()', function() {
      var offs = BitArray.toOffsets([1, 0, 0, 1])
      ade(offs, [0, 3])
    })

    it('#toBuffer()', function() {
      var buf = BitArray.toBuffer([1,1,1,1,1,1,1,1])
      ase(buf instanceof Buffer, true)
      ase(buf[0], 255)
    })

    it('#toNumber()', function() {
      ase(BitArray.toNumber([1, 0, 1, 1, 0, 1]), 45)
    })
    
    it('#toHex()', function() {
      ase(BitArray.toHex([1, 0, 1, 1, 0, 1]), '2d')
    })

    it('#and()', function() {
      var a = [ 1, 0, 0, 1, 0, 0, 0, 1 ]
      var b = [ 1, 0, 0, 0, 1, 0, 0, 1 ]
      var c = [ 0, 1, 0, 0, 0, 1, 0, 1 ]
      var d = BitArray.and(a, b, c)
      ade(d,  [ 0, 0, 0, 0, 0, 0, 0, 1 ])
    })

    it('#or()', function() {
      var a = [ 1, 0, 0, 1, 0, 0, 0, 1 ]
      var b = [ 1, 0, 0, 0, 1, 0, 0, 1 ]
      var c = [ 0, 1, 0, 0, 0, 1, 0, 1 ]
      var d = BitArray.or(a, b, c)
      ade(d,  [ 1, 1, 0, 1, 1, 1, 0, 1 ])
    })

    it('#xor()', function() {
      var a = [ 1, 0, 0, 1, 0, 0, 0, 1 ]
      var b = [ 1, 0, 0, 0, 1, 0, 0, 1 ]
      var c = [ 0, 1, 0, 0, 0, 1, 0, 1 ]
      var d = BitArray.xor(a, b, c)
      ade(d,  [ 0, 1, 0, 1, 1, 1, 0, 1 ])
    })

    it('#not()', function() {
      var a = [ 1, 0, 0, 1, 0, 0, 0, 1 ]
      var b = BitArray.not(a)
      ade(b,  [ 0, 1, 1, 0, 1, 1, 1, 0])
    })

    it('#bitcount()', function() {
      ase(BitArray.cardinality(144), 2)
      ase(BitArray.count(128), 1)
      ase(BitArray.bitcount(new Buffer([255, 128])), 9)
      ase(BitArray.population([0,1,1,0,1,0]), 3)
    })
  })

  describe('Instance methods', function() {

    it('#fill()', function() {
      var bits = new BitArray()
      ase(bits.length, 0)
      bits.fill(24)
      ase(bits.length, 24)
      var bits = new BitArray(0, 3)
      ase(bits.length, 3)
    })

    it('#clone()', function() {
      var bits = new BitArray().set([1,0,1])
        , bit2 = bits.clone()

      ade(bit2.toJSON(), bits.toJSON())
      ase(BitArray.equals(bits, bit2), true)
      ase(bits == bit2, false)
    })

    it('#clear()', function() {
      var bits = new BitArray(255)
      ase(bits.length, 8)
      bits.clear()
      ase(bits.length, 0)

      var bits = new BitArray(0, 10)
      bits.set(4, 1)
      ase(bits.length, 10)
      bits.reset()
      ase(bits.length, 10)
    })

    it('#equals()', function() {
      var a = new BitArray(1)
        , b = new BitArray(2)
        , c = new BitArray().set(0, 1)

      ase(a.equals(b), false)
      ase(a.equals(c), true)
    })

    it('#set()', function() {
      var bits = new BitArray()
      bits.set(0, 1)
      ase(bits.get(0), 1)
      bits.set(7, 1)
      ase(bits.get(6), 0)
      ase(bits.get(7), 1)
      ade(bits.toJSON(), [1,0,0,0,0,0,0,1])
      ase(bits.length, 8)
    })

    it('#get()', function() {
      var bits = new BitArray(144)
      ase(bits.get(0), 1)
      ase(bits.get(1), 0)
      ase(bits.get(3), 1)
    })

    it('#bitcount()', function() {
      var bits = new BitArray()
      bits.set(0, 1)
      bits.set(3, 0)
      bits.set(200, 1)
      ase(bits.cardinality(), 2)
    })

    it('#toOffsets()', function() {
      var bits = new BitArray(144)
      ade(bits.toOffsets(), [0, 3])
    })

    it('#toString()', function() {
      var bit = new BitArray(new Buffer([128, 144]))
      ase(bit.toString(), '0000100100000001')
      var bit2 = new BitArray(255)
      ase([bit2].join(''), '11111111')
      var bits = new BitArray('0011')
      ase([bits].join(''), '0011')
    })

    it('#toJSON()', function() {
      var bit = new BitArray(new Buffer([128, 144]))
      ade(bit.toJSON(), [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0])
      ase(JSON.stringify(bit), '[1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0]')
      var bit2 = new BitArray(255)
      ade(bit2.toArray(), [1,1,1,1,1,1,1,1])
    })

    it('#valueOf()', function() {
      var bits = new BitArray('1001')
      ase(+bits, 9)
      ase(new BitArray('011001') + new BitArray(new Buffer([255])), 280)

      var bits = new BitArray().set([1, 0, 1, 1])
      ase(bits.toNumber(), 13)
    })

    it('#toHex()', function() {
      var bits = new BitArray(255)
      ase(bits.toHex(), 'ff')

      var bits = new BitArray().set([1, 0, 1, 1])
      ase(bits.toHex(), 'd')
    })

    it('#toBuffer()', function() {
      var bits = new BitArray([0], 8).set([1, 0, 0, 1])
        , buf = bits.toBuffer()
        , bits2 = new BitArray(buf)

      ase(buf instanceof Buffer, true)
      ase(BitArray.equals(bits, bits2), true)
      ase(buf[0], 144)
    })

    it('#length', function() {
      var bits = new BitArray(0, 16)
      ase(bits.__bits[15], 0)
      ase(bits.length, 16)
      ase(bits.toString().length, 16)
      ase(bits.reset().length, 16)
    })
  })
})
