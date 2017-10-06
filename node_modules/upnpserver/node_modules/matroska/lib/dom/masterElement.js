/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var Element1 = require('./element1');
var schema = require('../schema');
var _proto = require('./_proto');

function MasterElement(doc, tagId, ebmlId, start, length) {
	Element1.call(this, doc, tagId, ebmlId, start, length);
}

util.inherits(MasterElement, Element1);

module.exports = MasterElement;

_proto.oneChild(MasterElement.prototype, "CRC_32");
