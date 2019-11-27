'use strict';

/**
 * Module dependencies.
 */
 
var should = require('should');
var jsonHttp = require('json-http');
var omdbApi = require('../index');
var sinon = require('sinon');

var _shouldNotHaveError = function(params, done) {
  omdbApi.get(params, function(err) {
    should.not.exist(err);
    done();
  });
};

var _shouldHaveErrorMessage = function(params, message, done) {
  omdbApi.get(params, function(err) {
    err.should.eql(message);
    done();
  });
};

var _shouldBeCalledWithUrl = function(params, expectedUrl, done) {
  omdbApi.get(params, function() {
    jsonHttp.getJson
    .calledWith(expectedUrl)
    .should.equal(true);
    done();
  });
};

describe('Get Film', function() {

  beforeEach(function() {
    sinon.stub(jsonHttp, 'getJson');
    jsonHttp.getJson.yields(null, { title: 'film title' });
  });

  afterEach(function() {
    jsonHttp.getJson.restore();
  });

  it('sets user defined timeout value', function(done) {
    var params = {
      title: 'Terminator',
      timeout: 3000
    };
    var url = 'http://www.omdbapi.com/?t=Terminator&r=json&v=1';
    omdbApi.get(params, function() {
      jsonHttp.getJson.calledWith(url, 3000).should.equal(true);
      done();
    });
  });

  it('uses default timeout of 10 seconds if not user defined', function(done) {
    var params = {
      title: 'Terminator'
    };
    var url = 'http://www.omdbapi.com/?t=Terminator&r=json&v=1';
    omdbApi.get(params, function() {
      jsonHttp.getJson.calledWith(url, 10000).should.equal(true);
      done();
    });
  });

  it('with http error returns error message', function(done) {

    var url = 'http://www.omdbapi.com/?t=Terminator&r=json&v=1';
    var params = {
      title: 'Terminator'
    };

    jsonHttp.getJson.withArgs(url).yields('timeout error', null);

    _shouldHaveErrorMessage(
      params,
      'timeout error',
      done);
  });

  it('with imdb error returns error message', function(done) {

    var url = 'http://www.omdbapi.com/?t=Alcatraz&r=json&v=1';
    
    var response = { 
      Error: 'message from imdb server' 
    };

    var params = {
      title: 'Alcatraz'
    };

    jsonHttp.getJson.withArgs(url).yields(null, response);

    _shouldHaveErrorMessage(
      params,
      'message from imdb server',
      done);
  });

  it('with imdb data returns response data', function(done) {

    var url = 'http://www.omdbapi.com/?t=The%20Brain%20Terminator&r=json&v=1';
    
    var response = { 
      Title: 'The Brain Terminator',
      Year: '2012'
    };

    var params = {
      title: 'The Brain Terminator'
    };

    jsonHttp.getJson.withArgs(url).yields(null, response);

    omdbApi.get(params, function(err, data) {
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

    it('returns error when id and title is empty', function(done) {
      _shouldHaveErrorMessage(
        {}, 
        'id or title param required.', 
        done);
    });

  });

  describe('with "title" parameter', function() {

    it('returns error for invalid string', function(done) {
      var params = {
        title: 50
      };

      _shouldHaveErrorMessage(params, 'title must be a string.', done);
    });

    it('calls omdbapi with title querystring param', function(done) {
      var params = {
        title: 'Milk'
      };

      _shouldBeCalledWithUrl(
        params,
        'http://www.omdbapi.com/' +
          '?t=Milk&r=json&v=1',
        done);
    });

    it('calls omdbapi with title and id querystring param', function(done) {
      var params = {
        title: 'Milk',
        id: 'tt1013753'
      };

      _shouldBeCalledWithUrl(
        params,
        'http://www.omdbapi.com/' +
          '?i=tt1013753&t=Milk&r=json&v=1',
        done);
    });
  });

  describe('with "id" parameter', function() {

    it('returns error for invalid string', function(done) {
      var params = {
        id: 123
      };

      _shouldHaveErrorMessage(params, 'id must be a string.', done);
    });

    it('calls omdbapi with id querystring param', function(done) {
      var params = {
        id: 'tt1013753'
      };

      _shouldBeCalledWithUrl(
        params,
        'http://www.omdbapi.com/' +
          '?i=tt1013753&r=json&v=1',
        done);
    });
  });

  describe('with "year" parameter', function() {
    
    it('returns error when type is not number', function(done) {
      var params = {
        title: 'Milk',
        year: 'movie'
      };

      _shouldHaveErrorMessage(
        params, 
        'year must be a valid number', 
        done);
    });

    it('calls omdbapi with year querystring param', function(done) {
      var params = {
        id: 'tt1013753',
        year: 2008
      };

      _shouldBeCalledWithUrl(
        params,
        'http://www.omdbapi.com/' +
          '?i=tt1013753&y=2008&r=json&v=1',
        done);
    });

  });

  describe('with "incTomatoes" parameter', function() {
    
    it('returns error when type is not boolean', function(done) {
      var params = {
        title: 'Milk',
        incTomatoes: 'yes'
      };

      _shouldHaveErrorMessage(
        params, 
        'incTomatoes must be a boolean.',
        done);
    });

    it('calls omdbapi with incTomatoes querystring param', function(done) {
      var params = {
        id: 'tt1013753',
        incTomatoes: true,
      };

      _shouldBeCalledWithUrl(
        params,
        'http://www.omdbapi.com/' +
          '?i=tt1013753&tomatoes=true&r=json&v=1',
        done);
    });

  });

  describe('with "type" parameter', function() {

    it('returns error for invalid value', function(done) {
      var params = {
        title: 'Milk',
        type: 'film'
      };

      _shouldHaveErrorMessage(
        params, 
        'type must be: movie, series, episode.', 
        done);
    });

    it('returns no error for valid type', function(done) {
      var params = {
        title: 'Milk',
        type: 'movie'
      };

      _shouldNotHaveError(params, done);
    });

    it('calls omdbapi with type querystring param', function(done) {
      var params = {
        id: 'tt1013753',
        type: 'episode'
      };

      _shouldBeCalledWithUrl(
        params,
        'http://www.omdbapi.com/' +
          '?i=tt1013753&type=episode&r=json&v=1',
        done);
    });

  });

  describe('with "plot" parameter', function() {

    it('returns error for invalid value', function(done) {
      var params = {
        title: 'Milk',
        plot: 'big'
      };

      _shouldHaveErrorMessage(
        params, 
        'plot must be: short, full.',
        done);
    });

    it('returns no error for valid plot', function(done) {
      var params = {
        title: 'Milk',
        plot: 'short'
      };

      _shouldNotHaveError(params, done);
    });

    it('calls omdbapi with plot querystring param', function(done) {
      var params = {
        id: 'tt1013753',
        plot: 'full'
      };

      _shouldBeCalledWithUrl(
        params,
        'http://www.omdbapi.com/' +
          '?i=tt1013753&plot=full&r=json&v=1',
        done);
    });

  });

});
