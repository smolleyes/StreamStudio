var chdir = require('../');
var test = require('tap').test;

test('chdir', function (t) {
    t.plan(2);
    
    var cwd = process.cwd();
    chdir('/tmp', function () {
        t.equal(process.cwd(), '/tmp');
    });
    t.equal(process.cwd(), cwd);
    t.end();
});
