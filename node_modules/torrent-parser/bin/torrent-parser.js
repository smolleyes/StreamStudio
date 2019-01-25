#!/usr/bin/env node

const torrentParser = require("../out/torrent-parser.js").decodeTorrentFile;

let parsedTorrent = torrentParser(process.argv[2]);

console.log(parsedTorrent);
