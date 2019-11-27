module.exports = (fn) ->
  str = fn.toString()
  raw = str[str.indexOf('(')+1...str.indexOf(')')]
  return raw.match /([^\s,]+)/g