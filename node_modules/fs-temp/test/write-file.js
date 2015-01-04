
var lib = require('../');

var fs = require('fs');
var assert = require('assert');

var data = new Buffer('testing 1 2 3');

function checkWrittenFile (path) {

  var content = fs.readFileSync(path);
  assert.equal(content.toString(), data.toString());

}

describe('writeFile', function () {

  var cleanup = [];

  after(function () {

    cleanup.forEach(function (path) {
      try { fs.unlinkSync(path); } catch (err) {}
    });

    cleanup = [];

  });

  it('should write a file async', function (done) {

    lib.writeFile(data, function (err, path) {
      assert.ifError(err);

      cleanup.push(path);
      checkWrittenFile(path);

      done();
    });

  });

  it('should write a file sync', function () {

    var path = lib.writeFileSync(data);

    cleanup.push(path);
    checkWrittenFile(path);

  });

  it('should accept string and encoding async', function (done) {

    lib.writeFile(data.toString(), 'utf-8', function (err, path) {
      assert.ifError(err);

      cleanup.push(path);
      checkWrittenFile(path);

      done();
    });

  });

  it('should accept string and encoding sync', function () {

    var path = lib.writeFileSync(data.toString(), 'utf-8');

    cleanup.push(path);
    checkWrittenFile(path);

  });

});
