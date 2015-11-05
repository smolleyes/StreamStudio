var Iterator = require('iterator').Iterator;
var path = require('path');

function initCpbSearch(results,cb) {
	if(results.page == 0) {
		$.post('http://www.cpasbien.io/recherche/',{"champ_recherche":results.query}).done(function(datas){
			var link = $($('#pagination a',datas)[0]).attr('href');
			results.basePath = path.dirname(link);
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
		results.totalResults = parseInt($('#titre',data).text().split(':')[1].trim().match(/\d{1,10}/)[0]);
		if(results.totalResults == 0) {
			results.seasons = {};
			return getOmgDatas(results,cb,1);
		}
		var mlist=$('.ligne0,.ligne1',data).get();
		Iterator.iterate(mlist).forEach(function (item,i) {
			try {
				var video = {};
				video.torrentLink = 'http://www.cpasbien.io/telechargement/'+path.basename($(item).find('.titre').attr('href').replace('.html','.torrent'));
				video.seeders = $(item).find('.up').text();
				video.leechers = $(item).find('.down').text();
				video.title = $(item).find('.titre').text();
				video.torrentTitle = video.title;
				video.size = $(item).find('.poid').text().trim();
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