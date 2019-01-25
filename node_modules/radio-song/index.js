var urlLib = require('url'),
  net = require('net'),
  http = require('http'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter;


var Shoutcast = function(url) {
  this.init(url);
  this.start();
};
util.inherits(Shoutcast, EventEmitter);

/**
 *
 */
Shoutcast.prototype.init = function (url) {
  this.url = urlLib.parse(url);
  // описание ошибки (если таковая была) @see closeClient
  this.error = '';
  // флаг указывает что нужно при закрытии сокета генерировать события и т.п. @see onError
  this.triggerError = true;
  // счетчик, сколо прочитано байт до метаданных
  this.readBytes = 0;
  // все что связанно с заголовками
  this.headers = {
    src: '',       // заголовки всыром виде
    isRead: true,  // флаг указывающий что сейчас еще из сокета еще считываются заголовки
    newLineCount: 0,
    type: ''       // тип станции (shoutcast, icecast)
  };

  this.metadata = {
    src: '',
    isRead: false,
    metaint: 0,
    bytesDone: 0,
    length: 0,
    done: false,
    attempts: 0
  };
};

/**
 *
 */
Shoutcast.prototype.start = function () {
  var self = this;
  // пробуем достать название песни из "7.html", если не получается парсим поток
  getHtmlPage(
    {
      hostname: this.url.hostname,
      port: this.url.port,
      path: '/7.html'
    },
    function (body) {
      var match = /<body>\d*,\d*,\d*,\d*,\d*,\d*,(.*)<\/body>/mi.exec(body);
      if(match && match[1].length > 0) {
        self.metadata.src = match[1].trim();
        self.metadataDone();
      }
      else self.readStream();
    },
    function () {
      self.readStream();
    }
  );
};

/**
 * Запуск чтения потока
 */
Shoutcast.prototype.readStream = function () {
  this.client = net.connect({
    port: this.url.port || 80,
    host: this.url.hostname
  }, this.onConnect.bind(this));
  this.client.setTimeout(3000, this.onTimeout.bind(this));

  this.client
    .on('data', this.onData.bind(this))
    .on('end', this.onError.bind(this))
    .on('error', this.onError.bind(this))
    .on('close', this.onError.bind(this))
};

Shoutcast.prototype.unbindErrorEvents = function () {
  this.client
    .removeAllListeners('end')
    .removeAllListeners('error')
    .removeAllListeners('close');
};

/**
 *
 */
Shoutcast.prototype.onTimeout = function() {
  this.closeClient();
};

/**
 * Получеем байты из сокета чтения потока станции
 */
Shoutcast.prototype.onData = function(data){
  var skip = 0; // сколько занимают байт заголовки в этом блоке
  if(this.headers.isRead)
    for(var i = 0; i < data.length; i++) {
      // если еще не встретили два перехода строки подряд, значит читаем заголовки
      if(this.headers.newLineCount < 2) {
        this.headers.src += String.fromCharCode(data[i]);
        skip++;
        // считаем переходы строк (игнорируя \n)
        if(data[i] == 10)
          this.headers.newLineCount++;
        else if(data[i] != 13)
          this.headers.newLineCount = 0;
      } else {
        this.headers.isRead = false;
        this.processHeaders();
        break;
      }
    }

  // если прочли заголовки
  if(!this.headers.isRead) {
    if(this.metadata.isRead) { // если уже получаем метаданные...
      this.processMetadata(data, 0);
    } else {  // все еще ищем метаданные
      // если в текущем блоке данных уже есть метаданные
      if((data.length + this.readBytes - skip) > this.headers.metaint) {
        this.metadata.isRead = true;
        // номер байта с которого начинаются метаданные
        var startByte = this.headers.metaint - this.readBytes;
        // первый байт метаданных это их размер, если натыкаемся 3 раза подряд на 0 размер, выходим
        if(data[startByte] == 0) {
          if(this.metadata.attempts > 3) {
            this.closeClient('shoutcast: can`t find metadata');
            return;
          }
          this.metadata.attempts++;
          this.readBytes = data.length - startByte - 1;
        } else {
          this.metadata.isRead = true;
          this.metadata.length = data[startByte] * 16;
          this.processMetadata(data, startByte + 1);
        }
      } else
        this.readBytes += data.length - skip;
    }
  }
};

/**
 *
 */
Shoutcast.prototype.onConnect = function() {
  this.client.write(
    'GET '+ this.url.path +' HTTP/1.1\r\n' +
    'Host: ' + this.url.hostname + '\r\n' +
    'User-Agent: VLC/2.0.5 LibVLC/2.0.5\r\n' +
    'Icy-MetaData: 1\r\n' +
    '\r\n'
  );
};

/**
 *
 */
Shoutcast.prototype.onError = function () {
  if(!this.metadata.done && this.triggerError && !this.isError) {
    this.isError = true;
    this.emit('error', this.error);
  }
};

/**
 * Закрываем сокет
 * @param {string=} error
 * @param {bool=} silent не генерировать события и т.п.
 */
Shoutcast.prototype.closeClient = function (error, silent) {
  this.triggerError = !silent;
  this.error = error;
  this.client.destroy();
};

/**
 * вытаскиваем из заголовков "metaint"
 */
Shoutcast.prototype.processHeaders = function() {
  var data = this.headers.src.split('\r\n');
  // проверяем на редирект
  if(/HTTP\/1\.[10] 30[12] /i.test(data[0])) {
    var matches = /Location: (.*)/ig.exec(this.headers.src);
    this.unbindErrorEvents();
    this.closeClient('redirect', true);
    this.init(matches[1]);
    this.start();
    return;
  }

  this.headers.type = 'shoutcast';

  for(var i = 0; i < data.length; i++) {
    var header = data[i].split(':');
    if(/icy-metaint/i.test(header[0])) {
      this.headers.metaint = parseInt(header[1]);
      break;
    }
  }

  // если metaint == 0, парсим как icecast
  if(this.headers.metaint == 0 || isNaN(this.headers.metaint)) {
    this.headers.type = 'icecast';
    this.closeClient('icecast server type', true);
    this.parseIcecastMetadata();
  }
};

/**
 * Метаданные успешно получены
 */
Shoutcast.prototype.metadataDone = function () {
  this.metadata.done = true;
  this.emit('metadata', this.metadata.src);
};

/**
 * получаем из сокета метаданные для Shoutcast
 */
Shoutcast.prototype.processMetadata = function(buffer, start) {
  var need = this.metadata.length - this.metadata.bytesDone;
  if((buffer.length - start) >= need) {
    this.metadata.src += buffer.slice(start, start + need).toString();
    // вырезаем название песни
    var match = /StreamTitle='([\s\S]*?)';/im.exec(this.metadata.src);
    if(match) {
      this.metadata.src = match[1].trim();
    }
    this.metadataDone();
    this.closeClient('finish');
  } else {
    this.metadata.src += buffer.slice(start).toString();
    this.metadata.bytesDone += buffer.length - start;
  }
};

/**
 * @returns {boolean}
 */
Shoutcast.prototype.isEmptyMountPoint = function () {
  return this.url.pathname == '/;' || this.url.pathname == '/' || this.url.pathname == ';' || this.url.pathname == '';
};

/**
 * Получаем название песни для icecast (парсим страницу /status.xsl)
 */
Shoutcast.prototype.parseIcecastMetadata = function () {
  if(this.isEmptyMountPoint()) {
    this.closeClient('icecast: empty mount point');
    return false;
  }

  var self = this;
  getHtmlPage(
    {
      hostname: this.url.hostname,
      port: this.url.port,
      path: '/status.xsl?mount=' + this.url.pathname
    },
    function (body) {
      var rows = body.match(/<td[^>]*>[^<]+:<\/td>[^<]*<td[^>]+class="streamdata"[^>]*>.*?<\/td>/img),
        matches = {};
      if(rows)
        for(var i = 0 ; i < rows.length; i++) {
          var match = /<td[^>]*>([^<]+):<\/td>[^<]*<td[^>]+class="streamdata"[^>]*>(.*?)<\/td>/im.exec(rows[i]);
          if(match)
            matches[match[1]] = match[2];
        }
      self.metadata.src = matches['Current Song'] || '';
      self.metadataDone();
    },
    function (e) {
      self.closeClient(e);
    }
  );
};

/**
 * @param {object} options
 * @param {function} success
 * @param {function} error
 */
function getHtmlPage (options, success, error) {
  var timeout, req;
  options.headers = options.headers || {};
  options.headers['User-Agent'] = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13';

  // ставим таймаут, если вдруг начнем читать какой-то непрерывный поток
  timeout = setTimeout(function () {
    req.destroy();
  }, 3000);

  req = http.get(options,
    function (res) {
      if(200 != res.statusCode) {
        clearTimeout(timeout);
        error('response status != 200');
        return false;
      }

      var body = '';
      res
        .on('data', function (chunk) {
          body += chunk.toString('utf-8');
        })
        .on('end', function () {
          clearTimeout(timeout);
          success(body);
        });
    })
    .on('error', function () {
      clearTimeout(timeout);
      error('unavailable');
    });
}

module.exports = Shoutcast;