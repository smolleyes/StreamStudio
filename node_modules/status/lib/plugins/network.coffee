{readFile} = require "fs"
{readableSize} = require "fractal"

module.exports =
  meta:
    name: "network"
    author: "Contra"
    version: "0.0.1"
    description: "Network information"

  upstream: (int="eth0", format="raw") ->
    readFile "/sys/class/net/#{int}/statistics/tx_bytes", (err, res) =>
      return @error err if err?
      val = parseInt res
      if format is "raw"
        @done val
      else if format is "pretty"
        @done readableSize val
      else
        @error "Invalid format specified"

  downstream: (int="eth0", format="raw") ->
    readFile "/sys/class/net/#{int}/statistics/rx_bytes", (err, res) =>
      return @error err if err?
      val = parseInt res
      if format is "raw"
        @done val
      else if format is "pretty"
        @done readableSize val
      else
        @error "Invalid format specified"