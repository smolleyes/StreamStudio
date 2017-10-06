/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function SimpleTag(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.SimpleTag, start, length);
}

util.inherits(SimpleTag, MasterElement);

module.exports = SimpleTag;

SimpleTag.prototype.toString = function() {
	return "[SimpleTag #" + this.tagId + "]";
};

_proto.addChild(SimpleTag.prototype, "SimpleTag");

_proto.addAttribute(SimpleTag.prototype, "TagName");
_proto.addAttribute(SimpleTag.prototype, "TagLanguage");
_proto.addAttribute(SimpleTag.prototype, "TagDefault");
_proto.addAttribute(SimpleTag.prototype, "TagString");
_proto.addAttribute(SimpleTag.prototype, "TagBinary");
