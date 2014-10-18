node-load-json
==============

Simple utility to do a json request
--

```sh
npm install load-json --save
```

## Example

```js
var getJson=require('load-json')
//options will be appended as query string, like ?searchTerm1=test&sort=column2&order=desc
var options={
  searchTerm1: 'test',
  sort: 'column2',
  order: 'desc'
}
getJson('http://my.cool.api/json/', options, function(e, response){
   if(e)
       return console.log(e)
   console.log(response)//this is an object
})

```
