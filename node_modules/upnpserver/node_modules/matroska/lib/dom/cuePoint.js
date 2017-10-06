/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function CuePoint(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.CuePoint, start, length);
}

util.inherits(CuePoint, MasterElement);

module.exports = CuePoint;

CuePoint.prototype.toString = function() {
	return "[CuePoint #" + this.tagId + "]";
};

_proto.addAttribute(CuePoint.prototype, "CueTime");

_proto.addChild(CuePoint.prototype, "CueTrackPositions");
