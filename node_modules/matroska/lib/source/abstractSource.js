/*jslint node: true, vars: true, nomen: true */
'use strict';

var assert = require('assert');
var fs = require('fs');
var util = require('util');

var debug = require('debug')('matroska:abstractSource');

var Source = require('./source');
var tools = require('../tools');

var MAX_BUFFER_SIZE = 1024 * 64;

function AbstractSource() {
	this._vints = [];
	this._vintsSize = 0;
}

module.exports = AbstractSource;

util.inherits(AbstractSource, Source);

AbstractSource.prototype.writeCompleteTag = function(session, tag, callback) {

	assert(typeof (tag.start) === "number", "Invalid start index of tag #" + tag.tagId);
	assert(typeof (tag.end) === "number", "Invalid start index of tag #" + tag.tagId);

	var self = this;
	this._flush(session, function(error) {
		if (error) {
			return callback(error);
		}

		var start = tag.start;
		var end = tag.end;
		var modified = tag._modified;
		if (modified) {
			start = modified.start;
			end = modified.end;
		}

		self.getStream({
			start: start,
			end: end - 1

		}, function(error, stream) {
			if (error) {
				return callback(error);
			}

			stream.on('end', callback);
			stream.on('error', callback);

			stream.pipe(session.stream, {
				end: false
			});
		});
	});
};

AbstractSource.prototype.writeTagData = function(session, data, callback) {
	var self = this;

	if (!data) {
		throw new Error("No data !");
	}

	this.writeVInt(session, data.length);

	// console.log("WriteTagData[" + data.length + "]=", data);

	if (this._vintsSize + data.length < MAX_BUFFER_SIZE) {
		this._vints.push(data);
		this._vintsSize += data.length;
		setImmediate(callback);
		return;
	}

	this._flush(session, function(error) {
		if (error) {
			return callback(error);
		}

		session.stream.write(data, callback);
	});
};

AbstractSource.prototype.writeTagDataSource = function(session, dataSize, dataSource, callback) {
	var self = this;

	this.writeVInt(session, dataSize);

	this._flush(session, function(error) {
		if (error) {
			return callback(error);
		}

		dataSource.getStream(session, function(error, stream) {
			if (error) {
				return callback(error);
			}
			stream.pipe(session.stream, {
				end: false
			});
			stream.on('error', callback);
			stream.on('end', callback);
		});
	});
};

AbstractSource.prototype.writeVInt = function(session, value) {
	if (typeof (value) !== "number") {
		throw new Error("Invalid value (" + value + ")")
	}

	var buffer = tools.writeVInt(value);
	this._vints.push(buffer);
	this._vintsSize += buffer.length;
	// console.log("Vint(" + value.toString(16) + ")=>", buffer);
};

AbstractSource.prototype.writeHInt = function(session, value) {
	if (typeof (value) !== "number") {
		throw new Error("Invalid value (" + value + ")")
	}

	var buffer = value;
	if (!Buffer.isBuffer(buffer)) {
		buffer = tools.writeUInt(value);
	}

	this._vints.push(buffer);
	this._vintsSize += buffer.length;
	// console.log("Hint(" + value.toString(16) + ")=>", buffer);
};

AbstractSource.prototype._flush = function(session, callback) {
	var vints = this._vints;
	if (!this._vintsSize) {
		return callback();
	}

	// console.log("Write vints=", vints);

	var buffer;
	if (vints.length === 1) {
		buffer = vints[0];

	} else {
		buffer = Buffer.concat(vints);
	}

	this._vints = [];
	this._vintsSize = 0;
	session.stream.write(buffer, callback);
};

AbstractSource.prototype.getTagDataStream = function(tag, callback) {

	if (debug.enabled) {
		debug("Get data stream of #" + tag.tagId + "  start=" + tag.start + " end=" + tag.end + " modified=", modified);
	}

	var end = tag.end;
	var modified = tag._modified;
	if (modified) {
		end = modified.end;
	}
	var start = end - tag.getDataSize();

	if (debug.enabled) {
		debug("Open stream " + this.filename + " start=" + start + " end=" + end + " size=" + tag.dataSize);
	}

	this.getStream({}, {
		start: start,
		end: end - 1

	}, function(error, stream) {
		if (error) {
			return callback(error);
		}

		return callback(null, stream);
	});
};

AbstractSource.prototype.end = function(session, callback) {
	var self = this;

	this._flush(session, function(error) {
		if (error) {
			return callback(error);
		}

		self._end(session, callback);
	});
};

AbstractSource.prototype._end = function(session, callback) {
	callback();
};

AbstractSource.prototype.release = function(callback) {
	this.end(this, callback);
};
