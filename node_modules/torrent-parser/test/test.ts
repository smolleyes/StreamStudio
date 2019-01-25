import * as test from "blue-tape";
import * as fs   from "fs";
import { decodeTorrentFile, decodeTorrent, encodeTorrent } from "../torrent-parser";

const parseTorrent = require("parse-torrent"),
      bencode      = require("bencode");

test("parse Torrent from File", (t) => {
  t.plan(17);

  let file             = fs.readFileSync("./screen.torrent");
  let parsedTorrent    = decodeTorrentFile("./screen.torrent");
  let devParsedTorrent = parseTorrent(file);

  t.equal( parsedTorrent.info.toString(), devParsedTorrent.info.toString(), "Same info" );
  t.equal( parsedTorrent.infoBuffer.toString(), devParsedTorrent.infoBuffer.toString(), "Same infoBuffer" );
  t.equal( parsedTorrent.infoHash, devParsedTorrent.infoHash, "Same infoHash" );
  t.equal( parsedTorrent.infoHashBuffer.toString(), devParsedTorrent.infoHashBuffer.toString(), "Same infoHashBuffer" );
  t.equal( parsedTorrent.name, devParsedTorrent.name, "Same name" );
  t.equal( parsedTorrent.private, devParsedTorrent.private, "Same private" );
  t.equal( parsedTorrent["creation date"].toString(), devParsedTorrent.created.toString(), "Same created" );
  t.equal( parsedTorrent["created by"], devParsedTorrent.createdBy, "Same createdBy" );
  t.equal( parsedTorrent.announce.toString(), devParsedTorrent.announce.toString(), "Same announce" );
  t.equal( parsedTorrent.urlList.toString(), devParsedTorrent.urlList.toString(), "Same urlList" );
  t.equal( parsedTorrent.files[0].path, devParsedTorrent.files[0].path, "Same info path" );
  t.equal( parsedTorrent.files[0].name, devParsedTorrent.files[0].name, "Same info name" );
  t.equal( parsedTorrent.files[0].length, devParsedTorrent.files[0].length, "Same info length" );
  t.equal( parsedTorrent.files[0].offset, devParsedTorrent.files[0].offset, "Same info offset" );
  t.equal( parsedTorrent.length, devParsedTorrent.length, "Same length" );
  t.equal( parsedTorrent.lastPieceLength, devParsedTorrent.lastPieceLength, "Same lastPieceLength" );
  t.equal( parsedTorrent.pieces.toString(), devParsedTorrent.pieces.toString(), "Same pieces" );

  t.end();
});

test("parse Torrent from File", (t) => {
  t.plan(17);

  let file             = fs.readFileSync("./screen.torrent");
  let parsedTorrent    = decodeTorrent(file);
  let devParsedTorrent = parseTorrent(file);

  t.equal( parsedTorrent.info.toString(), devParsedTorrent.info.toString(), "Same info" );
  t.equal( parsedTorrent.infoBuffer.toString(), devParsedTorrent.infoBuffer.toString(), "Same infoBuffer" );
  t.equal( parsedTorrent.infoHash, devParsedTorrent.infoHash, "Same infoHash" );
  t.equal( parsedTorrent.infoHashBuffer.toString(), devParsedTorrent.infoHashBuffer.toString(), "Same infoHashBuffer" );
  t.equal( parsedTorrent.name, devParsedTorrent.name, "Same name" );
  t.equal( parsedTorrent.private, devParsedTorrent.private, "Same private" );
  t.equal( parsedTorrent["creation date"].toString(), devParsedTorrent.created.toString(), "Same created" );
  t.equal( parsedTorrent["created by"], devParsedTorrent.createdBy, "Same createdBy" );
  t.equal( parsedTorrent.announce.toString(), devParsedTorrent.announce.toString(), "Same announce" );
  t.equal( parsedTorrent.urlList.toString(), devParsedTorrent.urlList.toString(), "Same urlList" );
  t.equal( parsedTorrent.files[0].path, devParsedTorrent.files[0].path, "Same info path" );
  t.equal( parsedTorrent.files[0].name, devParsedTorrent.files[0].name, "Same info name" );
  t.equal( parsedTorrent.files[0].length, devParsedTorrent.files[0].length, "Same info length" );
  t.equal( parsedTorrent.files[0].offset, devParsedTorrent.files[0].offset, "Same info offset" );
  t.equal( parsedTorrent.length, devParsedTorrent.length, "Same length" );
  t.equal( parsedTorrent.lastPieceLength, devParsedTorrent.lastPieceLength, "Same lastPieceLength" );
  t.equal( parsedTorrent.pieces.toString(), devParsedTorrent.pieces.toString(), "Same pieces" );

  t.end();
});


