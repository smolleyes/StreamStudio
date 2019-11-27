'use strict';

/**
 * Module dependencies.
 */

require('should');
var validator = require('../lib/validator');

describe('Validate', function () {

	describe('String', function() {
		it('returns true for valid string', function() {
			validator.isString('Alcatraz').should.equal(true);
		});

		it('returns false for invalid string', function() {
			validator.isString(50).should.equal(false);
		});
	});

	describe('Number', function() {
		it('returns true for valid number', function() {
			validator.isNumber(50).should.equal(true);
		});

		it('returns false for invalid number', function() {
			validator.isNumber('50').should.equal(false);
		});
	});

	describe('Boolean', function() {
		it('returns true for valid number', function() {
			validator.isBoolean(true).should.equal(true);
		});

		it('returns false for invalid number', function() {
			validator.isBoolean('50').should.equal(false);
		});
	});

	describe('Result Type', function() {
		it('returns true for valid type "movie"', function() {
			var params = {
				type: 'movie'
			};
			validator.isValidType(params).should.equal(true);
		});

		it('returns true for valid type "series"', function() {
			var params = {
				type: 'series'
			};
			validator.isValidType(params).should.equal(true);
		});

		it('returns true for valid type "episode"', function() {
			var params = {
				type: 'episode'
			};
			validator.isValidType(params).should.equal(true);
		});

		it('returns true for invalid type', function() {
			var params = {
				type: 'film'
			};
			validator.isValidType(params).should.equal(false);
		});
	});

	describe('Plot Type', function() {
		it('returns true for valid type "full"', function() {
			var params = {
				plot: 'full'
			};
			validator.isValidPlotType(params).should.equal(true);
		});

		it('returns true for valid type "short"', function() {
			var params = {
				plot: 'short'
			};
			validator.isValidPlotType(params).should.equal(true);
		});

		it('returns true for invalid type', function() {
			var params = {
				plot: 'film'
			};
			validator.isValidPlotType(params).should.equal(false);
		});
	});

});
