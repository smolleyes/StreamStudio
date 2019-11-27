{exec} = require "child_process"
dbus = require "dbus"
{which} = require "fractal"

throw "Spotify not installed" unless which "spotify"

getMeta = (cb) ->
  exec "dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'Metadata'", (err, stdout) ->
    throw err if err?
    out = {}
    for def in stdout.match /entry\(([\S\s]*?)\)/ig
      [head, key, val..., tail] = def.split '\n'
      key = key.match(/"([\S\s]*?)"/i)[1].split(':')[1]
      [_, val...] = val.join('').trim().split('  ').join('').trim().split(' ')
      val = val.join ''
      match = val.match /"(.*?)"/i
      if match
        out[key] = match[1]
      else
        try
          out[key] = parseFloat val
        catch err
          out[key] = val
    cb out

getInterface = ->
  dbus.init()
  session = dbus.session_bus()
  return dbus.get_interface session, "org.mpris.MediaPlayer2.spotify", "/org/mpris/MediaPlayer2", "org.mpris.MediaPlayer2.Player"

module.exports =
  meta:
    name: "spotify"
    author: "Contra"
    version: "0.0.1"
    description: "Spotify controls/information"

  next: ->
    getInterface().Next()
    @done success: true

  previous: ->  
    getInterface().Previous()
    @done success: true

  toggle: -> 
    getInterface().PlayPause()
    @done success: true

  pause: -> 
    getInterface().Pause()
    @done success: true

  play: -> 
    getInterface().Play()
    @done success: true

  stop: -> 
    getInterface().Stop()
    @done success: true

  open: (uri) ->
    return @error 'Missing uri' unless typeof uri is 'string'
    getInterface().OpenUri uri
    @done success: true

  playing: ->
    getMeta (meta) =>
      meta.contentCreated = new Date meta.contentCreated
      @done meta