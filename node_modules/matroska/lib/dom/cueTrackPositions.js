/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function CueTrackPositions(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.CueTrackPositions, start, length);
}

util.inherits(CueTrackPositions, MasterElement);

module.exports = CueTrackPositions;

CueTrackPositions.prototype.toString = function() {
	return "[CueTrackPositions #" + this.tagId + "]";
};

_proto.addAttribute(CueTrackPositions.prototype, "CueTrack");
_proto.addAttribute(CueTrackPositions.prototype, "CueClusterPosition");
_proto.addAttribute(CueTrackPositions.prototype, "CueRelativePosition");
_proto.addAttribute(CueTrackPositions.prototype, "CueDuration");
_proto.addAttribute(CueTrackPositions.prototype, "CueBlockNumber");
_proto.addAttribute(CueTrackPositions.prototype, "CueCodecState");

_proto.addChild(CueTrackPositions.prototype, "CueReference");
