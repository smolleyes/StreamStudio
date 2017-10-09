var player;
var Reader = require('radio-song');
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
var playFromTwitch = false;
var playFromYoutube = false;
var playFromDailymotionLive = false;
var doNotSwitch = false;
var currentMedia = {};
var ChromecastInterval;
var chromeCastplaying = false;
var playFromWat = false;
var playFromIcecast = false;
var iceCastTimer = null;
var https = require('https')
var Cast = require('casts')

$(document).ready(function() {

	player = MediaElementPlayer('#videoPlayer', {
		playlist: true,
		playlistposition: 'top',
		features: ['playlistfeature','playlist','playpause', 'progress', 'current', 'duration', 'tracks','stop', 'volume', 'fullscreen']
	});

	$.each(['show', 'hide'], function (i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function () {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});

	$('.mejs-playlist').on('show', function() {
		player.playlistToggle.removeClass('mejs-show-playlist').addClass('mejs-hide-playlist');
		player.options.playlist = true;
	});

	$('.mejs-playlist').on('hide', function() {
		player.playlistToggle.removeClass('mejs-hide-playlist').addClass('mejs-show-playlist');
		player.options.playlist = false;
	});

	// next signal and callback
	$(document).on('click', '.mejs-next-btn', function(e) {
		e.preventDefault();
		play_next = true;
		if(fromPlayList) {
			player.playNextTrack()
		} else {
			getNext();
		}
	});
	// stop button
	$(document).on('click', '#stopBtn, #subPlayer-stop', function(e) {
		if(upnpToggleOn){
			try{
				mediaRenderer.stop()
				clearInterval(castStatusInterval)
				castStatusInterval = null;
			} catch(err) {
				initPlayer()
				player.media.stop()
			}
		}
		updateMiniPlayer()
		try {
			upnpMediaPlaying = false;
			continueTransition = false;
			upnpContinuePlay = false;
			upnpStoppedAsked = true;
			fromPlayList = false;
		} catch(err) {}
		if (win.isFullscreen === true) {
			win.toggleFullscreen();
			player.isFullScreen = false;
		}
		$('#playerContainer').hide();
		$('#playerTopBar').hide();
		$('#closePlayer').click();
		$('#subPlayer-play').show();
		$('#subPlayer-pause').hide();
		$('.mejs-playpause-button').removeClass('mejs-pause').addClass('mejs-play');
		stopTorrent();
		initPlayer();
	});
	//transcoder button
	$(document).on('click','#transcodeBtnContainer,#transcodingBtnSub',function(e) {
		e.preventDefault();
		if(transcoderEnabled) {
			$('button[aria-controls="transcodeBtn"]').removeClass('transcoder-enabled').addClass('transcoder-disabled');
			$('button[aria-controls="transcodeBtn"]').attr('title',_('transcoding disabled'));
			$('#transcodingInput').prop( "checked", false );
			transcoderEnabled = false;
		} else {
			$('button[aria-controls="transcodeBtn"]').removeClass('transcoder-disabled').addClass('transcoder-enabled');
			$('button[aria-controls="transcodeBtn"]').attr('title',_('transcoding enabled'));
			$('#transcodingInput').prop( "checked", true );
			transcoderEnabled = true;
		}
	});

	//playlist buttons
	$(document).on('click','#playModeBtn,#playlistBtnSub',function(e) {
		e.preventDefault();
		console.log('playlist clicked');
		var pos = $('button[aria-label="playmode"]').css('backgroundPosition-y');
		if(pos === '0px') {
			$('button[aria-label="playmode"]').attr('style', 'background-position-y:-16px !important');
			$('button[aria-label="playmode"]').attr('title',_('repeat mode'));
			playlistMode = 'loop';
			//} else if(pos === '-16px') {
			//$('button[aria-label="playlist"]').attr('style', 'background-position-y:-48px !important');
			//$('button[aria-label="playlist"]').attr('title','shuffle mode');
			//playlistMode = 'shuffle';
		} else if (pos === '-16px') {
			$('button[aria-label="playmode"]').attr('style', 'background-position-y:-48px !important');
			$('button[aria-label="playmode"]').attr('title',_('play and stop mode (click to change)'));
			playlistMode = 'normal';
		} else if (pos === '-48px') {
			$('button[aria-label="playmode"]').attr('style', 'background-position-y:0px !important');
			$('button[aria-label="playmode"]').attr('title',_('playlist mode'));
			playlistMode = 'continue';
		}
	});

	// previous signal and callback
	$(document).on('click', '.mejs-back-btn', function(e) {
		e.preventDefault();
		play_prev = true;
		if(fromPlayList) {
			player.playPrevTrack();
		} else {
			getPrev();
		}
	});

	// player signals
	player.media.addEventListener('ended', function() {
		console.log('media finished')
		torObj.retried = false;
		updateMiniPlayer();
		on_media_finished()
		$('.mejs-overlay-play').show();
		$(".mejs-overlay-loading").hide();
	});

	player.media.addEventListener('timeupdate', function(e) {

	});

	// player.media.addEventListener('pause', function() {
	// 	playPause()
	// });
	player.media.addEventListener('seeking', function() {
		$(".mejs-overlay-loading").show();
		$('.mejs-overlay-play').hide();
	});

	player.media.addEventListener('stalled', function() {
		$(".mejs-overlay-loading").show();
		$('.mejs-overlay-play').hide();
	});

	player.media.addEventListener('playing', function() {
		$('#subPlayer-play').hide();
		$('#subPlayer-pause').show();
		try { $('#fbxMsg2').remove(); } catch(err) {}
		$('.mejs-overlay-button,.mejs-overlay,.mejs-overlay-loading,.mejs-overlay-play').hide();
		updateMiniPlayer();
		if(upnpToggleOn && state.playing.location=="airplay") {
			state.playing.state ="PLAYING"
		}
	});

	$(document).on('click','.playlistTrack',function(){
		console.log($(this))
		player.playTrack($(this),true,false)
		player.playlistToggleClick();
		fromPlayList = true;
	})
	player.playlistToggleClick()

	//SubPlayer controls
	$('#subPlayer-next').click(function() {
		play_next = true;
		if(fromPlayList) {
			player.playNextTrack()
		} else {
			getNext();
		}
	});

  // click subplayer play/pause
	$('#subPlayer-play, #subPlayer-pause').click(function() {
		playPausePLayer()
	});

  // play/pause btn in main player, pause won t work without upnp like this... so let the player do with paused state in !upnpToggleOn
	$('.mejs-playpause-button').click(function() {
		if(upnpToggleOn) {
			playPausePLayer()
		}
	});

	$('#subPlayer-prev').click(function() {
		play_prev = true;
		if(fromPlayList) {
			player.playPrevTrack()
		} else {
			getNext();
		}
	});

	// subPlayer progress bar
	mediaPlayer = document.getElementById('videoPlayer');
	mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);
	$('#progress-bar').click(function(e) {
		if(playFromMegaUser || playFromMega || engine && engine.engine_name == "Shoutcast") {
			return;
		}
		var pos = e.offsetX;
		var pct = (( pos * 100) / $('#progress-bar').outerWidth(true)).toFixed(2);
		console.log(pct)
		var duree;
		if(upnpTranscoding){
			duree = mediaDuration;
		} else {
			duree = (player.media.duration == Infinity || isNaN(player.media.duration)) ? mediaDuration : player.media.duration;
		}
		var newTime = (pct <= 0.0001) ? 0 : pct * duree / 100;
		mediaCurrentPct = pct;
		mediaCurrentTime = newTime;
		seekAsked = true;
		if(transcoderEnabled || upnpTranscoding || playFromYoutube && videoResolution !== '720p' && videoResolution !== '360p') {
			var m = {};
			var l = currentMedia.link.replace(/&start=(.*)/,'')
			if(playFromFile) {
				m.link = l.replace('?file=/','?file=file:///')+'&start='+mejs.Utility.secondsToTimeCode(newTime);
			} else if(playFromHttp) {
				m.link = l.split('?file=')[1]+'&start='+mejs.Utility.secondsToTimeCode(newTime)+'&external';
			} else if (torrentPlaying) {
				m.link = l.split('?file=')[1]+'&start='+mejs.Utility.secondsToTimeCode(newTime)+'&torrent';
			} else if (playFromUpnp) {
				m.link = l.split('?file=')[1]+'&start='+mejs.Utility.secondsToTimeCode(newTime)+'&upnp';
			} else if (playFromYoutube) {
				doNotSwitch = true;
				currentMedia.link=l+mejs.Utility.secondsToTimeCode(newTime).trim();
				m.link = l.split('?file=')[1].trim()+'&start='+mejs.Utility.secondsToTimeCode(newTime).trim();
			}
			m.title = currentMedia.title;
			m.cover = currentMedia.cover;
			console.log("INITPLAY", m, mejs.Utility.secondsToTimeCode(newTime))
			initPlay(m);
			//player.media.setCurrentTime(newTime);
		} else {
			if(upnpToggleOn){
				newTime = pct * state.playing.duration / 100
				if(upnpTranscoding) {
					var m = state.media
					m.link = state.media.link.split('?file=')[1]+'&start='+mejs.Utility.secondsToTimeCode(newTime)+'&upnp';
					initPlay(m);
				} else {
					if(state.playing.location == "airplay") {
						mediaRenderer.scrub(newTime)
					} else {
						mediaRenderer.seek(newTime)
					}
				}
			} else {
				console.log(newTime)
				player.media.setCurrentTime(newTime);
			}
		}
	})

	// close player
	$(document).on('click', '#closePlayer',function() {
		if (win.isFullscreen === true) {
			win.toggleFullscreen();
			player.isFullScreen = false;
		}
		$('#playerContainer').hide();
		$('#castPopup').hide()
		$('#playerTopBar').hide();
		$('#tab a[href="#tabpage_'+activeTab+'"]').click();
	});

	// pin player bars
	$(document).on('click', '.playerBarsLocker', function(e) {
		e.preventDefault();
		if(playerBarsLocked) {
			playerBarsLocked = false;
			$(this).removeClass('playerBarsLocked').addClass('playerBarsUnlocked');
			$(this).attr('title',_("Click to pin bars"));
		} else {
			playerBarsLocked = true;
			$(this).removeClass('playerBarsUnlocked').addClass('playerBarsLocked');
			$(this).attr('title',_("Click to unpin bars"));
		}
	});
	$('.mejs-volume-current').css('height','80');
	$('.mejs-volume-handle').css('top','20')
	$('.mejs-volume-pct').text('80%')
});


