module.exports =
  convert: (secs) ->
    days = Math.floor secs / 86400
    hours = Math.floor (secs % 86400) / 3600
    minutes = Math.floor ((secs % 86400) % 3600) / 60
    seconds = Math.floor ((secs % 86400) % 3600) % 60

    out = {}
    out.days = days unless days is 0
    out.hours = hours unless hours is 0
    out.minutes = minutes unless minutes is 0
    out.seconds = seconds unless seconds is 0
    return out

  pretty: ({days, hours, minutes, seconds}) ->
    out = ""
    out += "#{days} days " if days
    out += "#{hours} hours " if hours
    out += "#{minutes} minutes" if minutes
    out += " #{seconds} seconds" if seconds
    return out

  small: ({days, hours, minutes, seconds}) ->
    days ?= "00"
    hours ?= "00"
    minutes ?= "00"
    seconds ?= "00"
    return "#{days}:#{hours}:#{minutes}:#{seconds}"