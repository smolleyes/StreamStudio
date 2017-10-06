/*jslint node: true, vars: true, nomen: true */
'use strict';

var crc32 = require('crc').crc32;
var fs = require('fs');
var Mime = require('mime');
var Path = require('path');
var util = require('util');

var Segment1 = require('./segment1');
var schema = require('../schema');
var tools = require('../tools');

function Segment2(doc, tagId, start, length) {
	Segment1.call(this, doc, tagId, start, length);
}

util.inherits(Segment2, Segment1);

module.exports = Segment2;

Segment2.prototype.addFileAttachment = function(path, description, mimeType, fileName, callback) {

	if (typeof (description) === "function" && arguments.length == 2) {
		callback = description;
		description = undefined;

	} else if (typeof (mimeType) === "function" && arguments.length == 3) {
		callback = mimeType;
		mimeType = undefined;

	} else if (typeof (fileName) === "function" && arguments.length == 4) {
		callback = fileName;
		fileName = undefined;
	}

	if (typeof (callback) !== "function") {
		return this.addFileAttachmentSync(path, description, mimeType, fileName);
	}

	if (typeof (path) !== 'string' || !path) {
		return callback("Invalid path '" + path + "'");
	}

	var self = this;

	fs.stat(path, function(error, stats) {
		if (error) {
			return callback(error);
		}

		if (!fileName) {
			fileName = Path.basename(path);
		}

		if (!mimeType) {
			mimeType = Mime.lookup(path);
		}

		var attachedFileTag = self._addAttachment({
			path: path,
			description: description,
			size: stats.size,
			fileName: fileName,
			mimeType: mimeType,
			date: stats.mtime
		});

		callback(null, attachedFileTag);
	});
};

Segment2.prototype.getAttachmentByFileName = function(filename) {

	return this.eachChildByName(schema.byName.AttachedFile, function(attachedFile) {
		var fn = attachedFile.getFirstChildByName(schema.byName.FileName);
		if (!fn) {
			return;
		}
		if (fn.getValue() !== filename) {
			return;
		}

		return attachedFile;
	});
};

Segment2.prototype.getAttachmentByFileUID = function(fileUID) {

	return this.eachChildByName(schema.byName.AttachedFile, function(attachedFile) {
		var fn = attachedFile.getFirstChildByName(schema.byName.FileUID);
		if (!fn) {
			return;
		}
		if (fn.getValue() !== fileUID) {
			return;
		}

		return attachedFile;
	});
};

Segment2.prototype.addFileAttachmentSync = function(path, description, mimeType, fileName) {

	if (typeof (path) !== 'string' || !path) {
		throw new Error("Invalid path '" + path + "'");
	}

	var stats = fs.statSync(path);

	if (!fileName) {
		fileName = Path.basename(path);
	}

	if (!mimeType) {
		mimeType = Mime.lookup(path);
	}

	var attachedFileTag = this._addAttachment({
		path: path,
		description: description,
		size: stats.size,
		fileName: fileName,
		mimeType: mimeType,
		date: stats.mtime
	});

	return attachedFileTag;
};

Segment2.prototype.addStreamAttachment = function(stream, fileName, mimeType, size, description, callback) {

	if (typeof (size) !== 'number') {
		return callback("Invalid size for attachment '" + size + "'");
	}

	if (typeof (mimeType) !== 'string' || !mimeType.length) {
		return callback("Invalid mimeType for attachment '" + mimeType + "'");
	}

	if (typeof (fileName) !== 'string' || !fileName.length) {
		return callback("Invalid fileName for attachment '" + fileName + "'");
	}

	if (typeof (description) === "function") {
		callback = description;
		description = undefined;

	}

	var attachedFileTag = this._addAttachment({
		stream: stream,
		description: description,
		size: size,
		fileName: fileName,
		mimeType: mimeType
	});

	callback(null, attachedFileTag);
};

