status = require '../'
should = require 'should'
require 'mocha'

describe 'loading', ->
  it 'should load a valid plugin', (done) ->
    plugin =
      meta:
        name: "test"
        author: "Contra"
        version: "0.0.1"

    res = status.load plugin
    res.should.equal true
    status.remove plugin.meta.name
    done()

  it 'should not load with an invalid name', (done) ->
    plugin =
      meta:
        name: "test lol !!"
        author: "Contra"
        version: "0.0.1"

    res = status.load plugin
    res.should.not.equal true
    status.remove plugin.meta.name
    done()

  it 'should not load with an invalid version', (done) ->
    plugin =
      meta:
        name: "test"
        author: "Contra"
        version: "-1"

    res = status.load plugin
    res.should.not.equal true
    status.remove plugin.meta.name
    done()
    
describe 'listing', ->
  it 'should load and list a valid plugin', (done) ->
    plugin =
      meta:
        name: "test"
        author: "Contra"
        version: "0.0.1"

    res = status.load plugin
    res.should.equal true
    status.plugin(plugin.meta.name).details().version.should.equal plugin.meta.version
    status.remove plugin.meta.name
    done()

describe 'executing', ->
  it 'should load and execute a valid plugin', (done) ->
    plugin =
      meta:
        name: "test"
        author: "Contra"
        version: "0.0.1"
      doStuff: (a, b) -> @done a+b

    res = status.load plugin
    res.should.equal true
    plug = status.plugin plugin.meta.name
    op = plug.operation "doStuff" 
    op.on 'error', done
    op.on 'done', (ret) ->
      should.exist ret
      ret.should.equal 3
      status.remove plugin.meta.name
      done()
    op.run 1, 2