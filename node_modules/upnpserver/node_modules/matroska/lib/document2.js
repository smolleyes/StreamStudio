/*jslint node: true, vars: true, nomen: true */
'use strict';

var async = require('async');
var util = require('util');

var Document1 = require('./document1');
var schema = require('./schema');

function Document2() {
	Document1.call(this);
}

util.inherits(Document2, Document1);

module.exports = Document2;

/**
 * 
 */
Document2.prototype.optimizeData = function(options, callback) {

	if (arguments.length === 1 && typeof (options) === "function") {
		callback = options;
		options = null;
	}

	if (!this.children) {
		return callback();
	}

	options = options || {};

	var cnt = 0;

	this.deepWalk(function(child) {
		var c = child._optimizeData(options);
		// console.log("child #" + child.tagId + " " + c + " optimisation(s)");

		cnt += c;
	});

	console.log("Optimize " + cnt + " values");

	return callback();
};

Document2.prototype.normalizeSegments = function(options, callback) {
	var segments = this.segments;
	options = options || {};

	async.eachSeries(segments, function(segment, callback) {
		segment.normalize(options, callback);
	}, callback);
};

Document2.prototype._prepareDocument = function(options, callback) {
	var fcts = [];

	var self = this;
	if (options.normalizeSegments !== false) {
		fcts.push(function(callback) {
			self.normalizeSegments(options, callback);
		});
	}

	if (options.optimizeData !== false) {
		fcts.push(function(callback) {
			self.optimizeData(options, callback);
		});
	}

	if (options.forceStereoMode !== undefined) {
		this.segments.forEach(function(segment) {
			segment.tracks.trackEntries.forEach(function(trackEntry) {
				try {
					var video = trackEntry.video;
					if (!video) {
						return;
					}

					video.stereoMode = options.forceStereoMode;

				} catch (x) {
					console.error(x);
				}
			});
		});
	}

	var self = this;

	async.series(fcts, function(error) {
		if (error) {
			return callback(error);
		}

		Document1.prototype._prepareDocument.call(self, options, callback);
	});
};
