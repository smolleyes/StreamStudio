var Iterator = require('iterator').Iterator;
var shortid = require('shortid')
bongo.db({
	name: 'seriesDb',
	collections: ["series"]
},function(){
	console.log("seriesDb successfully loaded");
});

function analyseCpbDatas(results,cb) {
	var seasons = {};
	seasons.fr = {}
	seasons.vostfr = {}
	var fr = [];
	var vost = [];
	results.success = true;
	Iterator.iterate(results.list).forEach(function (src,index) {
		try {
			var item = {};
			item.id = shortid.generate()
			item.percent = 0
			item.title = src.title;
			item.torrentLink = src.torrentLink;
			item.size = src.size;
			item.seeders = src.seeders;
			item.leechers = src.leechers;
			item.torrentTitle = src.torrentTitle;
			if(item.title.toLowerCase().indexOf('vostfr') !== -1) {
				vost.push(item);
			} else {
				fr.push(item);
			}
			results.seasons = seasons;
		} catch(err) {
			console.log(err)
			console.log("file "+src.title+" is not a serie");
		}
	});
	// if french list is 0 parse vostfr
	console.log(fr,vost)
	if(fr.length == 0 && vost.length == 0) {
		verifySerie(datas,cb)
	} else {
		if(fr.length !== 0) {
			console.log('load fr',fr)
			storeCpbDatas('fr',fr,results,function(datas){
				if(vost.length !== 0) {
					console.log('load vostfr',vost)
					storeCpbDatas('vostfr',vost,datas,function(datas){
						verifySerie(datas,cb)
					});
				} else {
					verifySerie(datas,cb)
				}
		});
	} else {
		if(vost.length !== 0) {
			console.log('load vostfr',vost)
			storeCpbDatas('vostfr',vost,results,function(datas){
				verifySerie(datas,cb)
			});
		}
	}
}
}

function storeCpbDatas(lang,list,results,cb) {
	results.needRebuild = false;
	Iterator.iterate(list).forEach(function (item,index) {
		try {
			//detect season
			try {
				item.season = parseInt(item.title.toUpperCase().match(/S(\d{1,3})/)[1])
				item.type = 'episode'
				item.needRebuild = false
			} catch(err) {
				try {
					item.season = parseInt(item.title.toUpperCase().replace(/\s+/g,'').match(/SAISON(\d{1,3})/).pop())
					item.needRebuild = false
					item.type = 'complete'
				} catch(err) {
					try {
						item.season = parseInt(item.title.toUpperCase().match(/(\d{1,3})/)[1])
						item.needRebuild = true
						item.type = 'episode'
					} catch(err) {
						return true;
					}
				}
			}
			// parse episodes to extract seasons number
			if(!results.seasons[lang].hasOwnProperty(item.season)){
				results.seasons[lang][item.season] = {}
				results.seasons[lang][item.season]['episode'] = {}
			}
			// check if we have an episode number, set is a episode type first
			try {
				item.ep = parseInt(item.title.toUpperCase().match(/S(\d{1,3})E(\d{1,3})/)[2]);
				Iterator.iterate(results.infos['Episodes']).forEach(function(e) {
					if(!results.seasons[lang][item.season]['episode'].hasOwnProperty(item.ep)) {
						if(results.infos['Episodes'].hasOwnProperty(item.ep)) {
							if(e['EpisodeNumber'] && parseInt(e['EpisodeNumber']) == item.ep && e['SeasonNumber'] && parseInt(e['SeasonNumber']) == item.season) {
								if(e['EpisodeName'] !== null) {
									item.title = e['EpisodeName'];
									results.seasons[lang][item.season]['episode'][item.ep] = item;
								} else {
									results.seasons[lang][item.season]['episode'][item.ep] = item;
								}
							}
						} else {
							results.seasons[lang][item.season]['episode'][item.ep] = item;
						}
					}
				});
			} catch(err) {
				// if not if we have a season number, add it as complete season torrent...
				if(!item.needRebuild && !results.seasons[lang][item.season]['episode'].hasOwnProperty('complete')) {
					item.type = 'complete';
					results.seasons[lang][item.season]['episode']['complete'] = item;
				} else {
					results.needRebuild = true
				}
			}
		} catch(err) {}
	});
	cb(results);
}

function verifySerie(results,cb) {
	// count valid seasons
	results.seasonsCount ={}
	results.seasonsCount['fr'] = 0;
	results.seasonsCount['vostfr'] = 0;
	var langs = ['fr','vostfr']
	console.log(results,Object.keys(results.seasons['fr']).length  && Object.keys(results.seasons['vostfr']).length)
	if(Object.keys(results.seasons['fr']).length == 0 && Object.keys(results.seasons['vostfr']).length == 0 ) {
		swal(_("Error!"), _("No torrents found for %s, sorry !",results.name), "error");
		return loadMySeries();
	}
	//console.log(results)
	Iterator.iterate(langs).forEach(function(lang) {
		if(Object.keys(results.seasons[lang]).length !== 0) {
			results.seasonsCount[lang]=Object.keys(results.seasons[lang]).length
		}
  });
	if(results.needRebuild) {
		buildSeasons(results,cb)
	} else {
		storeSerieToDb(results,cb)
	}
}

