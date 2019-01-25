var util = require('util'),
    StreamParser = require('stream-parser'),
    StreamTransform = require('stream').Transform;

/**
 * Block size of metadata
 * @type {Number}
 * @private
 */
var METADATA_BLOCK_SIZE = 16;

util.inherits(Reader, StreamTransform);
StreamParser(Reader.prototype);

/**
 * Create new transform stream which will getting metadata
 * @param {Number} metaint Number of bytes which need to skip for metadata section
 * @constructor
 */
function Reader(metaint) {
    StreamTransform.call(this);
    this.metaint = +metaint;
    this._passthrough(this.metaint, this._onMetaSectionStart);
}

/**
 * Triggers when metadata section is starting
 * @private
 */
Reader.prototype._onMetaSectionStart = function () {
    this._bytes(1, this._onMetaSectionLengthByte);
};

/**
 * Triggers when we read 1 byte with metadata section length
 * @param chunk Chunk where located length byte
 * @private
 */
Reader.prototype._onMetaSectionLengthByte = function (chunk) {
    var length = chunk[0] * METADATA_BLOCK_SIZE;

    if (length > 0) {
        this._bytes(length, this._onMetaData);
    } else {
        this._passthrough(this.metaint, this._onMetaSectionStart);
    }
};

/**
 * Triggers when metadata is collected
 * @param chunk Metadata buffer
 * @private
 */
Reader.prototype._onMetaData = function (chunk) {
    this.emit('metadata', chunk);
    this._passthrough(this.metaint, this._onMetaSectionStart);
};

module.exports = Reader;