const fs = require('fs')
const zlib = require('zlib')
const strs = require('stringstream')

const utf8Stream = fs.createReadStream('massiveLogFile.gz')
  .pipe(zlib.createGunzip())
  .pipe(strs('utf8'))

utf8Stream.pipe(process.stdout)

// Stream from utf8 to hex to base64... Why not, ay.
const hex64Stream = fs.createReadStream('myFile.txt')
  .pipe(strs('utf8', 'hex'))
  .pipe(strs('hex', 'base64'))

hex64Stream.pipe(process.stdout)

// Deals with base64 correctly by aligning chunks
const stream = fs.createReadStream('myFile.jpg').pipe(strs('base64'))

let base64Str = ''

stream.on('data', data => base64Str += data)
stream.on('end', () => {
  console.log('My base64 encoded file is: ' + base64Str)
  console.log('Original file size: ' + Buffer.from(base64Str, 'base64').length)
})
