{exec} = require "child_process"
{which} = require "fractal"

boiler = (command, format, done)->
  throw 'rc.d not installed' unless which 'rc.d'
  exec command, (err, stdout)->
    if stdout.match /usage/
      done format stdout
    else
      throw err if err? #TODO return more useful errors
      done format stdout

listFormat = (stdout)->
  entries = stdout.split '\n'
  res = {}
  for entry in entries when entry != ''
    daemons = entry.match /^\[(.*)\]\[(.*)\] (.*)$/
    res[daemons[3]] = {
      started: daemons[1] == "STARTED"
      auto: daemons[2] == "AUTO"
    }
  return res

commandFormat = (stdout)->
  entries = stdout.split('\n').filter((item)-> item[0] is ':' or item.match /\[+\]$/)
  messageStack = []
  res = {}
  for entry in entries
    message = entry.match /^::\s*(\S(?:\S\s[^\s\[]|[^\s\[])*)/
    if message?[1]?
      status = entry.match /\[([^\s\[]*)\]\s*$/
      if status? and status is 'DONE' or 'FAIL'
        res[message[1]] = status[1]
      else
        messageStack.push message
    else
      if messageStack.length > 0
        status = entry.match /\[([^\s\[]*)\]\s*$/
        if status? and status is 'DONE' or 'FAIL'
          res[message[1]] = status[1]
  return res

statusFormat = (stdout)->
  commands: stdout.match(/\{(.*)\}/)[1].split '|'

module.exports =
  meta:
    name: "daemons"
    author: "Joseph"
    version: "0.0.1"
    description: "Daemon management through rc.d"

  list: ->
    boiler "rc.d list", listFormat, @done

  started: ->
    boiler "rc.d -s list", listFormat, @done

  stopped: ->
    boiler "rc.d -S list", listFormat, @done

  auto: ->
    boiler "rc.d -a list", listFormat, @done

  noAuto: ->
    boiler "rc.d -A list", listFormat, @done

  start: (target)->
    boiler "rc.d start #{target}", commandFormat, @done

  stop: (target)->
    boiler "rc.d start #{target}", commandFormat, @done

  restart: (target)->
    boiler "rc.d start #{target}", commandFormat, @done

  status: (target)->
    boiler "rc.d status #{target}", statusFormat, @done
