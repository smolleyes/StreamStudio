'use strict';

/**
 * Module dependencies.
 */
 
var omdbApi = require('../index');

var output = function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log(data);	
	}
};

/**
 * Search movie by title & year.
 */
omdbApi.search({
	query: 'Terminator',
	year: 1984
}, output);

/**
 * Search movie by title, year & type.
 */
omdbApi.search({
	query: 'Terminator',
	year: 1984,
	type: 'movie'
}, output);