function playPausePLayer() {
	if(upnpToggleOn) {
		if(state.playing.state !== 'PAUSED') {
			mediaRenderer.pause()
			state.playing.state = 'PAUSED'
			$('#subPlayer-play').show();
			$('#subPlayer-pause').hide();
		} else {
			if(state.playing.location =="airplay") {
				mediaRenderer.resume()
			} else {
				mediaRenderer.play()
			}
			state.playing.state = "PLAYING"
			$('#subPlayer-play').hide();
			$('#subPlayer-pause').show();
		}
	} else {
		if(player.media.paused) {
			if(player.media.src.indexOf('index.html') !== -1) {
				return;
			} else {
				player.play();
			}
		} else {
			player.pause();
		}
	}
}

function initPlayer(stopTorrent) {
	// clean subtitles
	$('.soloTorrent').remove();
	player.durationD.html(mejs.Utility.secondsToTimeCode(0));
	player.currenttime.html(mejs.Utility.secondsToTimeCode(0))
	$('.mejs-currenttime-sub').text('00:00:00')
	$('.mejs-duration-sub').text('00:00:00')
	stopIceTimer()
	state.playing.currentTime = 0
	state.playing.duration = 0
	chromeCastplaying = false;
	mediaCurrentTime = 0;
	mediaDuration = 0;
	mediaCurrentPct = 0;
	seekAsked = false;
	mediaCurrentTime = 0;
	transcoderEnabled = false;
	player.media.duration = 0
	state.media = {}
	state.playing.duration = 0
	state.playing.currentTime = 0
	state.playing.state = 'STOPPED'
	try {
		$('.mejs-captions-button').remove();
		$('.mejs-captions-layer').remove();
		$('#videoPlayer').empty();
		player.tracks = [];
	} catch(err) {}
	// restore curosr if player is fulscreen
	if(win.isFullscreen) {$('body').css({'cursor':'default'});}
	//clean ffmpeg process
	try {
		cleanffar();
		currentRes.end();
	} catch (err) {}
	// stop torrents
	try {
		if(torrentPlaying && !stopTorrent) {
			stopTorrent();
		}
	} catch (err) {}
	// stop external players
	if(extPlayerRunning) {
		try {
			if(os.platform == "win32") {
				var playerPath = path.basename(JSON.parse(settings.ht5Player).path);
			} else {
				var playerPath = JSON.parse(settings.ht5Player).path;
			}
			var pid = 0;
			psnode.lookup({command:''+playerPath+''},function(err,res){
				pid = res[0].pid;
				// kill the process
				extPlayerProc.kill();
				psnode.kill(pid, function( err ) {
					if (err); throw err;
					console.log( 'Process %s has been killed!', pid );
					extPlayerRunning = false;
				});
			});
		} catch(err){};
	}
	// reinit internal player
	player.pause();
	player.setSrc('');
	player.currentTime = 0;
	player.loaded.width(0);
	player.current.width(0);
	$('#infosPage').remove();
	$('.song-title').empty().append(_('Waiting...'));
	$(".mejs-overlay-loading").hide();
	$(".mejs-overlay-button").show();
	$(".mejs-overlay-play").show();
	// reinit mini Player
	clearInterval(timeUpdater);
	timeUpdater = null;
	$("#subPlayer-title").text(' '+_('Waiting...'));
	$('#subPlayer-play').show();
	$('#subPlayer-pause').hide();
	$('#subPlayer-Progress progress').val(0);
	$('.mejs-time-current').width(0)
	$('#progress-bar').val(0)
	//$('.mejs-duration,.mejs-currenttime').text('00:00:00')
	$('#subPlayer-img').attr('src','images/play-overlay.png');
	$('#fbxMsg,#fbxMsg2').remove();
}

