var TVDBClient = require("node-tvdb");
var tvdb = new TVDBClient("E53AA0833CB1740C", settings.locale);
var Iterator = require('iterator').Iterator;
var diff = require('deep-diff').diff;
var observableDiff = require('deep-diff').observableDiff;
var applyChange = require('deep-diff').applyChange;

var searchCb;
var searchQuery;

$(document).on('click', '.seriePopupSelect', function() {
    var id = $(this).attr('id');
    var engine = $(this).attr('data-id').split('::')[0];
    var etzvId = null;
    if(engine == "eztv") {
    	etzvId = $(this).attr('data-id').split('::')[1];
    }
    $.magnificPopup.close();
    $("#mySeries").empty();
    $($("#seriesContainer p")[0]).empty().append('<p>'+_("Loading your serie, please wait...")+'</p>');
    return searchTVdbAllById(id, searchCb, searchQuery,true,engine,etzvId);
})

function checkSeriesUpdates(cb) {
	var results = {};
	results.success=true;
	bongo.db('seriesDb').collection('series').find({}).toArray(function(error,list) {
		Iterator.iterate(list).forEach(function(item, i) {
			console.log('searching updates for '+ item.query);
			var eztvId = null;
		    if(item.engine == "eztv") {
		    	etzvId = item.eztvId;
		    }
			searchTVdbAllById(item.id, function(data){
				if (!data.success) {
					results.success = false;
				}
			}, item.query,false,item.engine,eztvId);
		});
		if(cb) {
			cb(results);
		}
	});
}

function searchTVdb(query, cb, fromSearch) {
	$($("#seriesContainer p")[0]).empty().append('<p>'+_("Searching for %s, please wait...", query)+'</p>');
    var results = {};
    results.fromSearch = true;
    searchCb = cb;
    searchQuery = query;
    $.get("http://eztvapi.re/shows/1?keywords=" + query).done(function(items) {
        if (items.length > 0 && settings.locale !== 'fr') {
        	if(fromSearch) {
            	return printSearchResults(items,cb,query,'eztv');
        	}
            if (items.length == 1) {
                var id = items[0].tvdb_id;
                return searchTVdbAllById(id, cb,query,'eztv',items[0]._id);
            } else {
                var html = '<h3>Select your serie!</h3><ul style="  width: 600px;position: relative;top: 50%;left: 50%;margin-left: -300px;">'
                Iterator.iterate(items).forEach(function(item, i) {
                    html += '<li class="list-row" style="float:left;"><a href="#" class="seriePopupSelect" data-id="eztv::'+item._id+'" id="' + item.tvdb_id + '"><img style="width:150px;height:200px;" src="' + item.images.poster + '" /></a><p class="coverInfosTitle">' + item.title + '</p></li>';
                });
                html += '</ul>';
                showPopup(html, 'body');
            }
        } else {
            tvdb.getSeries(query).then(function(items) {
                if (items.length > 0) {
                    if (items.length == 1) {
                    	if(fromSearch) {
                    		var list = [];
                    		var gen = getTVdbBanners(items[0],query);
                            var res = gen.next().value.then(
                                function(val) {
                                    list.push(val);
							        return printSearchResults(list,cb,query,'tvdb',null);
                                }
                            );
			        	} else {
			        		var id = items[0].id;
                        	return searchTVdbAllById(id, cb, query,false,'tvdb',null);
			        	}
                    } else {
                        var list = [];
                        Iterator.iterate(items).forEach(function(item, i) {
                            var gen = getTVdbBanners(item);
                            var res = gen.next().value
                            .then(
                                function(val) {
                                    list.push(val);
                                    if (list.length == items.length) {
                                    	if(fromSearch) {
                                    		return printSearchResults(list,cb,query,'tvdb');
                                    	}
                                        var html = '<h3>Select your serie!</h3><ul style="margin-top:10px;position: relative;top: 50%;display:inline-block;">'
                                        Iterator.iterate(list).forEach(function(item, i) {
                                            html += '<li class="list-row" style="float:left;"><a href="#" class="seriePopupSelect" data-id="tvdb::" id="' + item.id + '"><img style="width:150px;height:200px;" src="' + item.poster + '" /></a><p class="coverInfosTitle">' + item.SeriesName + ' (' + item.language + ')</p></li>';
                                        });
                                        html += '</ul>';
                                        showPopup(html, 'body');
                                    }
                               }
                            );
                        });
                    }
                } else {
                    results.success = false;
                    results.error = "Can't find results for " + query;
                    swal(_("Error!"), _("Can't find results for %s !",query), "error")
                    if(fromSearch) {
                    	$($("#seriesContainer p")[0]).empty().append('<p>'+_("No results found...")+'</p>');
                	}
                    cb(results);
                }
            })
            .catch(function(error) {
            	console.log(error)
                results.success = false;
                results.error = "Can't find results for " + query;
                swal(_("Error!"), _("Can't find results for %s !",query), "error")
                if(fromSearch) {
                    $($("#seriesContainer p")[0]).empty().append('<p>'+_("No results found...")+'</p>');
                }
                cb(results);
            });
        }
    }).fail(function(error) {
        results.success = false;
        results.error = error;
        cb(results);
    });
}