test("Encode Torrent to File", (t) => {
  t.plan(17);

  let file             = fs.readFileSync("./screen.torrent");
  let parsedTorrent    = decodeTorrent(file);
  encodeTorrent(parsedTorrent, "./dev-screen.torrent", (err) => {
    if (err) { t.fail(err.toString()); }
    let file2            = fs.readFileSync("./dev-screen.torrent");
    parsedTorrent        = decodeTorrent(file2);
    let devParsedTorrent = parseTorrent(file2);

    t.equal( parsedTorrent.info.toString(), devParsedTorrent.info.toString(), "Same info" );
    t.equal( parsedTorrent.infoBuffer.toString(), devParsedTorrent.infoBuffer.toString(), "Same infoBuffer" );
    t.equal( parsedTorrent.infoHash, devParsedTorrent.infoHash, "Same infoHash" );
    t.equal( parsedTorrent.infoHashBuffer.toString(), devParsedTorrent.infoHashBuffer.toString(), "Same infoHashBuffer" );
    t.equal( parsedTorrent.name, devParsedTorrent.name, "Same name" );
    t.equal( parsedTorrent.private, devParsedTorrent.private, "Same private" );
    t.equal( parsedTorrent["creation date"].toString(), devParsedTorrent.created.toString(), "Same created" );
    t.equal( parsedTorrent["created by"], devParsedTorrent.createdBy, "Same createdBy" );
    t.equal( parsedTorrent.announce.toString(), devParsedTorrent.announce.toString(), "Same announce" );
    t.equal( parsedTorrent.urlList.toString(), devParsedTorrent.urlList.toString(), "Same urlList" );
    t.equal( parsedTorrent.files[0].path, devParsedTorrent.files[0].path, "Same info path" );
    t.equal( parsedTorrent.files[0].name, devParsedTorrent.files[0].name, "Same info name" );
    t.equal( parsedTorrent.files[0].length, devParsedTorrent.files[0].length, "Same info length" );
    t.equal( parsedTorrent.files[0].offset, devParsedTorrent.files[0].offset, "Same info offset" );
    t.equal( parsedTorrent.length, devParsedTorrent.length, "Same length" );
    t.equal( parsedTorrent.lastPieceLength, devParsedTorrent.lastPieceLength, "Same lastPieceLength" );
    t.equal( parsedTorrent.pieces.toString(), devParsedTorrent.pieces.toString(), "Same pieces" );
    t.end();
  });
});

