// casts
//
// © 2014 Dave Goehrig <dave@dloh.org>
//

os = require('os')
util = require('util')
events = require('events')
WebSocket = require('ws')

function EventEmitter(port) {
	var self = this
	self._nodes = {}
	events.EventEmitter.call(this)	
	self.emit = function() {
		var self = this
		var args = Array.prototype.slice.apply(arguments,[0])
		// For outbound local origin messages rebroadcast!!
		for (node in self._nodes) self._nodes[node].send(JSON.stringify(args))
		events.EventEmitter.prototype.emit.apply(self,args)
	}
	self.nodes = function() {
		var self = this
		return self._nodes
	}
	self.node = function(node,cb) {
		var self = this
		var ws = new WebSocket(node)
		ws.on('message', function(message) {
			// For incoming messages don't rebroadcast!!
			try {
				var args = JSON.parse(message.data)
				events.EventEmitter.prototype.emit.apply(self,args)
			} catch (e) {
				console.error(e)
			}
		})
		ws.on('open', function() {
			ws.send(JSON.stringify(['peer', os.hostname() + ':' + port]))
			if (typeof(cb) == 'function') cb(ws,node)
		})
		ws.on('close', function() {
			delete self._nodes[node]
		})
		self._nodes[node] = ws
		return self
	}
	if (port) {
		self.server = new WebSocket.Server({ port: port })
		self.server.on('connection', function(ws) {
			// For incoming messages don't rebroadcast!!
			ws.on('message', function(message) {
				var args = JSON.parse(message)
				if (args[0] == 'peer') {
					var peer = args[1]
					ws.on('message', function(message) {
						try {
							var args = JSON.parse(message)
							events.EventEmitter.prototype.emit.apply(self,args)
						} catch(e) {
							console.error(e)
						}
					})
					self._nodes[peer] = ws
					ws.on('close', function() {
						delete self._nodes[peer]
					})
				}
			})
		})
	}
}

util.inherits(EventEmitter,events.EventEmitter)

module.exports = EventEmitter
