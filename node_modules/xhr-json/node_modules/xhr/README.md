# xhr

A tiny and minimal module for HTTP requests. Returns a *promise*.

## Installation

    $ npm install nathan7/xhr

  or

    $ component install nathan7/xhr

## API

### xhr(url, options)

Perform a GET request to the given URL with the given options.

#### options

The ``options`` object has the following properties:

##### url

The url to perform the request on.

##### method

The HTTP method to use (GET, POST, PUT, DELETE, etc.).  Defaults to ``GET``.

##### headers

An object containing headers.

```javascript
headers: {
  'Accept': 'application/json'
}
```

##### data

The data to send along as the body of the request.

##### credentials

Browser-only.
If true, the ``withCredentials`` value will be applied to the XMLHttpRequest object, which allows for [CORS](http://www.w3.org/TR/cors/) requests.

## Examples

```javascript
var xhr = require('xhr')

var fooData = JSON.stringify({
  foo: 'bar',
  baz: 'qux'
})

xhr({
  url: 'http://example.com/foos',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': fooData.length
  },
  method: 'POST',
  data: fooData
}.then(function onSuccess() {
    console.log('It worked!')
  }
  , function onError(err) {
    console.log('There was an error: ' + err.message)
  })
```
