var Iterator = require('iterator').Iterator;
var pt = require('parse-torrent');

$(document).off('mouseenter','#seriesContainer .serieItem');
$(document).on('mouseenter','#seriesContainer .serieItem',function(e){
	var self = $(this);
	if($(this).find('.optionsTop').is(':hidden')) {
		setTimeout(function() {
			if ($("li:hover").attr('id') == self.attr('id')) {
				self.find('.optionsTop,#optionsTopInfos,.optionsBottom,#optionsBottomInfos').fadeIn("fast");
				self.find('.coverPlayImg').fadeIn('fast');
			}
		},100);
	}
});

$(document).off('mouseleave','#seriesContainer .serieItem');
$(document).on('mouseleave','#seriesContainer .serieItem',function(e){
	if($(this).find('.optionsTop').is(':visible')) {
		$(this).find('.optionsTop,#optionsTopInfos,.optionsBottom,#optionsBottomInfos').fadeOut("fast");
		$(this).find('.coverPlayImg').fadeOut("fast");
	}
});

$(document).on('click','.loadSerie',function(e){
	var id = $(this).attr('id');
	loadSerie(id);
});

$(document).on('click','#reloadSeries',function(e){
	reloadSeries();
});

$(document).on('click','.seasonItem',function(e){
	$('#seasonsList').find('.active').removeClass('active');
	var id = $(this).attr('data-id');
	var num = $(this).attr('data-num');
	loadSeasonTable(id,num);
})

$(document).on('click','.removeSerie',function(e){
	var id = $(this).attr('data-id');
	var self = $(this);
	var name = self.closest('.serieItem').find('.coverInfosTitle').text();
	var imgPath = $(this).attr('data-path');
	bongo.db('seriesDb').collection('series').remove(id, function(error, data) {
		if(!error) {
			console.log('Serie: '+name+', successfully removed from db');
			sdb.remove({"serieName":name.toLowerCase()});
			self.closest('.serieItem').remove();
			var list = $('.serieItem');
			if(list.length == 0) {
				$($("#seriesContainer p")[0]).empty().append('<p>'+_("No series added in your favorites...")+'</p>');
			} else {
				$($("#seriesContainer p")[0]).empty().append('<p>'+_("%s series in your favorites",list.length)+'</p>');
			}
			try {
				var imgList = imgPath.split('::');
				$.each(imgList,function(i,e){
					if(e.indexOf('tvdb.png') == -1) {
						fs.unlinkSync(e);
					}
				})
			} catch(err) {}
		}
	});
})

$(document).on('click','.openTorrent',function(e){
	var obj = JSON.parse(decodeURIComponent($(this).attr('data')));
	console.log(obj)
	if(obj.engine == "eztv") {
		getAuthTorrent(obj.torrents['480p']['url'],true,false,obj.cover);
	} else {
		getAuthTorrent(obj.torrentLink,true,false,obj.cover);
	}
	itemTitle = obj.torrentTitle;
	try {
		$(".highlight").removeClass('highlight');
	} catch(err) {}
	$(this).closest('tr').addClass('highlight')
	$('#playerToggle')[0].click();
})

$(document).on('click','#searchSerieSend',function(e){
	searchSerie();
})

$(document).on('keyup','#searchSerieByName',function(e) {
    if (e.which == 13) {
      	searchSerie();
    }
})

$(document).on('click','#refreshSeries',function(e) {
	$("#mySeries").empty();
	$("#seriesContainer p").empty().append('<p>'+_("Searching updates for your series, please wait ... !")+'</p>');
	checkSeriesUpdates(function(data){
		if(data.success) {
			setTimeout(function(){
				reloadSeries()
			},2000)
		} else {
			swal(_("Error!"), _("Series update error, please try again later !"), "error")
			printSeriesList(list)
		}
	});
});

$(document).on('click','.newEpisode',function(e) {
	e.preventDefault();
	var infos = JSON.parse(decodeURIComponent($(this).attr('data-infos')));
    bongo.db('seriesDb').collection('series').find({'id': infos.id}).toArray(function(error,list) {
		var serie = list[0];
		var count = parseInt(serie.newItems) - 1;
		serie.seasons[infos.season]['episode'][infos.ep].newItem = false;
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
			    newItems : count
			},function(error, id) {
				if (!error) {
					//console.log("serie "+ id + " sucessfully updated");
				} else {
					console.log("serie "+ id + "error while updating database, error: " + error);
				}
		});
	});
})

