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
