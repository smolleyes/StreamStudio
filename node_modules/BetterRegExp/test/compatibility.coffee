{util} = BetterRegExp = require '../'
should = require 'should'
require 'mocha'

# These samples are from http://www.javascriptkit.com/javatutors/redev3.shtml
describe 'instanceof', ->
  it 'should be the same', (done) ->
    exp = /sample/
    pat = new BetterRegExp exp
    (exp instanceof RegExp).should.equal true
    (pat instanceof RegExp).should.equal true
    done()

describe 'test()', ->
  it 'should return identical results', (done) ->
    exp = /sample/
    sample = "Sample text"
    pat = new BetterRegExp exp
    ours = pat.test sample
    theirs = exp.test sample
    should.exist ours, "ours does not exist"
    should.exist theirs, "theirs does not exist"
    ours.should.equal theirs
    done()

describe 'exec()', ->
  it 'should return identical results', (done) ->
    exp = /s(amp)le/i
    sample = "Sample text"
    pat = new BetterRegExp exp
    ours = pat.exec sample
    theirs = exp.exec sample
    should.exist ours, "ours does not exist"
    should.exist theirs, "theirs does not exist"
    ours.should.eql theirs
    done()

describe 'String.match()', ->
  it 'should return identical results', (done) ->
    exp = /r?or?/g
    sample = "Watch out for the rock!"
    pat = new BetterRegExp exp
    ours = sample.match pat
    theirs = sample.match exp
    should.exist ours, "ours does not exist"
    should.exist theirs, "theirs does not exist"
    ours.should.eql theirs
    done()

describe 'String.search()', ->
  it 'should return identical results', (done) ->
    exp = /for/
    sample = "Watch out for the rock!"
    pat = new BetterRegExp exp
    ours = sample.search pat
    theirs = sample.search exp
    should.exist ours, "ours does not exist"
    should.exist theirs, "theirs does not exist"
    ours.should.eql theirs
    done()

describe 'String.replace()', ->
  it 'should return identical results', (done) ->
    exp = /Liorean/g
    sample = "Liorean said: My name is Liorean!"
    pat = new BetterRegExp exp
    ours = sample.replace pat, 'shawty'
    theirs = sample.replace exp, 'shawty'
    should.exist ours, "ours does not exist"
    should.exist theirs, "theirs does not exist"
    ours.should.eql theirs
    done()

describe 'String.split()', ->
  it 'should return identical results', (done) ->
    exp = /\s/g
    sample = "I am confused"
    pat = new BetterRegExp exp
    ours = sample.split pat
    theirs = sample.split exp
    should.exist ours, "ours does not exist"
    should.exist theirs, "theirs does not exist"
    ours.should.eql theirs
    done()