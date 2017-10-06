/*jslint node: true, vars: true, nomen: true */
'use strict';

module.exports = {
	Decoder: require('./lib/decoder'),
	Document: require('./lib/document'),
	Schema: require('./lib/schema'),
	FileSource: require('./lib/source/fileSource'),
	HttpSource: require('./lib/source/httpSource'),
	StreamFactorySource: require('./lib/source/streamFactorySource')
};
