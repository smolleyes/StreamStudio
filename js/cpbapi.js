var Iterator = require('iterator').Iterator;
var path = require('path');
var cloudscraper = require('cloudscraper');

function initCpbSearch(results,cb) {
	console.log('SEARCH FOR', results)
	// LOAD CLOUDFLARE ENGINE
	if(results.page == 0) {
				cloudscraper.get('http://www.torrent9.red/search_torrent/'+encodeURIComponent(results.query)+'/page-0',function(e,r,datas){
					console.log(datas)
					if(e) {
						results.success = false;
						results.error = "Can't get results for " + results.query;
						cb(results);
					}
					try {
						var mlist=$('.cust-table tr',datas).get()
						try {
							results.totalResults = parseInt($($('small',datas)[0]).text().match(/\d{1,5}/)[0]);
							results.basePath = path.dirname($($('.pagination li',datas).not(".active")[0]).find('a').attr('href'))
							console.log("ERRRRRRRRRRRRRRRRRRRRRR", results)
						} catch(err) {
							results.totalResults = mlist.length
						}
						return parseDatas(datas, results,cb);
		      } catch (err) {}
					return parseDatas(datas, results,cb);
				});
	} else {
		console.log(results.basePath+'/page-'+results.page)
				cloudscraper.get(results.basePath+'/page-'+results.page,function(e,r,datas){
					if(e) {
						results.success = false;
						results.error = "Can't get results for " + results.query;
						cb(results);
					}
					return parseDatas(datas, results, cb);
				})
	}
}

function hasHeader(header, headers) {
  var headers = Object.keys(headers || this.headers)
    , lheaders = headers.map(function (h) {return h.toLowerCase()})
    ;
  header = header.toLowerCase()
  for (var i=0;i<lheaders.length;i++) {
    if (lheaders[i] === header) return headers[i]
  }
  return false
}

function parseDatas(data, results,cb) {
	var mlist=$('.cust-table tr',data).get()
	try {
		Iterator.iterate(mlist).forEach(function (item,i) {
			//try {
				var video = {};
				video.torrentLink = 'http://www.torrent9.red/get_torrent/'+path.basename($(item).find('a').attr('href')+'.torrent');
				video.seeders = $($(item).find('td')[2]).text();
				video.leechers = $($(item).find('td')[3]).text();
				video.title = $($(item).find('a')[0]).text();
				video.torrentTitle = video.title;
				video.size = $($(item).find('td')[1]).text();
				results.list.push(video)
			//} catch(err) {
				//console.log("parseData error:", err)
			//}
		});
		console.log(results.list.length, results.totalResults)
		if(results.list.length !== results.totalResults) {
			results.page+=1;
			console.log(results);
			return initCpbSearch(results,cb)
		} else {
			return analyseCpbDatas(results,cb);
		}
	} catch(err) {
		console.log(err)
		results.success = false;
		results.error = "Can't get results for " + results.name;
		cb(results);
	}
}
