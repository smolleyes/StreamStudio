var chdir = require('../');
var test = require('tap').test;

test('push undefined', function (t) {
    t.plan(2);
    
    var cwd = process.cwd();
    chdir.push();
    
    process.chdir('/tmp');
    t.equal(process.cwd(), '/tmp');
    
    chdir.pop();
    t.equal(process.cwd(), cwd);
    
    t.end();
});
