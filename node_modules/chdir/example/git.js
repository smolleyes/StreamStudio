var chdir = require('chdir');
var spawn = require('child_process').spawn;

chdir('/tmp', function () {
    console.log('cwd[0]=' + process.cwd());
    
    var ps = spawn('git', [
        'clone', 'https://github.com/substack/node-chdir.git'
    ]);
    ps.on('exit', function () {
        console.log('cloned into /tmp/node-chdir');
        console.log('cwd[2]=' + process.cwd());
    });
});

console.log('cwd[1]=' + process.cwd());
