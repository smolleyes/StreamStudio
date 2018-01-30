# torrent-parser [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![Greenkeeper badge](https://badges.greenkeeper.io/CraigglesO/torrent-parser.svg)](https://greenkeeper.io/)

[travis-image]: https://travis-ci.org/CraigglesO/torrent-parser.svg?branch=master
[travis-url]: https://travis-ci.org/CraigglesO/torrent-parser
[npm-image]: https://img.shields.io/npm/v/torrent-parser.svg
[npm-url]: https://npmjs.org/package/torrent-parser
[downloads-image]: https://img.shields.io/npm/dm/torrent-parser.svg
[downloads-url]: https://npmjs.org/package/torrent-parser

### Parse torrents from their files or buffers

Bot parse and write a torrent file.

## Install

``` javascript
npm install torrent-parser
```

or download for global use:
``` javascript
npm install -g torrent-parser
```

## Usage
``` javascript
import { decodeTorrentFile, decodeTorrent, encodeTorrent, parseInfo } from "torrent-parser"
```

**DECODE**
``` javascript

let file             = fs.readFileSync("./screen.torrent");
// Parse directly from the file
let parsedTorrent    = decodeTorrentFile("./screen.torrent");
// Or parse the buffer created from a file
let parsedTorrent    = decodeTorrent(file);





parsedTorrent =  {
  info: {
    length: 99525,
    name: <Buffer 53 63 72 65 65 6e 20 53 68 6f 74 20 32 30 31 37 2d 30 31 2d 32 31 20 61 74 20 38 2e 32 35 2e 31 35 20 41 4d 2e 70 6e 67>,
    'piece length': 16384,
    pieces: <Buffer 4a a0 c3 fb ce 71 26 8c 4e fb 56 fe 4c b1 f4 22 26 bc 59 59 26 c5 f5 90 f8 8d c5 60 90 5d 2d 2c 1d 4a 82 db 39 4f ae 98 c4 53 61 a1 85 8c 37 cf df 77 ... >,
    private: 0
  },
  infoBuffer: <Buffer 64 36 3a 6c 65 6e 67 74 68 69 39 39 35 32 35 65 34 3a 6e 61 6d 65 34 30 3a 53 63 72 65 65 6e 20 53 68 6f 74 20 32 30 31 37 2d 30 31 2d 32 31 20 61 74 ... >,
  infoHash: '74416fe776ca02ca2da20f686fed835e4dcfe84d',
  infoHashBuffer: <Buffer 74 41 6f e7 76 ca 02 ca 2d a2 0f 68 6f ed 83 5e 4d cf e8 4d>,
  name: 'Screen Shot 2017-01-21 at 8.25.15 AM.png',
  private: false,
  'creation date': 2017-02-14T21:24:02.000Z,
  'created by': 'Empire/vParrot',
  announce: [ 'udp://tracker.empire-js.us:1337,udp://tracker.openbittorrent.com:80,udp://tracker.leechers-paradise.org:6969,udp://tracker.coppersurfer.tk:6969,udp://tracker.opentrackr.org:1337,udp://explodie.org:6969,udp://zer0day.ch:1337' ],
  urlList: [],
  files: [
    { path: 'Screen Shot 2017-01-21 at 8.25.15 AM.png',
    name: 'Screen Shot 2017-01-21 at 8.25.15 AM.png',
    length: 99525,
    offset: 0 }
  ],
  length: 99525,
  pieceLength: 16384,
  lastPieceLength: 1221,
  pieces: [
    '4aa0c3fbce71268c4efb56fe4cb1f42226bc5959',
    '26c5f590f88dc560905d2d2c1d4a82db394fae98',
    'c45361a1858c37cfdf77bb716c48fa368f3605af',
    '4d4289c76994ee95b0302b76ca0df2a351a10afc',
    '84eac82d3f383e6c1bb9d5a0c18b5cdbc1b729af',
    'db265f87a7f6047916c30298479cae03c9dceccb',
    'fa2857f4fbeb4d3e9d7d847e4b94c6b418f4fa83'
  ]
}

```

**ENCODE**
``` javascript
let info = {
  length: 99525,
  name: <Buffer 53 63 72 65 65 6e 20 53 68 6f 74 20 32 30 31 37 2d 30 31 2d 32 31 20 61 74 20 38 2e 32 35 2e 31 35 20 41 4d 2e 70 6e 67>,
  'piece length': 16384,
  pieces: <Buffer 4a a0 c3 fb ce 71 26 8c 4e fb 56 fe 4c b1 f4 22 26 bc 59 59 26 c5 f5 90 f8 8d c5 60 90 5d 2d 2c 1d 4a 82 db 39 4f ae 98 c4 53 61 a1 85 8c 37 cf df 77 ... >,
  private: 0
}

// Encode just info files
const bencode        = require("bencode");

let file             = fs.readFileSync("./screen.torrent");
let parsedTorrent    = decodeTorrent(file);
let info             = bencode.encode(parsedTorrent.info);
// NOTE: INFO in the field is usually a bencoded buffer.
encodeTorrent(info, "./dev-screen3", (err) => {
  if (err) throw err;
  // SUCCESS
});
// Or encode full torrents
let file             = fs.readFileSync("./screen.torrent");
let parsedTorrent    = decodeTorrent(file);
encodeTorrent(parsedTorrent, "./dev-screen.torrent", (err) => {
  if (err) throw err;
  // SUCCESS
});

```

## ISC License (Open Source Initiative)

ISC License (ISC)
Copyright 2017 <CraigglesO>
Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium


Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
