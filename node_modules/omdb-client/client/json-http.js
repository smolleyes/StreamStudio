'use strict';

module.exports.getJson = function() {  
  var xhr = new XMLHttpRequest();
  var url = arguments[0];
  var timeoutInMs = 10000;
  var callback;

  if (typeof(arguments[1]) === 'function') {
    callback = arguments[1]; 
  }

  if (typeof(arguments[1]) === 'number') {
    timeoutInMs = arguments[1];
    callback = arguments[2];
  }

  xhr.onreadystatechange = function() {
    this.timeout = timeoutInMs;
    if (this.readyState === 4) {
      if (this.status === 200) {
        callback(null, this.response);
      } else {
        // timeouts are handled by ontimeout callback
        if (this.status !== 0) { 
          callback(this);
        }
      }
    }
  };
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.timeout = timeoutInMs;
  xhr.ontimeout = callback;
  xhr.send();
};
