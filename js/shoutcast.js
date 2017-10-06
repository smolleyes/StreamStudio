function searchShoutCast(query) {
  var unirest = require('unirest')
  unirest.post('https://shoutcast.com/Search/UpdateSearch')
  .send({ "query": query })
  .end(function (response) {
    console.log(response.body);
  });
}

function getShoutcastM3u(id) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", 'http://yp.shoutcast.com/sbin/tunein-station.m3u?id='+id);
  xhr.overrideMimeType("audio/x-mpegurl"); // Needed, see below. 
  xhr.onload = parseShoutCastM3u;
  xhr.send();
}

// Parse it 
function parseShoutCastM3u() {
  var playlist = M3U.parse(this.response);
  console.log(playlist)
  iceCastStation = playlist[0].artist || playlist[0].title.replace('-1,','')
  playShoutCast(playlist[0].file)
};

function playShoutCast(stream) {
  playFromIcecast=true
  var t={}
  t.link=stream;
  t.title=iceCastStation || '';
  startPlay(t)
}

// icecast
function searchIceCast(query) {
  var unirest = require('unirest')
    unirest.get('http://dir.xiph.org/search?search='+query.replace(/\s/g,'+'))
    .send({ "search": query.replace(/\s/g,'+') })
    .end(function (response) {
      console.log(response.body);
  });
}

function getIceCastM3u(link) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", link);
  xhr.overrideMimeType("audio/x-mpegurl"); // Needed, see below. 
  xhr.onload = parseIceCastM3u;
  xhr.send();
}

// Parse it 
function parseIceCastM3u() {
  var playlist = M3U.parse(this.response);
  playShoutCast(playlist[0].file)
};