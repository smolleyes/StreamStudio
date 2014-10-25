var player;
var searchTypes_select = 'videos';
var selected_resolution = '1080p';
var selected_category = '';
var current_video = NaN;
var current_search = '';
var current_start_index = 1;
var current_prev_start_index = 1;
var current_page = 1;
var current_search_page = 1;
var current_song_page = 1;
var load_first_song_next = false;
var load_first_song_prev = false;
var current_song = NaN;
var next_vid;
var prev_vid;
var relTime;
var trackDuration;
var timeUpdater;
var previousLink;
var playFromHttp = false;
var playFromFile = false;
var playFromUpnp = false;
var playFromMega = false;
var playFromMegaUser = false;


$(document).ready(function() {
	$('#subPlayer-next').click(function() {
		getNext();
	});
	
	$('#subPlayer-play, #subPlayer-pause').click(function() {
		if(player.media.paused) {
			player.play();
		} else {
			player.pause();
		}
	});
	
	$('#subPlayer-prev').click(function() {
		getPrev();
	});
	
});


function initPlayer() {
    player.pause();
    player.setSrc('');
    player.currentTime = 0;
    player.current[0].style.width = 0;
    player.loaded[0].style.width = 0;
    player.durationD.html('00:00:00');
    $('.mejs-time-loaded').width(0+'%');
    $('.mejs-time-buffering').width(0+'%');
	$('.mejs-time-current').width(0+'%');
	$('span.mejs-currenttime').text('00:00:00');
	$('span.mejs-duration').text('00:00:00');
    $("#preloadTorrent").remove();
    $(".mejs-overlay").show();
    $(".mejs-layer").show();
    $(".mejs-overlay-loading").hide();
    $(".mejs-overlay-button").show();
    $('#song-title').empty().append(_('Stopped...'));
    $('#infosPage').remove();
     $('.mejs-container #fbxMsg').remove();
    continueTransition = false;
    clearInterval(timeUpdater);
    timeUpdater = null;
    $("#subPlayer-img").attr('src',"images/play-overlay.png");
    $("#subPlayer-title").text(' '+_('Waiting...'));
    $('#subPlayer-play').show();
	$('#subPlayer-pause').hide();
    if (upnpMediaPlaying === true) {
		upnpMediaPlaying = false;
		mediaRenderer.stop();
    }
    try {
        cleanffar();
        currentRes.end();
    } catch (err) {}
    try {
		if(torrentPlaying) {
		 stopTorrent();
		}
	} catch (err) {}
	
	try {
		extPlayerProc.kill('SIGKILL');
	} catch(err) {}
}

function startPlay(media) {
    initPlayer();
    playFromFile = false;
    playFromHttp = false;
    torrentPlaying = false;
    playFromUpnp = false;
    playFromMega = false;
    playFromMegaUser = false;
    var localLink = null;
    try {
        next_vid = media.next;
        var link = media.link;
        if(link.indexOf('http://'+ipaddress+':8888/?file') !== -1) {
			link = link.split('?file=')[1].replace('&tv','');
		} else {
			link = link.replace('&tv','');
		}
        var title = media.title;
        currentMedia = media;
        currentMedia.link = link;
        
        // set title
        $('#song-title').empty().append(_('Playing: ') + decodeURIComponent(title));
			
        // check type of link to play
		var linkType = link.split('&').pop();
		
		// torrents
		if (linkType === 'torrent') {
			torrentPlaying = true;
			currentMedia.link = link.replace('&torrent','');
			launchPlay();
		// http(s) links
		} else if (linkType === 'external') {
			playFromHttp = true;
			currentMedia.link = link.replace('&external','');
			launchPlay();
		// local files links
		} else if (link.indexOf('file:///') !== -1) {
			playFromFile = true;
			currentMedia.link = link.replace('file://','');
			launchPlay();
		// play from upnp server
		} else if (linkType === 'upnp' || upnpToggleOn) {
			playFromUpnp = true;
			currentMedia.link = link.replace('&upnp','');
			launchPlay();
		// else look for link already downloaded, if yes play it from hdd
		} else if (playFromFile == false) {
			fs.readdir(download_dir, function(err, filenames) {
				var i;
				count = filenames.length;
				if ((err) || (count === 0)) {
					launchPlay();
				} else {
					for (i = 0; i < filenames.length; i++) {
						ftitle = filenames[i];
						if ((title + '.mp4' === ftitle) || (title + '.webm' === ftitle) || (title + '.mp3' === ftitle)) {
							currentMedia.link = 'file://' + encodeURI(download_dir + '/' + ftitle);
						}
						count--;
						if (count === 0) {
							launchPlay();
						}
					}
				}
			});
		} else {
			launchPlay();
		}
    } catch (err) {
        console.log("error startPlay: " + err);
    }
}

