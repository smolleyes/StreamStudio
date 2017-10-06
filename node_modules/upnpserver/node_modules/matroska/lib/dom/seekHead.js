/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function SeekHead(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.SeekHead, start, length);
}

util.inherits(SeekHead, MasterElement);

module.exports = SeekHead;

SeekHead.prototype.toString = function() {
	return "[SeekHead #" + this.tagId + "]";
};

_proto.addChild(SeekHead.prototype, "Seek");
