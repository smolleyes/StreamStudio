var youtube_dl = require('youtube-dl');

$(document).off('mouseenter','#items_container .youtube_item,.youtube_item_playlist,.youtube_item_channel');
$(document).on('mouseenter','#items_container .youtube_item,.youtube_item_playlist,.youtube_item_channel',function(e){
    var self = $(this);
    if($(this).find('.optionsTop').is(':hidden')) {
        setTimeout(function() {
            if ($(".youtube_item:hover").attr('id') == self.attr('id') || $(".youtube_item_channel:hover").attr('id') == self.attr('id') || $(".youtube_item_playlist:hover").attr('id') == self.attr('id')) {
                self.find('.optionsTop,#optionsTopInfos,.optionsBottom,#optionsBottomInfos').fadeIn("fast");
                self.find('.coverPlayImg').fadeIn('fast');
            }
        },100);
    }
});

$(document).off('mouseleave','#items_container .youtube_item,.youtube_item_playlist,.youtube_item_channel');
$(document).on('mouseleave','#items_container  .youtube_item,.youtube_item_playlist,.youtube_item_channel',function(e){
    if($(this).find('.optionsTop').is(':visible')) {
        $(this).find('.optionsTop,#optionsTopInfos,.optionsBottom,#optionsBottomInfos').fadeOut("fast");
        $(this).find('.coverPlayImg').fadeOut("fast");
    }
});

// start dailymotion live
$(document).on('click', '.preload_dailymotion_live', function(e) {
    var obj = {};
    obj.link = $(this).attr('data-link');
    obj.title = $(this).text();
    obj.id = $(this).closest('.youtube_item').find('.downloads_container').attr('id');
    var spiffy = $(this).closest('.youtube_item').find('.spiffy');
    $('#'+obj.id).empty().append('<span style="text-align:center;font-size:12px;">'+_("Loading...")+'</span>').show();
    var st = spawn(livestreamerPath, ['--stream-url',obj.link.trim()]);
    var out = '';
    st.stdout.on('data',function(data){
        out  = data.toString();
        console.log(out)
    });
    st.on('exit', function(code) {
        if(code == 0) {
            if(out.indexOf('Available streams:') !== -1) {
                var list = out.replace('Available streams:','').replace(/\(.*?\)/g,'').split(',');
                $('#'+obj.id).empty();
                Iterator.iterate(list).forEach(function(item) {
                    var item = item.trim();
                    if(item !== 'audio') {
                        $('#'+obj.id).append('<li style="float:left;"><a style="background:none;width: 45px;font-size: 12px;font-weight: bold;margin: 0;padding: 0 5px;" class="playChannel dailyLiveQualityLink twitchQualityLink" href="#" data="'+obj.title+'::'+obj.link+'&quality='+item+'">'+item+' </a></li>')
                    }
                });
            } else {
                $('#'+obj.id).empty().hide;
                $.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:0,content:_("No streams found for this channel !"),btnId:'ok',btnTitle:_('Ok'),btnColor:'black',btnDisplay: 'block',updateDisplay:'none'})
            }
        } else {
            $('#'+obj.id).empty().hide;
            $.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:0,content:_("No streams found for this channel !"),btnId:'ok',btnTitle:_('Ok'),btnColor:'black',btnDisplay: 'block',updateDisplay:'none'})
        }
    });
});

$(document).on('click', '.dailyLiveQualityLink', function(e) {
    e.preventDefault();
    console.log('DAILYMOTION LIVE CLICKED')
    var obj = $(this).attr("data").split('::');
    var video = {};
    video.title = obj[0];
    video.link = obj[1];
    startPlay(video);
});

