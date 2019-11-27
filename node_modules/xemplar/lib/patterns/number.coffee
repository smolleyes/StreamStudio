patterns =
  percent: /-?(\d*\.\d+|\d+)(?=(?:\s?%))/
  all: /-?\d*\.\d+|-?\d+/
  positive: /(?:[^-\d\.]|^)(\d*\.\d+|\d+)/
  negative: /-\d*\.\d+|-\d+/

patterns.percent.test =
  match:
    flags: 'g'
    sample: '12341234.1234% .234% 30% -12341234.1234% -.234% -30%'
    expected: ['12341234.1234','.234','30','-12341234.1234','-.234','-30']
  test:
    shouldntMatch: ['i','','-','2.1','-2.1','%','i%']
    shouldMatch: ['20%','21 %','21.5%','0.1%','.1%']

patterns.all.test =
  match:
    flags: 'g'
    sample: '12341234.1234 .234 30 -12341234.1234 -.234 -30'
    expected: ['12341234.1234','.234','30','-12341234.1234','-.234','-30']
  test:
    shouldntMatch: ['i','','-']
    shouldMatch: ['2','2.1','0','12341234.1234','.234','-2','-2.1','-12341234.1234','-.234']

patterns.positive.test =
  match:
    flags: 'g'
    sample: '12341234.1234 .234 30 -12341234.1234 -.234 -30'
    expected: ['12341234.1234',' .234',' 30']
  test:
    shouldntMatch: ['i','','-','-2','-2.1','-12341234.1234','-.234']
    shouldMatch: ['2',' 2.1',' 0',' 12341234.1234',' .234']

patterns.negative.test =
  match:
    flags: 'g'
    sample: '12341234.1234 .234 30 -12341234.1234 -.234 -30'
    expected: ['-12341234.1234','-.234','-30']
  test:
    shouldntMatch: ['i','','-','2','2.1','0','12341234.1234','.234']
    shouldMatch: ['-2','-2.1','-12341234.1234','-.234']

module.exports = patterns