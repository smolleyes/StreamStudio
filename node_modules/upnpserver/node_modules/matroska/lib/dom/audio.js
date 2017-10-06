/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var Element1 =  require('./element1');;
var schema = require('../schema');
var _proto = require('./_proto');

function Audio(doc, tagId, start, length) {
	Element1.call(this, doc, tagId, schema.byName.Audio, start, length);
}

util.inherits(Audio, Element1);

module.exports = Audio;

Audio.prototype.toString = function() {
	return "[Audio #" + this.tagId + "]";
};

_proto.addAttribute(Audio.prototype, "SamplingFrequency");
_proto.addAttribute(Audio.prototype, "OutputSamplingFrequency");
_proto.addAttribute(Audio.prototype, "Channels");
_proto.addAttribute(Audio.prototype, "BitDepth");
