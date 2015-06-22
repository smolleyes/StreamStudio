
BitArray
========

[![Build Status](https://secure.travis-ci.org/sorensen/node-bitarray.png)](http://travis-ci.org/sorensen/node-bitarray)

Utility library for dealing with bit / byte arrays and converting between node 
Buffers and bitarrays.  

Usage
-----

```js
var BitArray = require('node-bitarray')
```


Methods
-------

### BitArray

See: `BitArray.factory` for details on instantiation


### BitArray.factory([bits], [length], [asOctet])

Return a new BitArray instance. Added for use in Array.map(), if a buffer is passed 
in, the `asOctet` will always be set to `true`.

* `bits` - 32bit integer, or buffer/array of 32bit integers (optional)
* `length` - zero fill the bitarray to the set length
* `asOctet` - ensure resulting array length is a multiple of 8 (optional, default `false`)

```js
[255, 128].map(BitArray.factory).map(String) // [ '11111111', '00000001' ]
```

### BitArray.parse([bits], [asOctet])

Convert a 32bit integer into a bit array, the `asOctet` will always be set to `true`
if a Buffer is passed in.

* `bits` - 32bit integer, or buffer/array of 32bit integers (optional)
* `asOctet` - ensure resulting array length is a multiple of 8 (optional, default `false`)

```js
BitArray.parse(255) // [1, 1, 1, 1, 1, 1, 1, 1]
```


### BitArray.octet(array)

Zero fill an array until it represents an octet

* `array` - bit array

```js
BitArray.octet([1, 0, 0]) // [1, 0, 0, 0, 0, 0, 0, 0]
```


### BitArray.equals(bitarray, bitarray)

Perform an equality check on two BitArray instances

* `bitarray` - bit array to compare
* `bitarray` - bit array to compare

```js
var a = new BitArray('0101')
  , b = new BitArray('0101')
  , c = new BitArray('10')

BitArray.equals(a, b) // true
BitArray.equals(b, c) // false
```


### BitArray.fromBinary(string)

Create a new instance from a binary string

* `string` - binary string

```js
var bits = BitArray.fromBinary('1001101')
bits.toJSON() // [1, 0, 1, 1, 0, 0, 1]
```


### BitArray.fromOffsets(array)

Create a new instance from a offset positions of set bits

* `string` - binary string

```js
var bits = BitArray.fromOffsets([0, 4, 2, 9])
bits.toJSON() // [1, 0, 1, 0, 1, 0, 0, 0, 0, 1]
```


### BitArray.fromNumber(number)

Create a new instance from a base 10 number

* `number` - base 10 number

**Aliases**: [`fromDecimal`]

```js
var bits = BitArray.fromNumber(15)
bits.toJSON() // [1, 1, 1, 1]
```


### BitArray.fromHexadecimal(string)

Create a new instance from a hexadecimal string, case insensitive.

* `string` - hexadecimal string

**Aliases**: [`fromHex`]

```js
var bits = BitArray.fromHex('Fa')
bits.toJSON() // [0, 1, 0, 1, 1, 1, 1, 1]
```


### BitArray.from32Integer(number)

Create a new instance from a 32bit integer

* `number` - 32bit integer

```js
var bits = BitArray.from32Integer(144)
bits.toJSON() // [1, 0, 0, 1, 0, 0, 0, 0]
```


### BitArray.fromBuffer(buffer)

Create a new instance from a node buffer instance

* `buffer` - node buffer instance

**Aliases**: [`fromRedis`]

```js
var buf = new Buffer([128, 144, 255])
  , bits = BitArray.fromBuffer(buf)

bits.toJSON() // [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
```


### BitArray.and(array1, [array2], [...])

Perform a bitwise `AND` operation on any number of bit arrays

* `...` - any number of bit arrays

**Alias**: [`intersect`]

```js
BitArray.and(
  [ 1, 0, 0, 1, 0, 0, 0, 1 ]
, [ 1, 0, 0, 0, 1, 0, 0, 1 ]
, [ 0, 1, 0, 0, 0, 1, 0, 1 ]
)
//[ 0, 0, 0, 0, 0, 0, 0, 1 ]
```


### BitArray.toOffsets(array)

Find the offset indexes of all set bits

* `array` - bit array

```js
BitArray.toOffsets([0, 0, 1, 0, 1]) // [2, 4]
new BitArray(144).toOffsets()       // [0, 3]
```


### BitArray.toBuffer(bits)

```js
```


### BitArray.toNumber(bits)

Convert an array of bits to a base 10 number

**Alias**: [`toDecimal`]

```js
BitArray.toNumber([1, 0, 1, 1, 0, 1]) // 45
```


### BitArray.toHexadecimal(bits)

Convert an array of bits to a hex string. Results are lowercased.

**Alias**: [`toHex`]

```js
BitArray.toHex([1, 0, 1, 1, 0, 1]) // '2d'
```


### BitArray.or(array1, [array2], [...])

Perform a bitwise `OR` operation on any number of bit arrays

* `...` - any number of bit arrays

**Alias**: [`union`]

```js
BitArray.and(
  [ 1, 0, 0, 1, 0, 0, 0, 1 ]
, [ 1, 0, 0, 0, 1, 0, 0, 1 ]
, [ 0, 1, 0, 0, 0, 1, 0, 1 ]
)
//[ 1, 1, 0, 1, 1, 1, 0, 1 ]
```


### BitArray.xor(array1, [array2], [...])

Perform a bitwise `XOR` operation on any number of bit arrays

* `...` - any number of bit arrays

**Alias**: [`difference`]

```js
BitArray.xor(
  [ 1, 0, 0, 1, 0, 0, 0, 1 ]
, [ 1, 0, 0, 0, 1, 0, 0, 1 ]
, [ 0, 1, 0, 0, 0, 1, 0, 1 ]
)
//[ 0, 1, 0, 1, 1, 1, 0, 1 ]
```


### BitArray.not(array)

Perform a bitwise `NOT` operation on a single array

* `array` - single bit array to flip

**Alias**: [`reverse`]

```js
BitArray.not(
  [ 1, 0, 0, 1, 0, 0, 0, 1 ]
)
//[ 0, 1, 1, 0, 1, 1, 1, 0 ]
```


### BitArray.bitcount(32bit)

Find the cardinality of a bit array, 32bit integer, or buffer of 32bit ints

* `bits` - 32bit integer, buffer of 32bit integers, or bit array

**Alias**: [`count`, `cardinality`, `population`]

```js
BitArray.cardinality(144)              // 2
BitArray.population(128)               // 1
BitArray.count(new Buffer([255, 128])) // 9
BitArray.bitcount([0,1,1,0,1])         // 3
```


### instance.set(index, value)

Set the value of the bit array at the given index / offset

* `index` - offset position to set value
* `value` - bit val (1 / 0)

```js
new BitArray().set(2, 1) // bits: [0, 0, 1]
```


### instance.get(index)

Get the value of the bit array at the given index / offset

* `index` - offset position to get

```js
new BitArray(144).get(3) // 1
```


### instance.fill(offset) 

Zero fill the current bits to the given offset

* `offset` - zero fill the current bits to the given offset

```js
new BitArray().fill(5) // bits: [0, 0, 0, 0, 0, 0]
```


### instance.bitcount()

Get the bitcount of the current bits

**Alias**: [`count`, `cardinality`, `population`]

```js
new BitArray(255).cardinality() // 8
```


### instance.toString()

Get the binary representation of the current bits, can also be used in 
string coercion.

```js
new BitArray(128).toString() // '00000001'
[new BitArray(255)].join('') // '11111111'
```


### instance.valueOf()

Get the base 10 number representing the current bits, can also be used
in number coercion.

**Alias**: [`toNumber`, `toDecimal`]

```js
new BitArray(144).valueOf() // 9
1 + new BitArray(255)       // 256
```


### instance.toJSON()

Get a copy of the current bit array

**Alias**: [`toArray`, `toBits`]

```js
new BitArray(128).toJSON() // [1,0,0,0,0,0,0,0]
```


### instance.toBuffer()

Convert the current bit array to a node Buffer

```js
new BitArray(new Buffer([128, 255])).toBuffer() // <Buffer 80 ff>
```


### instance.toOffsets()

Convert the current bit array to an offset array

```js
new BitArray(new Buffer([128, 255])).toOffsets() // [0, 8, 9, 10, 11, 12, 13, 14, 15]
```


### instance.copy()

Create and return a copy of the current BitArray

**Aliases**: [`clone`]

```js
var bits = new BitArray(255)
  , bits2 = bits.clone()

BitArray.equals(bits, bits2) // true
bits === bits2               // false
```


### instance.reset()

Reset the current bits, if a length was supplied to the constructor it will be used.

**Aliases**: [`clear`]

```js
var bits = new BitArray(144, 16)
bits.toString() // '000000000001001'

```


### instance.equals(bitarray)

Determine if the instance is equal to another instance

* `bitarray` - instance to compare

```js
var a = new BitArray(1)          // [1]
  , b = new BitArray(2)          // [1, 0]
  , c = new BitArray().set(0, 1) // [1]

a.equals(b) // false
a.equals(c) // true
```


### instance.length

Get the length of the current bit array

```js
new BitArray().length           // 0
new BitArray([128, 255]).length // 16
```


Install
-------

With [npm](https://npmjs.org)

```
npm install node-bitarray
```


License
-------

(The MIT License)

Copyright (c) 2013 Beau Sorensen <mail@beausorensen.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
