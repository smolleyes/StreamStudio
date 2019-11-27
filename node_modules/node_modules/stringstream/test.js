'use strict'

/* eslint-disable no-return-assign */
const assert = require('assert')
const Readable = require('stream').Readable
const strs = require('.')

const HIGH = new Readable().readableHighWaterMark || 16384

function assertStream(vals, streams, expected) {
  const readable = [new Readable({read() { vals.concat(null).forEach(c => this.push(c)) }})]
  let actual = ''
  readable.concat(streams).reduce((readable, stream) => readable.pipe(stream)).on('data', str => actual += str).on('end', () => {
    assert.strictEqual(actual, expected, `Failed for ${vals}: '${actual}' === '${expected}'`)
    console.log('ok')
  })
}

assertStream(['a'], strs(), 'a')
assertStream(['a'], strs('utf8'), 'a')

assertStream(['a'], strs('hex'), '61')

assertStream(['a'], strs('base64'), 'YQ==')

assertStream(['aa'], strs('utf8'), 'aa')

assertStream(['aa'], strs('hex'), '6161')

assertStream(['aa'], strs('base64'), 'YWE=')
assertStream(['aaa'], strs('base64'), 'YWFh')
assertStream(['aaaa'], strs('base64'), 'YWFhYQ==')
assertStream(['aaaaa'], strs('base64'), 'YWFhYWE=')
assertStream(['aaaaaa'], strs('base64'), 'YWFhYWFh')
assertStream(['abcb'], strs('base64', 'base64'), 'abcb')
assertStream(['abc', 'b'], strs('base64', 'base64'), 'abcb')

assertStream(['ab'], strs('hex', 'hex'), 'ab')
assertStream(['a', 'b'], strs('hex', 'hex'), 'ab')
assertStream(['a', 'b', 'ab'], strs('hex', 'hex'), 'abab')
assertStream(['61'], strs('hex', 'utf8'), 'a')
assertStream(['6', '1'], strs('hex', 'utf8'), 'a')
assertStream(['6', '1', '6', '1'], strs('hex', 'utf8'), 'aa')

assertStream(['abcbb', 'bbb'], strs('base64', 'base64'), 'abcbbbbb')

assertStream(['YQ'], strs('base64', 'utf8'), 'a')
assertStream(['YQ='], strs('base64', 'utf8'), 'a')
assertStream(['YQ=='], strs('base64', 'utf8'), 'a')
assertStream(['YWE'], strs('base64', 'utf8'), 'aa')
assertStream(['YWE='], strs('base64', 'utf8'), 'aa')
assertStream(['YWFh'], strs('base64', 'utf8'), 'aaa')
assertStream(['YWFhYQ'], strs('base64', 'utf8'), 'aaaa')
assertStream(['YWFhYQ='], strs('base64', 'utf8'), 'aaaa')
assertStream(['YWFhYQ=='], strs('base64', 'utf8'), 'aaaa')
assertStream(['YWFhYWE'], strs('base64', 'utf8'), 'aaaaa')
assertStream(['YWFhYWE='], strs('base64', 'utf8'), 'aaaaa')
assertStream(['YWFhYWFh'], strs('base64', 'utf8'), 'aaaaaa')

assertStream([new Array(HIGH).join('a')], strs('utf8'), new Array(HIGH).join('a'))
assertStream([new Array(HIGH + 1).join('a')], strs('utf8'), new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 2).join('a')], strs('utf8'), new Array(HIGH + 2).join('a'))
assertStream([new Array(HIGH).join('a'), 'a'], strs('utf8'), new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 1).join('a'), 'a'], strs('utf8'), new Array(HIGH + 2).join('a'))
assertStream([new Array(HIGH + 2).join('a'), 'a'], strs('utf8'), new Array(HIGH + 3).join('a'))

assertStream([new Array(HIGH + 1).join('a')], strs('hex', 'hex'), new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 3).join('a')], strs('hex', 'hex'), new Array(HIGH + 3).join('a'))
assertStream([new Array(HIGH).join('a'), 'a'], strs('hex', 'hex'), new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 2).join('a'), 'a'], strs('hex', 'hex'), new Array(HIGH + 3).join('a'))

assertStream([new Array(HIGH).join('a')], strs('base64', 'base64'), new Array(HIGH - 1).join('a') + 'Y=')
assertStream([new Array(HIGH + 1).join('a')], strs('base64', 'base64'), new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 2).join('a')], strs('base64', 'base64'), new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 3).join('a')], strs('base64', 'base64'), new Array(HIGH + 2).join('a') + 'Q==')
assertStream([new Array(HIGH + 4).join('a')], strs('base64', 'base64'), new Array(HIGH + 3).join('a') + 'Y=')
assertStream([new Array(HIGH + 5).join('a')], strs('base64', 'base64'), new Array(HIGH + 5).join('a'))
assertStream([new Array(HIGH).join('a'), 'a'], strs('base64', 'base64'), new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 1).join('a'), 'a'], strs('base64', 'base64'), new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 2).join('a'), 'a'], strs('base64', 'base64'), new Array(HIGH + 2).join('a') + 'Q==')
assertStream([new Array(HIGH + 3).join('a'), 'a'], strs('base64', 'base64'), new Array(HIGH + 3).join('a') + 'Y=')
assertStream([new Array(HIGH + 4).join('a'), 'a'], strs('base64', 'base64'), new Array(HIGH + 5).join('a'))

assertStream(['a'], [strs('utf8', 'hex'), strs('hex', 'base64'), strs('base64', 'utf8')], 'a')
assertStream(['a', 'a'], [strs('utf8', 'hex'), strs('hex', 'base64'), strs('base64', 'utf8')], 'aa')
assertStream([new Array(HIGH).join('a')], [strs('utf8', 'hex'), strs('hex', 'base64'), strs('base64', 'utf8')], new Array(HIGH).join('a'))
assertStream([new Array(HIGH + 1).join('a')], [strs('utf8', 'hex'), strs('hex', 'base64'), strs('base64', 'utf8')], new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 2).join('a')], [strs('utf8', 'hex'), strs('hex', 'base64'), strs('base64', 'utf8')], new Array(HIGH + 2).join('a'))
assertStream([new Array(HIGH).join('a'), 'a'], [strs('utf8', 'hex'), strs('hex', 'base64'), strs('base64', 'utf8')], new Array(HIGH + 1).join('a'))
assertStream([new Array(HIGH + 1).join('a'), 'a'], [strs('utf8', 'hex'), strs('hex', 'base64'), strs('base64', 'utf8')], new Array(HIGH + 2).join('a'))
assertStream([new Array(HIGH + 2).join('a'), 'a'], [strs('utf8', 'hex'), strs('hex', 'base64'), strs('base64', 'utf8')], new Array(HIGH + 3).join('a'))
