var Iterator = require('iterator').Iterator;
var path = require('path');

function initCpbSearch(results,cb) {
	console.log('SEARCH FOR', results.query)
	// LOAD CLOUDFLARE ENGINE
	if(results.page == 0) {
				$.post('http://www.torrent9.biz/search_torrent/',{"champ_recherche":results.query}).done(function(datas){
					console.log(datas)
					try {
						var link = $($('.pagination li',datas).not(".active")[0]).find('a').attr('href')
					  results.basePath = path.dirname(link);
		      } catch (err) {}
					return parseDatas(datas, results,cb);
				}).fail(function(error){
					results.success = false;
					results.error = "Can't get results for " + results.query;
					cb(results);
				})
	} else {
				$.get(results.basePath+'/page-'+results.page).done(function(datas){
					return parseDatas(datas, results, cb);
				}).fail(function(error){
					results.success = false;
					results.error = "Can't get results for " + results.query;
					cb(results);
				})
	}
}

function parseDatas(data, results,cb) {
	try {
		results.totalResults = parseInt($($('small',data)[0]).text().match(/\d{1,5}/)[0]);
		if(results.totalResults == 0) {
			results.seasons = {};
			return getOmgDatas(results,cb,1);
		}
		var mlist=$('.cust-table tr',data).get().slice(1)
		console.log(mlist)
		Iterator.iterate(mlist).forEach(function (item,i) {
			try {
				var video = {};
				console.log(item)
				video.torrentLink = 'http://www.torrent9.biz/get_torrent/'+path.basename($(item).find('a').attr('href')+'.torrent');
				video.seeders = $($(item).find('td')[2]).text();
				video.leechers = $($(item).find('td')[3]).text();
				video.title = $($(item).find('a')[0]).text();
				video.torrentTitle = video.title;
				video.size = $($(item).find('td')[1]).text();
				results.list.push(video)
			} catch(err) {
				console.log(err)
			}
		});
		if(results.list.length !== results.totalResults) {
			results.page+=1;
			initCpbSearch(results,cb)
		} else {
			return analyseCpbDatas(results,cb);
		}
	} catch(err) {
		results.success = false;
		results.error = "Can't get results for " + results.name;
		cb(results);
	}
}
