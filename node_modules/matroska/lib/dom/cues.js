/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function Cues(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.Cues, start, length);
}

util.inherits(Cues, MasterElement);

module.exports = Cues;

Cues.prototype.toString = function() {
	return "[Cues #" + this.tagId + "]";
};

_proto.addChild(Cues.prototype, "CuePoint");
