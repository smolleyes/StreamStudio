patterns =
  frequency: 
    all: /(-?\d*\.\d+|-?\d+)(?=(?:\s?[tgmk]?hz))/i
    thz: /(-?\d*\.\d+|-?\d+)(?=(?:\s?thz))/i
    ghz: /(-?\d*\.\d+|-?\d+)(?=(?:\s?ghz))/i
    mhz: /(-?\d*\.\d+|-?\d+)(?=(?:\s?mhz))/i
    khz: /(-?\d*\.\d+|-?\d+)(?=(?:\s?khz))/i
    hz: /(-?\d*\.\d+|-?\d+)(?=(?:\s?hz))/i

  size:
    all: /(-?\d*\.\d+|-?\d+)(?=(?:\s?[tgmk]?b))/i
    tb: /(-?\d*\.\d+|-?\d+)(?=(?:\s?tb))/i
    gb: /(-?\d*\.\d+|-?\d+)(?=(?:\s?gb))/i
    mb: /(-?\d*\.\d+|-?\d+)(?=(?:\s?mb))/i
    kb: /(-?\d*\.\d+|-?\d+)(?=(?:\s?kb))/i
    b: /(-?\d*\.\d+|-?\d+)(?=(?:\s?b))/i

getPostfixTest = (letters, postfix) ->
  test =
    test:
      shouldntMatch: ['i','','-']
      shouldMatch: []
    #match:
    #  flags: 'ig'
    #  sample: ""
    #  expected: []
  ex = ['-2.1','2','2.1','20.01','1056.21']
  letters ?= [""] 
  for m in ex
    for letter in letters
      nu = [
        "#{m}#{letter}#{postfix} ",
        "#{m} #{letter}#{postfix} ",
        "#{m}#{letter.toUpperCase()}#{postfix.toUpperCase()} "
      ]
      #for s in nu
      #  test.match.sample += s
      #  test.match.expected.push m
      test.test.shouldntMatch.push m
      test.test.shouldMatch.concat nu
  return test

patterns.frequency.all.test = getPostfixTest "tgmk", "hz"
patterns.frequency.thz.test = getPostfixTest "t", "hz"
patterns.frequency.ghz.test = getPostfixTest "g", "hz"
patterns.frequency.mhz.test = getPostfixTest "m", "hz"
patterns.frequency.khz.test = getPostfixTest "k", "hz"
patterns.frequency.hz.test = getPostfixTest null, "hz"

patterns.size.all.test = getPostfixTest "tgmk", "b"
patterns.size.tb.test = getPostfixTest "t", "b"
patterns.size.gb.test = getPostfixTest "g", "b"
patterns.size.mb.test = getPostfixTest "m", "b"
patterns.size.kb.test = getPostfixTest "k", "b"
patterns.size.b.test = getPostfixTest null, "b"

module.exports = patterns
