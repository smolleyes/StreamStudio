/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function Targets(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.Targets, start, length);
}

util.inherits(Targets, MasterElement);

module.exports = Targets;

Targets.prototype.toString = function() {
	return "[Targets #" + this.tagId + "]";
};

_proto.addAttribute(Targets.prototype, "TargetTypeValue");
_proto.addAttribute(Targets.prototype, "TargetType");

_proto.addChild(Targets.prototype, "TagTrackUID");
_proto.addChild(Targets.prototype, "TagEditionUID");
_proto.addChild(Targets.prototype, "TagChapterUID");
_proto.addChild(Targets.prototype, "TagAttachmentUID");
