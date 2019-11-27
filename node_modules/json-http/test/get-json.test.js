'use strict';

/**
 * Module dependencies.
 */
var should = require('should');
var jsonHttp = require('../index');

describe('Get', function() {

  it('returns response', function(done) {
    var url = 'http://www.omdbapi.com/?t=Terminator&y=&plot=short&r=json';
    jsonHttp.getJson(url, function(err, response) {
      should.exist(response);
      done();
    });
  });

  it('returns timeout error message', function(done) {
    var url = 'http://www.omdbapi.com/?t=Terminator&y=&plot=short&r=json';
    jsonHttp.getJson(url, 2, function(err) {
      err.should.equal('timeout exceeded');
      done();
    });
  });

  it('returns error message', function(done) {
    var url = 'http://localhost';
    jsonHttp.getJson(url, 2, function(err) {
      err.code.should.eql('ECONNREFUSED');
      done();
    });
  });

});