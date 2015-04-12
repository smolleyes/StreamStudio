var util = require('util');
var events = require('events');
var mdns = require('mdns-js');
var Device = require('./device').Device;
var debug = require('debug')('chromecast-js');

var browser = function(options) {
	events.EventEmitter.call(this);
	this.init(options);
};

util.inherits( browser, events.EventEmitter );
exports.Browser = browser;

browser.prototype.init = function( options ) {
	var self = this;
	this.devices = {};

	this.getDeviceTxtValue = function(device, key, fallback) {
		var value = fallback !== undefined ? fallback : '';
		if (Array.isArray(device.txt)) {
			for (var i = 0; i < device.txt.length; i++) {
				var keyValue = device.txt[i].split('=');
				if (keyValue[0] === key) {
					value = keyValue[1];
				}
			}
		}
		return value;
	}

	var discoverTimeout = 30000;
	var browser = mdns.createBrowser(mdns.tcp('googlecast'));

	browser.on('ready', function () {
		browser.discover();
	});

	browser.on('update', function (device) {

		// New mDNS-js (0.2.2) version scans all available network interfaces.
		// Some naughty devices or virtual networks will respond even though they are not a chromecast device, so we have to check type.
		// Each chromecast device could respond on more than one interface, so we make sure to only discover each unique device once.
		// For id, try to use 'id' from mDNS response txt part, but use ip address if not present.
		// For device name, try to use 'fn' from mDNS response txt part, but use hostname if not present.

		if (device.type !== undefined && device.type.length > 0 && device.type[0].name === 'googlecast') {

			var deviceId = self.getDeviceTxtValue(device, 'id', device.addresses[0]);
			if (!(deviceId in self.devices)) {
				self.devices[deviceId] = device;

				var dev_config = {
					addresses: device.addresses,
					name: self.getDeviceTxtValue(device, 'fn', device.host)
				};
				self.device = new Device(dev_config);
				self.emit('deviceOn', self.device);
			}
		}
	});

	setTimeout(function() {
		console.log('chromecast-js: device discovery stopped');
		browser.stop();
	}, discoverTimeout);
};