function buildSeasons(results,cb) {
	results.seasons['fr'] = {}
	results.seasons['vostfr'] = {}
	results.seasonsCount['fr'] = 0
	results.seasonsCount['vostfr'] = 0
	var episodes = results.infos["Episodes"];
	var seasons = results.seasons;
	Iterator.iterate(results.list).forEach(function(e) {
		var epNum = parseInt(e.title.match(/\d{2,4}/)).toString()
		var ep = __.findWhere(episodes,{absolute_number:epNum})
		if(ep) {
			e.season = parseInt(ep.SeasonNumber)
			e.type = "episode"
			var lang = e.title.toUpperCase().indexOf('VOSTFR') !== -1 ? 'vostfr' : 'fr';
			try {
			if(seasons[lang][parseInt(e.season)]) {
				seasons[lang][e.season].episode[parseInt(ep.absolute_number)] = e;
			} else {
				results.seasonsCount[lang] += 1
				seasons[lang][e.season] = {}
				seasons[lang][e.season].episode = {}
				seasons[lang][e.season].episode[parseInt(ep.absolute_number)] = e;
			}
		} catch(err){
			console.log(err)
		}
		}
	})
	storeSerieToDb(results,cb)
}

function getOmgDatas(results,cb,page) {
	$.get('http://www.omgtorrent.com/api?login=smodedibox80&key=rt5f6yh23tygTGR6hu6tyg6&query='+encodeURIComponent(results.query)+'&order=rls&orderby=desc')
	.done(function(res) {
		try {
			results.success = true;
			items = res;
			results.items = res.Resultats;
			results.total = res.ResultatsTotal;
			if(parseInt(results.total) == 0) {
				// count valid seasons
				results.seasonsCount = 0;
				//console.log(results)
				if(Object.keys(results.seasons).length == 0) {
					swal(_("Error!"), _("No torrents found for %s, sorry !",results.name), "error");
					return loadMySeries();
				}
				var num = 1;
				$.each(results.seasons,function(key,val) {
					if(Object.keys(val.episode).length > 0) {
						results.seasonsCount+=1;
					}
					if(num == Object.keys(results.seasons).length) {
						storeSerieToDb(results,cb)
						return cb(results);
					}
					num += 1;
				});
			} else {
				Iterator.iterate(results.items).forEach(function (src,index) {
					try {
						var item = {};
						item.title = src.rls;
						item.torrentLink = 'http://www.omgtorrent.com/clic_dl.php?id='+src.id;
						item.size = bytesToSize(parseInt(src.taille),2);
						item.torrentTitle = src.rls;
						try {
							item.season = parseInt(item.title.toUpperCase().match(/S(\d{1,3})/)[1])
							item.type = 'episode'
						} catch(err) {
							try {
								item.season = parseInt(item.title.toUpperCase().match(/SAISON (\d{1,3})/)[1])
								item.type = 'complete'
							} catch(err) {
								return true;
							}
						}
						item.seeders = src.seeders;
						item.leechers = src.leechers;
						// parse episodes to extract seasons number
						if(!results.seasons.hasOwnProperty(item.season)){
							results.seasons[item.season] = {}
							results.seasons[item.season]['episode'] = {}
						}
						// check if we have an episode number, set it as episode type first
						item.type = 'episode'
						try {
							item.ep = parseInt(item.title.toUpperCase().match(/S(\d{1,3})E(\d{1,3})/)[2]);
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
							// if not if we have a season number, add it as complete season torrent...
							if(!results.seasons[item.season]['episode'].hasOwnProperty('complete')) {
								item.type = 'complete';
								results.seasons[item.season]['episode']['complete'] = item;
							}
						}
					} catch(err) {}
				})
				// check all pages
				if(parseInt(results.items) > 100) {
					parseInt(page) += 1;
					return getOmgDatas(results,cb,page);
				}
				// count valid seasons
				results.seasonsCount = 0;
				//console.log(results)
				if(Object.keys(results.seasons).length == 0) {
					swal(_("Error!"), _("No torrents found for %s, sorry !",results.name), "error");
					return loadMySeries();
				}
				var num = 1;
				$.each(results.seasons,function(key,val) {
					if(Object.keys(val.episode).length > 0) {
						results.seasonsCount+=1;
					}
					if(num == Object.keys(results.seasons).length) {
						storeSerieToDb(results,cb)
						return cb(results);
					}
					num += 1;
				});
			}
		} catch(err) {
			console.log(err)
		}
	}).fail(function(err){
		console.log(err);
		results.success = false;
		cb(results);
	});
}

function bytesToSize(bytes, precision) {
	var kilobyte = 1024;
	var megabyte = kilobyte * 1024;
	var gigabyte = megabyte * 1024;
	var terabyte = gigabyte * 1024;

	if ((bytes >= 0) && (bytes < kilobyte)) {
		return bytes + ' Bits';

	} else if ((bytes >= kilobyte) && (bytes < megabyte)) {
		return (bytes / kilobyte).toFixed(precision) + ' Ko';

	} else if ((bytes >= megabyte) && (bytes < gigabyte)) {
		return (bytes / megabyte).toFixed(precision) + ' Mo';

	} else if ((bytes >= gigabyte) && (bytes < terabyte)) {
		return (bytes / gigabyte).toFixed(precision) + ' Go';

	} else if (bytes >= terabyte) {
		return (bytes / terabyte).toFixed(precision) + ' To';
	} else {
		return bytes + 'Bits';
	}
}
