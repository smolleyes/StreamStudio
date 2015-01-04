
var lib = require('../');

var fs = require('fs');
var assert = require('assert');

function checkCreatedDir (path) {

  var files = fs.readdirSync(path);
  assert.equal(files.length, 0);

}

describe('mkdir', function () {

  var cleanup = [];

  after(function () {

    cleanup.forEach(function (path) {
      try { fs.rmdirSync(path); } catch (err) {}
    });

    cleanup = [];

  });

  it('should create empty directory async', function (done) {

    lib.mkdir(function (err, path) {
      assert.ifError(err);

      cleanup.push(path);
      checkCreatedDir(path);

      done();
    });

  });

  it('should create empty directory sync', function () {

    var path = lib.mkdirSync();

    cleanup.push(path);
    checkCreatedDir(path);

  });

});
