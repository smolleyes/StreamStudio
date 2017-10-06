var http = require('http'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Parser = require('./lib/Parser'),
    Reader = require('./lib/Reader');

util.inherits(Metadata, EventEmitter);

/**
 * Create new Metadata instance
 * @param {String} url Radio station url
 * @param {Object} config Object with additional parameters
 * @constructor
 * @private
 */
function Metadata(url, config) {
    EventEmitter.call(this);

    this.setLink(url);
    this.setConfig(config);
    this.queueRequest(0);
}

/**
 * Triggers when request successful and returns Readable stream
 * @param {IncomingMessage|Stream} response
 * @private
 */
Metadata.prototype._onRequestResponse = function (response) {
    var self = this,
        metaint = response.headers['icy-metaint'];

    if (metaint) {
        this.setStream(new Reader(metaint));
        this.getStream().on('metadata', function (metadata) {
            self._destroyResponse(response);
            self._queueNextRequest(self.getConfig('metadataInterval'));
            self.emit('metadata', new Parser(metadata).parse());
        });
        response.pipe(this.getStream());
    } else {
        this._destroyResponse(response);
        this._queueNextRequest(this.getConfig('emptyInterval'));
        this.emit('empty');
    }
};

/**
 * Triggers when request was executed with error
 * @param error
 * @private
 */
Metadata.prototype._onRequestError = function (error) {
    this._queueNextRequest(this.getConfig('errorInterval'));
    this.emit('error', error);
};

/**
 * Destroy response if not need keep listening
 * @param {IncomingMessage} response
 * @private
 */
Metadata.prototype._destroyResponse = function (response) {
    if (!this.getConfig('keepListen')) {
        response.destroy();
    }
};

/**
 * Start processing request to radio station and grab metadata
 * @returns {Metadata}
 * @private
 */
Metadata.prototype._executeRequest = function () {
    var request = http.request(this.getLink());
    request.setHeader('Icy-MetaData', '1');
    request.once('response', this._onRequestResponse.bind(this));
    request.once('error', this._onRequestError.bind(this));
    request.end();
};

/**
 * Check if auto updating is enabled and queue new request
 * @param {Number} timeout Timeout for new request in seconds
 * @private
 */
Metadata.prototype._queueNextRequest = function (timeout) {
    if (this.getConfig('autoUpdate') && !this.getConfig('keepListen')) {
        this.queueRequest(timeout);
    }
};

/**
 * Queue new request for update metadata
 * @param {Number} timeout Timeout for next updating in seconds
 * @returns {Metadata}
 */
Metadata.prototype.queueRequest = function (timeout) {
    setTimeout(this._executeRequest.bind(this), timeout * 1000);
    return this;
};

/**
 * Get url from where metadata is getting
 * @returns {String} Returns radio station url
 */
Metadata.prototype.getLink = function () {
    return this._link;
};

/**
 * Set radio station link
 * @param {String} link URL of radio station
 * @returns {Metadata}
 */
Metadata.prototype.setLink = function (link) {
    this._link = link;
    return this;
};

/**
 * Get configuration object or value of specified key
 * @param {String} [key] Specify key if you want get specified option
 * @returns {Object|*} Returns all object of options or value of specified key
 */
Metadata.prototype.getConfig = function (key) {
    if (key) {
        return this._config[key];
    } else {
        return this._config;
    }
};

/**
 * Set configuration object
 * @param {Object} config
 * @returns {Metadata}
 */
Metadata.prototype.setConfig = function (config) {
    config = config || {};

    this._config = {
        keepListen: typeof config.keepListen === 'boolean' ? config.keepListen : false,
        autoUpdate: typeof config.autoUpdate === 'boolean' ? config.autoUpdate : false,
        errorInterval: config.errorInterval || 5 * 60,
        emptyInterval: config.emptyInterval || 3 * 60,
        metadataInterval: config.metadataInterval || 10
    };

    return this;
};

/**
 * Get metadata stream
 * @returns {Stream} Returns transform stream
 */
Metadata.prototype.getStream = function () {
    return this._stream;
};

/**
 * Set Transform stream to metadata
 * @param {Stream|Reader} stream Transform or duplex stream
 */
Metadata.prototype.setStream = function (stream) {
    this._stream = stream;
    this.emit('stream', stream);
};

module.exports = Metadata;