function printSearchResults(items,cb,query,engine) {
	searchCb = cb;
    searchQuery = query;
    $($("#seriesContainer p")[0]).empty().append('<p>'+_("%s results found, click the image to add the serie to your favorites", items.length)+'</p>');
    $("#mySeries").prepend('<div class="nano"><div class="nano-content"></div></div>');
    Iterator.iterate(items).forEach(function(item, i) {
    	if(engine == 'eztv') {
        	$("#mySeries .nano-content").append('<li class="list-row" style="float:left;border-bottom:0 !important;"><a href="#" class="seriePopupSelect" data-id="'+engine+'::'+item._id+'" id="' + item.tvdb_id + '"><img style="width:150px;height:185px;cursor:pointer;" src="' + item.images.poster + '" /></a><p class="coverInfosTitle" title="' + item.title + '">' + item.title + '</p></li>');
    	} else {
    		$("#mySeries .nano-content").append('<li class="list-row" style="float:left;border-bottom:0 !important;"><a href="#" class="seriePopupSelect" data-id="'+engine+'::" id="' + item.id + '"><img style="width:150px;height:185px;cursor:pointer;" src="' + item.poster + '" /></a><p class="coverInfosTitle" title="' + item.SeriesName + ' (' + item.language + ')">' + item.SeriesName + ' (' + item.language + ')</p></li>');
    	}
    });
}

function searchTVdbAllById(id, cb, query,fromSearch,engine,eztvId) {
    var serie = {};
    serie.eztvId= null;
    serie.engine = engine; 
    console.log(engine,eztvId)
    tvdb.getSeriesAllById(id)
        .then(function(res) {
            serie.infos = res;
            serie.name = res.SeriesName.replace(/\(.*\)/, '').trim();
            serie.id = res.id;
            serie.page = 0;
            serie.list = [];
            serie.query = query;
            serie.fromSearch = fromSearch;
            if(engine == 'tvdb') {
            	return initCpbSearch(serie, cb);
            } else {
            	serie.eztvId = eztvId;
            	return getEztvShow(serie, cb);
            }
        })
        .catch(function(error) {
            serie.success = false;
            serie.error = error;
            cb(serie);
        });
}

function *getTVdbBanners(item, query) {
    var results = {};
    var found = false;
    var id = item.id;
    yield tvdb.getBanners(id).then(function(res) {
    	if(res == null || !$.isArray(res)) {
    		item.poster = 'images/tvdb.png';
    		return item;
    	}
        Iterator.iterate(res).forEach(function(banner, i) {
            if (banner.BannerType == "poster") {
                item.poster = 'http://thetvdb.com/banners/' + banner.BannerPath;
                if (!found) {
                    found = true;
                }
            }
        });
        if(!item.poster){
        	item.poster = 'images/tvdb.png';
        }
        return item;
    })
    .catch(function(error) {
    	console.log(error)
        results.success = false;
        results.error = error;
        swal(_("Error!"), _("Can't find results for %s !",query), "error")
    });
}