function searchSerie() {
	var query = $("#searchSerieByName").val()
	if(query == "") {
		return;
	} else {
		$("#mySeries").empty();
		searchTVdb(query, function(data) {
			if(!data.success){
                swal(_("Error!"), _("Can't find results for %s !",data.infos.SeriesName), "error");
                reloadSeries();
			}
		}, true)
	}
}

function loadMySeries() {
	if($("#seasonsHeader").length > 0 ) {
		return;
	}
	$("#searchSeriesContainer").show();
	bongo.db('seriesDb').collection('series').find({}).toArray(function(error,list) {
		if(!error) {
			if(list.length == 0) {
				$("#seriesContainer p").empty().append('<p>'+_("No series added in your favorites...")+'</p>');
			} else {
				printSeriesList(list);
			}
		}
	});
}

function printSeriesList(list) {
	var serieString = list.length > 1 ? _("series") : _("serie");
	$("#seriesContainer p").empty().append('<p>'+_("%s series in your favorites",list.length)+'</p>');
	$('#mySeries').empty();
	Iterator.iterate(list).forEach(function(e) {
		var seasonString = parseInt(e.seasonsCount) > 1 ? _("seasons") : _("season");
		var newItems = parseInt(e.newItems) > 0 ? '<span class="notifCircle" title="'+_("%s new episode(s)",e.newItems)+'">'+e.newItems+'</span>' : '';
		var html = '<li id="'+e.id+'" class="serieItem" style="border:none !important;"> \
		<span class="optionsTop" style="display:none;"></span> \
		<div id="optionsTopInfos" style="display:none;"> \
		<span><i class="glyphicon glyphicon-list-alt"></i>'+ e.seasonsCount+' '+seasonString+'</span> \
		</div> \
		<div class="mvthumb"> \
		<img class="cpbthumb" style="float:left;" src="'+e.poster+'" /> \
		</div> \
		<div> \
			<img class="coverPlayImg loadSerie" style="display:none;" id="'+e.id+'" /> \
		</div> \
		<span class="optionsBottom" style="display:none;"></span> \
		<div id="optionsBottomInfos" style="display:none;"> \
		<span><a href="#" style="cursor:pointer;background:none !important;" class="removeSerie" data-id="'+e._id+'" data-path="'+e.poster+'::'+e.fanart+'" title="'+_("Remove serie")+'"><i class="glyphicon glyphicon glyphicon-trash"></i></a></span> \
		</div> \
		<div> \
			<p class="coverInfosTitle" title="'+e.name+'">'+e.name+'</p> \
		</div> \
		'+newItems+' \
		</li>';
		$('#mySeries').append(html);
	});
}

function loadSerie(id) {
	$("#searchSeriesContainer").hide();
	bongo.db('seriesDb').collection('series').find({'id':id}).toArray(function(error,list) {
		if(!error) {
			var serie = list[0];
			var genre = serie.infos.Genre !== null ? serie.infos.Genre : _("Unknown");
			var network = serie.infos.Network !== null ? serie.infos.Network : _("Unknown");
			var status = serie.infos.Status == 'Continuing' ? _("Continuing") : _("Ended");
			var html ='<div><a href="#" id="reloadSeries">X</a></div> \
				<div id="seasonsHeader"> \
					<h3>'+serie.name+'</h3> \
					<ul id="seasonsList"></ul> \
					<div style="clear:both;"></div> \
				</div> \
				<div class="container" style="height:100%;"> \
					<div class="row" style="position: absolute;left: 0;margin: 0 7px 0 5px;width: 100%;"> \
						<div class="col-xs-5 col-md-4 col-lg-3" id="synopsisMainContainer" style="height: calc(100% - 143px);"> \
							<div id="synopsisContainer"> \
							<p style="margin:0;padding:0;"><b>'+_("Genre: ")+'</b>'+genre+'</p> \
							<p style="margin:0;padding:0;"><b>'+_("Network: ")+'</b>'+network+'</p> \
							<p style="margin:0;padding:0;"><b>'+_("Status: ")+'</b>'+status+'</p> \
							<label style="float:left;margin-right:5px;">'+_("Rating: ")+'</label><div id="raty"></div> \
							<u><h3 style="margin:0 0 5px 0 !important;color:white;">'+_("Overview:")+'</h3></u> \
							<div class="bigTable"> \
								<div class="nano"><p class="nano-content">'+serie.infos.Overview+'</p></div> \
							</div> \
						</div> \
						</div> \
						<div class="col-xs-7 col-md-8 col-lg-9" id="epMainContainer"> \
							<div id="epContainer"></div> \
						</div> \
					</div> \
				</div>';
				$('#seriesContainer').empty().append(html);
			var num = 1;
			$.each(serie.seasons,function(key,val) {
				if(Object.keys(val.episode).length > 0) {
					$('#seasonsList').append('<button href="#" class="seasonItem btn btn-infos" data-id="'+serie.id+'" data-num="'+num+'"><span>'+_("Season")+' '+num+'</span></button>');
				}
				if(num == Object.keys(serie.seasons).length) {
					$('#seasonsList .btn')[0].click();
					$('#seriesContainer .row').css('height','calc(100% - '+ parseInt(65 + $("#seasonsList").height())+'px)');
					var rating = parseInt(serie.infos.Rating) / 2;
					$('#raty').raty({ 
						score:rating,
						path: 'images',
						half: true,
						click: undefined,
						mouseover : undefined,
						mouseout    : undefined,
						readOnly    : true
					});
				}
				num += 1;
			});
			$('#seriesContainer').css('background','url("'+serie.fanart+'") no-repeat');
		} else {
			return false;
		}
	});
}

