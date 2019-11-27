patterns =
  email: /[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*@(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+(?:[a-z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/i
  phone:
    us: /(?:[\(])?([2-9]\d{2})(?:[\)])?(?:[\.-])?(\d{3})(?:[\.-])?(\d{4})/
  credit_card: /(^(4|5)\d{3}-?\d{4}-?\d{4}-?\d{4}|(4|5)\d{15})|(^(6011)-?\d{4}-?\d{4}-?\d{4}|(6011)-?\d{12})|(^((3\d{3}))-\d{6}-\d{5}|^((3\d{14})))/
  zip_code: /\d{5}((?:-)?\d{4})?/

patterns.email.test =
  match:
    flags: 'g'
    sample: 'johnny@gmail.com tommy92@mail.co.nz don.+.juan_julio@sanjuan.io kz@asdfsds.asdf.asdf'
    expected: ['johnny@gmail.com','tommy92@mail.co.nz','don.+.juan_julio@sanjuan.io']
  test:
    shouldntMatch: ['i','','-','kz@asdfsds.asdf.asdf']
    shouldMatch: ['johnny@gmail.com','tommy92@mail.co.nz','don.+.juan_julio@sanjuan.io']

patterns.phone.us.test =
  match:
    flags: 'g'
    sample: '4805555545 (480)-555-5545 480-555-5545 (480)555-5545 (480)-5555545 480.555.5545'
    expected: ['4805555545','(480)-555-5545','480-555-5545','(480)555-5545','(480)-5555545','480.555.5545']
  test:
    shouldntMatch: ['i','','-','2.1','48055-555-45']
    shouldMatch: ['4805555545','(480)-555-5545','480-555-5545','(480)555-5545','(480)-5555545','480.555.5545']

patterns.zip_code.test =
  match:
    flags: 'g'
    sample: '85249 90210-1234 902101234 - i -1234'
    expected: ['85249','90210-1234','902101234']
  test:
    shouldntMatch: ['i','','-','2.1','-1234']
    shouldMatch: ['85249','90210-1234','902101234']

module.exports = patterns