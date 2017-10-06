/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var Element1 =  require('./element1');;
var schema = require('../schema');
var _proto = require('./_proto');

function Video(doc, tagId, start, length) {
	Element1.call(this, doc, tagId, schema.byName.Video, start, length);
}

util.inherits(Video, Element1);

module.exports = Video;

Video.prototype.toString = function() {
	return "[Video #" + this.tagId + "]";
};

_proto.addAttribute(Video.prototype, "FlagInterlaced");
_proto.addAttribute(Video.prototype, "StereoMode");
_proto.addAttribute(Video.prototype, "AlphaMode");
_proto.addAttribute(Video.prototype, "PixelWidth");
_proto.addAttribute(Video.prototype, "PixelHeight");
_proto.addAttribute(Video.prototype, "PixelCropBottom");
_proto.addAttribute(Video.prototype, "PixelCropTop");
_proto.addAttribute(Video.prototype, "PixelCropLeft");
_proto.addAttribute(Video.prototype, "PixelCropRight");
_proto.addAttribute(Video.prototype, "DisplayWidth");
_proto.addAttribute(Video.prototype, "DisplayHeight");
_proto.addAttribute(Video.prototype, "DisplayUnit");
_proto.addAttribute(Video.prototype, "AspectRatioType");
_proto.addAttribute(Video.prototype, "ColourSpace");
