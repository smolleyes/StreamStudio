module.exports = ({user, nice, sys, idle}, pretty=false) ->
  out =
    total: user+sys+idle
    free: idle
    used:
      total: user+sys
      user: user
      system: sys
      
  return out unless pretty
  # TODO: these calculations suck and are completely incorrect
  nout =
    free: "#{Math.floor (out.free/out.total)*100 }%"
    used:
      total: "#{Math.floor (out.used.total/out.total)*100  }%"
      user: "#{Math.floor (out.used.user/out.total)*10 }%"
      system: "#{Math.floor (out.used.system/out.total)*10 }%"
  return nout