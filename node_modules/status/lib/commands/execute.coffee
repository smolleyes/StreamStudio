argus = require "argus"
async = require "async"
log = require "loggo"
status = require "../main"

module.exports = (ops, {name, plain}) ->
  process.env.PLAIN_TEXT = true if plain
  plugin = status.plugins()[name]
  return log.error "Plugin '#{name}' is not installed" unless plugin

  if typeof ops is "string" and ops.length > 0
    operations = argus.parse ops
    operations = ({name:k,args:v} for k,v of argus.parse ops)
  else if plugin.operation null
    operations = [{name:null,args:[null]}]
  else
    return log.error "No operations specified"

  out = {}
  run = ({name, args}, cb) ->
    op = plugin.operation name
    return cb "#{name}: Operation does not exist" unless op?
    op.once 'error', (err) -> cb "#{name}: #{err.message or err}"
    op.once 'done', (ret) ->
      if process.env.PLAIN_TEXT
        out = ret
      else
        out[name or plugin.details().name] = ret
      return cb()
    op.run args...

  async.forEach operations, run, (err) ->
    return log.error err if err?
    if process.env.PLAIN_TEXT
      console.log out
    else
      console.log JSON.stringify out
    process.exit()