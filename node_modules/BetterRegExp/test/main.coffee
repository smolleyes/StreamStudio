{util} = BetterRegExp = require '../'
should = require 'should'
require 'mocha'

describe 'constructor()', ->
  it 'should create from a regexp', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/
    done()
  it 'should create from a regexp with flags', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/g
    done()

  it 'should create from a string', (done) ->
    pat = BetterRegExp "^\\s*\\d+\\s*$"
    done()
  it 'should create from a string with flags', (done) ->
    pat = BetterRegExp "^\\s*\\d+\\s*$", "g"
    done()

  it 'should create from itself', (done) ->
    pat = BetterRegExp BetterRegExp /^\s*\d+\s*$/
    done()
  it 'should create from itself with flags', (done) ->
    pat = BetterRegExp BetterRegExp /^\s*\d+\s*$/g
    done()

describe 'clone()', ->
  it 'should clone', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/
    pat.clone().flags().should.eql ''
    done()
  it 'should clone with flags', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/g
    pat.clone().flags().should.eql 'g'
    done()

describe 'flags', ->
  it 'should work with one', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/g
    pat.flags().should.eql 'g'
    done()
  it 'should work with multiple', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/gi
    pat.flags().should.eql 'gi'
    done()

describe 'setFlag()', ->
  it 'should work with one', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/g
    pat.flags().should.equal 'g'
    pat.isGlobal().should.equal true
    pat.setFlag 'i'
    pat.flags().should.equal 'i'
    pat.isIgnoreCase().should.equal true
    done()
  it 'should work with multiple', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/g
    pat.flags().should.equal 'g'
    pat.isGlobal().should.equal true
    pat.hasFlag('g').should.equal true
    pat.setFlag 'im'
    pat.flags().should.equal 'im'
    pat.isIgnoreCase().should.equal true
    pat.isMultiline().should.equal true
    done()

describe 'addFlag()', ->
  it 'should work with one', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/
    pat.addFlag('g')
    pat.flags().should.equal 'g'
    done()
  it 'should work with multiple', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/g
    pat.flags().should.equal 'g'
    pat.isGlobal().should.equal true
    pat.addFlag('im')
    pat.flags().should.equal 'gim'
    done()

describe 'isX()', ->
  it 'should work', (done) ->
    for flag, name of util.flags
      pat = BetterRegExp /^\s*\d+\s*$/, flag
      pat["is#{util.uppercase(name)}"]().should.equal true
    done()

describe 'X()', ->
  it 'should work', (done) ->
    for flag, name of util.flags
      pat = BetterRegExp(/^\s*\d+\s*$/)[flag]()
      pat["is#{util.uppercase(name)}"]().should.equal true
    done()

describe 'hasFlag()', ->
  it 'should work with one', (done) ->
    for flag, name of util.flags
      pat = BetterRegExp /^\s*\d+\s*$/, flag
      pat.hasFlag(flag).should.equal true
    done()
  it 'should work with multiple', (done) ->
    pat = BetterRegExp /^\s*\d+\s*$/
    for flag, name of util.flags
      pat.addFlag flag
      pat.hasFlag(flag).should.equal true
    done()

describe 'escape()', ->
  it 'should work', (done) ->
    BetterRegExp.escape('end$').should.equal "end\\$"
    done()