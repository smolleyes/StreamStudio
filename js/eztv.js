function getEztvShow(results, cb) {
	$.get('http://eztvapi.re/show/'+results.eztvId)
	.done(function(data){
		results.seasons = {};
		results.seasonsCount = data.num_seasons;
		Iterator.iterate(data.episodes).forEach(function (item,index) {
			try {
				// parse episodes to extract seasons number
				if(!results.seasons.hasOwnProperty(item.season)){
					results.seasons[item.season] = {}
					results.seasons[item.season]['episode'] = {}
				}
				// check if we have an episode number, set is a episode type first
				item.type = 'episode'
				try {
					item.ep = item.episode;
					Iterator.iterate(results.infos['Episodes']).forEach(function(e) {
						if(!results.seasons[item.season]['episode'].hasOwnProperty(item.ep)) {
							if(results.infos['Episodes'].hasOwnProperty(item.ep)) {
								if(e['EpisodeNumber'] && parseInt(e['EpisodeNumber']) == item.ep && e['SeasonNumber'] && parseInt(e['SeasonNumber']) == item.season) {
									if(e['EpisodeName'] !== null) {
										item.title = e['EpisodeName'];
										results.seasons[item.season]['episode'][item.ep] = item;
									} else {
										results.seasons[item.season]['episode'][item.ep] = item;
									}
								}
							} else {
								results.seasons[item.season]['episode'][item.ep] = item;
							}
						}
					});
				} catch(err) {
					console.log(err)
				}
			} catch(err) {}
		});
		console.log(results)
		storeSerieToDb(results,cb)
	})
	.fail(function(error) {
		results.success = false;
        results.error = error;
        cb(results);
	});
}