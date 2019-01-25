const Zombie = require('zombie');
const request = require('request');

function cfget() {
  let browser = new Zombie({
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:51.0) Gecko/20100101 Firefox/51.0'
  });
  let urlToGet = process.argv[2] ? process.argv[2] : process.argv[1];

  browser.visit(urlToGet)
  .then(function() {})
  .catch(function(error) {
    // code 502 is expected
    browser.wait({ duration: 6000 });
  });

  browser.on('redirect', function(req, res) {
    res.text().then(function(content){
      let additionalCookie = null;
      for (let header of res.headers['_headers']) {
        if (header[0] === 'set-cookie') {
          additionalCookie = header[0].split(';')[0];
        }
      }
      let requesOptions = {
        'url': req.url,
        'headers': {}
      };

      for (let header of req.headers['_headers']) {
        requesOptions.headers[header[0]] = header[1];
      }
      requesOptions.cookie += `;${additionalCookie}`;
      request(requesOptions, function(error, response) {
        if (error) return;
        console.log(response.body);
        process.exit(1);
      });
    })
    .catch(function(){});
  });
}

module.exports = cfget;
