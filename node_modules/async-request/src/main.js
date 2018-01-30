'use strict';

let Arequest,
    request = require('request'),
    _ = require('lodash');

request.debug = false;

Arequest = (defaultOptions) => {
    let arequest;

    Arequest.validateOptions(defaultOptions);

    arequest = async (url, options) => {
        return new Promise((resolve) => {
            Arequest.validateOptions(options);

            options = _.assign({url: url}, options, defaultOptions);

            options = Arequest.mapOptions(options);

            request(options, (error, response) => {
                if (error) {
                    throw new Error(error);
                }

                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    body: response.body
                });
            });
        });
    };

    arequest.defaults = (options) => {
        if (!options) {
            return defaultOptions;
        }

        if (options.cookieJar === true) {
            options.cookieJar = request.jar();
        }

        return Arequest(options);
    };

    return arequest;
};

/**
 *
 */
Arequest.validateOptions = (options) => {
    let unknownOption;

    if (!options) {
        return;
    }

    unknownOption = _.first(_.difference(_.keys(options), ['method', 'data', 'headers', 'proxy', 'cookieJar', 'cookieJar2']));

    if (unknownOption) {
        throw new Error('Unknown option ("' + unknownOption + '").');
    }

    if (options.method && _.indexOf(['GET', 'POST', 'PUT', 'HEAD', 'DELETE'], options.method) === -1) {
        throw new Error('Unknown option.method value ("' + options.method + '").');
    }
};

/**
 * Map options to meet the request interface.
 */
Arequest.mapOptions = (options) => {
    if (!options) {
        return options;
    }

    if (options.data) {
        options.form = options.data;

        delete options.data;
    }

    if (options.cookieJar) {
        options.jar = options.cookieJar;

        delete options.cookieJar;
    }

    return options;
};

module.exports = Arequest({});
