'use strict';

/**
 * Module dependencies.
 */

var http = require('json-http');
var validator = require('./validator');

/**
 * Validate the parameters for the search request.
 *
 * @param {Object} params
 * @return {Object} validation state
 * @api private
 */
var _validateParams = function(params) {

  if (!params) {
    return {
      error: 'params cannot be null.'
    };
  }

  // query is mandatory
  if (!params.hasOwnProperty('query')) {
    return {
      error: 'query param required.'
    };
  }

  if (!validator.isString(params.query)) {
    return {
      error: 'query must be a string.'
    };
  }

  if (!validator.isValidType(params)) {
    return {
      error: 'type must be: movie, series, episode.'
    };
  }

  if (params.hasOwnProperty('year') && !validator.isNumber(params.year)) {
    return { 
      error: 'year must be a valid number'
    };
  }

};

/**
 * Build the url string from the parameters.
 *
 * @param {Object} params 
 * @return {String} url to call omdbapi.com
 * @api private
 */
var _createUrl = function(params) {

  var baseUrl = 'http://www.omdbapi.com/';
  var query = '?';
  
  // mandatory
  query += 's='.concat(encodeURIComponent(params.query));
  
  if (params.year) {
    query += '&y='.concat(params.year);
  }

  if (params.type) {
    query += '&type='.concat(params.type);
  }

  return baseUrl.concat(query, '&r=json&v=1');
};

/**
 * Search film content from the imdb http service.
 *
 * @param {Object} params
 * @param {Function} callback
 * @api public
 */
module.exports = function(params, callback) {

  var validate = _validateParams(params);
  var timeout = (params) ? params.timeout || 10000 : 10000;

  if (validate) {
    callback(validate.error, null);  
    return;
  }

  http.getJson(_createUrl(params), timeout, function handleResponse(err, data) {
    
    if (err) {
      callback(err, null); 
      return;
    }

    if (data.Error) {
      callback(data.Error, null);  
    } else {
      callback(null, data); 
    }

  });

};
