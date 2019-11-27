xemplar = require '../'
should = require 'should'
require 'mocha'

tests =
  match: (regex, {sample, expected, idx}) ->
    throw "Missing sample: #{regex}" unless typeof sample is 'string'
    throw "Missing expected: #{regex}" unless expected?
    (done) ->
      res = sample.match regex
      if res?
        res = res[idx or 0] unless Array.isArray expected
        res.should.eql expected
      else
        expected.should.eql res
      done()

  exec: (regex, {sample, expected, idx}) ->
    throw "Missing sample: #{regex}" unless typeof sample is 'string'
    throw "Missing expected: #{regex}" unless expected?
    (done) ->
      res = regex.exec sample
      if res?
        res = (match for match in res)
        res = res[idx or 0] unless Array.isArray expected
        res.should.eql expected
      else
        expected.should.eql res
      done()

  test: (regex, {shouldntMatch, shouldMatch}) ->
    throw "Missing shouldntMatch: #{regex}" unless shouldntMatch?
    throw "Missing shouldMatch: #{regex}" unless shouldMatch?
    (done) ->
      m.should.not.match regex for m in shouldntMatch
      m.should.match regex for m in shouldMatch
      done()

  split: (regex, {sample, expected}) ->
    throw "Missing sample: #{regex}" unless typeof sample is 'string'
    throw "Missing expected: #{regex}" unless expected?
    (done) ->
      expected.should.eql sample.split regex
      done()

  replace: (regex, {sample, replaceWith, expected}) ->
    throw "Missing sample: #{regex}" unless typeof sample is 'string'
    throw "Missing replaceWith: #{regex}" unless typeof replaceWith is 'string'
    throw "Missing expected: #{regex}" unless expected?
    (done) ->
      expected.should.eql sample.replace regex, replaceWith
      done()

runTest = (exp) -> ->
  throw "Invalid RegExp: #{regex}" unless exp?
  throw "Missing test: #{regex}" unless exp.test?
  it "should #{type} properly", tests[type] exp.clone(test.flags), test for type, test of exp.test

findTests = (obj) -> ->
  for k,v of obj
    do (k,v) ->
      describe k, (if v instanceof RegExp and v.test then runTest(v) else findTests(v))
  return

findTests(xemplar)()