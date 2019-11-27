{exec} = require "child_process"
{which} = require "fractal"

runNm = (fields, cb) ->
  throw "nmcli not installed" unless which "nmcli"
  exec "nmcli -t -f active,#{fields} dev wifi", (err, stdout) ->
    throw err if err?
    cb (line for line in stdout.split('\n') when line.indexOf("yes") is 0)[0]

module.exports =
  meta:
    name: "wireless"
    author: "Contra"
    version: "0.0.1"
    description: "Wireless network information"

  ssid: ->
    runNm "ssid", (active) =>
      ssid = active[active.indexOf("'")+1...active.lastIndexOf("'")]
      @done ssid

  bssid: ->
    runNm "bssid", (active) =>
      [head, bssid...] = active.replace(/\\/g,'').split ':'
      @done bssid.join ':'

  # TODO: pretty format for signal, freq, and rate
  signal: ->
    runNm "signal", (active) =>
      @done parseInt active.split(':')[1]

  frequency: ->
    runNm "freq", (active) =>
      @done parseInt active.split(':')[1].split(' ')[0]

  rate: ->
    runNm "rate", (active) =>
      @done parseInt active.split(':')[1].split(' ')[0]

  security: ->
    runNm "security", (active) =>
      @done active.split(':')[1]

  mode: ->
    runNm "mode", (active) =>
      @done active.split(':')[1]