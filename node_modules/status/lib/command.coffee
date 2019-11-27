status = require "./main"
log = require "loggo"
log.setName "status"

list = require "./commands/list"
execute = require "./commands/execute"

module.exports =
  run: (argv, program) ->
    program.version require("../package.json").version

    ls = program.command 'ls'
    ls.description "List installed plugin information"
    ls.option "-j --json", "output as json"
    ls.action list

    for name, plugin of status.plugins()
      cmd = program.command "#{name} [operations]"
      cmd.description plugin.details().description
      cmd.option "-p, --plain", "output as plain text"
      cmd.action execute

    program.on '--help', ->
      console.log '  Examples:\r\n'
      console.log '    $ os uptime'
      console.log '    $ hd temp["F"]:free["pretty"]:used["pretty"]'
      console.log '    $ cpu -t used\r\n'

    program.parse argv