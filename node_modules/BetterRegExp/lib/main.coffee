util = require './util'

BetterRegExp = (pattern, flag="") ->
  if pattern instanceof RegExp
    flag += util.getFlags pattern
    pattern = pattern.source
  throw "Pattern must be a string or RegExp" unless typeof pattern is "string"
  regex = new RegExp pattern, util.cleanFlag flag
  regex[k] = v for own k,v of BetterRegExp::
  return regex

BetterRegExp::clone = (flags=@flags()) -> BetterRegExp @source, flags
BetterRegExp::flags = -> util.getFlags @
BetterRegExp::addFlag = (flag) -> @setFlag @flags()+flag
BetterRegExp::setFlag = (flag) -> 
  @compile @source, flag
  return @
BetterRegExp::removeFlag = (flag) -> @setFlag (m for m in @flags() when !(m in flag))
BetterRegExp::hasFlag = (flag) -> (m for m in @flags() when !(m in flag)).length isnt -1

for flag, name of util.flags
  do (flag) ->
    BetterRegExp::["is#{util.uppercase(name)}"] = -> @hasFlag flag
    BetterRegExp::[flag] = -> @addFlag flag

BetterRegExp.escape = util.escape
BetterRegExp.util = util

module.exports = BetterRegExp