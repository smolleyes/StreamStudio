
const test = require('tape')
const ipSet = require('../');

test('ipSet.contains respects ipSet.add with only a start', function(t) {
  const set = ipSet();
  const ip = '127.0.0.1';
  
  t.notOk(set.contains(ip))
  set.add(ip)
  t.ok(set.contains(ip))
  t.end()
});

test('ipSet.contains respects ipSet.add with a start and an end', function(t) {
  const set = ipSet();
  const ips = ['192.168.1.0', '192.168.1.255'];
  
  set.add(ips[0], ips[1])
  t.ok(set.contains(ips[0]))
  t.ok(set.contains(ips[1]))
  t.ok(set.contains('192.168.1.123'))
  t.notOk(set.contains('192.168.2.0'))

  t.end()
});

test('ipSet.contains respects ipSet.add with a cidr', function(t) {
  const set = ipSet();
  const cidrIp = '192.168.1.0/24';
  
  set.add(cidrIp);
  t.ok(set.contains('192.168.1.0'))
  t.ok(set.contains('192.168.1.5'))
  t.ok(set.contains('192.168.1.255'))
  t.ok(set.contains('192.168.1.123'))
  t.notOk(set.contains('192.168.2.0'))

  t.end()
});

test('IPv6', function(t) {
  const set = ipSet();
  const ip = '0:0:0:0:0:ffff:7f00:1' // 127.0.0.1
  const publicIP = '2607:f8b0:4004:811::200e'; // google
  const ipv4 = '127.0.0.1';
  
  t.notOk(set.contains(ip))
  set.add(ip)
  t.ok(set.contains(ip))

  t.notOk(set.contains(publicIP))
  set.add(publicIP)
  t.ok(set.contains(publicIP))

  t.notOk(set.contains('127.0.0.1'))
  set.add(ipv4)
  t.ok(set.contains(ipv4))

  t.end()
});

// Fails on checking it doesn't contain a value outside the range.
test.skip('IPv6 range', function(t) {
  const set = ipSet();
  const start = '0:0:0:0:0:0:0:1'
  const mid1 = '0:0:0:0:0:0:0:9'
  const mid2 = '0:0:0:0:0:0:0:a'
  const end = '0:0:0:0:0:0:0:f'
  const outside = '0:0:0:0:0:0:1:0'
  
  set.add(start, end)
  t.ok(set.contains(start))
  t.ok(set.contains(end))
  t.ok(set.contains(mid1))
  t.ok(set.contains(mid2))
  t.ok(set.contains(mid2))
  t.notOk(set.contains(outside))

  t.end()
})

