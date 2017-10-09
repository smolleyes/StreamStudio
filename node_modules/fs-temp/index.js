
var temp = require('./lib/temp');

function template(template) {

  if (typeof template !== 'string') {
    throw new TypeError('template is not a string');
  }

  if (template.indexOf('%s') === -1) {
    throw new Error('template must contain replacement token %s');
  }

  return {
    open: temp.open.bind(temp, template),
    openSync: temp.openSync.bind(temp, template),
    mkdir: temp.mkdir.bind(temp, template),
    mkdirSync: temp.mkdirSync.bind(temp, template),
    writeFile: temp.writeFile.bind(temp, template),
    writeFileSync: temp.writeFileSync.bind(temp, template)
  };
}

module.exports = template('%s');
module.exports.template = template;