function loadSeasonTable(id,num) {
	bongo.db('seriesDb').collection('series').find({'id':id}).toArray(function(error,list) {
		var html = '<div class="bigTable"><div class="panel panel-default"><div class="panel-heading"><h3 style="margin: -6px 0 0 0 !important;color:white;">'+_("Episodes list:")+'</h3></div><div class="nano"><div class="panel-body nano-content"><table class="table table-stripped table-hover table-bordered table-responsive serieTable"><thead><tr><th data-field="name">'+_("Name")+'</th><th data-field="viewed">'+_("Status")+'</th><th data-field="size">'+_("Size")+'</th><th data-field="size">'+_("Seeders")+'</th><th data-field="size">'+_("Leechers")+'</th></tr></thead><tbody>';
		var count = 1;
		var infos = {};
		$.each(list[0].seasons[num]['episode'],function(i,file){
			file.cover = "http://thetvdb.com/banners/"+list[0].infos.fanart;
			if(list[0].engine == "eztv") {
				file.engine = 'eztv';
				var hash = pt(file.torrents['480p'].url.match(/btih:(.*?)&/)[1]).infoHash;
				$.get('http://torrentproject.se/?s='+hash+'&out=json&orderby=latest')
				.done(function(data){
					if(parseInt(data.total_found) > 0 ){
						file.torrentTitle = data[1].title;
						file.seeders = data[1].seeds;
						file.leechers = data[1].leechs;
						file.size = bytesToSize(parseInt(data[1].torrent_size),2);
					} else {
						file.torrentTitle = file.title;
						file.seeders = _('');
						file.leechers = _('');
						file.size = _('');
					}
					var c = sdb.find({"title":file.torrentTitle});
					var viewed = c.length > 0 ? 'block' : 'none';
					var watched = c.length > 0 ? _("already watched") : _("Not seen");
					var newItem = file.newItem ? 'newEpisode' : '';
					infos.season = parseInt(num);
					infos.id = list.id;
					if(settings.locale == 'fr' && file.torrentTitle.toLowerCase().indexOf('vostfr') !== -1) {
						file.title += ' (VOSTFR)';
					}
					if (newItem) {
						file.title += _(" (NEW)");
					}
					if(file.type == "complete") {
						infos.ep = 'complete';
						html+='<tr><td><a href="#" class="openTorrent '+newItem+'" data-infos="'+encodeURIComponent(JSON.stringify(infos))+'" data="'+encodeURIComponent(JSON.stringify(file))+'">'+file.title+' ('+_("Complete season torrent")+')</a></td><td><span><i style="display:'+viewed+';line-height: 23px;margin-right:5px;float:left;" class="glyphicon glyphicon-eye-open"></i>'+watched+'</span></td><td> '+file.size+'</td><td>'+file.seeders+'</td><td>'+file.leechers+'</td></tr>';
					} else {
						infos.ep = count;
						html+='<tr><td><a href="#" class="openTorrent '+newItem+'" data-infos="'+encodeURIComponent(JSON.stringify(infos))+'" data="'+encodeURIComponent(JSON.stringify(file))+'">'+count+' - '+file.title+'</a></td><td><span><i style="display:'+viewed+';line-height: 23px;margin-right:5px;float:left;" class="glyphicon glyphicon-eye-open"></i>'+watched+'</span></td><td> '+file.size+'</td><td>'+file.seeders+'</td><td>'+file.leechers+'</td></tr>';
					}
					if(count == Object.keys(list[0].seasons[num]['episode']).length){
					  html+='</tbody></table><div style="clear:both;"></div></div></div></div></div>';
					  	$('#epContainer').empty().append(html)
					}
					count+=1;
				})
				.fail(function(error){
					file.torrentTitle = file.title;
					file.seeders = _('');
					file.leechers = _('');
					file.size = _('');
					var c = sdb.find({"title":file.torrentTitle});
					var viewed = c.length > 0 ? 'block' : 'none';
					var watched = c.length > 0 ? _("already watched") : _("Not seen");
					var newItem = file.newItem ? 'newEpisode' : '';
					infos.season = parseInt(num);
					infos.id = list.id;
					if(settings.locale == 'fr' && file.torrentTitle.toLowerCase().indexOf('vostfr') !== -1) {
						file.title += ' (VOSTFR)';
					}
					if (newItem) {
						file.title += _(" (NEW)");
					}
					if(file.type == "complete") {
						infos.ep = 'complete';
						html+='<tr><td><a href="#" class="openTorrent '+newItem+'" data-infos="'+encodeURIComponent(JSON.stringify(infos))+'" data="'+encodeURIComponent(JSON.stringify(file))+'">'+file.title+' ('+_("Complete season torrent")+')</a></td><td><span><i style="display:'+viewed+';line-height: 23px;margin-right:5px;float:left;" class="glyphicon glyphicon-eye-open"></i>'+watched+'</span></td><td> '+file.size+'</td><td>'+file.seeders+'</td><td>'+file.leechers+'</td></tr>';
					} else {
						infos.ep = count;
						html+='<tr><td><a href="#" class="openTorrent '+newItem+'" data-infos="'+encodeURIComponent(JSON.stringify(infos))+'" data="'+encodeURIComponent(JSON.stringify(file))+'">'+count+' - '+file.title+'</a></td><td><span><i style="display:'+viewed+';line-height: 23px;margin-right:5px;float:left;" class="glyphicon glyphicon-eye-open"></i>'+watched+'</span></td><td> '+file.size+'</td><td>'+file.seeders+'</td><td>'+file.leechers+'</td></tr>';
					}
					if(count == Object.keys(list[0].seasons[num]['episode']).length){
					  html+='</tbody></table><div style="clear:both;"></div></div></div></div></div>';
					  	$('#epContainer').empty().append(html)
					}
					count+=1;
				});
			} else {
				file.engine = 'tvdb'
				var c = sdb.find({"title":file.torrentTitle});
				var viewed = c.length > 0 ? 'block' : 'none';
				var watched = c.length > 0 ? _("already watched") : _("Not seen");
				var newItem = file.newItem ? 'newEpisode' : '';
				infos.season = parseInt(num);
				infos.id = list.id;
				if(settings.locale == 'fr' && file.torrentTitle.toLowerCase().indexOf('vostfr') !== -1) {
					file.title += ' (VOSTFR)';
				}
				if (newItem) {
					file.title += _(" (NEW)");
				}
				if(file.type == "complete") {
					infos.ep = 'complete';
					html+='<tr><td><a href="#" class="openTorrent '+newItem+'" data-infos="'+encodeURIComponent(JSON.stringify(infos))+'" data="'+encodeURIComponent(JSON.stringify(file))+'">'+file.title+' ('+_("Complete season torrent")+')</a></td><td><span><i style="display:'+viewed+';line-height: 23px;margin-right:5px;float:left;" class="glyphicon glyphicon-eye-open"></i>'+watched+'</span></td><td> '+file.size+'</td><td>'+file.seeders+'</td><td>'+file.leechers+'</td></tr>';
				} else {
					infos.ep = count;
					html+='<tr><td><a href="#" class="openTorrent '+newItem+'" data-infos="'+encodeURIComponent(JSON.stringify(infos))+'" data="'+encodeURIComponent(JSON.stringify(file))+'">'+count+' - '+file.title+'</a></td><td><span><i style="display:'+viewed+';line-height: 23px;margin-right:5px;float:left;" class="glyphicon glyphicon-eye-open"></i>'+watched+'</span></td><td> '+file.size+'</td><td>'+file.seeders+'</td><td>'+file.leechers+'</td></tr>';
				}
				if(count == Object.keys(list[0].seasons[num]['episode']).length){
				  html+='</tbody></table><div style="clear:both;"></div></div></div></div></div>';
				  	$('#epContainer').empty().append(html)
				}
				count+=1;
			}
		})
	});
}

function reloadSeries() {
	$("#seriesContainer").empty().append('<p></p><ul id="mySeries"></ul>');
	$('#seriesContainer').css('background','');
	loadMySeries();
}