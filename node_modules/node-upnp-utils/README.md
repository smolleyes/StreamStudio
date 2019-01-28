node-upnp-utils
===============

The node-upnp-utils allows you to discover UPnP devices or services in the same subnet and to invole actions or queries to the targeted device.

This module has been developed based on UPnP Device Architecture 2.0. You can find the specification at the web site of UPnP FORUM.
* https://openconnectivity.org/upnp/architectural-documents

## Dependencies
- [xml2js](https://www.npmjs.com/package/xml2js)

## Installation
```
$ npm install xml2js
$ npm install node-upnp-utils
```

## Usage

### Discover UPnP devices or services

```JavaScript
var upnp = require('node-upnp-utils');

// Set an event listener for 'added' event
upnp.on('added', (device) => {
  // This callback function will be called whenever an device is found.
  console.log(device['address']);
  console.log(device['description']['device']['friendlyName']);
  console.log(device['headers']['LOCATION']);
  console.log(device['headers']['USN']);
  console.log('------------------------------------');
});

// Start the discovery process
upnp.startDiscovery();

// Stop the discovery process in 15 seconds
setTimeout(() => {
  upnp.stopDiscovery(() => {
    console.log('Stopped the discovery process.');
    process.exit();
  });
}, 15000);
```

### Discover and monitor UPnP devices or services

```JavaScript
var upnp = require('node-upnp-utils');

// Set an event listener for 'added' event
upnp.on('added', (device) => {
  // This callback function will be called whenever an device was added.
  var name = device['description']['device']['friendlyName'];
  var addr = device['address'];
  console.log('Added ' + name + ' (' + addr + ')');
});

// Set an event listener for 'deleted' event
upnp.on('deleted', (device) => {
  // This callback function will be called whenever an device was deleted.
  var name = device['description']['device']['friendlyName'];
  var addr = device['address'];
  console.log('Deleted ' + name + ' (' + addr + ')');
});

// Start the discovery process
upnp.startDiscovery();
```

### Get the current active devices or services

```JavaScript
var upnp = require('node-upnp-utils');

// Start the discovery process
upnp.startDiscovery();

setTimeout(() => {
  upnp.stopDiscovery(() => {
    var device_list = upnp.getActiveDeviceList();
    console.log(device_list.length + ' devices (services) were found.');
    device_list.forEach((device) => {
      var ip   = device['address'];
      var name = device['description']['device']['friendlyName'];
      console.log(' * ' + name + ' (' + ip + ')');
    });
    process.exit();
  });
}, 10000);
```

### Invoke an action

```JavaScript
var upnp = require('node-upnp-utils');

var soap = '';
soap += '<?xml version="1.0" encoding="utf-8"?>';
soap += '<s:Envelope';
soap += '  s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"';
soap += '  xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">';
soap += '  <s:Body>';
soap += '    <u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">';
soap += '      <ObjectID>0</ObjectID>';
soap += '      <BrowseFlag>BrowseDirectChildren</BrowseFlag>';
soap += '      <Filter>\*</Filter>';
soap += '      <StartingIndex>0</StartingIndex>';
soap += '      <RequestedCount>100000</RequestedCount>';
soap += '      <SortCriteria></SortCriteria>';
soap += '    </u:Browse>';
soap += '  </s:Body>';
soap += '</s:Envelope>';

var params = {
  'url': 'http://192.168.10.4:20003/MediaServer/ContentDirectory/Control',
  'soap': soap
};

upnp.invokeAction(params, (err, obj, xml, res) => {
  if(err) {
    console.log('[ERROR]');
    console.dir(err);
  } else {
    if(res['statusCode'] === 200) {
      console.log('[SUCCESS]');
    } else {
      console.log('[ERROR]');
    }
    console.log('----------------------------------');
    console.log(JSON.stringify(obj, null, '  '))
  }
});
```

---------------------------------------
## List of APIs

### Methods
* [startDiscovery(*params*)](#startDiscovery)
* [stopDiscovery(*callback*)](#stopDiscovery)
* [getActiveDeviceList()](#getActiveDeviceList)
* [invokeAction(*params*, *callback*)](#invokeAction)

### Events
* added event
* deleted event

---------------------------------------
## APIs
### <a name="startDiscovery">startDiscovery(*params*)

This method sends a M-SEARCH message periodically, then gathers information of UPnP devices or services in the same subnet. Besides, NOTIFY events are monitored.

Whenever a device or service is newly found, then this method requests the UPnP description (XML) and get detail information.

Whenever a device or service is newly found, this method emits 'added' event on this instance until the stopDiscovery() method is called.

Whenever a 'byebye' notification is received from an added device or service, this method emits 'deleted' event on this instance until the stopDiscovery() method is called.

If this method is called again during this discovery process is ongoing, an Exception will be thrown.

#### Arguments

##### *params* (optional)

This value must be an object having the members as follows:


member | required | description
-------|----------|------------------
mx     | optional | This value is used for the value of the MX header of M-Search. This value must be an integer. The default value is 3 (seconds).
st     | optional | The value of the ST header of M-Search. The default value is "upnp:rootdevice".

```JavaScript
upnp.startDiscovery({
  mx:3,
  st:'upnp:urn:schemas-upnp-org:service:ContentDirectory:1'
});
```

### <a name="stopDiscovery">stopDiscovery(*callback*)

This method stops the discovery process started by startDiscovery() method. If the discovery process is not active, this method does nothing.

#### Arguments

##### *callback* (optional)

When this method finishes to stop the discovery process, the callback will called. No argument will be passed to the callback.

### <a name="getActiveDeviceList">getActiveDeviceList()

This method returns an array object representing the list of active devices (services).

You can use this method after you invoke the startDiscovery() method.

Even after you invoke the stopDiscovery(), this method returns the device (service) list representing the state just before the stopDiscovery method was invoked. That is, the list doesn't represent the latest state.

Before the startDiscovery() is invoked, this method will return an empty array.

### <a name="invokeAction">invokeAction(*params*, *callback*)

This method sends the specified SOAP string to the specified device.

#### Arguments

##### *params* (required)

This value must be an object having the members as follows:

member  | required | description
--------|----------|------------------
url     | required | This value is the URL of the targeted device (service).
soap    | required | This value is the SOAP string which you want to post.
action  | optional | This value is the value of the SOAPAction header. If this value was not specified, this method will search the SOAPAction value from the specified SOAP string.
cookies | optional | This value is an array of cookies. e.x. ['key1:value1', 'key2:value2']

##### *callback* (required)

When the response (XML) from the targeted device comes, the callback will invoked.

Four arguments will be passed to the callback.

The 1st argument is an error object. It will be null if no error occurred.

The 2nd argument is an object representing the response converted from XML to JavaScript object. If xml2js module is not installed, this value will be null.

The 3rd argument is an XML string representing the response.

The 4th argument is an [http.IncomingMessage object](https://nodejs.org/api/http.html#http_class_http_incomingmessage).

---------------------------------------
## License

The MIT License (MIT)

Copyright (c) 2017 - 2018 Futomi Hatano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
