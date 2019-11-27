/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var Element1 =  require('./element1');;
var schema = require('../schema');
var _proto = require('./_proto');

function AttachedFile(doc, tagId, start, length) {
	Element1.call(this, doc, tagId, schema.byName.AttachedFile, start, length);
}

util.inherits(AttachedFile, Element1);

module.exports = AttachedFile;

AttachedFile.prototype.toString = function() {
	return "[AttachedFile #" + this.tagId + "]";
};

_proto.addAttribute(AttachedFile.prototype, "FileName");
_proto.addAttribute(AttachedFile.prototype, "FileMimeType");
_proto.addAttribute(AttachedFile.prototype, "FileDescription");
_proto.addAttribute(AttachedFile.prototype, "FileData");
_proto.addAttribute(AttachedFile.prototype, "FileUID");