function launchPlay() {
	try {
		if(engine.type == "video" && activeTab == 1 || activeTab == 2 ) {
			$('#playerToggle')[0].click();
		}
	} catch(err) {
		$('#playerToggle')[0].click();
	}
	$('#subPlayer-play').hide();
	$('#subPlayer-pause').show();
	var img = null;
	try {
		img = $('.highlight').find('img')[0].src;
	} catch(err) {}
	console.log(img, $('#subPlayer-img').attr('src'))
	if (img !== $('#subPlayer-img').attr('src') && img !== null) {
		$('#subPlayer-img').attr('src',img);
	}
	if($('#subPlayer-title').text() !== currentMedia.title) {
		$('#subPlayer-title').empty().append('<marquee behavior="scroll" scrollamount="2" direction="left">'+currentMedia.title+'</marquee>');
	}
	// add link for transcoding
	if(transcoderEnabled || currentMedia.link.indexOf('mega.co') !== -1) {
		var link = 'http://'+ipaddress+':8888/?file='+currentMedia.link;
		currentMedia.link = link;
	}
	
	if(upnpToggleOn) {
		upnpMediaPlaying = false;
		continueTransition = false;
		currentMedia.data = JSON.stringify({"protocolInfo" : "http-get:*"});
		if(currentMedia.type === undefined) {
			try {
				if (mime.lookup(currentMedia.title).indexOf('audio/') !== -1 || mime.lookup(currentMedia.link).indexOf('audio/') !== -1) {
					currentMedia.type = "object.item.audioItem.musicTrack";
				} else if (mime.lookup(currentMedia.title).indexOf('video/') !== -1 || mime.lookup(currentMedia.link).indexOf('video/') !== -1) {
					currentMedia.type = "object.item.videoItem";
				}
			} catch(err) {
				currentMedia.type = "object.item.videoItem";
			}
		}
		if (upnpMediaPlaying) {
			mediaRenderer.stop();
			setTimeout(function() { return playUpnpRenderer(currentMedia);},2000);
		} else {
			return playUpnpRenderer(currentMedia);
		}
	} else {
		var obj = JSON.parse(settings.ht5Player);
		console.log('PLAYING in player: ' + currentMedia.link)
		if(obj.name === 'StreamStudio') {
			player.setSrc(currentMedia.link);
			player.play();
		} else {
			try {extPlayerProc.kill();} catch(err){}
			if(currentMedia.link.indexOf('mega.co') !== -1) {
				extPlayerProc = exec('"'+obj.path+'"' +' "'+currentMedia.link+'"');
			} else {
				console.log('"'+obj.path+'"' +' "'+decodeURIComponent(currentMedia.link)+'"')
				extPlayerProc = exec('"'+obj.path+'"' +' "'+decodeURIComponent(currentMedia.link)+'"');
			}
			extPlayerProc.on('exit',function() {
				console.log(obj.name + ' process terminated....');
				initPlayer();
			});
		}
	}
}


