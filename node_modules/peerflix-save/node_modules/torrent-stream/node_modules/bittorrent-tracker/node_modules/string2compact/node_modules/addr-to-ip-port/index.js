var cache = {}

module.exports = function addrToIPPort (addr) {
  if (!cache[addr]) {
    var s = addr.split(':')
    cache[addr] = [ s[0], Number(s[1]) ]
  }
  return cache[addr]
}
