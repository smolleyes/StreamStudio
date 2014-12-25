var mediaDuration;
var stArr = [];

function startHt5Server() {
	ht5Server = http.createServer(function(req, res) {
		if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
			startStreaming(req, res)
		}
	}).listen(8888);
	console.log('StreamStudio Server ready on port 8888');
}

function startProxyServer() {
	proxyServer = http.createServer(function(req, resp) {
		if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
			var url = req.url.split('?link=')[1];
			var jqxhr = $.get(url, function(data) {
			})
			.done(function(data) {
				if(typeof(data) === 'object'){
					resp.writeHead(200,{'Content-type': 'application/json;charset=utf-8','Access-Control-Allow-Origin' : '*','transferMode.dlna.org': 'Streaming','contentFeatures.dlna.org':'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000'});
					resp.end(JSON.stringify(data));
				} else {
					resp.writeHead(200,{'Content-type': 'text/html;charset=utf-8','Access-Control-Allow-Origin' : '*','transferMode.dlna.org': 'Streaming','contentFeatures.dlna.org':'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000'});
					resp.end(data);
				}
			})
			.fail(function(err) {
				console.log(err)
				resp.writeHead(200,{'Content-type': 'text/html;charset=utf-8','Access-Control-Allow-Origin' : '*','transferMode.dlna.org': 'Streaming','contentFeatures.dlna.org':'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000'});
				resp.end(err);
			});
		}
	}).listen(8081);
}

