/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var MasterElement = require('./masterElement');
var schema = require('../schema');
var _proto = require('./_proto');

function Tags(doc, tagId, start, length) {
	MasterElement.call(this, doc, tagId, schema.byName.Tags, start, length);
}

util.inherits(Tags, MasterElement);

module.exports = Tags;

Tags.prototype.toString = function() {
	return "[Tags #" + this.tagId + "]";
};

_proto.addChild(Tags.prototype, "Tag");
