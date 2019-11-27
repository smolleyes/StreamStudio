status = require "../main"

module.exports = ({json}) ->
  plugins = (plug.details() for name, plug of status.plugins())
  if json
    console.log JSON.stringify plugins
  else
    for plug in plugins
      name = "#{plug.name}@#{plug.version}"
      name += " - #{plug.description}" if typeof plug.description is "string"
      console.log name
      console.log "  * #{op.name}" for op in plug.operations
  return