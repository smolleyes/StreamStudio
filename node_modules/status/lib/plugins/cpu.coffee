{exec} = require "child_process"
os = require "os"
{readableSpeed, calculateCPU} = require "fractal"

module.exports =
  meta:
    name: "cpu"
    author: "Contra"
    version: "0.0.1"
    description: "CPU information"

  temp: (format="raw") ->
    # TODO: implement

  usage: (format="raw") ->
    cpus = os.cpus()
    if format is "raw"
      calc = (calculateCPU cpu.times for cpu in cpus)
    else if format is "pretty"
      calc = (calculateCPU cpu.times, true for cpu in cpus)
    else
      @error "Invalid format specified"
    @done (if process.env.PLAIN_TEXT then calc[0] else calc)

  speed: (format="raw") ->
    cpus = os.cpus()
    if format is "raw"
      calc = (cpu.speed for cpu in cpus)
    else if format is "pretty"
      calc = (readableSpeed cpu.speed for cpu in cpus)
    else
      @error "Invalid format specified"
    @done (if process.env.PLAIN_TEXT then calc[0] else calc)