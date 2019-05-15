var Iterator = require('iterator').Iterator;
var path = require('path');
var cloudscraper = require('cloudscraper');

function initCpbSearch(results,cb) {
	console.log('SEARCH FOR', results)
	// LOAD CLOUDFLARE ENGINE
	if(results.page === 0) {
		results.totalParsed = 0;
		$.post(TORRENT9_URL+'/search_torrent/', {champ_recherche: results.query}).done(function(datas) {
				console.log(datas)
				try {
						var mlist=$('.cust-table tr',datas).get()
						try {
							results.totalResults = parseInt($($('small',datas)[0]).text().match(/\d{1,5}/)[0]);
							results.basePath = path.dirname($($('.pagination li',datas).not(".active")[0]).find('a').attr('href'))
						} catch(err) {
							results.totalResults = mlist.length
						}
						return parseDatas(mlist, results,cb);
					} catch (err) {}
					//return parseDatas(mlist, results,cb);
				}).fail(function(e){
						results.success = false;
						results.error = "Can't get results for " + results.query;
						cb(results);
				});
	} else {
		console.log(results.basePath+'/page-'+results.page)
				$.get(results.basePath+'/page-'+results.page).done(function(datas){
					var mlist=$('.cust-table tr',datas).get()
					console.log(mlist)
					return parseDatas(mlist, results, cb);
				}).fail(function(e){
					results.success = false;
					results.error = "Can't get results for " + results.query;
					cb(results);
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

function parseDatas(list, results,cb) {

	try {
		Iterator.iterate(list).forEach(function (item,i) {
			try {
				var video = {};
				video.torrentLink = TORRENT9_URL+$(item).find('a')[0].href.replace(/.*?\/torrent/,'torrent')
				video.seeders = $($(item).find('td')[2]).text();
				video.leechers = $($(item).find('td')[3]).text();
				video.title = $($(item).find('a')[0]).text();
				video.torrentTitle = video.title;
				video.size = $($(item).find('td')[1]).text();
				results.totalParsed += 1;
				results.list.push(video);
			} catch(err) {
				console.log("parseData error:", err)
			}
		});
		console.log(results.totalParsed, results.totalResults, results.totalParsed)
		if(results.totalParsed < results.totalResults) {
			results.page+=1;
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
