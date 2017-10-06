casts
=====

Casts is a nodejs module that allows for creating an adhoc peer to peer websocket network across multiple
servers that extends EventEmitter to distribute messages across the websocket mesh network.  

Getting Started
---------------

To use the casts module in a server, one can simple instantiate the server on a port and register event 
handlers for the events one wants to process:

	Cast = require('casts')
	emitter = new Cast(8081)
	emitter.on('hello',function(msg) { console.log('hello',msg) })

This will create a 'hello' handler for 'hello' messages sent to this node.  You can test it by using the
"cast" cli tool to send a message to the casts server:

	cast ws://localhost:8081 hello world

This will output on the console of the casts server the string:

	hello world

You can add multiple nodes to the network:

	Cast = require('casts')
	emitter = new Cast(8080)
	emitter.node('ws://localhost:8081', function(ws,node) { 	
		emitter.emit('hello','world')
	})	
	emitter.on('hello', function(msg) { console.log('hello',msg) })

In this case, this will start a new casts server on 8080, and attempt to connect to 8081, and after peering, send an event [ 'hello', 'world' ].  Both servers will recieve the event, and invoke their associated handler.

If you then the cli cast program to send a message to ws://localhost:8080 only that server will respond:

	cast ws://localhost:8080 hello "dave, this is only a test"

The reason for this is each casts server only emits messages to it's peers that originate from that server. 
This was done to prevent creating infinite message loops do to cyclic topologies.

Further modules will add additional network topologies to build upon this infrastructure.

Dave


