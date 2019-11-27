fs = require 'fs'
path = require 'path'

# Singleton for the contents of package.json
exports.load = ->
  places = [path.join(process.cwd(), 'package.json'), path.join(__dirname, '../../', 'package.json')]
  if !@package
    @package = JSON.parse(fs.readFileSync(place)) for place in places when !@package and path.existsSync(place)
    if !@package
      appName = path.basename(require.main.filename).replace(path.extname(require.main.filename), '')
      @package = {name: appName}
  return @package
