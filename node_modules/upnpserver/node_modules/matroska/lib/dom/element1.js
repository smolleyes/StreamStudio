/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var Element = require('../element');
var schema = require('../schema');
var _proto = require('./_proto');

function Element1(doc, tagId, ebmlId, start, length) {
	Element.call(this, doc, tagId, ebmlId, start, length);
}

util.inherits(Element1, Element);

module.exports = Element1;
