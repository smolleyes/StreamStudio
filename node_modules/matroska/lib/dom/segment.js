/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function Segment(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.Segment, start, length);
}

util.inherits(Segment, MasterElement);

module.exports = Segment;

Segment.prototype.toString = function() {
	return "[Segment #" + this.tagId + "]";
};

_proto.oneChild(Segment.prototype, "Info");

_proto.oneChild(Segment.prototype, "SeekHead");

_proto.oneChild(Segment.prototype, "Attachments");

_proto.oneChild(Segment.prototype, "Tracks");

_proto.oneChild(Segment.prototype, "Tags");
