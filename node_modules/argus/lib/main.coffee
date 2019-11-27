{readFileSync} = require 'fs'
{join} = require 'path'
{buildParser} = require 'pegjs'

standard = buildParser String readFileSync join __dirname, 'standard.pegjs'

module.exports =
  parse: (command) -> standard.parse command