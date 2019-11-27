os = require "os"
{readableSize} = require "fractal"

module.exports =
  meta:
    name: "ram"
    author: "Contra"
    version: "0.0.1"
    description: "RAM information"

  usage: (format="raw") ->
    total = os.totalmem()
    free = os.freemem()
    used = total-free

    if format is "raw"
      @done
        total: total
        used: used
        free: free
    else if format is "pretty"
      @done
        total: readableSize total
        used: readableSize used
        free: readableSize free
    else
      @error "Invalid format specified"

  total: (format="raw") ->
    if format is "raw"
      @done os.totalmem()
    else if format is "pretty"
      @done readableSize os.totalmem()
    else
      @error "Invalid format specified"

  free: (format="raw") ->
    if format is "raw"
      @done os.freemem()
    else if format is "pretty"
      @done readableSize os.freemem()
    else
      @error "Invalid format specified"

  used: (format="raw") ->
    used = os.totalmem()-os.freemem()
    if format is "raw"
      @done used
    else if format is "pretty"
      @done readableSize used
    else
      @error "Invalid format specified"