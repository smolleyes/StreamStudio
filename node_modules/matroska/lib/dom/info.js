/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function Info(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.Info, start, length);
}

util.inherits(Info, MasterElement);

module.exports = Info;

Info.prototype.toString = function() {
	return "[Info #" + this.tagId + "]";
};

_proto.addAttribute(Info.prototype, "SegmentUID");
_proto.addAttribute(Info.prototype, "SegmentFilename");
_proto.addAttribute(Info.prototype, "PrevUID");
_proto.addAttribute(Info.prototype, "PrevFilename");
_proto.addAttribute(Info.prototype, "NextUID");
_proto.addAttribute(Info.prototype, "NextFilename");
_proto.addAttribute(Info.prototype, "SegmentFamily"); // TODO Array support !

_proto.addChild(Info.prototype, "ChapterTranslate");

_proto.addAttribute(Info.prototype, "TimecodeScale");
_proto.addAttribute(Info.prototype, "Duration");
_proto.addAttribute(Info.prototype, "DateUTC");
_proto.addAttribute(Info.prototype, "Title");
_proto.addAttribute(Info.prototype, "MuxingApp");
_proto.addAttribute(Info.prototype, "WritingApp");
