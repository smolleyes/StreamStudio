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
                $('#categories_select').empty();
                for (var i = 0; i < arr.length; i++) {
                    $('#categories_select').append('<option value = "' + arr[i]._term + '">' + arr[i]._label + '</option>')
                    if(i+1 == arr.length) {
						 $('.selectpicker').selectpicker('refresh');
					}
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
                $('#categories_select').empty();
                for (var i = 0; i < arr.length; i++) {
                    $('#categories_select').append('<option value = "' + arr[i].id + '">' + arr[i].name + '</option>')
                    if(i+1 == arr.length) {
						 $('.selectpicker').selectpicker('refresh');
					}
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
            var totalResults = datas.totalItems;
            var pages = totalResults / 10;
            var startPage = 1;
            var browse = false;
            var has_more = false;
            var itemsByPage = 25;
            break;
        case 'dailymotion':
            var items = datas.list;
            var totalResults = datas.total;
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
            return;
        }
        // for dailymotion
    } else if ((totalResults === undefined) && (datas.limit !== 10) || (engine === 'youtube') && (searchTypes_select === 'topRated') || (searchTypes_select === 'mostViewed')) {
        $('#search_results').html('<p>' + _("Browsing mode, use the pagination bar to navigate") + '</p>');
        browse = true;
        if ((sublist === false) && (pagination_init === false)) {
            $("#pagination").pagination({
                itemsOnPage: 25,
                pages: current_page + 1,
                currentPage: current_page,
                displayedPages: 5,
                cssStyle: 'compact-theme',
                edges: 1,
                prevText: '' + _("Prev") + '',
                nextText: '' + _("Next") + '',
                onPageClick: changePage
            });
            if ((datas.has_more === true) && (engine === 'dailymotion') || (engine === 'youtube') && (searchTypes_select === 'topRated') || (searchTypes_select === 'mostViewed')) {
                pagination_init = false;
            } else {
                pagination_init = true;
            }
            total_pages = $("#pagination").pagination('getPagesCount');
        }
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
    // init pagination bar
    if ((sublist === false) && (pagination_init === false) && (browse === false)) {
        $("#pagination").pagination({
            items: totalResults,
            itemsOnPage: itemsByPage,
            displayedPages: 5,
            cssStyle: 'compact-theme',
            edges: 1,
            prevText: '' + _("Prev") + '',
            nextText: '' + _("Next") + '',
            onPageClick: changePage
        });
        pagination_init = true;
        total_pages = $("#pagination").pagination('getPagesCount');
    }
    // load videos
    switch (engine) {
        case 'dailymotion':
            for (var i = 0; i < items.length; i++) {
                dailymotion.getVideoInfos(items[i].id, i, items.length, function(datas) {
                    fillPlaylist(datas, sublist, vid, 'dailymotion')
                });
            }
            break;
        case 'youtube':
            for (var i = 0; i < items.length; i++) {
                youtube.getVideoInfos('http://www.youtube.com/watch?v=' + items[i].id, i, items.length, function(datas) {
                    fillPlaylist(datas, sublist, vid, 'youtube')
                });
            }
            break;
    }
}

