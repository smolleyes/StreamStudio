"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _this = this;

var Arequest = undefined,
    request = require("request"),
    _ = require("lodash");

request.debug = false;

Arequest = function (defaultOptions) {
    var arequest = undefined;

    Arequest.validateOptions(defaultOptions);

    arequest = function callee$1$0(url, options) {
        return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    return context$2$0.abrupt("return", new _core.Promise(function (resolve) {
                        Arequest.validateOptions(options);

                        options = _.assign({ url: url }, options, defaultOptions);

                        options = Arequest.mapOptions(options);

                        request(options, function (error, response) {
                            if (error) {
                                throw new Error(error);
                            }

                            resolve({
                                statusCode: response.statusCode,
                                headers: response.headers,
                                body: response.body
                            });
                        });
                    }));

                case 1:
                case "end":
                    return context$2$0.stop();
            }
        }, null, _this);
    };

    arequest.defaults = function (options) {
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
Arequest.validateOptions = function (options) {
    var unknownOption = undefined;

    if (!options) {
        return;
    }

    unknownOption = _.first(_.difference(_.keys(options), ["method", "data", "headers", "proxy", "cookieJar", "cookieJar2"]));

    if (unknownOption) {
        throw new Error("Unknown option (\"" + unknownOption + "\").");
    }

    if (options.method && _.indexOf(["GET", "POST", "PUT", "HEAD", "DELETE"], options.method) === -1) {
        throw new Error("Unknown option.method value (\"" + options.method + "\").");
    }
};

/**
 * Map options to meet the request interface.
 */
Arequest.mapOptions = function (options) {
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
//# sourceMappingURL=data:application/json;base64,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QUs7QUFDL0IsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNWLGVBQU8sT0FBTyxDQUFDO0tBQ2xCOztBQUVELFFBQUksT0FBTyxDQUFDLElBQUksRUFBRTtBQUNkLGVBQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQzs7QUFFNUIsZUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDO0tBQ3ZCOztBQUVELFFBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtBQUNuQixlQUFPLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7O0FBRWhDLGVBQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQztLQUM1Qjs7QUFFRCxXQUFPLE9BQU8sQ0FBQztDQUNsQixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmxldCBBcmVxdWVzdCxcbiAgICByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxucmVxdWVzdC5kZWJ1ZyA9IGZhbHNlO1xuXG5BcmVxdWVzdCA9IChkZWZhdWx0T3B0aW9ucykgPT4ge1xuICAgIGxldCBhcmVxdWVzdDtcblxuICAgIEFyZXF1ZXN0LnZhbGlkYXRlT3B0aW9ucyhkZWZhdWx0T3B0aW9ucyk7XG5cbiAgICBhcmVxdWVzdCA9IGFzeW5jICh1cmwsIG9wdGlvbnMpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBBcmVxdWVzdC52YWxpZGF0ZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgICAgICAgIG9wdGlvbnMgPSBfLmFzc2lnbih7dXJsOiB1cmx9LCBvcHRpb25zLCBkZWZhdWx0T3B0aW9ucyk7XG5cbiAgICAgICAgICAgIG9wdGlvbnMgPSBBcmVxdWVzdC5tYXBPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgICAgICByZXF1ZXN0KG9wdGlvbnMsIChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogcmVzcG9uc2Uuc3RhdHVzQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogcmVzcG9uc2UuYm9keVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhcmVxdWVzdC5kZWZhdWx0cyA9IChvcHRpb25zKSA9PiB7XG4gICAgICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRPcHRpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY29va2llSmFyID09PSB0cnVlKSB7XG4gICAgICAgICAgICBvcHRpb25zLmNvb2tpZUphciA9IHJlcXVlc3QuamFyKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gQXJlcXVlc3Qob3B0aW9ucyk7XG4gICAgfTtcblxuICAgIHJldHVybiBhcmVxdWVzdDtcbn07XG5cbi8qKlxuICpcbiAqL1xuQXJlcXVlc3QudmFsaWRhdGVPcHRpb25zID0gKG9wdGlvbnMpID0+IHtcbiAgICBsZXQgdW5rbm93bk9wdGlvbjtcblxuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdW5rbm93bk9wdGlvbiA9IF8uZmlyc3QoXy5kaWZmZXJlbmNlKF8ua2V5cyhvcHRpb25zKSwgWydtZXRob2QnLCAnZGF0YScsICdoZWFkZXJzJywgJ3Byb3h5JywgJ2Nvb2tpZUphcicsICdjb29raWVKYXIyJ10pKTtcblxuICAgIGlmICh1bmtub3duT3B0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBvcHRpb24gKFwiJyArIHVua25vd25PcHRpb24gKyAnXCIpLicpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLm1ldGhvZCAmJiBfLmluZGV4T2YoWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnSEVBRCcsICdERUxFVEUnXSwgb3B0aW9ucy5tZXRob2QpID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gb3B0aW9uLm1ldGhvZCB2YWx1ZSAoXCInICsgb3B0aW9ucy5tZXRob2QgKyAnXCIpLicpO1xuICAgIH1cbn07XG5cbi8qKlxuICogTWFwIG9wdGlvbnMgdG8gbWVldCB0aGUgcmVxdWVzdCBpbnRlcmZhY2UuXG4gKi9cbkFyZXF1ZXN0Lm1hcE9wdGlvbnMgPSAob3B0aW9ucykgPT4ge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgICAgIG9wdGlvbnMuZm9ybSA9IG9wdGlvbnMuZGF0YTtcblxuICAgICAgICBkZWxldGUgb3B0aW9ucy5kYXRhO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNvb2tpZUphcikge1xuICAgICAgICBvcHRpb25zLmphciA9IG9wdGlvbnMuY29va2llSmFyO1xuXG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLmNvb2tpZUphcjtcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0aW9ucztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJlcXVlc3Qoe30pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9