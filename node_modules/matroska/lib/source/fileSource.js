/*jslint node: true, vars: true, nomen: true */
'use strict';

var fs = require('fs');
var util = require('util');
var debug = require('debug')('matroska:fileSource');

var AbstractSource = require('./abstractSource');

var fileSourceKey = 0;

function FileSource(filename) {
	AbstractSource.call(this);

	this.filename = filename;
}

util.inherits(FileSource, AbstractSource);

module.exports = FileSource;

/**
 * @private
 * @param callback
 */
FileSource.prototype.getStream = function(session, options, callback) {
	switch (arguments.length) {
	case 1:
		callback = session;
		session = null;
		break;

	case 2:
		callback = options;
		options = null;
		break;
	}

	session = session || {};
	
	session.$fileSourceKey=fileSourceKey++;

	var fd = session._fd;
	if (fd) {
		var params = {
			flags: 'r',
			fd: fd,
			autoClose: false
		};
		if (typeof (options.start) === "number") {
			params.start = options.start;
		}
		if (typeof (options.end) === "number") {
			params.end = options.end;
		}

		debug("GetStream", params, " fd=", session._fd);

		var stream = fs.createReadStream(this.filename, params);

		stream.destroy = function() {
			// Disable destory, because it will close fd !
		};

		return callback(null, stream);
	}

	var self = this;
	fs.open(this.filename, 'r', function(error, fd) {
		if (error) {
			return callback(error);
		}

		session._fd = fd;

		self.getStream(session, options, callback);
	});
};

/**
 * @private
 */
FileSource.prototype._end = function(session, callback) {

	debug("Close", session._fd);

	if (!session._fd) {
		return callback();
	}

	fs.close(session._fd, function(error) {
		delete session._fd;

		return callback(error);
	});
};

FileSource.prototype.toString = function() {
	return "[FileSource file=" + this.filename + "]";
};
