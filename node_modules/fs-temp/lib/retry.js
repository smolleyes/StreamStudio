
exports.async = function (fn, cb) {

  var tries = 3;

  (function next () {
    fn(function (err, res) {
      if (!err) { return cb(null, res); }
      if (err.code !== 'EEXIST') { return cb(err); }

      if (--tries === 0) {
        cb(new Error('Failed to find unique name'));
      } else {
        next();
      }
    });
  }());

};

exports.sync = function (fn) {

  var tries = 3;

  while (--tries) {

    try {
      res = fn();
    } catch (err) {
      if (err.code === 'EEXIST') {
        continue ;
      } else {
        throw err;
      }
    }

    return res;
  }

  throw new Error('Failed to find unique name');
};
