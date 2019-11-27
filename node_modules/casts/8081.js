Cast = require('casts')
emitter = new Cast(8081)
emitter.on('hello',function(msg) { console.log('hello',msg) })