function updateMiniPlayer() {

	if (upnpToggleOn) {
		if(!upnpLoading && (state.playing.state =="PLAYING" || state.playing.state =="BUFFERING")) {
			$('.mejs-overlay-button').hide();
			$('.mejs-overlay-loading').hide();
			$('.mejs-container p#fbxMsg').remove();
			$('#fbxMsg2').remove()
			$('.mejs-overlay-button,.mejs-overlay,.mejs-overlay-loading,.mejs-overlay-play').hide()
			$('.mejs-container').append('<p id="fbxMsg" style="height:300px !important;position: absolute;top: 50%;margin: 0 50%;margin-top:-150px;color: white;font-size: 30px;text-align: center;z-index: 10000;width: 450px;right: 50%;left: -225px;">'+_("Playing on your "+state.playing.location+" device !")+'</p>')
		}
	}

	if(currentMedia.title && $('#subPlayer-title').text() !== currentMedia.title) {
		$('#subPlayer-title').empty().append('<p>'+currentMedia.title+'</p>');
	}
	if(!currentMedia.cover || currentMedia.cover == "") {
		try {
			try {
				currentMedia.cover = $('.highlight img')[0].src;
			}catch(err) {
				try {
					currentMedia.cover = $('.list-row.well img')[0].src;
				} catch(err) {
				}
			}
		} catch(err) {
			currentMedia.cover = 'images/play-overlay.png'
		}
	}
	if (!player.media.paused && upnpToggleOn) {
		$('#subPlayer-img').attr('src',currentMedia.cover );
	} else {
		$('#subPlayer-img').attr('src','images/play-overlay.png');
	}
}

