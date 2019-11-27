{exec} = require "child_process"
{which} = require "fractal"

module.exports =
  meta:
    name: "speech"
    author: "Joseph"
    version: "0.0.1"
    description: "text to speech using festival"

  speak: (text)->
    return @error 'Missing text argument' unless typeof text is 'string'
    return @error 'festival is not installed' unless which 'festival'
    return @error 'echo is not installed' unless which 'echo'
    exec "echo #{text} | festival --tts", (err, stdout) =>
      return @error err if err
      @done {spoke: text}