test("Encode Torrent to File without .torrent name", (t) => {
  t.plan(17);

  let file             = fs.readFileSync("./screen.torrent");
  let parsedTorrent    = decodeTorrent(file);
  encodeTorrent(parsedTorrent, "./dev-screen2", (err) => {
    if (err) { t.fail(err.toString()); }
    let file2            = fs.readFileSync("./dev-screen2.torrent");
    parsedTorrent        = decodeTorrent(file2);
    let devParsedTorrent = parseTorrent(file2);

    t.equal( parsedTorrent.info.toString(), devParsedTorrent.info.toString(), "Same info" );
    t.equal( parsedTorrent.infoBuffer.toString(), devParsedTorrent.infoBuffer.toString(), "Same infoBuffer" );
    t.equal( parsedTorrent.infoHash, devParsedTorrent.infoHash, "Same infoHash" );
    t.equal( parsedTorrent.infoHashBuffer.toString(), devParsedTorrent.infoHashBuffer.toString(), "Same infoHashBuffer" );
    t.equal( parsedTorrent.name, devParsedTorrent.name, "Same name" );
    t.equal( parsedTorrent.private, devParsedTorrent.private, "Same private" );
    t.equal( parsedTorrent["creation date"].toString(), devParsedTorrent.created.toString(), "Same created" );
    t.equal( parsedTorrent["created by"], devParsedTorrent.createdBy, "Same createdBy" );
    t.equal( parsedTorrent.announce.toString(), devParsedTorrent.announce.toString(), "Same announce" );
    t.equal( parsedTorrent.urlList.toString(), devParsedTorrent.urlList.toString(), "Same urlList" );
    t.equal( parsedTorrent.files[0].path, devParsedTorrent.files[0].path, "Same info path" );
    t.equal( parsedTorrent.files[0].name, devParsedTorrent.files[0].name, "Same info name" );
    t.equal( parsedTorrent.files[0].length, devParsedTorrent.files[0].length, "Same info length" );
    t.equal( parsedTorrent.files[0].offset, devParsedTorrent.files[0].offset, "Same info offset" );
    t.equal( parsedTorrent.length, devParsedTorrent.length, "Same length" );
    t.equal( parsedTorrent.lastPieceLength, devParsedTorrent.lastPieceLength, "Same lastPieceLength" );
    t.equal( parsedTorrent.pieces.toString(), devParsedTorrent.pieces.toString(), "Same pieces" );
    t.end();
  });
});

test("Encode Torrent to File from Torrent.info", (t) => {
  t.plan(17);

  let file             = fs.readFileSync("./screen.torrent");
  let parsedTorrent    = decodeTorrent(file);
  let info             = bencode.encode(parsedTorrent.info);
  encodeTorrent(info, "./dev-screen3", (err) => {
    if (err) { t.fail(err.toString()); }
    let file2            = fs.readFileSync("./dev-screen3.torrent");
    parsedTorrent        = decodeTorrent(file2);
    let devParsedTorrent = parseTorrent(file2);

    t.equal( parsedTorrent.info.toString(), devParsedTorrent.info.toString(), "Same info" );
    t.equal( parsedTorrent.infoBuffer.toString(), devParsedTorrent.infoBuffer.toString(), "Same infoBuffer" );
    t.equal( parsedTorrent.infoHash, devParsedTorrent.infoHash, "Same infoHash" );
    t.equal( parsedTorrent.infoHashBuffer.toString(), devParsedTorrent.infoHashBuffer.toString(), "Same infoHashBuffer" );
    t.equal( parsedTorrent.name, devParsedTorrent.name, "Same name" );
    t.equal( parsedTorrent.private, devParsedTorrent.private, "Same private" );
    t.equal( parsedTorrent["creation date"].toString(), devParsedTorrent.created.toString(), "Same created" );
    t.equal( parsedTorrent["created by"], devParsedTorrent.createdBy, "Same createdBy" );
    t.equal( parsedTorrent.announce.toString(), devParsedTorrent.announce.toString(), "Same announce" );
    t.equal( parsedTorrent.urlList.toString(), devParsedTorrent.urlList.toString(), "Same urlList" );
    t.equal( parsedTorrent.files[0].path, devParsedTorrent.files[0].path, "Same info path" );
    t.equal( parsedTorrent.files[0].name, devParsedTorrent.files[0].name, "Same info name" );
    t.equal( parsedTorrent.files[0].length, devParsedTorrent.files[0].length, "Same info length" );
    t.equal( parsedTorrent.files[0].offset, devParsedTorrent.files[0].offset, "Same info offset" );
    t.equal( parsedTorrent.length, devParsedTorrent.length, "Same length" );
    t.equal( parsedTorrent.lastPieceLength, devParsedTorrent.lastPieceLength, "Same lastPieceLength" );
    t.equal( parsedTorrent.pieces.toString(), devParsedTorrent.pieces.toString(), "Same pieces" );
    t.end();
  });
});
