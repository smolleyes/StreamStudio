os = require 'os'
fs = require 'fs'
{resolve} = require 'path'
{existsSync} = require 'fs'

getPlatform = -> (if os.type().match(/^Win/) then 'win' else 'unix')
splitPath = (p) -> (if getPlatform() is "win" then p.split ";" else p.split ":")

module.exports = (cmd) ->
  return null unless cmd?
  pathEnv = process.env.path or process.env.Path or process.env.PATH
  pathArray = splitPath pathEnv
  where = null
  if cmd.search(/\//) is -1
    pathArray.forEach (dir) ->
      return if where
      attempt = resolve dir + "/" + cmd
      return where = attempt if existsSync attempt
      if getPlatform() is "win"
        baseAttempt = attempt
        attempt = baseAttempt + ".exe"
        return where = attempt if existsSync attempt
        attempt = baseAttempt + ".cmd"
        return where = attempt if existsSync attempt
        attempt = baseAttempt + ".bat"
        return where = attempt if existsSync attempt

  return null if !existsSync(cmd) and !where
  return where or resolve cmd