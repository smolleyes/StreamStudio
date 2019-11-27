Operation = require "./Operation"

class Plugin
  constructor: (plug) ->
    @_meta = plug.meta
    @_operations = {}
    for k,v of plug when typeof v is "function" and k isnt "meta"
      if k is "_default"
        @_default = v
      else
        @_operations[k] = new Operation k,v
    return

  operations: -> (op.details() for name, op of @_operations)
  operation: (name) ->
    return op if op = @_operations[name]
    return new Operation name, op if op = @_default? name

  details: ->
    out =
      name: @_meta.name
      author: @_meta.author
      version: @_meta.version
      description: @_meta.description
      operations: @operations()
    return out

module.exports = Plugin