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
 * Find movie by title.
 */
omdbApi.get({
	title: 'Terminator',
	year: 2012
}, output);

/**
 * Find movie by id.
 */
omdbApi.get({
	id: 'tt0276751'
}, output);

/**
 * Find series by title & type.
 */
omdbApi.get({
	title: 'Terminator',
	type: 'series'
}, output);

/**
 * Find movies by title & type. Inlcude full plot and rotten tomatoes review.
 */
omdbApi.get({
	title: 'Milk',
	type: 'movie',
	plot: 'full',
	incTomatoes: true
}, output);
