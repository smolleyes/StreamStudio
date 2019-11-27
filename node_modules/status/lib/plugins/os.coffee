os = require "os"
{exec} = require "child_process"
{readableSpeed, seconds, which} = require "fractal"

module.exports =
  meta:
    name: "os"
    author: "Contra"
    version: "0.0.1"
    description: "System information"
  
  load: -> 
    calc = (Math.floor(num*1000)/1000 for num in os.loadavg())
    calc = Math.floor((calc.reduce((t,s)->t+s)/calc.length)*100)/100 if process.env.PLAIN_TEXT
    @done calc

  uptime: (format="raw") ->
    secs = os.uptime()
    time = seconds.convert secs
    if format is "raw"
      time = seconds.small time if process.env.PLAIN_TEXT
      @done time
    else if format is "pretty"
      @done seconds.pretty time
    else if format is "full"
      @done secs
    else
      @error "Invalid format specified"

  arch: -> @done os.arch()
  platform: -> @done os.platform()
  type: -> @done os.type()
  hostname: -> @done os.hostname()
  kernel: -> @done os.release()
  environment: -> @done process.env
  
  drives: ->
    return @error "df not installed" unless which "df"
    return @error "awk not installed" unless which "awk"
    exec "df | awk '{print $1}'", (err, stdout) =>
      return @error err if err?
      out = {}
      [head, names..., tail] = stdout.split '\n'
      @done names

  cpus: (format="raw") ->
    calc = (cpu.model for cpu in os.cpus())
    @done (if process.env.PLAIN_TEXT then calc[0] else calc)

  network: -> @done os.networkInterfaces()