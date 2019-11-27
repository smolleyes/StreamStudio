/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function TrackEntry(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.TrackEntry, start, length);
}

util.inherits(TrackEntry, MasterElement);

module.exports = TrackEntry;

TrackEntry.prototype.toString = function() {
	return "[TrackEntry #" + this.tagId + "]";
};

_proto.addAttribute(TrackEntry.prototype, "TrackNumber");
_proto.addAttribute(TrackEntry.prototype, "TrackUID");
_proto.addAttribute(TrackEntry.prototype, "TrackType");
_proto.addAttribute(TrackEntry.prototype, "FlagEnabled");
_proto.addAttribute(TrackEntry.prototype, "FlagDefault");
_proto.addAttribute(TrackEntry.prototype, "FlagForced");
_proto.addAttribute(TrackEntry.prototype, "FlagLacing");
_proto.addAttribute(TrackEntry.prototype, "MinCache");
_proto.addAttribute(TrackEntry.prototype, "MaxCache");
_proto.addAttribute(TrackEntry.prototype, "DefaultDuration");
_proto.addAttribute(TrackEntry.prototype, "DefaultDecodedFieldDuration");
_proto.addAttribute(TrackEntry.prototype, "MaxBlockAdditionID");
_proto.addAttribute(TrackEntry.prototype, "Name");
_proto.addAttribute(TrackEntry.prototype, "CodecID");
_proto.addAttribute(TrackEntry.prototype, "CodecPrivate");
_proto.addAttribute(TrackEntry.prototype, "CodecName");
_proto.addAttribute(TrackEntry.prototype, "AttachmentLink");
_proto.addAttribute(TrackEntry.prototype, "CodecDecodeAll");
_proto.addAttribute(TrackEntry.prototype, "TrackOverlay");
_proto.addAttribute(TrackEntry.prototype, "CodecDelay");
_proto.addAttribute(TrackEntry.prototype, "SeekPreRoll");

_proto.addChild(TrackEntry.prototype, "TrackTranslate");

_proto.oneChild(TrackEntry.prototype, "Video");

_proto.oneChild(TrackEntry.prototype, "Audio");

_proto.addChild(TrackEntry.prototype, "TrackOperation");

_proto.addChild(TrackEntry.prototype, "ContentEncodings");
