'use strict';

/**
 * Module dependencies.
 */

var jsonHttp = require('json-http');
var omdbApi = require('../index');
var sinon = require('sinon');

var _shouldHaveErrorMessage = function(params, message, done) {
	omdbApi.search(params, function(err) {
		err.should.eql(message);
		done();
	});
};

var _shouldBeCalledWithUrl = function(params, expectedUrl, done) {
	omdbApi.search(params, function() {
		jsonHttp.getJson
		.calledWith(expectedUrl)
		.should.equal(true);
		done();
	});
};

describe('Search Film', function() {

	beforeEach(function() {
		sinon.stub(jsonHttp, 'getJson');
		jsonHttp.getJson.yields(null, { title: 'film title' });
	});

	afterEach(function() {
		jsonHttp.getJson.restore();
	});

  it('sets user defined timeout value', function(done) {
    var params = {
      query: 'Terminator',
      timeout: 3000
    };
    var url = 'http://www.omdbapi.com/?s=Terminator&r=json&v=1';
    omdbApi.search(params, function() {
      jsonHttp.getJson.calledWith(url, 3000).should.equal(true);
      done();
    });
  });

  it('uses default timeout of 10 seconds if not user defined', function(done) {
    var params = {
      query: 'Terminator'
    };
    var url = 'http://www.omdbapi.com/?s=Terminator&r=json&v=1';
    omdbApi.search(params, function() {
      jsonHttp.getJson.calledWith(url, 10000).should.equal(true);
      done();
    });
  });

	it('with http error returns error message', function(done) {

    var url = 'http://www.omdbapi.com/?s=Terminator&r=json&v=1';
    var params = {
      query: 'Terminator'
    };

    jsonHttp.getJson.withArgs(url).yields('timeout error', null);

    _shouldHaveErrorMessage(
      params,
      'timeout error',
      done);
  });

  it('with imdb error returns error message', function(done) {

    var url = 'http://www.omdbapi.com/?s=Alcatraz&r=json&v=1';
    
    var response = { 
      Error: 'message from imdb server' 
    };

    var params = {
      query: 'Alcatraz'
    };

    jsonHttp.getJson.withArgs(url).yields(null, response);

    _shouldHaveErrorMessage(
      params,
      'message from imdb server',
      done);
  });

  it('with imdb data returns response data', function(done) {

    var url = 'http://www.omdbapi.com/?s=The%20Brain%20Terminator&r=json&v=1';
    
    var response = { 
      Title: 'The Brain Terminator',
      Year: '2012'
    };

    var params = {
      query: 'The Brain Terminator'
    };

    jsonHttp.getJson.withArgs(url).yields(null, response);

    omdbApi.search(params, function(err, data) {
      data.should.eql(response);
      done();
    });
  });

	describe('with invalid mandatory params', function() {

		it('returns error when params object is null', function(done) {
			_shouldHaveErrorMessage(
				null, 
				'params cannot be null.', 
				done);
		});

		it('returns error when query is empty', function(done) {
			_shouldHaveErrorMessage(
				{}, 
				'query param required.', 
				done);
		});

	});

	describe('with "query" parameter', function() {

		it('returns error for invalid string', function(done) {
			var params = {
				query: 50
			};

			_shouldHaveErrorMessage(params, 'query must be a string.', done);
		});

		it('calls omdbapi with query querystring param', function(done) {
			var params = {
				query: 'Terminator'
			};

			_shouldBeCalledWithUrl(
				params,
				'http://www.omdbapi.com/?s=Terminator&r=json&v=1',
				done);
		});

	});

	describe('with "type" parameter', function() {

		it('returns error for invalid type', function(done) {
			var params = {
				query: 'Terminator',
				type: 'film'
			};

			_shouldHaveErrorMessage(
				params,
				'type must be: movie, series, episode.', 
				done);
		});

		it('calls omdbapi with type querystring param', function(done) {
			var params = {
				query: 'Terminator',
				type: 'movie'
			};

			_shouldBeCalledWithUrl(
				params,
				'http://www.omdbapi.com/?s=Terminator&type=movie&r=json&v=1',
				done);
		});

	});

	describe('with "year" parameter', function() {
		
		it('returns error when type is not number', function(done) {
			var params = {
				query: 'Terminator',
				year: 'yesterday'
			};

			_shouldHaveErrorMessage(
				params, 
				'year must be a valid number', 
				done);
		});

		it('calls omdbapi with year querystring param', function(done) {
			var params = {
				query: 'Terminator',
				year: 1984
			};

			_shouldBeCalledWithUrl(
				params,
				'http://www.omdbapi.com/' +
					'?s=Terminator&y=1984&r=json&v=1',
				done);
		});

	});

});
