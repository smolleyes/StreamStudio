Cast = require('casts')
emitter = new Cast(8080)
emitter.node('ws://localhost:8081', function() {
	emitter.emit('hello','world')
})
emitter.on('hello', function(msg) { console.log('hello',msg) })