// load download links in youtube item
$(document).on('click', '.youtube_downloads', function(e) {
    e.preventDefault();
    var vid = $(this).closest('.youtube_item').attr('id');
    var title = $(this).closest('.youtube_item').find('.itemTitle').attr('title');
    if ($('#youtube_entry_res_' + vid + ' a.download_file_https').length === 0 && $('#youtube_entry_res_' + vid + ' p').length === 0) {
        $('#youtube_entry_res_' + vid).append('<p style="font-size:12px;text-align:center;position:relative;top:3px;">'+_("Loading...")+'</p>')
        youtube.getVideoInfos('https://youtube.com/watch?v=' + vid, 0, 1, false,false, settings, function(datas) {
            var infos = datas[25];
            var resolutions_string = ['1080p', '720p', '480p', '360p', '240p'];
            var resolutions = infos.resolutions;
            for (var i = 0; i < resolutions_string.length; i++) {
                var resolution = resolutions_string[i];
                try {
                    var vlink = resolutions[resolution]['link'];
                    var vlinka = resolutions[resolution]['linka'];
                    var container = resolutions[resolution]['container'];
                    $('#youtube_entry_res_' + vid).append('<li class="resolutions_container"><a href="' + vlink + '::' + vlinka + '" alt="' + title + '.' + container + '::' + vid + '" title="' + _("Download") + '" class="download_file_https twitchQualityLink">' + resolution + '</a></li>');
                } catch(err) {}
                if(i+1 == resolutions_string.length) {
                    $('#youtube_entry_res_' + vid).append('<li role="presentation" class="divider" style="clear: both;margin-bottom: 2px;"></li>');
                    $('#youtube_entry_res_' + vid).append('<li class="youtubeAudioTrackContainer resolutions_container"><a href="#" alt="' + title + '.mp4::' + vid + '" title="' + _("Download best Audio track only") + '" class="youtubeAudioTrack twitchQualityLink">' + _("Audio only")  + '</a></li>');
                    $('#youtube_entry_res_' + vid).find('p').remove();
                    $('#youtube_entry_res_' + vid + ' a.dropdown-toggle');
                    $('#youtube_entry_res_' + vid + ' a.dropdown-menu').show();
                }
            }
        });
    }
});

$(document).on('click', '.youtubeAudioTrack', function(e) {
    var id = $(this).attr('alt').split('::')[1];
    var title = $(this).attr('alt').split('::')[0];
    var options = ['-f', 'bestaudio', '--get-url'];
    $('#youtube_entry_res_' + id+ ' li.youtubeAudioTrackContainer a').text('Loading...');
    $('#youtube_entry_res_' + id + ' a.dropdown-menu').show();
    youtube_dl.getInfo('https://youtube.com/watch?v='+id,options,function(err, inf){
        if(err) {
            $('#youtube_entry_res_' + id+ ' li.youtubeAudioTrackContainer').removeClass('youtubeAudioTrack').text('No audio links found...');
        } else{
            var url = inf.url.trim();
            downloadFFMpeg(url, title, id, false, true);
        }
        setTimeout(function(){
            $('#youtube_entry_res_' + id+ ' li.youtubeAudioTrackContainer').remove();
        },3000);
    });
});

function getCategories() {
    $('#categories_label').hide();
    $('#categories_select').hide();
    if (search_engine === 'youtube') {
        http.get('http://gdata.youtube.com/schemas/2007/categories.cat?hl=' + locale, function(resp) {
            var datas = [];
            resp.on('data', function(chunk) {
                datas.push(chunk);
            }).on("end", function(e) {
                var xml = datas.join('');
                var xjs = new X2JS();
                var obj = xjs.xml_str2json(xml);
                var arr = obj.categories.category_asArray;
                selected_category = arr[0]._term;
                $('#categories_select ul').empty();
                for (var i = 0; i < arr.length; i++) {
                    $('#categories_select ul').append('<li><a href="#" data-value="' + arr[i]._term + '">' + arr[i]._label + '</a></li>')
                }
            });
        }).on("error", function(e) {
            console.log("Got error: " + e.message);
        });
    } else if (search_engine === 'dailymotion') {
        https.get('https://api.dailymotion.com/channels', function(resp) {
            var datas = [];
            resp.on('data', function(chunk) {
                datas.push(chunk);
            }).on("end", function(e) {
                var obj = JSON.parse(datas.join(''));
                var arr = obj.list;
                selected_category = arr[0].id;
                $('#categories_select ul').empty();
                for (var i = 0; i < arr.length; i++) {
                    $('#categories_select ul').append('<li><a href="#" data-value="' + arr[i].id + '">' + arr[i].name + '</a></li>')
                }
            });
        }).on("error", function(e) {
            console.log("Got error: " + e.message);
        });
    }
}


function searchRelated(vid, page, engine) {
    if (search_engine === 'youtube') {
        youtube.searchRelated(vid, page, searchFilters, function(datas) {
            getVideosDetails(datas, 'youtube', true, vid);
        });
    } else if (search_engine === 'dailymotion') {
        dailymotion.searchRelated(vid, page, searchFilters, function(datas) {
            getVideosDetails(datas, 'dailymotion', true, vid);
        });
    }
}

