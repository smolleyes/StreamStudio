/*jslint node: true, vars: true, nomen: true */
'use strict';

var fs = require('fs');
var util = require('util');
var debug = require('debug')('matroska:httpSource');
var http = require('follow-redirects').http;
var Url = require('url');

var AbstractSource = require('./abstractSource');

var userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MSAppHost/1.0)';

var httpSourceKey = 0;

function HttpSource(url, configuration) {
	AbstractSource.call(this);

	this.configuration = configuration || {};

	// this.configuration.userAgent = userAgent;

	this.url = url;
}

util.inherits(HttpSource, AbstractSource);

module.exports = HttpSource;

/**
 * @private
 * @param callback
 */
HttpSource.prototype.getStream = function(session, params, callback) {
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

	session.$httpSourceKey = httpSourceKey++;

	var options = Url.parse(this.url);
	// options.keepAlive = true;

	options.headers = options.headers || {};

	if (this.configuration.userAgent) {
		options.headers['User-Agent'] = this.configuration.userAgent;
	}

	if (params.start) {
		options.headers.Range = 'bytes=' + params.start + '-' + ((params.end) ? params.end : '');
	}

	if (debug.enabled) {
		debug("Http request ", options, params);
	}

	var request = http.get(options, function(response) {
		debug("Response=", response.statusCode, response.statusMessage);

		if (Math.floor(response.statusCode / 100) !== 2) {
			return callback(new Error("Invalid status '" + response.statusCode + "' message='" + response.statusMessage +
					"' for url=" + url));
		}

		if (params.start) {
			var pr;
			var crange = response.headers['content-range'];
			if (crange) {
				var rr = /bytes (\d+)-(\d+)\/(\d+)/g.exec(crange);

				pr = rr && parseInt(rr[1], 10);
			}

			if (pr !== params.start) {
				// Faire les skips à la fin
				return callback(new Error("Invalid start range"));
			}
		}

		debug("Response stream ...");
		callback(null, response);
	});

	request.on('error', function(error) {
		debug("Error:", error);
		callback(error + " for url=" + this.url);
	});
};

/**
 * @private
 */
HttpSource.prototype._end = function(session, callback) {
	debug("Close");

	callback();
};

HttpSource.prototype.toString = function() {
	return "[HttpSource url=" + this.url + "]";
};
