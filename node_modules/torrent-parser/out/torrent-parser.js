"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const buffer_1 = require("buffer");
const _ = require("lodash");
const bencode = require("bencode");
const decodeTorrentFile = function (torrentFile) {
    let torrentData = fs.readFileSync(torrentFile);
    return _parseTorrent(torrentData);
};
exports.decodeTorrentFile = decodeTorrentFile;
const decodeTorrent = function (torrent) {
    return _parseTorrent(torrent);
};
exports.decodeTorrent = decodeTorrent;
function _parseTorrent(torrentId) {
    if (buffer_1.Buffer.isBuffer(torrentId))
        torrentId = bencode.decode(torrentId);
    if (torrentId && torrentId.info) {
        return torrent(torrentId);
    }
    else {
        throw new Error("Invalid torrent identifier");
    }
}
function torrent(torrent) {
    let result = {
        "info": {
            "length": null,
            "name": null,
            "piece length": null,
            "pieces": null,
            "private": null
        },
        "infoBuffer": null,
        "infoHash": null,
        "infoHashBuffer": null,
        "name": null,
        "private": null,
        "creation date": null,
        "created by": null,
        "announce": null,
        "urlList": null,
        "files": {
            "path": null,
            "name": null,
            "length": null,
            "offset": null
        },
        "length": null,
        "pieceLength": null,
        "lastPieceLength": null,
        "pieces": null
    };
    result["info"] = torrent.info;
    result["infoBuffer"] = bencode.encode(torrent["info"]);
    result["infoHash"] = sha1sync(result["infoBuffer"]);
    result["infoHashBuffer"] = new buffer_1.Buffer(result["infoHash"], "hex");
    result["name"] = (torrent.info["name.utf-8"] || torrent.info.name).toString();
    if (torrent.info.private !== undefined)
        result["private"] = !!torrent.info.private;
    if (torrent["creation date"])
        result["creation date"] = new Date(torrent["creation date"] * 1000);
    if (torrent["created by"])
        result["created by"] = torrent["created by"].toString();
    if (buffer_1.Buffer.isBuffer(torrent.comment))
        result["comment"] = torrent.comment.toString();
    result["announce"] = [];
    if (torrent["announce-list"] && torrent["announce-list"].length) {
        torrent["announce-list"].forEach(function (urls) {
            urls.forEach(function (url) {
                result["announce"].push(url.toString());
            });
        });
    }
    else if (torrent.announce) {
        result["announce"].push(torrent.announce.toString());
    }
    if (buffer_1.Buffer.isBuffer(torrent["url-list"])) {
        torrent["url-list"] = torrent["url-list"].length > 0
            ? [torrent["url-list"]]
            : [];
    }
    result["urlList"] = (torrent["url-list"] || []).map(function (url) {
        return url.toString();
    });
    result["announce"] = _.uniq(result["announce"]);
    result["urlList"] = _.uniq(result["urlList"]);
    let files = torrent.info.files || [torrent.info];
    result["files"] = files.map((file, i) => {
        let parts = [].concat(result["name"], file["path.utf-8"] || file.path || []).map(function (p) {
            return p.toString();
        });
        return {
            path: path.join.apply(null, [path.sep].concat(parts)).slice(1),
            name: parts[parts.length - 1],
            length: file.length,
            offset: files.slice(0, i).reduce(sumLength, 0)
        };
    });
    result["length"] = files.reduce(sumLength, 0);
    let lastFile = result["files"][result["files"].length - 1];
    result["pieceLength"] = torrent.info["piece length"];
    result["lastPieceLength"] = ((lastFile.offset + lastFile.length) % result["pieceLength"]) || result["pieceLength"];
    torrent.info.pieces = check(torrent.info.pieces);
    result["pieces"] = splitPieces(torrent.info.pieces);
    return result;
}
const encodeTorrent = function (parsed, location, cb) {
    if (!parsed) {
        cb("Error, not a torrent file or infoBuffer");
        return;
    }
    if (buffer_1.Buffer.isBuffer(parsed)) {
        parsed = parseInfo(parsed);
    }
    parsed = verify(parsed);
    if (location.indexOf(".torrent") === (-1)) {
        location += ".torrent";
    }
    fs.writeFile(location, bencode.encode(parsed), (err) => {
        if (err) {
            cb("Error writing to file");
            return;
        }
        cb(null);
    });
};
exports.encodeTorrent = encodeTorrent;
function verify(data) {
    let info;
    if (data.infoBuffer)
        info = data.infoBuffer;
    else
        info = buffer_1.Buffer.from(data.info);
    let infoHash = crypto.createHash("sha1").update(info).digest("hex");
    let t = data;
    if (!data.urlList) {
        data.urlList = [];
    }
    if (!data.private) {
        data.private = false;
    }
    if (!data.infoBuffer) {
        data.infoBuffer = buffer_1.Buffer.from(t);
    }
    if (!data.infoHash) {
        data.infoHash = infoHash;
    }
    if (!data.infoHashBuffer) {
        data.infoHashBuffer = buffer_1.Buffer.from(infoHash);
    }
    data.announce = ["udp://tracker.empire-js.us:1337", "udp://tracker.openbittorrent.com:80", "udp://tracker.leechers-paradise.org:6969", "udp://tracker.coppersurfer.tk:6969", "udp://tracker.opentrackr.org:1337", "udp://explodie.org:6969", "udp://zer0day.ch:1337"];
    data["creation date"] = Math.round(Date.now() / 1000);
    data["created by"] = "Empire/vParrot";
    return data;
}
function parseInfo(data) {
    let infoHash = sha1sync(data);
    let t = bencode.decode(data);
    let torrent = {
        "info": t,
        "name": t.name.toString(),
        "files": [],
        "length": null,
        "pieceLength": t["piece length"],
        "lastPieceLength": null,
        "pieces": [],
        "urlList": [],
        "infoBuffer": data,
        "announce": null,
        "creation date": null,
        "created by": null,
        "private": false,
        "infoHash": infoHash,
        "infoHashBuffer": buffer_1.Buffer.from(infoHash)
    };
    let length = 0;
    if (t.files) {
        torrent.files = t.files;
        let o = 0;
        torrent.files = torrent.files.map((file) => {
            length += file.length;
            file.path = file.path.toString();
            file.offset = o;
            o += file.length;
            return file;
        });
        torrent.length = length;
    }
    else {
        torrent.files = [{
                length: t.length,
                path: torrent.name,
                name: torrent.name,
                offset: 0
            }];
        torrent.length = t.length;
    }
    torrent.lastPieceLength = torrent.length % torrent.pieceLength;
    let piece = t.pieces.toString("hex");
    for (let i = 0; i < piece.length; i += 40) {
        let p = piece.substring(i, i + 40);
        torrent.pieces.push(p);
    }
    return torrent;
}
exports.parseInfo = parseInfo;
function sumLength(sum, file) {
    return sum + file.length;
}
function splitPieces(buf) {
    let pieces = [];
    for (let i = 0; i < buf.length; i += 20) {
        pieces.push(buf.slice(i, i + 20).toString("hex"));
    }
    return pieces;
}
function sha1sync(buf) {
    return crypto.createHash("sha1")
        .update(buf)
        .digest("hex");
}
function check(input) {
    if (!buffer_1.Buffer.isBuffer(input))
        return new buffer_1.Buffer(input);
    else
        return input;
}
