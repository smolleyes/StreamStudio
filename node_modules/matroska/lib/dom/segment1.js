/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');

var Segment = require('./segment');
var schema = require('../schema');

function Segment1(doc, elementId, start, length) {
	Segment.call(this, doc, elementId, start, length);
}

util.inherits(Segment1, Segment);

module.exports = Segment1;

function verifyCRC(element) {
	if (!element.children) {
		// Not loaded ?
		return;
	}

	var children = element.children || [];

	var found = false;
	children.forEach(function(c) {
		if (c.ebmlID !== schema.byName.CRC_32) {
			return;
		}

		if (children[0] === c) {
			found = true;
			return;
		}

		c.remove();
	});

	if (found) {
		return;
	}

	element.$crc_32 = 0;
}

function verifySeek(seekHeadElements, targetElement) {
	seekHeadElements.forEach(function(seekHead) {

		var found = false;

		seekHead.seeks.forEach(function(seek) {
			var ebmlID = seek.seekID;

			if (ebmlID !== targetElement.ebmlID) {
				return;
			}

			found = true;
			return false;
		});

		if (found) {
			return;
		}

		var newSeek = seekHead.newSeek();
		newSeek.seekID = targetElement.ebmlID;
		newSeek.seekPosition = targetElement;
	});
}

Segment1.prototype.normalize = function(options, callback) {
	if (typeof (options) === "function") {
		callback = options;
		options = null;
	}
	
	options = options || {};

	var self = this;

	var cluster = this.getFirstChildByName(schema.byName.Cluster);

	var seekHeadElements = this.listChildrenByName(schema.byName.SeekHead);
	seekHeadElements.forEach(function(seekHeadElement) {
		self.moveChildBefore(seekHeadElement, cluster);
		verifyCRC(seekHeadElement);
	});

	this.eachChildByName(schema.byName.Info, function(infoElement) {
		self.moveChildBefore(infoElement, cluster);
		verifyCRC(infoElement);
		verifySeek(seekHeadElements, infoElement);
	});

	this.eachChildByName(schema.byName.Tracks, function(tracksElement) {
		self.moveChildBefore(tracksElement, cluster);
		verifyCRC(tracksElement);
		verifySeek(seekHeadElements, tracksElement);
	});

	this.eachChildByName(schema.byName.Cues, function(cuesElement) {
		self.moveChildBefore(cuesElement, cluster);
		verifyCRC(cuesElement);
		verifySeek(seekHeadElements, cuesElement);
	});

	this.eachChildByName(schema.byName.Void, function(voidElement) {
		voidElement.remove();
	});

	this.eachChildByName(schema.byName.Tags, function(tagsElement) {
		self.moveChildBefore(tagsElement, null);
		verifyCRC(tagsElement);
		verifySeek(seekHeadElements, tagsElement);
	});

	this.eachChildByName(schema.byName.Attachments, function(attachementsElement) {
		self.moveChildBefore(attachementsElement, null);
		verifyCRC(attachementsElement);
		verifySeek(seekHeadElements, attachementsElement);
	});

	this.eachChildByName(schema.byName.AttachedFile, function(attachedFile) {
		verifyCRC(attachedFile);
	});

	// console.log("Seek head modified");
	// console.log(this.print());

	return callback();
};