function startPlay(media) {
	if(upnpToggleOn && castStatusInterval == null){
		startStatusInterval()
	}
	player.addTrack(media)
}

function initPlay(media) {
	player.media.stop()
	if(transcoderEnabled && seekAsked) {
		currentMedia = media;
		cleanffar(true)
		seekAsked = false;
		return;
	}
	seekAsked = false
	player.playlistToggleClick();
	$('.mejs-playlist').hide();
	$('.mejs-playlist  > ul').hide();
	$('.mejs-playlist').css('opacity',0);
	try {
		clearInterval(iceCastTimer);
	} catch(err) {}
	stopIceTimer()
	ffmpegLive = false;
	transcoderEnabled = false;
	upnpTranscoding = false;
	if ($("#upnpTranscoding input").is(':checked')) {
    upnpTranscoding = true;
  } else {
    upnpTranscoding = false;
  }
	if(upnpMediaPlaying || playFromUpnp) {
		play_next = true;
	}
	if(currentMedia.link && !upnpToggleOn) {
		if (media.link && media.link.indexOf('videoplayback?id') !== -1 && !upnpToggleOn) {
			if(!currentMedia.ytId || currentMedia.ytId !== ytId) {
				initPlayer();
			} else {
				cleanffar();
			}
		} else {
			if (player.media.currentSrc.indexOf(currentMedia.link) !== -1) {
				cleanffar();
			} else {
				if(!player.media.paused) {
					initPlayer();
				}
			}
		}
	}
	if(extPlayerRunning) {
		try {
			var playerPath = path.basename(JSON.parse(settings.ht5Player).path);
			var pid = 0;
			console.log(playerPath)
			psnode.lookup({command:''+playerPath+''},function(err,res){
				pid = res[0].pid;
				// kill the process
				extPlayerProc.kill();
				psnode.kill(pid, function( err ) {
					if (err); throw err;
					console.log( 'Process %s has been killed!', pid );
					extPlayerRunning = false;
					setTimeout(function() {
						initPlay(media);
						extPlayerRunning = false;
					},1000);
					return;
				});
			});
		} catch(err){};
	}

	playFromFile = false;
	playFromHttp = false;
	torrentPlaying = false;
	playFromUpnp = false;
	playFromMega = false;
	playFromMegaUser = false;
	playFromTwitch = false;
	playFromDailymotionLive = false;
	playFromYoutube = false;
	var localLink = null;
	playYoutubeDash = false;
	playFromWat = false;
	playFromIcecast = false;
	try {
		next_vid = media.next;
		var link = media.link
		if(link.indexOf('http://'+ipaddress+':8887/?file') !== -1) {
			link = link.split('?file=')[1].replace('&tv','');
		} else {
			link = link.replace('&tv','');
		}
		link.replace(/chrome-extension:\/\/.*?\//,'file:\/\/')
		console.log("media avant currentMedia", media)
		var title = media.title;
		currentMedia = media;
		currentMedia.link = link.trim();

		// set title
		$('.song-title').empty().append(_('Playing: ') + decodeURIComponent(title));
		$('.mejs-overlay, .mejs-overlay-loading').show();
		$('.mejs-overlay-play').hide();
		// check type of link to play
		var linkType = link.split('&').pop();
		console.log("linkTYPE is:", linkType)
	 if (linkType === 'torrent') {
		 torrentPlaying = true;
		 currentMedia.link = link.replace('&torrent','');
		 scanSubTitles(execDir+'/subtitles');
		 //launchPlay();
		 // http(s) links
	 } else if (linkType === 'external') {
		 playFromHttp = true;
		 currentMedia.link = link.replace('&external','');
		 launchPlay();
		 // local files links
	 } else if (link.indexOf('file://') !== -1) {
		 playFromFile = true;
		 currentMedia.link = link;
		 scanSubTitles(link);
		 // play from upnp server
	 } else if (linkType === 'upnp' || upnpToggleOn) {
		 playFromUpnp = true;
		 currentMedia.link = link.replace('&upnp','');
		 launchPlay();
		 // else look for link already downloaded, if yes play it from hdd
	 } else if(linkType == "shoutcast") {
			stopIceTimer()
			iceCastLink = media.link.replace('/&shoutcast','');
			currentMedia.link = iceCastLink;
			console.log('in play link', iceCastLink)
			playFromIcecast = true;
			$('.song-title').empty().append(_('Playing: ') + decodeURIComponent(currentMedia.title));
			launchPlay()
			iceCastTimer = setInterval(function(){ iceTimer() }, 10000);
		} else if (linkType === 'twitch' || link.indexOf('twitch.tv') !== -1) {
			playFromTwitch = true;
			currentMedia.link = link.replace('&twitch','').replace('&external','');
			launchPlay();
		} else if (link.indexOf('wat.tv') !== -1) {
			playFromWat = true;
			currentMedia.link = link;
			launchPlay();
			// youtube dash
		} else if (link.indexOf('dailymotion.com') !== -1 && link.indexOf('&quality=') !== -1) {
			playFromDailymotionLive = true;
			currentMedia.link = link;
			launchPlay();
		} else if (link.indexOf('videoplayback?') !== -1 && !upnpToggleOn) {
			playFromYoutube = true;
			currentMedia.link = link;
			currentMedia.ytId = ytId;
			launchPlay();
		} else if (playFromFile == false) {
	 		 if(currentMedia.link.match('http://|https://') !== null) {
	 			 playFromHttp = true;
	 			 launchPlay();
	 			 return;
	 		 }
	 		 fs.readdir(download_dir, function(err, filenames) {
	 			 var i;
	 			 if (!filenames || filenames.length == 0 || err) {
	 				 launchPlay();
	 			 } else {
	 				 for (i = 0; i < filenames.length; i++) {
	 					 ftitle = filenames[i];
	 					 if ((title + '.mp4' === ftitle) || (title + '.webm' === ftitle) || (title + '.mp3' === ftitle)) {
	 						 currentMedia.link = 'file://' + encodeURI(download_dir + '/' + ftitle);
	 					 }
	 					 if (i+1 === filenames.length) {
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
	var obj = JSON.parse(settings.ht5Player);
	try {
		if((activeTab == 1 || activeTab == 2) && (search_engine=== 'dailymotion' || search_engine=== 'youtube' || engine.type == "video") && obj.name === "StreamStudio") {
			if(doNotSwitch) {
				doNotSwitch = false;
			} else {
				$('#playerToggle').click();
				$(".mejs-overlay-button").hide();
				$('.mejs-overlay-play').hide();
			}
		}
	} catch(err) {}
	$('#subPlayer-play').hide();
	$('#subPlayer-pause').show();

	// transcoding by default
	// && currentMedia.title.indexOf('.avi') !== -1
	var carray = ['.mp3','.mp4','.m4a','.opus','.wav','.flac','.mkv','.avi','.mpeg','.mpg','.ogg','.webm','.ogv','.aac'];
	var aArray = ['.wma'];
	//['.mp3','.opus','.wav','.flac','.m4a','.wma','.aac'];
	var needTranscoding = ['hls','m3u8','manifest']
	var engineWithoutTranscoding = ['mp3stream']
	var engineWithTranscoding = ['shoutcast','twitch']
	var engineWithFFmpegCheck = ['torrent9','t411','torrent-project']
	var needFFmpegCheck = false;
	transcodeAudioOnly = false;
	transcodeVideoOnly = false;

	if(engine) {
		engine_name = engine.engine_name.toLowerCase();
	} else {
		engine_name = ""
	}

	// set transcoding if needed
	if(settings.transcoding || forceTranscoding) { // by default if forced in settings
		transcoderEnabled = true
	} else if(playFromYoutube) { // youtube
		if(!upnpToggleOn && obj.name == 'StreamStudio' && videoResolution !== '720p' && videoResolution !== '360p') {
			transcoderEnabled = true;
		} else if(upnpTranscoding) { //force transcoding when upnp transcoding checked
			upnpLoading = true;
			if(mediaRendererType == "chromecast") {
				currentMedia.type = currentMedia.mime || 'video/mp4'
			}
		}
	} else if(!upnpToggleOn && engine && obj.name == 'StreamStudio' && !playFromFile && engineWithoutTranscoding.indexOf(engine_name) == -1 && engineWithTranscoding.indexOf(engine_name) !== -1) {
		transcoderEnabled = true;
		// force by extension
	} else if(!upnpToggleOn && obj.name == 'StreamStudio' && path.extname(currentMedia.title) !== "" && (carray.indexOf(path.extname(currentMedia.title)) == -1 || needTranscoding.indexOf(currentMedia.link) !== -1 )) {
		transcoderEnabled = true;
	} else {
		transcoderEnabled = false;
	}

	// check avi et dts on engines with possibles avi
	if((engine || torrentPlaying) && obj.name == 'StreamStudio' && (engineWithFFmpegCheck.indexOf(engine_name) !== -1 || path.extname(currentMedia.title.toLowerCase()) == ".avi" || currentMedia.title.toLowerCase().indexOf('dts') !== -1)) {
		console.log('CHECK FFMPEG FORMAT')
		needFFmpegCheck = true;
	}

	//final check
	if((transcoderEnabled || upnpTranscoding) && currentMedia.link.indexOf('http://'+ipaddress+':8887/?file=') == -1) {
		var link = 'http://'+ipaddress+':8887/?file='+currentMedia.link.trim()
		currentMedia.link = link;
	}
	console.log("VIDEORESOLUTION " + videoResolution)

	// reinit forcetranscoding
	forceTranscoding = false;
	// then start on target device local/dlna ... or external
	if(upnpToggleOn) {
		if(mediaRendererType == "upnp") {
			currentMedia.data = JSON.stringify({"protocolInfo" : "http-get:*"});
		} else {
			currentMedia.seek = 0;
			currentMedia.subtitles = []
			currentMedia.autoSubtitles = false;
		}
		if(currentMedia.type === undefined) {
			try {
				if (mime.lookup(currentMedia.title).indexOf('audio/') !== -1 || mime.lookup(currentMedia.link).indexOf('audio/') !== -1) {
					//currentMedia.type = "audio";
					currentMedia.type = mime.lookup(currentMedia.title) || "audio/mp3"
				} else if (mime.lookup(currentMedia.title).indexOf('video/') !== -1 || mime.lookup(currentMedia.link).indexOf('video/') !== -1) {
					//currentMedia.type = "video";
					currentMedia.type = mime.lookup(currentMedia.title) || "video/mp4"
				}
			} catch(err) {
				currentMedia.type = "video/mp4";
			}
		}
		console.log('avant lecture upnp', currentMedia)
		upnpTransitionning =  true;
		upnpLoading = true
		state.playing.location=mediaRendererType

		// enable audio visualisation for shoutcast thru upnp
		if(upnpToggleOn && currentMedia.link.indexOf('http://'+ipaddress+':8887/?file=') == -1 && engine_name && engine_name == "shoutcast") {
			upnpTranscoding = true
			var link = 'http://'+ipaddress+':8887/?file='+currentMedia.link.trim()
			currentMedia.link = link;
		}

		if(state.playing.state !== "STOPPED") {
			if(castStatusInterval) {
				upnpStoppedAsked = true
				upnpTransitionning = true;
			} else {
				setTimeout(function() {
					mediaRenderer.play(currentMedia.link,currentMedia,function(cb) {

					})
				},1000)
			}
		} else {
			mediaRenderer.play(currentMedia.link,currentMedia,function(cb) {

			})
		}
		setTimeout(function() {
			console.log("CHECK STATUSINTERVAL", castStatusInterval)
			if(!castStatusInterval) {
				startStatusInterval()
			}
		},2000)
		try {
			$('#items_container').scrollTop($('#items_container').scrollTop() + ('#items_container .well').position().top);
		} catch(err) {}
	} else {
		var link = currentMedia.link;
		if(obj.name === 'StreamStudio') {
			if(needFFmpegCheck) {
				checkFFmpegFormat();
			} else {
				player.setSrc(currentMedia.link);
				player.play();
				if(player.tracks.length > 0) {
					$('input[value="'+_("Track").toLowerCase()+'1"]').attr('checked',true);
					player.setTrack(''+_("Track").toLowerCase()+'1');
				}
			}
		} else {
			startExtPlayer(obj);
		}
		try {
			$('#items_container').scrollTop($('#items_container').scrollTop() + ('#items_container .well').position().top);
		} catch(err) {}
	}
}

function checkFFmpegFormat() {
	// check if stream is XVID with Advances Simple Profile or has DTS audio, if yes enable transcoder
	// if(currentMedia.link.indexOf('8887') == -1) {
	//   currentMedia.link = currentMedia.link.match(/(.*?):\d{1,5}/)[0]
  // }
	var args = ['-i',""+currentMedia.link+"",'-analyzeduration','2147483647','-probesize', '2147483647'];
	var ffmpegCheck = spawn(ffmpegPath, args);
	var total_data = '';
	ffmpegCheck.stderr.on('data', function(data) {
		if(data) {
			total_data += data.toString();
		}
	});

	ffmpegCheck.stdout.on('data', function(data) {
		if(data) {
			total_data += data.toString();
		}
	});

	ffmpegCheck.on('exit',function(code) {
		console.log('FFMPEG FORMAT EXIT')
		var data = total_data.replace(/[\(\)]/g,'').replace(/(\r\n|\r|\n)/g,' ').toLowerCase()
		console.log(data)
		if(data.match(/mpeg4 advanced simple profile xvid/) !== null) {
			transcoderEnabled = true;
			transcodeVideoOnly = true;
		}
		if(data.match(/dts/) !== null) {
			transcoderEnabled = true;
			transcodeAudioOnly = true;
		}

		if(transcoderEnabled && currentMedia.link.indexOf('http://'+ipaddress+':8887/?file=') == -1) {
			var link = 'http://'+ipaddress+':8887/?file='+currentMedia.link.trim()
			currentMedia.link = link;
		}

		player.setSrc(currentMedia.link);
		player.play();
		if(player.tracks.length > 0) {
			$('input[value="'+_("Track").toLowerCase()+'1"]').attr('checked',true);
			player.setTrack(''+_("Track").toLowerCase()+'1');
		}
	})
}

function startExtPlayer(obj) {
	var link = decodeURIComponent(currentMedia.link).trim();
	var cpath = obj.path;
	if(process.platform === 'win32' && playFromFile) {
		link = link.replace(/\/\//g, '\\\\');
	}
	extPlayerProc = cp.exec('"'+cpath+'"'+' '+'"'+link+'"',{maxBuffer: 1024*1024*1024},function (error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
			extPlayerRunning = false;
		}
	});

	extPlayerRunning = true;
	extPlayerProc.on('exit',function() {
		console.log(obj.name + ' process terminated....');
		initPlayer();
		extPlayerRunning = false;
	});

}

var __ = require('underscore')

function startVideo(vid_id, title) {
	if ($('#' + vid_id + ' a.video_link').length === 0) {
		return;
	}
	videoResolution = '';
	var arr = $('#' + vid_id + ' a.video_link').get()
	var c = __.sortBy(arr, function(i) {
		return parseInt($(i).attr('alt').replace('p',''));
	});
	var childs = c.reverse();
	var found = false;
	if (childs.length > 1) {
		__.each(childs,function(child) {
			var res = $(child).attr('alt');
			console.log(res)
			if (res == settings.resolution) {
				videoResolution = res;
				found = true;
				child.click();
			}
		});
		if (!found) {
			videoResolution = $(childs[0]).attr('alt');
			childs[0].click();
		}
	} else {
		videoResolution = $(childs[0]).attr('alt');
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
	console.log('in getnext')
	initPlayer()
	if(fromPlayList && !playFromSeries) {
		player.playNextTrack()
		return;
	}
	if (activeTab == 1) {
		try {
			engine.play_next();
		} catch(err) {
			if(playlistMode == "continue" && search_engine == 'youtube' || search_engine == 'dailymotion') {
				try {
					$('.highlight').closest('.youtube_item').next().find('.coverPlayImg').click()
				} catch (err) {
					playNextVideo(next_vid);
				}
			} else {
				try {
					$('.highlight').closest('li').next().find('.coverPlayImg').click()
				} catch (err) {}
			}
		}
	} else {
		if($('.highlight').is('tr')) {
			try {
				$('.highlight').next().find("a").click();
			} catch(err) {
				console.log("no more torrents to play...");
				upnpStoppedAsked = false;
				upnpTransitionning = false;
				initPlayer();
			}
		} else {
			try {
				// have next node ?
				if($('.jstree-clicked').closest('li').next('li').length > 0) {
					// we have another node, check if we have a folder or media
					if($('.jstree-clicked').closest('li').next('li').attr('id').indexOf('SubNode') == -1) {
						// media file, play it...
						$('.jstree-clicked').closest('li').next('li').find('a').click();
					} else {
						// have a dir, open it
						$('.jstree-clicked').closest('li').next('li').find('a').click();
						setTimeout(function(){
							getNext();
						},2000);
					}
				} else {
					//check if we are in a sub node
					while($('.jstree-clicked').closest('ul').parent().attr('id').indexOf('SubNode') !== -1){
						if($('.jstree-clicked').closest('ul').parent().closest('li').next('li').length > 0) {
							$('.jstree-clicked').closest('ul').parent().closest('li').next('li').find('a').first().click();
							setTimeout(function(){
								getNext();
							},2000);
							break;
						} else {
							upnpStoppedAsked = false;
							upnpTransitionning = false;
							console.log("no more videos to play in the playlists");
							initPlayer()
							break;
						}
					}
				}
			} catch(err) {}
		}
	}
}

function getPrev() {
	initPlayer();
	if(fromPlayList) {
		player.playNextTrack()
		return;
	}
	if (activeTab == 1) {
		if(search_engine == 'youtube' || search_engine == 'dailymotion') {
			$('.highlight').closest('.youtube_item').prev().find('.coverPlayImg').click()
		} else {
			try {
				$('.highlight').closest('li').prev().find('.coverPlayImg').click()
			} catch (err) {}
		}
	} else {
		try {
			// have next node ?
			if($('.jstree-clicked').closest('li').prev('li').length > 0) {
				// we have another node, check if we have a folder or media
				if($('.jstree-clicked').closest('li').prev('li').attr('id').indexOf('SubNode') == -1) {
					// media file, play it...
					$('.jstree-clicked').closest('li').prev('li').find('a').click();
				} else {
					// have a dir, open it
					$('.jstree-clicked').closest('li').prev('li').find('a').click();
					setTimeout(function(){
						getprev();
					},2000);
				}
			} else {
				//check if we are in a sub node
				while($('.jstree-clicked').closest('ul').parent().attr('id').indexOf('SubNode') !== -1){
					if($('.jstree-clicked').closest('ul').parent().closest('li').prev('li').length > 0) {
						$('.jstree-clicked').closest('ul').parent().closest('li').prev('li').find('a').first().click();
						setTimeout(function(){
							getprev();
						},2000);
						break;
					} else {
						console.log("no more videos to play in the playlists");
						upnpStoppedAsked = false;
						upnpTransitionning = false;
						initPlayer()
						$('#closePlayer').click();
						break;
					}
				}
			}
		} catch(err) {}
	}
}

var upnpTransitionning = false;

function on_media_finished(){
	console.log('in on media finished')
	if(upnpToggleOn) {
		clearInterval(castStatusInterval)
		castStatusInterval = null;
		if(playlistMode== "normal") {
			upnpStoppedAsked = true
			upnpTransitionning = false;
			$('#closePlayer').click();
			clearInterval(castStatusInterval)
			castStatusInterval = null;
			initPlayer()
			return;
		}
	}

	if(win.isFullscreen) {$('body').css({'cursor':'default'});}
	if (playlistMode === 'normal') {
		initPlayer();
		$('.mejs-stop button').click()
	} else if (playlistMode === 'loop') {
		if(upnpToggleOn && !upnpTransitionning) {
			initPlay(currentMedia);
		} else {
			if(!upnpToggleOn){
				initPlay(currentMedia);
			}
		}
	} else if (playlistMode === 'shuffle') {

	} else if (playlistMode === 'continue' && !fromPlayList) {
		getNext();
	} else {
		seekAsked = false;
		if(upnpToggleOn && player.playlistTracks.length !== 0 && !upnpTransitionning || fromPlayList && player.playlistTracks.length !== 0) {
			player.playNextTrack()
		}
	}
}

function updateProgressBar() {
	var progressBar = document.getElementById('progress-bar');
	if(upnpToggleOn){
		duree = state.playing.duration;
		player.media.duration = state.playing.duration
		mediaDuration = mediaDuration == 0 ? state.playing.duration : mediaDuration
		try {
			var percentage = ((100 / duree) * (state.playing.currentTime));
			progressBar.value = percentage;
			$('.mejs-duration, .mejs-duration-sub').text(mejs.Utility.secondsToTimeCode(duree))
			var total = $('.mejs-time-total').width()
			var newWidth = Math.round($('.mejs-time-total').width() * (state.playing.currentTime) / duree)
			if(total > newWidth) {
				$('.mejs-time-current').width(Math.round($('.mejs-time-total').width() * (state.playing.currentTime) / duree)+'px');
			}
		  $('.mejs-currenttime, .mejs-currenttime-sub').text(mejs.Utility.secondsToTimeCode(state.playing.currentTime))
			$('#subPlayer-img').attr('src',currentMedia.cover);
			if(upnpTranscoding && percentage == 0) {
				$('.mejs-currenttime, .mejs-currenttime-sub').text('Live')
			}
		} catch(err) { console.log(err)}
	} else {
		var duree = (player.media.duration == Infinity || isNaN(player.media.duration)) ? mediaDuration : player.media.duration;
		var current = player.media.currentTime;
		try {
			if(transcoderEnabled) {
				var percentage = ((100 / duree) * (current+mediaCurrentTime));
				//$('.mejs-currenttime').text(mejs.Utility.secondsToTimeCode(current+mediaCurrentTime))
			} else {
				var percentage = ((100 / duree) * current);
				//$('.mejs-currenttime').text(mejs.Utility.secondsToTimeCode(current))
			}
			progressBar.value = percentage;
		} catch(err) {
		}
	}
}

function getIcecastTitle() {
	if(ffar.length > 1) {
		ffar.pop()
	}
	var args = ['-i',iceCastLink,'-f', 'ffmetadata', '-threads','0',  'pipe:1'];
	var ffmpeg = spawn(ffmpegPath, args);
	ffar.push(ffmpeg);
	var total_data = '';
	ffmpeg.stderr.on('data', function(data) {
		if(data) {
			total_data += data.toString();
		}
	});

	ffmpeg.on('exit', function (code) {
		if(engine && engine.engine_name == "Shoutcast") {
			console.log(total_data)
			if(total_data.toString().match(/StreamTitle(.*?):(.*)/) !== null) {
				currentMedia.title = total_data.toString().match(/StreamTitle(.*?):(.*)/)[2];
				iceCastStation = total_data.toString().match(/icy-name(.*?):(.*)/)[2];
			} else if (total_data.toString().match(/TITLE(.*?):(.*)/) !== null) {
				currentMedia.title = total_data.toString().match(/TITLE(.*?):(.*)/)[2];
				iceCastStation = total_data.toString().match(/icy-name(.*?):(.*)/)[2];
			} else if (total_data.toString().match(/icy-name(.*?):(.*)/) !== null) {
				currentMedia.title = '';
				iceCastStation = total_data.toString().match(/icy-name(.*?):(.*)/)[2];
			} else {
				currentMedia.title = _("Unknown station")
				iceCastStation = _("Unknown station")
			}
			currentMedia.title = currentMedia.title.replace(/\s+/,'') == '' ? iceCastStation : currentMedia.title;
			$('.song-title').empty().append(_('Playing: ') + decodeURIComponent(currentMedia.title));
		}
	});
}


function iceTimer() {
	getIcecastTitle()
}

function stopIceTimer() {
	clearInterval(iceCastTimer);
	cleanffar()
}


var download = function(url, dest, cb) {
	console.log('DOWNLOADING: ' + url + ' to ' + dest )
	var file = fs.createWriteStream(dest);
	request
	.get(url)
	.on('response', function(response) {
		console.log(response.statusCode) // 200
		console.log(response.headers['content-type']) // 'image/png'
	})
	.pipe(file)
};
