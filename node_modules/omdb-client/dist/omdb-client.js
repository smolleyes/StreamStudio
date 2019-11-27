(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.omdb = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports.getJson = function() {  
  var xhr = new XMLHttpRequest();
  var url = arguments[0];
  var timeoutInMs = 10000;
  var callback;

  if (typeof(arguments[1]) === 'function') {
    callback = arguments[1]; 
  }

  if (typeof(arguments[1]) === 'number') {
    timeoutInMs = arguments[1];
    callback = arguments[2];
  }

  xhr.onreadystatechange = function() {
    this.timeout = timeoutInMs;
    if (this.readyState === 4) {
      if (this.status === 200) {
        callback(null, this.response);
      } else {
        // timeouts are handled by ontimeout callback
        if (this.status !== 0) { 
          callback(this);
        }
      }
    }
  };
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.timeout = timeoutInMs;
  xhr.ontimeout = callback;
  xhr.send();
};

},{}],2:[function(require,module,exports){

module.exports.get = require('./lib/get');
module.exports.search = require('./lib/search');
},{"./lib/get":3,"./lib/search":4}],3:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var http = require('./../client/json-http.js');
var validator = require('./validator');

/**
 * Validate the parameters for the get request.
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

  // title and id are optional, but one must be present
  if (!params.hasOwnProperty('id') && !params.hasOwnProperty('title')) {
    return {
      error: 'id or title param required.'
    };
  }

  if (params.hasOwnProperty('title') && !validator.isString(params.title)) {
    return {
      error: 'title must be a string.'
    };
  }

  if (params.hasOwnProperty('id') && !validator.isString(params.id)) {
    return {
      error: 'id must be a string.'
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

  if (!validator.isValidPlotType(params)) {
    return { 
      error: 'plot must be: short, full.'
    };
  }

  if (params.hasOwnProperty('incTomatoes') && 
    !validator.isBoolean(params.incTomatoes)) {
    return { 
      error: 'incTomatoes must be a boolean.'
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
  
  if (params.id) {
    query += 'i='.concat(params.id);
  }

  if (params.title) {

    if (params.id) {
      query += '&t=';
    } else {
      query += 't=';
    }

    query += encodeURIComponent(params.title);
  }

  if (params.year) {
    query += '&y='.concat(params.year);
  }

  if (params.incTomatoes) {
    query += '&tomatoes='.concat(params.incTomatoes);
  }

  if (params.type) {
    query += '&type='.concat(params.type);
  }

  if (params.plot) {
    query += '&plot='.concat(params.plot);
  }

  return baseUrl.concat(query, '&r=json&v=1');
};

/**
 * Get film content from the imdb http service.
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

},{"./../client/json-http.js":1,"./validator":5}],4:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var http = require('./../client/json-http.js');
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

},{"./../client/json-http.js":1,"./validator":5}],5:[function(require,module,exports){
'use strict';

/**
 * Validate a data type for a given object's property.
 *
 * @param {String} value
 * @param {String} expected data type
 * @return {Boolean} whether the property is valid
 * @api private
 */
var _isDataType = function(value, type) {
  return typeof(value) === type;
};

/**
 * Validate string.
 *
 * @param {String} value
 * @return {Boolean} whether the property is valid
 * @api public
 */
module.exports.isString = function(value) {
  return _isDataType(value, 'string');
};

/**
 * Validate number.
 *
 * @param {Number} value
 * @return {Boolean} whether the property is valid
 * @api public
 */
module.exports.isNumber = function(value) {
  return _isDataType(value, 'number');
};

/**
 * Validate boolean.
 *
 * @param {Boolean} value
 * @return {Boolean} whether the property is valid
 * @api public
 */
module.exports.isBoolean = function(value) {
  return _isDataType(value, 'boolean');
};

/**
 * Validate result type - optional and (movie|series|episode)
 *
 * @param {Object} params
 * @return {Boolean} whether the property is valid
 * @api public
 */
module.exports.isValidType = function(params) {
  if (params.hasOwnProperty('type')) {
    return params.type.match('movie|series|episode') !== null;
  }

  return true;
};

/**
 * Validate plot type - optional and (short|full).
 *
 * @param {Object} params
 * @return {Boolean} whether the property is valid
 * @api public
 */
module.exports.isValidPlotType = function(params) {
  if (params.hasOwnProperty('plot')) {
    return params.plot.match('short|full') !== null;
  }

  return true;
};

},{}]},{},[2])(2)
});