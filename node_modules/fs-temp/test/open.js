
var lib = require('../');

var fs = require('fs');
var assert = require('assert');

var data = new Buffer('testing 1 2 3');

function checkOpenFile (res, flag) {

  fs.writeSync(res.fd, data, 0, data.length, null);

  if (flag === 'w+') {
    var buf = new Buffer(data.length);
    var bytesRead = fs.readSync(res.fd, buf, 0, data.length, 0);
    assert.equal(bytesRead, data.length);
    assert.equal(buf.toString(), data.toString());
  }

  fs.closeSync(res.fd);

  var content = fs.readFileSync(res.path);
  assert.equal(content.toString(), data.toString());

}

describe('open', function () {

  var cleanup = [];

  after(function () {

    cleanup.forEach(function (obj) {
      try { fs.closeSync(obj.fd); } catch (err) {}
      try { fs.unlinkSync(obj.path); } catch (err) {}
    });

    cleanup = [];

  });

  it('creates temporary file for writing async', function (done) {

    lib.open('w', function (err, res) {
      assert.ifError(err);

      cleanup.push(res);
      checkOpenFile(res, 'w');

      done();
    });

  });

  it('creates temporary file for writing sync', function () {

    var res = lib.openSync('w');

    cleanup.push(res);
    checkOpenFile(res, 'w');

  });

  it('creates temporary file for reading and writing async', function (done) {

    lib.open('w+', function (err, res) {
      assert.ifError(err);

      cleanup.push(res);
      checkOpenFile(res, 'w+');

      done();
    });

  });

  it('creates temporary file for reading and writing sync', function () {

    var res = lib.openSync('w+');

    cleanup.push(res);
    checkOpenFile(res, 'w+');

  });

  it('should throw on unknown flag', function () {

    assert.throws(function () {
      lib.openSync('asd');
    });

    assert.throws(function () {
      lib.open('asd', function () {
        assert(false);
      });
    });

  });

});
