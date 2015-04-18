var subs = require('popcorn-opensubtitles');

function getSubTitles(id,season,ep,name,cb) {
	var query = {
	    imdbid: id,
	    season: season,
	    episode: ep,
	    filename: name
	};
	subs.searchEpisode(query, 'OSTestUserAgent')
	    .then(function(result) {
	        cb(null,result)
	    }).fail(function(error) {
	        cb(error,null)
	});
}