function getPlaylistInfos(datas, engine) {
    sublist = false;
    switch (engine) {
        case 'youtube':
            var items = datas.items;
            var totalResults = datas.totalItems;
            var itemsByPage = 25;
            break;
        case 'dailymotion':
            var items = datas.list;
            var totalResults = datas.total;
            var itemsByPage = 25;
            break;
    }
    if (totalResults === 0) {
        $('#search_results').html(_("<p><strong>No playlist</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
        return;
    }
    $('#search_results').html('<p><strong>' + totalResults + '</strong> ' + _("playlists found") + '</p>');
    try {
        for (var i = 0; i < items.length; i++) {
            loadPlaylistItems(items[i], engine);
        }
        if ((sublist === false) && (pagination_init === false)) {
            $("#pagination").pagination({
                items: totalResults,
                itemsOnPage: itemsByPage,
                displayedPages: 5,
                cssStyle: 'compact-theme',
                edges: 1,
                prevText: '' + _("Prev") + '',
                nextText: '' + _("Next") + '',
                onPageClick: changePage
            });
            pagination_init = true;
            total_pages = $("#pagination").pagination('getPagesCount');
        }
    } catch (err) {
        $('#search_results').html(_("<p><strong>No playlist</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
    }
    $('#items_container').show();
    $('#pagination').show();
    $('#search').show();
    $('#loading').hide();
}

function getChannelsInfos(datas, engine) {
    sublist = false;
    switch (engine) {
        case 'youtube':
            var items = datas.feed.entry;
            var totalResults = datas.feed.openSearch$totalResults['$t'];
            break;
        case 'dailymotion':
            var items = datas.list;
            var totalResults = datas.total;
            break;
    }
    if (totalResults === 0) {
        $('#search_results').html(_("<p><strong>No channels</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
        return;
    }
    $('#search_results').html('<p><strong>' + totalResults + '</strong> ' + _("channels found") + '</p>');
    try {
        for (var i = 0; i < items.length; i++) {
            loadChannelsItems(items[i], engine);
        }
        if ((sublist === false) && (pagination_init === false)) {
            $("#pagination").pagination({
                items: totalResults,
                itemsOnPage: 25,
                displayedPages: 5,
                cssStyle: 'compact-theme',
                edges: 1,
                prevText: '' + _("Prev") + '',
                nextText: '' + _("Next") + '',
                onPageClick: changePage
            });
            pagination_init = true;
            total_pages = $("#pagination").pagination('getPagesCount');
        }
    } catch (err) {
        $('#search_results').html(_("<p><strong>No playlist</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
    }
    $('#items_container').show();
    $('#pagination').show();
    $('#search').show();
    $('#loading').hide();
}

function loadPlaylistItems(item, engine) {
    if (search_engine === 'dailymotion') {
        var title = item.name;
        var thumb = item.thumbnail_medium_url;
        var pid = item.id;
        var length = item.videos_total;
        var author = item['owner.username'];
        var description = item.description;
        $('#items_container').append('<div class="youtube_item_playlist"><img src="' + thumb + '" style="float:left;width:120px;height:90px;"/><div class="left" style="width:238px;"><p><b>' + title + '</b></p><p><span><b>total videos:</b> ' + length + '</span>      <span><b>      author:</b> ' + author + '</span></p></div><div class="right"><a href="#" id="' + pid + '::' + length + '::' + engine + '" class="load_playlist"><img width="36" height ="36" src="images/play.png" /></a></div></div>');

    } else if (engine === 'youtube') {
        var pid = item.id;
        var length = item.size;
        var author = item.author;
        var description = item.description;
        var thumb = item.thumbnail.sqDefault;
        var title = item.title;
        $('#items_container').append('<div class="youtube_item_playlist"><img src="' + thumb + '" style="float:left;width:120px;height:90px;"/><div class="left" style="width:238px;"><p><b>' + title + '</b></p><p><span><b>total videos:</b> ' + length + '</span>      <span><b>      author:</b> ' + author + '</span></p></div><div class="right"><a href="#" id="' + pid + '::' + length + '::' + engine + '" class="load_playlist"><img width="36" height ="36" src="images/play.png" /></a></div></div>');

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
    $('#items_container').append('<div class="youtube_item_channel"><img src="' + thumb + '" style="float:left;width:120px;height:90px;"/><div class="left" style="width:238px;"><p><b>' + title + '</b></p><p><span><b>total videos:</b> ' + length + '</span>      <span><b>      author:</b> ' + author + '</span></p></div><div class="right"><a href="#" id="' + pid + '::' + length + '::' + engine + '::' + link + '" class="load_channel"><img width="36" height ="36" src="images/play.png" /></a></div></div>');
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
            var totalResults = datas.data.totalItems;
            break;
        case 'dailymotion':
            var items = datas.list;
            var totalResults = datas.total;
            break;
    }
    if (totalResults === 0) {
        $('#search_results').html(_("<p><strong>No videos</strong> found...</p>"));
        $('#search').show();
        $('#loading').hide();
        return;
    } else {
        $('#search_results').html('<p><strong>' + totalResults + '</strong> ' + _("videos found in this channel") + ' </p>');
        try {
            for (var i = 0; i < items.length; i++) {
                if (search_engine === 'youtube') {
                    youtube.getVideoInfos('http://www.youtube.com/watch?v=' + items[i].id, i, items.length, function(datas) {
                        fillPlaylist(datas, false, '', 'youtube');
                    });
                }
            }
            if ((sublist === false) && (pagination_init === false)) {
                $("#pagination").pagination({
                    items: totalResults,
                    itemsOnPage: 25,
                    displayedPages: 5,
                    cssStyle: 'compact-theme',
                    edges: 1,
                    prevText: '' + _("Prev") + '',
                    nextText: '' + _("Next") + '',
                    onPageClick: changeChannelPage
                });
                pagination_init = true;
                total_pages = $("#pagination").pagination('getPagesCount');
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
    if (search_engine === 'dailymotion') {
        var items = datas.list;
        for (var i = 0; i < items.length; i++) {
            dailymotion.getVideoInfos(items[i].id, i, items.length, function(datas) {
                fillPlaylist(datas, false, '', 'dailymotion');
            });
        }
        if (datas.has_more === true) {
            current_search_page += 1;
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
                youtube.getVideoInfos('http://www.youtube.com/watch?v=' + items[i].video.id, i, items.length, function(datas) {
                    fillPlaylist(datas, false, '', 'youtube');
                });
            }
        } catch (err) {
            if (sublist === false) {
                $('#search_results').html('<p><strong>' + valid_vid + '</strong>' + _("verified videos in this playlist") + '</p>');
                return;
            }
        }
        if (parseInt(current_start_index) < parseInt(length)) {
            setTimeout(function() {
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
        if (items.length === 1) {
            printVideoInfos(items[i], true, sublist, sublist_id, engine);
            var pos = $('#items_container .youtube_item').first().position()['top'];
            $(window).scrollTop(pos - 65);
        } else {
            printVideoInfos(items[i], false, sublist, sublist_id, engine);
        }
    }
    $('#items_container').show();
    $('#search').show();
    $('#loading').hide();
    if (searchTypes_select === 'playlists') {
        $('#pagination').hide();
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
        var author = infos.author;
        if (author === 'unknown') {
            author = _("unknown");
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
        if (solo === true) {
            $('#items_container').prepend('<div class="youtube_item"><img class="video_thumbnail" src="' + thumb + '" /><div class="video_length"><span>' + seconds + '</span></div><div class="item-info"><p><a class="start_video"><b>' + text + '</b></a></p></div><div class="item-info"><span><b>' + _("Posted by:") + '</b> ' + author + ' </span></div><div class="item-info"><span><b>' + _("Views:") + ' </b> ' + views + '</span></div><div id="youtube_entry_res_' + vid + '" class="downloads_container"></div><div class="toggle-control" style="display:none;"><a href="#" class="toggle-control-link" alt="' + vid + '::' + engine + '">+ ' + _("Open related videos") + '</a><div class="toggle-content" style="display:none;"><div id="sublist_' + vid + '"></div><button id="loadmore_' + vid + '" href="#" class="load_more" alt="0::' + page + '::' + vid + '::' + engine + '" style="display:none">' + _("Load more videos") + '</button></div></div></div></div>');
        } else {
            if (sublist === false) {
                $('#items_container').append('<div class="youtube_item" ><img class="video_thumbnail" src="' + thumb + '" /><div class="video_length"><span>' + seconds + '</span></div><div class="item-info"><p><a class="start_video"><b>' + text + '</b></a></p></div><div class="item-info"><span><b>' + _("Posted by:") + '</b> ' + author + ' </span></div><div class="item-info"><span><b>' + _("Views:") + ' </b> ' + views + '</span></div><div id="youtube_entry_res_' + vid + '" class="downloads_container"></div><div class="toggle-control" style="display:none;"><a href="#" class="toggle-control-link" alt="' + vid + '::' + engine + '">+ ' + _("Open related videos") + '</a><div class="toggle-content" style="display:none;"><div id="sublist_' + vid + '"></div><button id="loadmore_' + vid + '" href="#" class="load_more" alt="0::' + page + '::' + vid + '::' + engine + '" style="display:none">' + _("Load more videos") + '</button></div></div></div></div>');
            } else {
                $('#subList').append('<div class="youtube_item"><img class="video_thumbnail" src="' + thumb + '" /><div class="item_infos"><span class="video_length">' + seconds + '</span><div><p><a class="start_video"><b>' + text + '</b></a></p><div><span><b>' + _("Posted by:") + '</b> ' + author + ' </span><span><b>' + _("Views:") + ' </b> ' + views + '</span></div></div><div id="youtube_entry_res_sub_' + vid + '" class="downloads_container"></div></div><div class="toggle-control" style="display:none;"><a href="#" class="toggle-control-link" alt="' + vid + '::' + engine + '">+ ' + _("Open related videos") + '</a><div class="toggle-content" style="display:none;"><div id="sublist_' + vid + '"></div><button id="loadmore_' + vid + '" href="#" class="load_more" alt="0::' + page + '::' + vid + '::' + engine + '" style="display:none">' + _("Load more videos") + '</button></div></div></div>').show();
            }
        }
        var resolutions_string = ['1080p', '720p', '480p', '360p'];
        var resolutions = infos.resolutions;
        for (var i = 0; i < resolutions_string.length; i++) {
            try {
                var resolution = resolutions_string[i];
                var vlink = resolutions[resolution]['link'];
                if (vlink === 'null') {
                    continue;
                }
                var container = resolutions[resolution]['container'];
            } catch (err) {
                continue;
            }
            var img = '';
            if (resolution == "720p" || resolution == "1080p") {
                img = 'images/hd.png';
            } else {
                img = 'images/sd.png';
            }
            if (sublist === false) {
                $('#youtube_entry_res_' + vid).append('<div class="resolutions_container"><a class="video_link" style="display:none;" href="' + vlink + '" alt="' + resolution + '"><img src="' + img + '" class="resolution_img" /><span>' + resolution + '</span></a><a href="' + vlink + '" alt="' + title + '.' + container + '::' + vid + '" title="' + _("Download") + '" class="download_file_https"><img src="images/down_arrow.png" width="16" height="16" />' + resolution + '</a></div>');
            } else {
                $('#youtube_entry_res_sub_' + vid).append('<div class="resolutions_container"><a class="video_link" style="display:none;" href="' + vlink + '" alt="' + resolution + '"><img src="' + img + '" class="resolution_img" /><span>' + resolution + '</span></a><a href='+ vlink + '" alt="' + title + '.' + container + '::' + vid + '" title="' + _("Download") + '" class="download_file_https"><img src="images/down_arrow.png" width="16" height="16" />' + resolution + '</a></div>');
            }
        }
        if ($('#youtube_entry_res_' + vid + ' a.video_link').length === 0) {
            $('#youtube_entry_res_' + vid).parent().parent().remove();
        } else if ($('#youtube_entry_res_sub_' + vid + ' a.video_link').length === 0) {
            $('#youtube_entry_res_sub_' + vid).parent().parent().remove();
        }
        if (search_engine === 'youtube') {
            var slink = "http://www.youtube.com/watch?v=" + vid;
        } else if (search_engine === 'dailymotion') {
            var slink = "http://www.dailymotion.com/video/" + vid;
        }
        if (sublist === false) {
            $('#youtube_entry_res_' + vid).append('<a class="open_in_browser" title="' + _("Open in ") + engine + '" href="' + slink + '"><img style="margin-top:10px;" src="images/export.png" />');
        } else {
            $('#youtube_entry_res_sub_' + vid).append('<a class="open_in_browser" title="' + _("Open in ") + engine + '" href="' + slink + '"><img style="margin-top:10px;" src="images/export.png" />');
        }

    } catch (err) {
        //console.log('printVideoInfos err: '+err);
    }
}
