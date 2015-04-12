var Iterator = require('iterator').Iterator;
var path = require('path');

function initCpbSearch(results,cb) {
	if(results.page == 0) {
		$.post('http://www.cpasbien.pw/recherche/',{"champ_recherche":results.query}).done(function(datas){
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
		var mlist=$('#centre div',data).get();
		Iterator.iterate(mlist).forEach(function (item,i) {
			if($(item).hasClass('ligne0') || $(item).hasClass('ligne1')){
				var video = {};
				video.torrentLink = 'http://www.cpasbien.pw/telechargement/'+path.basename($(item).find('a')[0].href).replace('.html','.torrent');
				video.seeders = $(item).find('.up').text();
				video.leechers = $(item).find('.down').text();
				video.title = $(item).find('a')[0].innerHTML;
				video.torrentTitle = $(item).find('a')[0].innerHTML;
				video.size = $(item).find('.poid').text().trim();
				results.list.push(video)
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