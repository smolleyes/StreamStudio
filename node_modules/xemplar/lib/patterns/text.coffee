patterns =
  words: /\w+/g
  nonblank: /\S/g
  trim: /(^\s*)|(\s*$)/g
  ltrim: /(^\s*)/g
  rtrim: /(\s*$)/g

patterns.nonblank.test =
  match:
    sample: 'test test hey test'
    expected: ['test','test','hey','test']
  test:
    shouldntMatch: ['']
    shouldMatch: ['oi mate']

patterns.nonblank.test =
  test:
    shouldntMatch: ['']
    shouldMatch: ['abc']

patterns.trim.test =
  replace:
    sample: ' abc '
    replaceWith: ''
    expected: 'abc'

patterns.rtrim.test =
  replace:
    sample: ' abc '
    replaceWith: ''
    expected: ' abc'

patterns.ltrim.test =
  replace:
    sample: ' abc '
    replaceWith: ''
    expected: 'abc '

module.exports = patterns