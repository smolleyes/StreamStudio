fractal = require '../'
should = require 'should'
require 'mocha'

describe 'which()', ->
  it 'should work', (done) ->
    should.exist fractal.which 'node'
    done()

describe 'seconds', ->
  describe 'convert()', ->
    it 'should work', (done) ->
      expected =
        days: 1
        hours: 1
        minutes: 3
        seconds: 30
      time = fractal.seconds.convert 90210
      time.should.eql expected
      done()

  describe 'pretty()', ->
    it 'should work', (done) ->
      time = fractal.seconds.pretty
        days: 1
        hours: 1
        minutes: 3
        seconds: 30
      time.should.eql "1 days 1 hours 3 minutes 30 seconds"
      done()

  describe 'small()', ->
    it 'should work', (done) ->
      time = fractal.seconds.small
        days: 1
        hours: 1
        minutes: 3
        seconds: 30
      time.should.eql "1:1:3:30"
      done()

describe 'parseArguments()', ->
  it 'should handle no arguments', (done) ->
    args = fractal.parseArguments ->
    should.not.exist args
    done()
  it 'should handle one argument', (done) ->
    args = fractal.parseArguments (test) ->
    should.exist args
    args.should.eql ['test']
    done()
  it 'should handle two arguments', (done) ->
    args = fractal.parseArguments (te,st) ->
    should.exist args
    args.should.eql ['te','st']
    done()