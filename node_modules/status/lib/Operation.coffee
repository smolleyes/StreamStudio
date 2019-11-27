{EventEmitter} = require "events"
{parseArguments} = require "fractal"

class Operation extends EventEmitter
  constructor: (name, @fn) ->
    throw "Missing function" unless typeof @fn is 'function'
    @_meta = {}
    @_meta.name = name
    return

  details: =>
    out =
      name: @_meta.name
      arguments: parseArguments(@fn)
    return out

  error: (args...) => @emit "error", args...
  done: (ret) => @emit "done", ret
  run: (args...) =>
    try
      @fn args...
    catch err
      return @error err

module.exports = Operation