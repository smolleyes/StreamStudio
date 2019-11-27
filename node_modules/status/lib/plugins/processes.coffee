{exec} = require "child_process"
{which} = require "fractal"

runPs = (args, cb) ->
  throw "ps not installed" unless which "ps"
  exec "ps #{args}", (err, stdout, stderr) ->
    throw err if err?
    [head, processes..., tail] = stdout.split '\n'
    out = []
    for process in processes
      process = (part for part in process.split(' ') when part.length > 0) # clean
      [user, pid, cpu, mem, vsz, rss, tty, stat, start, time, command...] = process
      out.push
        user: user
        pid: parseInt pid
        cpu: parseFloat cpu
        mem: parseFloat mem
        vsz: parseInt vsz
        rss: parseInt rss
        tty: tty unless tty is '?'
        stat: stat
        start: start
        time: time
        command: command.join ' '
    cb out

module.exports =
  meta:
    name: "processes"
    author: "Contra"
    version: "0.0.1"
    description: "Process information"

  all: -> runPs "aux", @done
  mine: -> runPs "ux", @done
  grep: (text) -> runPs "aux | grep #{text}", @done
  top: (num=10) -> runPs "aux | sort -nr -k 3 -k 4 | head -#{num+1}", @done