function storeSerieToDb(serie,cb) {
	bongo.db('seriesDb').collection('series').find({'id': serie.id}).toArray(function(error,list) {
	    if(list.length == 0) {
	    	if(serie.infos.fanart && serie.infos.fanart !== null) {
	    		serie.fanart = confDir + '/images/'+serie.id+'-fanart'+path.extname(serie.infos.fanart);
	    	} else {
	    		serie.fanart = null;
	    	}
	    	if(serie.infos.poster && serie.infos.poster.indexOf('tvdb.png') == -1) {
	    		serie.poster = confDir + '/images/'+serie.id+'-poster'+path.extname(serie.infos.poster);
	    	} else {
	    		serie.poster = 'images/tvdb.png';
	    	}
	    	var name = serie.infos.SeriesName.replace(/\(.*\)/,'').trim();
	    	bongo.db('seriesDb').collection('series').insert({
	        id: serie.id,
	        name: name,
	        poster: serie.poster,
	        fanart : serie.fanart,
	        seasonsCount: serie.seasonsCount,
	        infos: serie.infos,
	        query : serie.query,
	        seasons: serie.seasons,
	        newItems : 0,
	        updated: serie.updated,
	        newItem : false,
	        engine : serie.engine,
	        eztvId : serie.eztvId
		    }, function(error, id) {
		        if (!error) {
		        	console.log('checking if '+name+' already in database')
		            if (sdb.find({"serieName": name.toLowerCase()}).length == 0) {
		                sdb.insert({"serieName": name.toLowerCase(),"id":serie.id,"query":serie.query.toLowerCase()}, function(err, result) {
		                    if (!err) {
		                        console.log('serie ' + name + ' successfully added to databases!');
		                        if(serie.poster.indexOf('tvdb.png') == -1) {
			                        downloadImages(serie.infos.poster,serie.poster,function() {
			                        	if(serie.fanart !== null) {
			                        		downloadImages(serie.infos.fanart,serie.fanart,function() {
			                        			loadMySeries();
			                        		})
			                        	} else {
			                        		loadMySeries();
			                        	}
			                        })
			                    } else {
			                    	if(serie.fanart !== null) {
			                        	downloadImages(serie.infos.fanart,serie.fanart,function() {
			                        		loadMySeries();
			                        	})
			                        } else {
			                        	loadMySeries();
			                        }
			                    }
		                    } else {
		                        console.log(err);
		                        loadMySeries();
		                    }
		                })
		            } else {
		            	console.log('already in database ')
		            	loadMySeries();
		            }
		        } else {
		            console.log(error);
		            loadMySeries();
		        }
		    });
	    } else {
	    	compareSeasons(serie,list[0],cb);
	    }
	});
}

function updateSeriesDb(serie,cb) {
	bongo.db('seriesDb').collection('series').save({
		_id: serie._id,
		id: serie.id,
	    name: serie.infos.SeriesName,
	    poster: serie.poster,
	    fanart : serie.fanart,
	    seasonsCount: serie.seasonsCount,
	    query : serie.query,
	    infos: serie.infos,
	    seasons: serie.seasons,
	    newItems : serie.newItems,
	    engine : serie.engine,
	    eztvId : serie.eztvId
	},function(error, id) {
		if (!error) {
			console.log("serie "+ serie.name + " sucessfully updated");
			serie.success = true;
			cb(serie);
		} else {
			console.log("serie "+ serie.name + "error while updating database, error: " + error);
			serie.success = false;
			cb(serie);
		}
	});
}

function compareSeasons(update,serie,cb) {
	console.log(update,serie)
	try {
		if(update.infos.fanart && update.infos.fanart !== null) {
			update.fanart = confDir + '/images/'+update.id+'-fanart'+path.extname(update.infos.fanart);
		} else {
			update.fanart = null;
		}
		if(update.infos.poster && update.infos.poster.indexOf('tvdb.png') == -1) {
			update.poster = confDir + '/images/'+update.id+'-poster'+path.extname(update.infos.poster);
		} else {
			update.poster = 'images/tvdb.png';
		}
	    update.name  = update.infos.SeriesName;
	    var differences = diff(serie.seasons, update.seasons)
	    serie.updated = false;
	    observableDiff(serie.seasons, update.seasons, function (d) {
		 	// Apply all changes except those to the 'name' property...
		 	d.newItem = false;
			if (d.kind == 'N') {
			   	d.rhs.newItem = true;
		       	applyChange(serie.seasons, update.seasons, d);
		       	serie.updated = true;
			 	serie.newItems += 1;
				console.log('SERIE UPDATED!!!! ' + serie.name);
		    } else if (d.kind == 'E') {
		    	applyChange(serie.seasons, update.seasons, d);
		    	serie.updated = true;
		    }
		    console.log(d)
		});
	    if(serie.updated) {
		    return updateSeriesDb(serie,cb);
		} else {
			if(update.fromSearch) {
				loadMySeries()
			} else {
				cb(serie)
			}
		}
	} catch(err) {
		console.log(err)
	}
}

function downloadImages(link,target,cb) {
	options = {
    	host: 'thetvdb.com',
    	port: 80,
	  	path: '/banners/'+link
	}
    var file = fs.createWriteStream(target);
    http.get(options,function(res) {
    	var imagedata = ''
    	res.setEncoding('binary')
    	res.on("data",function(chunk){
    		imagedata += chunk;
    	});
    	res.on('end', function(){
	        fs.writeFile(target, imagedata, 'binary', function(err){
	            if (err) throw err
	            console.log('File '+target+' saved.'),
	        	cb();
	        })
	    })
	});
}

// searchTVdb('dexter',function(data){console.log(data)})