function getVideosDetails(datas, engine, sublist, vid) {
    switch (engine) {
        case 'youtube':
            var items = datas.items;
            totalResults = datas.totalItems;
            var pages = totalResults / 10;
            var startPage = 1;
            var browse = false;
            var has_more = false;
            var itemsByPage = 25;
            break;
        case 'dailymotion':
            var items = datas.list;
            totalResults = datas.total;
            var pages = totalResults / 10;
            var startPage = 1;
            var browse = false;
            var has_more = datas.has_more;
            var itemsByPage = 25;
            break;
    }
    if (totalResults === 0) {
        if (sublist === false) {
            $('#search_results').html(_("<p><strong>No videos</strong> found...</p>"));
            $('#search').show();
            $('#loading').hide();
            pageLoading = false;
            return;
        }
        // for dailymotion
    } else if ((totalResults === undefined) && (datas.limit !== 10) || (engine === 'youtube') && (searchTypes_select === 'topRated') || (searchTypes_select === 'mostViewed')) {
        browse = true;
        //total_pages = $("#pagination").pagination('getPagesCount');
    }
    // print total results
    if (sublist === false) {
        if ((totalResults !== undefined) && (browse === false)) {
            $('#search_results').html('<p><strong>' + totalResults + '</strong> ' + _("videos found") + '</p>');
        }
    } else {
        try {
            var p = $('#loadmore_' + vid).attr('alt').split('::')[1];
            if (parseInt(p) === startPage) {
                var string = $('#sublist_' + vid).parent().parent().find('a').first().text();
                $('#sublist_' + vid).parent().parent().find('a').first().html(string + ' (' + totalResults + ' ' + _("Videos found") + ')');

            }
        } catch (err) {
            console.log(err);
            pageLoading = false;
            return;
        }
        var page = parseInt(p) + 1;
        if (search_engine === 'dailymotion') {
            if (has_more === true) {
                $('#loadmore_' + vid).attr('alt', '' + totalResults + '::' + page + '::' + vid + '::' + engine + '').show();
            } else {
                $('#loadmore_' + vid).hide();
            }
        } else {
            if (pages > page) {
                $('#loadmore_' + vid).attr('alt', '' + totalResults + '::' + page + '::' + vid + '::' + engine + '').show();
            } else {
                $('#loadmore_' + vid).hide();
            }
        }
    }
    try {
        p = items.length;
    } catch (err) {
        if (sublist === false) {
            $('#search_results').html(_("<p><strong>No videos</strong> found...</p>"));
            $('#search').show();
            $('#loading').hide();
            return;
        }
    }
    itemsCount += items.length;
    $('#items_container').show();
    // load videos
    switch (engine) {
        case 'dailymotion':
            for (var i = 0; i < items.length; i++) {
                if(items[i].hasOwnProperty('onair')) {
                    var text = '' 
                    if(items[i].title.length > 45){
                        text = items[i].title.substring(0,45)+'...';
                    } else {
                        text = items[i].title;
                    }
                    vid = items[i].id;
                    title = items[i].title;
                    var online = 'Online';
                    var display = "block";
                    var css = 'class="glyphicon glyphicon-eye-open" style="color:green;"';
                    if(!items[i].onair) {
                        online = 'Offline';
                        display = "none";
                        css = 'class="glyphicon glyphicon-eye-close" style="color:red;"';
                    }
                    var did = ((Math.random() * 1e6) | 0);
                    $('#items_container').append('<div class="youtube_item" style="height:220px;display:'+display+'" id="'+vid+'"> \
                        <span class="optionsTop" style="display:none;"></span> \
                        <div id="optionsTopInfos" style="display:none;"> \
                            <span><i '+css+'></i>'+online+'</span> \
                            <span style="float:right;margin-right:5px;"><i class="glyphicon glyphicon-user"></i>'+("Viewers:")+' '+items[i].audience+'</span> \
                        </div> \
                        <img src="' + items[i].thumbnail_240_url + '" class="video_thumbnail" /> \
                        <div class="spiffy"><div class="inner one"></div><div class="inner two"></div><div class="inner three"></div></div> \
                        <div> \
                            <img data-link="http://www.dailymotion.com/video/'+vid+'" class="coverPlayImg preload_dailymotion_live" style="display:none;margin: -95px 0 0 -100px;" /> \
                        </div> \
                        <span class="optionsBottom" style="display:none;bottom:90px;"></span> \
                        <div id="optionsBottomInfos" style="display:none;bottom:90px;"> \
                                <div class="dropdown"> \
                                    <a style="margin-top:-17px;" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
                                    ' + _("Available streams:") + ' \
                                    <span class="caret"></span> \
                                    </a> \
                                    <ul class="dropdown-menu downloads_container" role="menu" style="width:100%;max-height:60px;" id="' + did + '"></ul> \
                                </div> \
                        </div> \
                        <p style="margin-top:10px;"><a class="itemTitle" title="'+title+'"><b>' + title + '</b></a></p> \
                    </div>');
                    if(i+1 == items.length) {
                        pageLoading = false;
                        $('#search_results').html('<p><strong>' + totalResults + ' </strong>' + _("lives found...(%s onlines displayed)", $('.youtube_item:visible').length) + '</p>');
                        $('#search').show();
                        $('#loading').hide();
                    }
                } else {
                    dailymotion.getVideoInfos(items[i].id, i, items.length, function(datas) {
                        fillPlaylist(datas, sublist, vid, 'dailymotion')
                    });
                }
            }
            break;
        case 'youtube':
            for (var i = 0; i < items.length; i++) {
				var list = [];
				list.push(items[i])
                fillPlaylist(list, sublist, vid, 'youtube')
            }
            break;
    }
}

function getPlaylistInfos(datas, engine) {
    sublist = false;
    switch (engine) {
        case 'youtube':
            var items = datas.items.reverse();
            totalResults = datas.totalItems;
            var itemsByPage = 25;
            break;
        case 'dailymotion':
            var items = datas.list.reverse();
            totalResults = datas.total;
            var itemsByPage = 25;
            break;
    }
    if (totalResults === 0) {
        $('#search_results').html(_("<p><strong>No playlist</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
        $("#pagination").hide();
        pageLoading = false;
        return;
    }
    $('#search_results').html('<p><strong>' + totalResults + '</strong> ' + _("playlists found") + '</p>');
    itemsCount += items.length;
    pageLoading = true;
    try {
        for (var i = 0; i < items.length; i++) {
            loadPlaylistItems(items[i], engine);
        }
    } catch (err) {
        $('#search').show();
        $('#loading').hide();
        $("#pagination").hide();
        pageLoading = false;
        return;
    }
    $('#items_container').show();
    $('#search').show();
    $('#loading').hide();
}

function getChannelsInfos(datas, engine) {
    sublist = false;
    pageLoading = true;
    switch (engine) {
        case 'youtube':
            var items = datas.feed.entry;
            totalResults = datas.feed.openSearch$totalResults['$t'];
            break;
        case 'dailymotion':
            var items = datas.list;
            totalResults = datas.total;
            break;
    }
    if (totalResults === 0) {
        $('#search_results').html(_("<p><strong>No channels</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
        pageLoading= false;
        return;
    }
    $('#search_results').html('<p><strong>' + totalResults + '</strong> ' + _("channels found") + '</p>');
	itemsCount += items.length;
    try {
        for (var i = 0; i < items.length; i++) {
            loadChannelsItems(items[i], engine);
        }
    } catch (err) {
        $('#search_results').html(_("<p><strong>No playlist</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
    }
    $('#items_container').show();
    $('#search').show();
    $('#loading').hide();
}

function loadPlaylistItems(item, engine) {
    try {
		if (search_engine === 'dailymotion') {
			var title = item.name;
			var thumb = item.thumbnail_medium_url;
			var pid = item.id;
			var length = item.videos_total;
			var author = item['owner.username'];
			var description = item.description;
			//$('#items_container').append('<div class="youtube_item_playlist"><img src="' + thumb + '" style="float:left;width:120px;height:90px;"/><div class="left" style="width:238px;"><p><b>' + title + '</b></p><p><span><b>total videos:</b> ' + length + '</span>      <span><b>      author:</b> ' + author + '</span></p></div><div class="right"><a href="#" id="' + pid + '::' + length + '::' + engine + '" class="load_playlist"><img width="36" height ="36" src="images/play.png" /></a></div></div>');
		} else if (engine === 'youtube') {
			var pid = item.id;
			var length = item.size;
			var author = item.author;
			var description = item.description;
			var thumb = item.thumbnail.hqDefault;
			var title = item.title;
        }
		$('#items_container').append('<div class="youtube_item_playlist" style="height:180px;" id="'+pid+'"> \
            <span class="optionsTop" style="display:none;"></span> \
            <div id="optionsTopInfos" style="display:none;"> \
                <span><i class="glyphicon glyphicon-user"></i>'+_("Author:")+author+'</span> \
            </div> \
            <img src="' + thumb + '" class="video_thumbnail" /> \
            <div> \
                <img id="' + pid + '::' + length + '::' + engine + '" class="coverPlayImg load_playlist" style="display:none;margin: -75px 0 0 -100px;" /> \
            </div> \
            <span class="optionsBottom" style="display:none;bottom:50px;"></span> \
            <div id="optionsBottomInfos" style="display:none;bottom:50px;"> \
                    <span><i class="glyphicon glyphicon-facetime-video"></i>'+("Total videos:")+' '+length+'</span> \
            </div> \
            <p style="margin-top:10px;"><a class="itemTitle" title="'+title+'"><b>' + title + '</b></a></p> \
        </div>');
		if($('#items_container .youtube_item_playlist').length === itemsCount) {
			pageLoading = false;
		}
	} catch(err) {
		itemsCount -= 1;
		if($('#items_container .youtube_item_playlist').length === itemsCount) {
			pageLoading = false;
		}
	}
}

function loadChannelsItems(item, engine) {
    if (search_engine === 'dailymotion') {
        var title = item.name;
        var thumb = item.thumbnail_medium_url;
        var pid = item.id;
        var length = item.videos_total;
        var author = item['owner.username'];
        var description = item.description;
    } else if (engine === 'youtube') {
        var pid = item.id;
        var length = item.gd$feedLink[0].countHint;
        var author = item.author[0].name['$t'];
        var description = item.summary['$t'];
        var thumb = item.media$thumbnail[0].url;
        var title = item.title['$t'];
        var link = item.gd$feedLink[0].href;
    }
    $('#items_container').append('<div class="youtube_item_channel" style="height:180px;" id="'+pid+'"> \
            <span class="optionsTop" style="display:none;"></span> \
            <div id="optionsTopInfos" style="display:none;"> \
                <span><i class="glyphicon glyphicon-user"></i>'+_("Author:")+author+'</span> \
            </div> \
            <img src="' + thumb + '" class="video_thumbnail" /> \
            <div> \
                <img id="' + pid + '::' + length + '::' + engine + '::' + link + '" class="coverPlayImg load_channel" style="display:none;margin: -75px 0 0 -100px;" /> \
            </div> \
            <span class="optionsBottom" style="display:none;bottom:50px;"></span> \
            <div id="optionsBottomInfos" style="display:none;bottom:50px;"> \
                    <span><i class="glyphicon glyphicon-facetime-video"></i>'+("Total videos:")+' '+length+'</span> \
            </div> \
            <p style="margin-top:10px;"><a class="itemTitle" title="'+title+'"><b>' + title + '</b></a></p> \
    </div>');
	if($('#items_container .youtube_item_channel').length === itemsCount) {
		pageLoading = false;
	}
}

function loadPlaylistSongs(pid) {
	$('#items_container').empty().hide();
    $('#pagination').hide();
    $('#search').hide();
    $('#loading').show();
    var plid = pid.split('::')[0];
    var length = pid.split('::')[1];
    var engine = pid.split('::')[2]
    current_start_index = 1;
    current_prev_start_index = 1;
    current_search_page = 1;
    if (search_engine === 'dailymotion') {
        dailymotion.loadSongs(plid, length, current_search_page, function(datas, length, pid, engine) {
            fillPlaylistFromPlaylist(datas, length, pid, engine);
        });
    } else if (engine === 'youtube') {
        youtube.loadSongs(plid, length, current_start_index, function(datas, length, pid, engine) {
            fillPlaylistFromPlaylist(datas, length, pid, engine);
        });
    }
}

function loadChannelSongs(pid) {
	$('#items_container').empty().hide();
    $('#pagination').hide();
    $('#search').hide();
    $('#loading').show();
    var plid = pid.split('::')[0];
    var length = pid.split('::')[1];
    var engine = pid.split('::')[2];
    var link = pid.split('::')[3];
    current_start_index = 1;
    current_prev_start_index = 1;
    current_search_page = 1;
    pagination_init = false;
    current_channel_link = link;
    if (search_engine === 'dailymotion') {
        dailymotion.loadSongs(link, current_search_page, function(datas) {
            fillPlaylistFromPlaylist(datas, engine);
        });
    } else if (engine === 'youtube') {
        youtube.loadChannelSongs(link, current_search_page, function(datas) {
            fillPlaylistFromChannel(datas, engine);
        });
    }
}

function fillPlaylistFromMixtape(datas, engine) {
    var sublist = false;
    var items = datas[1].items;
    var totalResults = datas[1].totalResults;
    if (totalResults === 0) {
        $('#search_results').html(_("<p><strong>No sounds</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
        return;
    } else {
        $('#search_results').html('<p><strong>' + totalResults + '</strong> ' + _("sounds in this mixtape") + ' </p>');
        try {
            for (var i = 0; i < items.length; i++) {
                var infos = {};
                infos.id = items[i].songId;
                infos.resolutions = items[i].resolutions;
                infos.author = items[i].author;
                infos.views = items[i].views;
                infos.title = infos.author + ' - ' + items[i].title;
                infos.thumb = items[i].thumb;
                infos.slink = items[i].songLink;
                printVideoInfos(infos, false, false, '', engine);
            }
        } catch (err) {
            $('#search_results').html(_("<p><strong>No sounds</strong> found...</p>"));
            $('#search').show();
            $('#loading').hide();
        }
    }
    $('#search').show();
    $('#loading').hide();
    $('#items_container').show();
}

function fillPlaylistFromChannel(datas, engine) {
    var sublist = false;
    current_channel_engine = engine;
    channelPagination = true;
    switch (engine) {
        case 'youtube':
            var items = datas.data.items;
            totalResults = datas.data.totalItems;
            break;
        case 'dailymotion':
            var items = datas.list;
            totalResults = datas.total;
            break;
    }
    if (totalResults === 0) {
        $('#search_results').html(_("<p><strong>No videos</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
        pageLoading = false;
        return;
    } else {
		$('#items_container').show();
        $('#search_results').html('<p><strong>' + totalResults + '</strong> ' + _("videos found in this channel") + ' </p>');
        itemsCount += items.length;
        try {
            for (var i = 0; i < items.length; i++) {
                if (search_engine === 'youtube') {
                    var list = [];
                    list.push(items[i])
                    fillPlaylist(list, false, items[i].id, 'youtube')
                }
            }
        } catch (err) {
            $('#search_results').html(_("<p><strong>No videos</strong> found...</p>"));
            $('#search').show();
            $('#loading').hide();
        }
    }
}

function fillPlaylistFromPlaylist(datas, length, pid, engine) {
    var sublist = false;
    $('#items_container').show();
    if (engine === 'dailymotion') {
        var items = datas.list;
        for (var i = 0; i < items.length; i++) {
            dailymotion.getVideoInfos(items[i].id, i, items.length, function(datas) {
                fillPlaylist(datas, false, '', 'dailymotion');
            });
        }
        if (datas.has_more === true) {
            current_search_page += 1;
            pageLoading = true;
            setTimeout(function() {
                dailymotion.loadSongs(pid, length, current_search_page, function(datas, length, pid, engine) {
                    fillPlaylistFromPlaylist(datas, length, pid, engine);
                });
            }, 2000);
        } else {
            current_page = 1;
            current_search_page = 1;
        }
    } else if (engine === 'youtube') {
        var items = datas.items;
        current_start_index += 25;
        valid_vid = $('.youtube_item').length
        if (sublist === false) {
            $('#search_results').html('<p><strong>' + valid_vid + '</strong>' + _("verified videos in this playlist") + '</p>');
        }
        try {
            for (var i = 0; i < items.length; i++) {
                var list = [];
				list.push(items[i].video)
                fillPlaylist(list, false, '', 'youtube')
            }
        } catch (err) {
            if (sublist === false) {
                $('#search_results').html('<p><strong>' + valid_vid + '</strong>' + _("verified videos in this playlist") + '</p>');
                return;
            }
        }
        if (parseInt(current_start_index) < parseInt(length)) {
			pageLoading = true;
            setTimeout(function() {
				pageLoading = true;
                youtube.loadSongs(pid, length, current_start_index, function(datas, length, pid, engine) {
                    fillPlaylistFromPlaylist(datas, length, pid, engine);
                });
            }, 2000);
        } else {
            current_start_index = 1;
            current_page = 1;
        }
    }
}

function fillPlaylist(items, sublist, sublist_id, engine) {
	$('#subList').empty();
    for (var i = 0; i < items.length; i++) {
		if(engine === 'youtube') {
			if (items.length === 1) {
				printYtVideoInfos(items[i], true, sublist, sublist_id, engine);
			} else {
				printYtVideoInfos(items[i], false, sublist, sublist_id, engine);
			}
		} else {
			if (items.length === 1) {
				printVideoInfos(items[i], true, sublist, sublist_id, engine);
			} else {
				printVideoInfos(items[i], false, sublist, sublist_id, engine);
			}
		}
    }
    $('#search').show();
    $('#loading').hide();
    if (searchTypes_select === 'playlists') {
        if (sublist === false) {
            var valid_vid = $('.youtube_item').length
            $('#search_results').html('<p><strong>' + valid_vid + '</strong>' + _("verified videos in this playlist") + '</p>');
        }
    }
    if (load_first_song_next == true || load_first_song_prev === true) {
        playNextVideo();
    }
    $(".nano").nanoScroller();
}

function printVideoInfos(infos, solo, sublist, sublist_id, engine) {
    try {
        var title = infos.title.replace(/[\"\[\]\.\)\(\''\*]/g, '').replace(/  /g, ' ');
        var thumb = infos.thumb;
        var vid = infos.id;
        var seconds = secondstotime(infos.duration);
        var views = infos.views;
        var aut = infos.author;
        if (aut === 'unknown') {
            aut = _("unknown");
        }
        if ($('#youtube_entry_res_' + vid).length === 1) {
            return;
        }
        if ($('#youtube_entry_res_sub_' + vid).length === 1) {
            return;
        }
        var page = 1;
        var text = '' 
        if(title.length > 45){
			text = title.substring(0,45)+'...';
		} else {
			text = title;
		}
		var author = '';
        if(aut.length > 17){
			author = aut.toLowerCase().substring(0,17)+'...';
		} else {
			author = aut;
		}
        $('#items_container').append('<div class="youtube_item" id="'+vid+'"> \
            <span class="optionsTop" style="display:none;"></span> \
            <div id="optionsTopInfos" style="display:none;"> \
                <span><i class="glyphicon glyphicon-eye-open"></i>'+_("Views:")+views+'</span> \
            </div> \
            <img class="video_thumbnail" src="' + thumb + '" /> \
            <div class="spiffy"><div class="inner one"></div><div class="inner two"></div><div class="inner three"></div></div> \
            <div> \
                <img id="'+vid+'" class="coverPlayImg start_video" style="display:none;margin: -90px 0 0 -100px;" /> \
            </div> \
            <span class="optionsBottom" style="display:none;bottom:80px;"></span> \
            <div id="optionsBottomInfos" style="display:none;bottom:80px;"> \
                <span><i class="glyphicon glyphicon-time"></i>'+seconds+'</span> \
                <div class="dropdown"> \
                    <a style="float:right;margin-top:-17px;" class="dropdown-toggle youtube_downloads" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
                    ' + _("Download") + ' \
                    <span class="caret"></span> \
                    </a> \
                    <ul class="dropdown-menu" role="menu" style="width:100%;max-height:80px;" id="youtube_entry_res_' + vid + '"> \
                    </ul> \
                </div> \
            </div> \
            <div><p style="margin-top:15px;"><a class="itemTitle" title="'+title+'"><b>' + text + '</b></a></p><div> \
            <p style="color:grey;font-size:10px;margin:-5px 0 5px 0;">'+_("Posted by:")+' '+author+'</p> \
        </div>');
        var resolutions_string = ['1080p', '720p', '480p', '360p','240p'];
        var resolutions = infos.resolutions;
        for (var i = 0; i < resolutions_string.length; i++) {
            try {
                var resolution = resolutions_string[i];
                var vlink = resolutions[resolution]['link'].trim().replace(' ','');
                if (vlink === 'null') {
                    continue;
                }
                var container = resolutions[resolution]['container'];
            } catch (err) {
                continue;
            }
            $('#youtube_entry_res_' + vid).append('<li class="resolutions_container"><a class="video_link twitchQualityLink" style="display:none;" href="' + vlink + ' " alt="' + resolution + '"><span>' + resolution + '</span></a><a href="' + vlink + '" alt="' + title + '.' + container + '::' + vid + '" title="' + _("Download") + '" class="download_file_https twitchQualityLink">' + resolution + '</a></li>');
        }
        if ($('#youtube_entry_res_' + vid + ' a.video_link').length === 0) {
            $('#youtube_entry_res_' + vid).parent().parent().remove();
        }
        
		if($('#items_container .youtube_item').length === itemsCount) {
            $('#search_results').empty().html('<p><strong>' + totalResults + '</strong> ' + _("videos found") + '</p>');
            $('#items_container').show();
			pageLoading = false;
		}
		
    } catch (err) {
		itemsCount -= 1;
        console.log('printVideoInfos err: '+err);
        if($('#items_container .youtube_item').length === itemsCount) {
            $('#search_results').empty().html('<p><strong>' + totalResults + '</strong> ' + _("videos found") + '</p>');
            $('#items_container').show();
			pageLoading = false;
		}
    }
}


function printYtVideoInfos(infos, solo, sublist, sublist_id, engine) {
    try {
        var title = infos.title.replace(/[\"\[\]\.\)\(\''\*]/g, '').replace(/  /g, ' ');
        if(title == 'Private video' || title == "Deleted video") {
            itemsCount -= 1;
            return;
        }

        try {
			var thumb = infos.thumbnail['hqDefault'];
		} catch(err) {
			var thumb = infos.thumb;
		}
        var vid = infos.id;
        var seconds = secondstotime(infos.duration);
        var views = infos.viewCount == undefined ? infos.views : infos.viewCount;
        var aut = infos.uploader == null ? infos.author : infos.uploader;
        if (aut === 'unknown') {
            aut = _("unknown");
        }
        var page = current_page;
        var text = '' 
        if(title.length > 45){
			text = title.substring(0,45)+'...';
		} else {
			text = title;
		}
        var soloCss = 'block;'; 
        if(solo) {
    		var author = '';
            if(aut.length > 17){
    			author = aut.toLowerCase().substring(0,17)+'...';
    		} else {
    			author = aut;
    		}
            var date = '';
            try {
                date = infos.uploaded.match(/(.*)?T/)[1];
            } catch(err) {

            }
		} else {
            soloCss = 'none;'; 
        }
        $('#items_container').append('<div class="youtube_item" id="'+vid+'"> \
            <span class="optionsTop" style="display:none;"></span> \
            <div id="optionsTopInfos" style="display:none;"> \
                <span><i class="glyphicon glyphicon-eye-open"></i>'+_("Views:")+views+'</span> \
            </div> \
            <img class="video_thumbnail" src="' + thumb + '" /> \
            <div class="spiffy"><div class="inner one"></div><div class="inner two"></div><div class="inner three"></div></div> \
            <div> \
                <img id="'+vid+'" class="coverPlayImg start_video" style="display:none;margin: -90px 0 0 -100px;" /> \
            </div> \
            <span class="optionsBottom" style="display:none;bottom:80px;"></span> \
            <div id="optionsBottomInfos" style="display:none;bottom:80px;"> \
                <span><i class="glyphicon glyphicon-time"></i>'+seconds+'</span> \
                <div class="dropdown"> \
                    <a style="float:right;margin-top:-17px;" class="dropdown-toggle youtube_downloads" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
                    ' + _("Download") + ' \
                    <span class="caret"></span> \
                    </a> \
                    <ul class="dropdown-menu" role="menu" style="width:100%;max-height:80px;" id="youtube_entry_res_' + vid + '"></ul> \
                </div> \
            </div> \
            <div><p style="margin-top:15px;"><a class="itemTitle" title="'+title+'"><b>' + text + '</b></a></p></div> \
            <p style="color:grey;font-size:10px;margin:-5px 0 5px 0;display:'+soloCss+'">'+_("Posted by:")+' '+author+'</p> \
            <p style="color:grey;font-size:10px;margin:-5px 0 5px 0;display:'+soloCss+'">'+_("Date:")+' '+date+'</p> \
        </div>');
        
        if (search_engine === 'youtube') {
            var slink = "http://www.youtube.com/watch?v=" + vid;
        } else if (search_engine === 'dailymotion') {
            var slink = "http://www.dailymotion.com/video/" + vid;
        }
        // if (sublist === false) {
        //     $('#youtube_entry_res_' + vid).append('<a class="open_in_browser" title="' + _("Open in ") + engine + '" href="' + slink + '"><img style="margin-top:10px;" src="images/export.png" />');
        // } else {
        //     $('#youtube_entry_res_sub_' + vid).append('<a class="open_in_browser" title="' + _("Open in ") + engine + '" href="' + slink + '"><img style="margin-top:10px;" src="images/export.png" />');
        // }
		
		if($('#items_container .youtube_item').length === itemsCount) {
			$('#search_results').empty().html('<p><strong>' + totalResults + '</strong> ' + _("videos found") + '</p>');
			$('#items_container').show();
			pageLoading = false;
		}
		
    } catch (err) {
		itemsCount -= 1;
        console.log('printVideoInfos err: '+err);
        if($('#items_container .youtube_item').length === itemsCount) {
            $('#search_results').empty().html('<p><strong>' + totalResults + '</strong> ' + _("videos found") + '</p>');
            $('#items_container').show();
			pageLoading = false;
		}
    }
}
