
var xhr = require('xhr');

/**
 * assert
 *
 * expr
 * err
 */

function assert (expr, err) {
  if (!expr) throw new Error(err || 'it\'s broken');
}

describe('xhr()', function () {
  it('should return `XMLHttpRequest` or `ActiveXObject`', function () {
    assert(xhr() instanceof XMLHttpRequest || xhr() instanceof ActiveXObject
      , 'Expected `req` to be instanceof XMLHttpRequest or ActiveXObject');
  })
})
