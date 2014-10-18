node-kickass
============

Node kickass.to json API wrapper
--

```sh
npm install kickass-torrent --save
```

## Examples

default options:
```js
var kickass=require('kickass-torrent')
kickass('test search',function(err, response){
    console.log(err, response)
})
```
all options:  
```js
var kickass=require('kickass-torrent')
kickass({
    q: 'test',//actual search term
    field:'seeders',//seeders, leechers, time_add, files_count, empty for best match
    order:'desc',//asc or desc
    page: 2,//page count, obviously
    url: 'http://kickass.to',//changes site default url (http://kickass.to)
},function(e, data){
    //will get the contents from
    //http://kickass.to/json.php?q=test&field=seeders&order=desc&page=2
    if(e)
        return console.log(e)
    console.log(data)//actual json response
})
```
