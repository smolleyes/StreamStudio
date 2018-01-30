import * as fs            from "fs";
import * as path          from "path";
import * as crypto        from "crypto";
import { Buffer }         from "buffer";
import { EventEmitter }   from "events";
import * as _             from "lodash";

const bencode = require("bencode");

interface File {
  "path":   string;
  "name":   string;
  "length": number;
  "offset": number;
}

interface Info {
  "length":        number;
  "name":          Buffer;
  "piece length":  number;
  "pieces":        Buffer;
  "private":       number;
}

interface Torrent {
  "info":            Info;
  "infoBuffer":      Buffer;
  "infoHash":        string;
  "infoHashBuffer":  Buffer;
  "name":            string;
  "private":         boolean;
  "creation date":   any;
  "created by":      string;
  "announce":        Array<string>;
  "urlList":         Array<string>;
  "files":           Array<File> | File;
  "length":          number;
  "pieceLength":     number;
  "lastPieceLength": number;
  "pieces":          Array<string>;
}

const decodeTorrentFile = function(torrentFile: string) {
  let torrentData = fs.readFileSync(torrentFile);
  return _parseTorrent(torrentData);
};

const decodeTorrent = function(torrent) {
  return _parseTorrent(torrent);
};

function _parseTorrent(torrentId) {
  if (Buffer.isBuffer(torrentId))
    torrentId = bencode.decode(torrentId);
  if (torrentId && torrentId.info) {
    return torrent(torrentId);
  } else {
    throw new Error("Invalid torrent identifier");
  }
}

function torrent(torrent): Torrent {

  let result = {
    "info": {
      "length":        null,
      "name":          null,
      "piece length":  null,
      "pieces":        null,
      "private":       null
    },
    "infoBuffer":      null,
    "infoHash":        null,
    "infoHashBuffer":  null,
    "name":            null,
    "private":         null,
    "creation date":   null,
    "created by":      null,
    "announce":        null,
    "urlList":         null,
    "files": {
      "path":          null,
      "name":          null,
      "length":        null,
      "offset":        null
    },
    "length":          null,
    "pieceLength":     null,
    "lastPieceLength": null,
    "pieces":          null
  };
  result["info"] = torrent.info;
  result["infoBuffer"] = bencode.encode(torrent["info"]);
  result["infoHash"] = sha1sync(result["infoBuffer"]);
  result["infoHashBuffer"] = new Buffer(result["infoHash"], "hex");

  result["name"] = (torrent.info["name.utf-8"] || torrent.info.name).toString();

  if (torrent.info.private !== undefined)
    result["private"] = !!torrent.info.private;

  if (torrent["creation date"])
    result["creation date"] = new Date(torrent["creation date"] * 1000);
  if (torrent["created by"])
    result["created by"] = torrent["created by"].toString();

  if (Buffer.isBuffer(torrent.comment))
    result["comment"] = torrent.comment.toString();

  // announce and announce-list will be missing if metadata fetched via ut_metadata
  result["announce"] = [];
  if (torrent["announce-list"] && torrent["announce-list"].length) {
    torrent["announce-list"].forEach(function (urls) {
      urls.forEach(function (url) {
        result["announce"].push(url.toString());
      });
    });
  } else if (torrent.announce) {
    result["announce"].push(torrent.announce.toString());
  }

  // handle url-list (BEP19 / web seeding)
  if (Buffer.isBuffer(torrent["url-list"])) {
    // some clients set url-list to empty string
    torrent["url-list"] = torrent["url-list"].length > 0
      ? [ torrent["url-list"] ]
      : [];
  }
  result["urlList"] = (torrent["url-list"] || []).map(function (url) {
    return url.toString();
  });

  result["announce"] = _.uniq(result["announce"]);
  result["urlList"]  = _.uniq(result["urlList"]);

  let files = torrent.info.files || [ torrent.info ];
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

const encodeTorrent = function (parsed: Torrent, location: string, cb: Function): number {
  if (!parsed) {
    cb("Error, not a torrent file or infoBuffer");
    return;
  }
  if (Buffer.isBuffer(parsed)) {
    // We recieved Info rather than a torrent
    parsed = parseInfo(parsed);
  }
  // Update proper values and verify parsed is ready to write from
  parsed = verify(parsed);

  if (location.indexOf(".torrent") === (-1)) {
    location += ".torrent";
  }
  fs.writeFile(location, bencode.encode(parsed), (err) => {
    if (err) { cb("Error writing to file"); return; }
    cb(null);
  });
};

function verify(data: Torrent): Torrent {
  let info;
  if (data.infoBuffer)
    info       = data.infoBuffer;
  else
    info       = Buffer.from(data.info);
  let infoHash = crypto.createHash("sha1").update(info).digest("hex");
  let t        = data;

  if (!data.urlList) {
    data.urlList = [];
  }
  if (!data.private) {
    data.private = false;
  }
  if (!data.infoBuffer) {
    data.infoBuffer = Buffer.from(t);
  }
  if (!data.infoHash) {
    data.infoHash = infoHash;
  }
  if (!data.infoHashBuffer) {
    data.infoHashBuffer = Buffer.from(infoHash);
  }

  data.announce         = ["udp://tracker.empire-js.us:1337", "udp://tracker.openbittorrent.com:80", "udp://tracker.leechers-paradise.org:6969", "udp://tracker.coppersurfer.tk:6969", "udp://tracker.opentrackr.org:1337", "udp://explodie.org:6969", "udp://zer0day.ch:1337"];
  data["creation date"] = Math.round(Date.now() / 1000);
  data["created by"]    = "Empire/vParrot";

  return data;
}

function parseInfo (data): Torrent {
  let infoHash = sha1sync(data);
  let t = bencode.decode(data);

  let torrent  = {
    "info":            t,
    "name":            t.name.toString(),
    "files":           [],
    "length":          null,
    "pieceLength":     t["piece length"],
    "lastPieceLength": null,
    "pieces":          [],
    "urlList":         [],
    "infoBuffer":      data,
    "announce":        null,
    "creation date":   null,
    "created by":      null,
    "private":         false,
    "infoHash":        infoHash,
    "infoHashBuffer":  Buffer.from(infoHash)
  };

  // Files:
  let length = 0;
  if (t.files) {
    torrent.files = t.files;
    let o         = 0;
    torrent.files = torrent.files.map((file) => {
      length     += file.length;
      file.path   = file.path.toString();
      file.offset = o;
      o          += file.length;
      return file;
    });
    torrent.length = length;
  } else {
    torrent.files = [{
      length: t.length,
      path:   torrent.name,
      name:   torrent.name,
      offset: 0
    }];
    torrent.length = t.length;
  }
  torrent.lastPieceLength = torrent.length % torrent.pieceLength;

  // Pieces:
  let piece = t.pieces.toString("hex");
  for (let i = 0; i < piece.length; i += 40) {
    let p = piece.substring(i, i + 40);
    torrent.pieces.push(p);
  }

  return torrent;
}




function sumLength (sum, file) {
  return sum + file.length;
}

function splitPieces (buf) {
  let pieces = [];
  for (let i = 0; i < buf.length; i += 20) {
    pieces.push(buf.slice(i, i + 20).toString("hex"));
  }
  return pieces;
}

function sha1sync (buf: Buffer) {
  return crypto.createHash("sha1")
    .update(buf)
    .digest("hex");
}

function check (input) {
  if (!Buffer.isBuffer(input))
    return new Buffer(input);
  else return input;
}

export { decodeTorrentFile, decodeTorrent, encodeTorrent, parseInfo };
