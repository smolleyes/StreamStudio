semver = require "semver"
Plugin = require "./Plugin"
{join} = require "path"
{readdirSync} = require "fs"

plugins = {}

status =
  plugins: -> plugins
  plugin: (name) -> plugins[name]
  remove: (name) -> delete plugins[name]
  load: (plugin) ->
    # Validate plugin
    return "Invalid plugin: Plugin must be an object" unless typeof plugin is "object"
    return "Invalid plugin: Missing meta field" unless typeof plugin.meta is "object"
    {name, author, version} = plugin.meta
    return "Invalid plugin: Missing name field" unless typeof name is "string" and name.length > 0
    return "Invalid plugin: Missing author field" unless typeof author is "string" and author.length > 0
    return "Invalid plugin: Missing version field" unless typeof version is "string" and version.length > 0
    return "Invalid plugin: Name must be alphanumeric" unless name.match /^\w+$/

    # Clean data
    version = semver.clean version
    author = author.trim()
    name = name.trim()

    return "Invalid plugin: Invalid version field" unless semver.valid version
    return "Plugin #{name} already exists" if plugins[name]?

    # Load plugin
    try
      plugins[name] = new Plugin plugin
    catch e
      return e.message or e

    return true

pluginDir = join __dirname, "./plugins"
for file in readdirSync pluginDir
  try # optional deps, dont fail if one doesnt load
    plug = require join pluginDir, file
    msg = status.load plug
    console.log msg, file unless msg is true

module.exports = status