Segment2.prototype._addAttachment = function(desc) {

	var doc = this.ownerDocument;

	var attachments = this.$attachments;

	var attachedFile = attachments.$attachedFile;
	attachedFile.$crc_32 = 0;
	attachedFile.fileName = desc.fileName;
	attachedFile.fileMimeType = desc.mimeType;

	if (desc.description) {
		attachedFile.fileDescription = desc.description;
	}

	var uid = crc32(desc.fileName + "$" + desc.mimeType + "$" + desc.description + "$" + desc.size);
	attachedFile.fileUID = uid;

	var fileData = attachedFile.getFileData();
	fileData.dataSize = desc.size;

	var getStream;
	var info;
	if (typeof (desc.stream) === "function") {
		getStream = desc.stream;
		info = "*function*";

	} else if (desc.path) {
		getStream = function(options, callback) {
			var stream = fs.createReadStream(desc.path, options);
			// console.log("Get stream (3) of ", desc.path, stream);
			callback(null, stream);
		};
		info = desc.path;
	}

	fileData._dataSource = {
		getStream: getStream,
		info: info
	};

	return attachedFile;
};

function targetIn(id, elements) {
	if (!elements || !elements.length) {
		return false;
	}

	for (var i = 0; i < elements.length; i++) {
		if (elements[i].getValue() !== id) {
			continue;
		}

		return true;
	}

	return false;
}

Segment2.prototype.getTagByTargetType = function(targetInfos) {

	var tags = this.listChildrenByName(schema.byName.Tag);
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i];

		var targets = tag.targets;
		if (!targets || targets.empty) {
			if (!targetInfos) {
				return tag;
			}
			continue;
		}

		if (targetInfos.targetTypeValue !== undefined) {
			if (targetInfos.targetTypeValue !== targets.targetTypeValue) {
				continue;
			}
		}

		if (targetInfos.targetType !== undefined) {
			if (targetInfos.targetType !== targets.targetType) {
				continue;
			}
		}

		var tus = targets.tagTrackUIDs;
		if (targetInfos.tagTrackUID !== undefined) {
			if (!targetIn(targetInfos.tagTrackUID, tus)) {
				continue;
			}
		} else if (tus && tus.length) {
			continue;
		}

		var tes = targets.tagEditionUIDs;
		if (targetInfos.tagEditionUID !== undefined) {
			if (!targetIn(targetInfos.tagEditionUID, tes)) {
				continue;
			}
		} else if (tes && tes.length) {
			continue;
		}

		var tcs = targets.tagChapterUIDs;
		if (targetInfos.tagChapterUID !== undefined) {
			if (!targetIn(targetInfos.tagChapterUID, tcs)) {
				continue;
			}
		} else if (tcs && tcs.length) {
			continue;
		}

		var tas = targets.tagAttachmentUIDs;
		if (targetInfos.tagAttachmentUID !== undefined) {
			if (!targetIn(targetInfos.tagAttachmentUID, tas)) {
				continue;
			}
		} else if (tas && tas.length) {
			continue;
		}

		return tag;
	}
};

/**
 * 
 * @param parent
 *          A Segment (itself), a Tags or a Tag
 * @param name
 * @param language
 * @param defaultLanguage
 * @param value
 * @param callback
 * @returns
 */
Segment2.prototype.addSimpleTagSync = function(targetInfos, name, language, defaultLanguage, value) {

	var tag;
	if (targetInfos.ebmlID === schema.byName.SimpleTag) {
		tag = targetInfos;

	} else {
		tag = this.getTagByTargetType(targetInfos);

		if (!tag) {
			tag = this.$tags.newTag();

			var targets = tag.$targets;
			if (targetInfos) {
				if (targetInfos.tagAttachmentUID) {
					targets.addTagAttachmentUID(targetInfos.tagAttachmentUID);
				}
				if (targetInfos.targetTypeValue) {
					targets.targetTypeValue = targetInfos.targetTypeValue;
				}
				if (targetInfos.targetType) {
					targets.targetType = targetInfos.targetType;
				}
			}
		}
	}

	var simpleTag = tag.newSimpleTag();
	simpleTag.tagName = name;
	simpleTag.tagLanguage = language || "und";
	simpleTag.tagDefault = defaultLanguage ? 1 : 0;

	/*
	 * if (typeof (value) === "function") { var binaryTag =
	 * this.createElement(schema.byName.TagBinary);
	 * simpleElement.appendChild(binaryTag); binaryElement.setData(value);
	 * 
	 * //TODO WE MUST KNOW the SIZE !
	 * 
	 * return callback(null, simpleTag); }
	 */

	if (value === null || value === undefined) {
		return simpleTag;
	}

	if (Buffer.isBuffer(value)) {
		simpleTag.tagBinary = value;

		return simpleTag;
	}

	if (value instanceof Date) {
		value = tools.formatDate(value);
	}

	value = String(value);

	simpleTag.tagString = value;

	return simpleTag;
};
