
var os = require('os');
var path = require('path');
var crypto = require('crypto');

var tmpPath = os.tmpDir();

function toChars(bytes) {
  return bytes.toString('base64').replace(/=+$/, '').replace(/[+/]/g, '-');
}

function generateName(template, bytes) {
  return template.replace('%s', toChars(bytes));
}

function generatePath(template, bytes) {
  return path.join(tmpPath, generateName(template, bytes));
}

exports.async = function (template, cb) {
  crypto.randomBytes(8, function (err, bytes) {
    if (err) { return cb(err); }

    cb(null, generatePath(template, bytes));
  });
};

exports.sync = function (template) {
  return generatePath(template, crypto.randomBytes(8))
};
