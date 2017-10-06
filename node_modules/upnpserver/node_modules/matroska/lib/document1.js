/*jslint node: true, vars: true, nomen: true */
'use strict';

var async = require('async');
var util = require('util');

var Document = require('./document');
var schema = require('./schema');

function Document1() {
	Document.call(this);
}

util.inherits(Document1, Document);

module.exports = Document1;

Document1.prototype.getEBML = function() {
	return this.getFirstChildByName(schema.byName.EBML);
};

Document1.prototype.getFirstSegment = function() {
	var firstSegment = this.getFirstChildByName(schema.byName.Segment);

	return firstSegment;
};

Object.defineProperty(Document1.prototype, "firstSegment", {
	iterable: false,
	get: function() {
		return this.getFirstSegment();
	}
});

Object.defineProperty(Document1.prototype, "head", {
	iterable: false,
	get: function() {
		return this.getEBML();
	}
});

Object.defineProperty(Document1.prototype, "segments", {
	iterable: false,
	get: function() {
		return this.listChildrenByName(schema.byName.Segment);
	}
});