function startVideo(vid_id, title) {
    if ($('#' + vid_id + ' a.video_link').length === 0) {
        return;
    }
    
    var childs = $('#' + vid_id + ' a.video_link');
    var elength = parseInt(childs.length);
    if (elength > 1) {
        for (var i = 0; i < elength; i++) {
            var found = false;
            var res = $(childs[i], this).attr('alt');
            if (res == selected_resolution) {
                childs[i].click();
                break;
            } else {
                // if not found  select the highest resolution available...
                if (i + 1 == elength) {
                    if (found === false) {
                        childs[0].click();
                    } else {
                        continue;
                    }
                }
            }
        }
    } else {
        childs[0].click();
    }
}

function playNextVideo(vid_id) {
    try {
        var elem_id = '';
        // if page was changed
        if (current_song_page !== current_page) {
            // if some items are loaded
            if ($('#items_container').children().length > 1) {
                // play first item
                vid_id = $('#items_container').find('.youtube_item').find('.downloads_container').attr('id');
            } else {
                return;
            }
        }
        load_first_song_next = false;
        load_first_song_prev = false;
        current_song_page = current_page;
        startVideo(vid_id);
    } catch (err) {
        console.log(err + " : can't play next video...");
    }
}

function getNext() {
	$('.mejs-time-buffering').width(0+'%');
	$('.mejs-time-current').width(0+'%');
	$('span.mejs-currenttime').text('00:00:00');
	$('span.mejs-duration').text('00:00:00');
    $("#preloadTorrent").remove();
    $(".mejs-overlay").show();
    $(".mejs-layer").show();
    $(".mejs-overlay-loading").hide();
    $(".mejs-overlay-button").show();
    $('#infosPage').remove();
    $('#song-title').empty().append(_('Stopped...'));
    $('.mejs-container #fbxMsg').remove();
    console.log("trying get next video", next_vid);
    if (activeTab == 1) {
		try {
			engine.play_next();
		} catch(err) {
			try {
				$('.highlight').closest('li').next().find('a')[0].click();
			} catch (err) {
				try {
					$('.highlight').closest('li').next().find('a.preload')[0].click();
				} catch (err) {
					try {
						var vid_id = $('.highlight').closest('div.youtube_item').next().find('.downloads_container').attr('id');
						startVideo(vid_id);
					} catch (err) {
						playNextVideo(next_vid);
					}
				}
			}
		}
	} else {
		try {
			var vid = $('.jstree-clicked').attr('id');
			if (vid === undefined) {
				console.log("no more videos to play in the playlists");
			} else {
				$('#' + vid).next().find('a').click();
			}
		} catch(err) {} 
	}
}

function getPrev() {
	$('.mejs-time-buffering').width(0+'%');
	$('.mejs-time-current').width(0+'%');
	$('span.mejs-currenttime').text('00:00:00');
	$('span.mejs-duration').text('00:00:00');
    $("#preloadTorrent").remove();
    $(".mejs-overlay").show();
    $(".mejs-layer").show();
    $(".mejs-overlay-loading").hide();
    $(".mejs-overlay-button").show();
    $('#infosPage').remove();
    $('#song-title').empty().append(_('Stopped...'));
    $('.mejs-container #fbxMsg').remove();
    if (activeTab == 1) {
		try {
			$('.highlight').closest('li').prev().find('a')[0].click();
		} catch (err) {
			try {
				var vid_id = $('.highlight').closest('div.youtube_item').prev().find('.downloads_container').attr('id');
				startVideo(vid_id);
			} catch(err) {}
		}
	} else {
		try {
			var vid = $('.jstree-clicked').attr('id');
			if (vid === undefined) {
				console.log("no more videos to play in the playlists");
			} else {
				$('#' + vid).prev().find('a').click();
			}
		} catch(err) {} 
	}
}

function on_media_finished(){
	if (playlistMode === 'normal') {
		initPlayer();
	} else if (playlistMode === 'loop') {
		if(upnpMediaPlaying) {
			playUpnpRenderer(currentMedia)
		} else {
			startPlay(currentMedia);
		}
	} else if (playlistMode === 'shuffle') {
		
	} else if (playlistMode === 'continue') {
		getNext();
	} 
}
