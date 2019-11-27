/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var Element1 = require('./element1');
var schema = require('../schema');
var _proto = require('./_proto');

function CueReference(doc, tagId, start, length) {
	Element1.call(this, doc, tagId, schema.byName.CueReference, start, length);
}

util.inherits(CueReference, Element1);

module.exports = CueReference;

CueReference.prototype.toString = function() {
	return "[CueReference #" + this.tagId + "]";
};

_proto.addAttribute(CueReference.prototype, "CueRefTime");