function startStreaming(req, res, width, height) {
    try {
        var baseLink = url.parse(req.url).href;
        var megaKey;
        var link;
        var megaSize;
        var mediaExt = currentMedia.title.split('.').slice(-1)[0];
        var parsedLink = url.parse(req.url).href.replace(/&amp;/g,'&');
        var device = deviceType(req.headers['user-agent']);
		$('.mejs-overlay, .mejs-overlay-loading').show();
		$('.mejs-overlay-play').hide();
		res.writeHead(200, { // NOTE: a partial http response
			// 'Date':date.toUTCString(),
			'Connection': 'closed',
			'Content-Type': 'video/mp4',
			'Server':'CustomStreamer/0.0.1',
			'transferMode.dlna.org': 'Streaming',
			'contentFeatures.dlna.org':'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000'
		});
		res.setTimeout(10000000)
		currentRes = res;
        var linkParams = parsedLink.split('&');
        var bitrate = 300;
        var time = 0;
        var swidth;
        var sheight;
        try {
            swidth = linkParams.slice(-1)[0].replace('screen=', "").split('x')[0];
            sheight = linkParams.slice(-1)[0].replace('screen=', "").split('x')[1];
        } catch (err) {
            swidth = 640;
            sheight = 480;
        }
        if ((swidth === undefined) || (sheight === undefined)) {
            swidth = 640;
            sheight = 480;
        }
        var link = parsedLink.split('?file=')[1];
		
        if (parsedLink.indexOf('&key') !== -1) {
            megaKey = linkParams[1].replace('key=', '');
        }
        if (parsedLink.indexOf('&start') !== -1) {
            try {
                time = parsedLink.match(/&start=(.*?)&/)[1];
                link = link.replace(/&start=.*/,'')
            } catch (err) {
                time = parsedLink.match(/&start=(.*)/)[1];
                link = link.replace(/&start=.*/,'')
            }
        }
        
        if (parsedLink.indexOf('&size') !== -1) {
            try {
                megaSize = parsedLink.match(/&size=(.*?)&/)[1];
            } catch (err) {
                megaSize = parsedLink.match(/&size=(.*)/)[1];
            }
        }
        if (parsedLink.indexOf('&bitrate') !== -1) {
            try {
                bitrate = parsedLink.match(/&bitrate=(.*?)&/)[1];
            } catch (err) {
                bitrate = parsedLink.match(/&bitrate=(.*)/)[1];
            }
        }
        var megaName = $('#song-title').text().replace(_('Playing: '), '');
        var megaType = megaName.split('.').pop().toLowerCase();
        var x = null;
        
        if(playFromTwitch) {
				console.log('play twitch stream')
				var l = parsedLink.replace('/?file=','');
				var link, quality;
				if(l.indexOf('&quality') !== -1) {
					quality = link.split('&quality=')[1];
					link = link.split('&')[0]
				} else {
					quality = "best";
				}
				console.log('Starting twitch streaming '+ link + " with quality " + quality);
				var st = spawn(livestreamerPath, ['-O',link, quality]);
				var ffmpeg = spawnFfmpeg('', device, 'truc', bitrate, 0, function(code) { // exit
                            console.log('child process exited with code ' + code);
                            res.end();
                        });
                st.stdout.pipe(ffmpeg.stdin);
                stArr.push(st);
				ffmpeg.stdout.pipe(res);
				st.stderr.on('data', function(data) {
					console.log('grep stderr: ' + data);
					if(data.toString().match(/Failed to open segment/) !== null) {
						$("#homeToggle").click();
						$.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:0,content:_("Bandwith problem please try a lower quality !"),btnId:'ok',btnTitle:_('Ok'),btnColor:'black',btnDisplay: 'block',updateDisplay:'none'})
						initPlayer();
					} else if(data.toString().match(/No streams found on this URL/) !== null || data.toString().match(/requires a subscription/) !== null) {
						$("#homeToggle").click();
						$.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:0,content:_("No streams available for this channel !"),btnId:'ok',btnTitle:_('Ok'),btnColor:'black',btnDisplay: 'block',updateDisplay:'none'})
					} else if(data.toString().match(/Unable to open URL/) !== null) {
						$("#homeToggle").click();
						$.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:0,content:_("Can't open this url, please retry !"),btnId:'ok',btnTitle:_('Ok'),btnColor:'black',btnDisplay: 'block',updateDisplay:'none'})
					}
				});
		}
		// play youtube dash
		if(playFromYoutube && !upnpToggleOn) {
			console.log('Opening youtube link ' + link)
			if(mediaDuration == 0) {
				checkDuration(link, device, '', bitrate,res,time);
			} else {
				var ffmpeg = spawnFfmpeg(link, device, '', bitrate,time, function(code) { // exit
                     console.log('child process exited with code ' + code);
                     //res.end();
                });
                ffmpeg.stdout.pipe(res);
			}
		}
        //if tv/upnp
        if(playFromUpnp){
			console.log('opening upnp link ' + link) 
			if(parsedLink.indexOf('freeboxtv') !== -1) {
				link = parsedLink.replace('/?file=','');
				currentMedia.link = link;
			}
			checkDuration(link, device, '', bitrate,res,time);
		}
		// external link
		if(playFromHttp){
			console.log('Opening external link ' + link)
			checkDuration(link, device, '', bitrate,res,time);
		}
        // torrent link
        if (torrentPlaying) {
			console.log('Opening torrent link')
            checkDuration(link, device, '', bitrate,res,time);
        }
        // if local file
        if (playFromFile) {
			console.log('Opening file link')
			checkDuration(link, device, '', bitrate,res,time);
        }
        //if mega userstorage link
        if (link.indexOf('userstorage.mega.co.nz') !== -1) {
			console.log('Opening userstorage.mega.co.nz link')
            var newVar = currentMedia.title.split('.').slice(-1)[0];
            if ((in_array(newVar, videoArray)) && (parsedLink.indexOf('&download') === -1)) {
                if (transcoderEnabled) {
                    var ffmpeg = spawnFfmpeg('', device, host, bitrate, function(code) { // exit
                        console.log('child process exited with code ' + code);
                        res.end();
                    });
                    megaDownload = downloadFromMega(decodeURIComponent(link), megaKey, megaSize).pipe(ffmpeg.stdin);
                    megaDownload.on('error', function(err) {
                        console.log('ffmpeg stdin error...' + err);
                        if (err.stack.indexOf('codec') === -1) {
                            console.log("Arret demandé !!!");
                            res.end();
                        } else {
                            var f = {};
                            f.link = 'http://' + ipaddress + ':8888' + req.url + '&direct';
                            f.title = megaName;
                            res.end();
                            startPlay(f);
                        }
                    });
                    ffmpeg.stdout.pipe(res);
                } else {
                    console.log('playing movie without transcoding');
                    downloadFromMega(decodeURIComponent(link), megaKey).pipe(res);
                }
            } else {
                console.log('fichier non video/audio ou téléchargement demandé... type:' + megaType);
                downloadFileFromMega(megaName, decodeURIComponent(link), megaKey, true, megaSize, '');
            }
            //normal mega link
        } else if (parsedLink.indexOf('mega.co') !== -1) {
            console.log("opening mega.co file: " + link);
            var file = mega.file(decodeURIComponent(link)).loadAttributes(function(err, file) {
				if (err) { console.log(err)}
                try {
                    megaSize = file.size;
                    megaName = file.name.replace(/ /g, '_');
                    megaType = megaName.split('.').pop().toLowerCase();
                } catch (err) {
                    $.notif({
                        title: 'StreamStudio:',
                        cls: 'red',
                        icon: '&#59256;',
                        timeout: 5000,
                        content: _("File not available on mega.co..."),
                        btnId: '',
                        btnTitle: '',
                        btnColor: '',
                        btnDisplay: 'none',
                        updateDisplay: 'none'
                    });
                    var url = $('.highlight .open_in_browser').attr("href");
                    var reportLink = $('.highlight #reportLink').attr("href");
                    var name = $($('.highlight b')[0]).text();
                    engine.sendMail(name, url, reportLink);
                    res.end();
                    initPlayer();
                    return;
                }
                if ((in_array(megaType, videoArray)) && (parsedLink.indexOf('&download') === -1)) {
                    $('#song-title').empty().html(_('Playing: ') + megaName);
                    if (transcoderEnabled) {
                        console.log('playing movie with transcoding');
                        var ffmpeg = spawnFfmpeg('', device, host, bitrate, function(code) { // exit
                            console.log('child process exited with code ' + code);
                            //res.end();
                        });
                        	
                        megaDownload = file.download().pipe(res);
						megaDownload.on('error', function(err) {
							console.log('ffmpeg stdin error...' + err);
							if (err.stack.indexOf('codec') === -1) {
								console.log("Arret demandé !!!!!!!!!!!!!!!!!!!!!!!!!!!!", megaName);
								//res.end();
							} else {
								var f = {};
								f.link = 'http://' + ipaddress + ':8888' + req.url + '&direct';
								f.title = megaName;
								res.end();
								startPlay(f);
							}
						});
						ffmpeg.stdout.pipe(res);
						
                    } else {
                        console.log('playing movie without transcoding');
                        file.download().pipe(res);
                    }
                } else {
                    console.log('fichier non video/audio ou téléchargement demandé...' + megaType);
                    downloadFileFromMega(megaName, '', '', false, megaSize, file);
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
    res.on("close", function() {
		currentRes= null;
		console.log('request end!!!!!!!!!!!!!!!!')
        ffar[0].kill('SIGKILL');
        stArr[0].kill('SIGKILL');
    });
}

function checkDuration(link, device, host, bitrate,res,seekTo) {
	var olink = '';
	if(playFromYoutube) {
		olink = link;
		var link = link.split('::')[0];
	}
	
	var p;
	if (process.platform === 'win32') {
		p = spawn(execDir+'/ffprobe.exe',[''+decodeURIComponent(link)+'', '-show_format','-v', 'quiet']); 
	} else {
		p = spawn(execDir+'/ffprobe',[''+decodeURIComponent(link)+'', '-show_format','-v', 'quiet']);
	}
	p.stdout.on('data',function(data){
		if(data.toString().indexOf('duration=') !== -1) {
			var rep = data.toString().match(/duration=(.*)/)[1];
			if(rep.indexOf('N/A') !== -1) {
				mediaDuration = 0;
			} else {
				mediaDuration = parseFloat(rep);
			}
		}
	}); 
    p.on('exit',function(code){
		if(code === 0 && mediaDuration !== 0) {
			console.log(mediaDuration + " " + secondstotime(mediaDuration))
			if(playFromYoutube) {
				var ffmpeg = spawnFfmpeg(olink, device, '', bitrate,seekTo, function(code) { // exit
						console.log('child process exited with code ' + code);
						//res.end();
				});
			} else {
				var ffmpeg = spawnFfmpeg(link, device, '', bitrate,seekTo, function(code) { // exit
						console.log('child process exited with code ' + code);
						//res.end();
				});
			}
			ffmpeg.stdout.pipe(res);
		} else {
			var ffmpeg = spawnFfmpeg(link, device, '', bitrate,seekTo, function(code) { // exit
					console.log('child process exited with code ' + code);
					//res.end();
			});
			ffmpeg.stdout.pipe(res);
		}
	});
}


function spawnFfmpeg(link, device, host, bitrate,seekTo) {
	console.log(link)
	var start = '00:00:00.00'
	if(seekTo !== 0) {
		start = seekTo;
	}
	if (host === undefined || link !== '') {
		//local file...
		if(!playFromYoutube && link.indexOf('videoplayback?id') == -1) {
			args = ['-ss' , start,'-i', ''+decodeURIComponent(link)+'', '-copyts','-sn','-preset', 'ultrafast','-c:v', 'libx264', '-c:a', 'libvorbis','-threads', '0','-f', 'matroska','pipe:1'];
		} else {
			//console.log(link)
			var vlink = link.split('::')[0];
			var alink = link.split('::')[1].trim().replace('%20','');
			args = ['-ss' , start, '-i', vlink, '-ss', start, '-i', alink, '-copyts','-preset', 'ultrafast', '-deinterlace','-c:v', 'copy','-c:a', 'copy', '-threads', '0','-f','matroska', 'pipe:1'];
		}
	} else {
		args = ['-re','-i', 'pipe:0', '-sn', '-c:v', 'libx264', '-preset', 'ultrafast', '-deinterlace', '-c:a', 'libvorbis', '-threads', '0','-f', 'matroska', 'pipe:1'];
	}
	if (process.platform === 'win32') {
		ffmpeg = spawn(ffmpegPath, args);
	} else {
		ffmpeg = spawn(ffmpegPath, args);
	}
	ffar.push(ffmpeg);
	
	try {
		img = $('.highlight img')[0].src;
		if (img !== $('#subPlayer-img').attr('src') && img !== null) {
			$('#subPlayer-img').attr('src',img);
		} else {
			$('#subPlayer-img').attr('src','images/play-overlay.png');
		}
	} catch(err) {
		$('#subPlayer-img').attr('src','images/play-overlay.png');
	}
	
	console.log('Spawning ffmpeg ' + args.join(' '));
	var total_time = 0,
		total_data = '';
		
	ffmpeg.stderr.on('data', function(data) {
		if(data) {
			total_data += data.toString();
			if (total_data.toString().match(/Duration:\s\d\d:\d\d:\d\d\.\d\d/)) {
				var time = total_data.toString().match(/Duration:\s(\d\d:\d\d:\d\d\.\d\d)/).toString().substring(10,21);
				var seconds = parseInt(time.substr(0,2))*3600 + parseInt(time.substr(3,2))*60 + parseInt(time.substr(6,2));
				total_data = '';
				total_time = seconds;
			}
			console.log('grep stderr: ' + data);
			
			if (data.toString().substr(0,5) == 'frame') {
				var time = data.toString().match(/time=(\d\d:\d\d:\d\d\.\d\d)/)[1];
				var seconds = parseInt(time.substr(0,2))*3600 + parseInt(time.substr(3,2))*60 + parseInt(time.substr(6,2));
			    var pct = (seconds / total_time) * 100;
				$('.mejs-time-loaded').css('width', pct+'%').show();
				if(pct == 100) {
					return;
				}
			}
			
		}
	});

	return ffmpeg;
}

function cleanffar() {
    $.each(ffar, function(index, ff) {
        try {
            ff.kill("SIGKILL");
        } catch (err) {}
        if (index + 1 === ffar.length) {
            ffar = [];
        }
    });
    $.each(stArr, function(index, ff) {
        try {
            ff.kill("SIGKILL");
        } catch (err) {}
        if (index + 1 === stArr.length) {
            stArr = [];
        }
    });
}

// start
startHt5Server();
startProxyServer();
