patterns =
  cli: /(?=(?::|^)?)(\w+)(?:\[(.*?)\](?=(?::\w|$)))?/i
  comment:
    single: /(?:\/\/)(.+)/i
    block:/\/\*((?:.|[\n\r])+)\*\//i
  color: 
    hex: /(?:#)?([fFcC0369]{6})/i
    rgb: /(?:rgb\()([0-255]{0,3}(?:,)?){3}(?:\))/i

patterns.cli.test =
  exec:
    sample: 'task["arg","arg2",true,false]'
    expected: ['task["arg","arg2",true,false]', 'task', '"arg","arg2",true,false']
  test:
    shouldntMatch: ['', '[]:', ':']
    shouldMatch: ['task', 'task:task', 'task1["test"]:task[true,true]:task']

patterns.comment.single.test =
  exec:
    idx: 1
    sample: '//test'
    expected: 'test'
  test:
    shouldntMatch: ['i','','-','2.1','/ /yo']
    shouldMatch: ['//yo']

patterns.comment.block.test =
  exec:
    idx: 1
    sample: '/* yo\r\nwazgud */'
    expected: ' yo\r\nwazgud '
  test:
    shouldntMatch: ['i','','-','2.1','/* yo']
    shouldMatch: ['/* yo */','/* yo\r\nwazgud */']

patterns.color.hex.test =
  exec:
    idx: 1
    sample: 'ayo #C0C0C0 waz'
    expected: 'C0C0C0'
  match:
    flags: 'g'
    sample: '#C0C0C0 #00FFFF #ff00ff #ffffff ffffff #FFFFF #ZZAAZ'
    expected: ['#C0C0C0','#00FFFF','#ff00ff','#ffffff','ffffff']
  test:
    shouldntMatch: ['i','','-','2.1','#FFFFF','#ZZAAZ']
    shouldMatch: ['#C0C0C0','#00FFFF','#ff00ff','#ffffff','ffffff']

patterns.color.rgb.test =
  match:
    flags: 'g'
    sample: 'rgb(255,0,255) rgb(255,255,255) rgb(255,255,256) rgb(0,0,0)'
    expected: ['rgb(255,0,255)','rgb(255,255,255)','rgb(0,0,0)']
  test:
    shouldntMatch: ['i','','-','2.1','rgb(255,255,256)']
    shouldMatch: ['rgb(255,0,255)','rgb(255,255,255)','rgb(0,0,0)']

module.exports = patterns