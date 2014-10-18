chdir
=====

Push and pop a stack of directories.

example
=======

Hop to `/tmp` to execute a command and automatically hop back after the callback
fires:

```
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
```

output:

```
$ node example/git.js 
cwd[0]=/tmp
cwd[1]=/home/substack/projects/node-chdir
cloned into /tmp/node-chdir
cwd[2]=/home/substack/projects/node-chdir
```

methods
=======

var chdir = require('chdir')

chdir(dir, cb)
--------------

Fires `chdir.push()`, `cb()`, then `chdir.pop()` immediately one after the other.

chdir.push(dir=process.cwd())
-----------------------------

Push a directory onto the stack just like the `pushd` command.

chdir.pop(dir=process.cwd())
-----------------------------

Pop a directory from the stack just like the `popd` command.

install
=======

With [npm](http://npmjs.org) do:

    npm install chdir

license
=======

MIT/X11
