var ht5Server;

function startHt5Server() {
    try {
        ht5Server.close();
    } catch (err) {
        ht5Server = http.createServer(function(req, res) {
            if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
                getMetadata(req, res)
            }
        }).listen(8888);
        console.log('Ht5Server ready on port 8888');
    }
}

proxyServer = http.createServer(function(req, resp) {
	if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
		var url = req.url.split('?link=')[1];
		var jqxhr = $.get(url, function(data) {
		})
		.done(function(data) {
			if(typeof(data) === 'object'){
				resp.writeHead(200,{'Content-type': 'application/json;charset=utf-8','Access-Control-Allow-Origin' : '*'});
				resp.end(JSON.stringify(data));
			} else {
				resp.writeHead(200,{'Content-type': 'text/html;charset=utf-8','Access-Control-Allow-Origin' : '*'});
				resp.end(data);
			}
		})
		.fail(function(err) {
			console.log(err)
			resp.writeHead(200,{'Content-type': 'text/html;charset=utf-8','Access-Control-Allow-Origin' : '*'});
			resp.end(err);
		});
	}
}).listen(8081);


function getMetadata(req, res) {
    var ffprobe;
    var link;
    var bitrate = '';
    var resolution = '';
    var duration = 'NaN';
    var parsedLink = decodeURIComponent(url.parse(req.url).href);
    link = parsedLink.split('/?file=')[1];
    //var args = ['-show_streams','-print_format','json',link];
    var args = [link];
    var error = false;
    if (process.platform === 'win32') {
        ffprobe = spawn(exec_path + '/ffprobe.exe', args);
    } else {
        ffprobe = spawn(exec_path + '/ffprobe', args);
    }
    ffprobe.stderr.on('data', function(data) {
        var infos = data.toString().trim().replace(/(\r\n|\n|\r)/gm," ");
        if (infos.indexOf('453 Not Enough Bandwidth') !== -1) {
            res.writeHead(400, {
                "Content-Type": "text/html"
            });
            res.write("Pas assez de débit");
            res.end();
            error = true;
        }
		if (resolution === '') {
			try {
				var vinfos = infos.match(/Video:(.*)/)[1];
				resolution = vinfos.toLowerCase().match(/\d{3}(?:\d*)?x\d{3}(?:\d*)/)[0];
			} catch (err) {}
		}
		if (duration === 'NaN') {
			try {
				duration = infos.match(/Duration: (.*?),/)[1];
			} catch (err) {}
		}
    });

    ffprobe.on('exit', function(data) {
        //if (error) {
            //return;
        //}
        console.log('[DEBUG] ffprobe exited...' + bitrate + ' ' + resolution + ' ' + duration );
        var width = 640;
        var height = 480;
        width = parseInt(resolution.split("x")[0]);
        height = parseInt(resolution.split("x")[1]);
        startStreaming(req, res, width, height, duration)
    });
}

function startStreaming(req, res, width, height,duration) {
    try {
		currentRes = res;
        var baseLink = url.parse(req.url).href;
        var megaKey;
        var link;
        var megaSize;
        var mediaExt = currentMedia.title.split('.').slice(-1)[0];
        var parsedLink = url.parse(req.url).href.replace(/&amp;/g,'&');
        var device = deviceType(req.headers['user-agent']);
		console.log('startstreaming parsedlink: ' + parsedLink)
		res.writeHead(200, { // NOTE: a partial http response
			// 'Date':date.toUTCString(),
			'Connection': 'keep-alive',
			'Content-Type': 'video/x-matroska',
			'Server':'CustomStreamer/0.0.1',
			'transferMode.dlna.org': 'Streaming',
			'contentFeatures.dlna.org':'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000'
		});

        var linkParams = parsedLink.split('&');
        var bitrate = 300;
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
        host = req.headers['host'];
        console.log("QUALITE TV: " + bitrate);
        var x = null;
        //if tv/upnp
        if(playFromUpnp){
			console.log('opening upnp link ' + link) 
			if(parsedLink.indexOf('freeboxtv') !== -1) {
				link = parsedLink.replace('/?file=','');
				currentMedia.link = link;
			}
			var ffmpeg = spawnFfmpeg(link, device, '', bitrate, function(code) { // exit
					console.log('child process exited with code ' + code);
					res.end();
			});
			ffmpeg.stdout.pipe(res);
		}
		// external link
		if(playFromHttp){
			console.log('Opening external link ' + link)
			var ffmpeg = spawnFfmpeg(link, device, '', bitrate, function(code) { // exit
				console.log('child process exited with code ' + code);
				res.end();
			});
			ffmpeg.stdout.pipe(res);
		}
        // torrent link
        if (torrentPlaying) {
			console.log('Opening torrent link')
            var ffmpeg = spawnFfmpeg(link, device, '', bitrate, function(code) { // exit
                console.log('child process exited with code ' + code);
                res.end();
            });
            ffmpeg.stdout.pipe(res);
        }
        // if local file
        if (playFromFile) {
			console.log('Opening file link')
            var ffmpeg = spawnFfmpeg(link, device, '', bitrate,duration, function(code) { // exit
                console.log('child process exited with code ' + code);
                res.end();
            });
            ffmpeg.stdout.pipe(res);
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
                            res.end();
                        });
                        	
                        megaDownload = file.download().pipe(res);
						megaDownload.on('error', function(err) {
							console.log('ffmpeg stdin error...' + err);
							if (err.stack.indexOf('codec') === -1) {
								console.log("Arret demandé !!!!!!!!!!!!!!!!!!!!!!!!!!!!", megaName);
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
		console.log('request end!!!!!!!!!!!!!!!!')
        ffar[0].kill('SIGKILL');
    });
}


function spawnFfmpeg(link, device, host, bitrate,duration,exitCallback) {
    if (host === undefined || link !== '') {
        //local file...
        args = ['-i', ''+link+'', '-copyts','-sn', '-c:v', 'libx264', '-c:a', 'libvorbis','-f', 'matroska','pipe:1'];
    } else {
        if (device === "phone") {
            if (host.match(/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)/) !== null) {
                args = ['-i', 'pipe:0', '-sn', '-c:v', 'libx264', '-preset', 'fast', '-profile:v', 'high', '-deinterlace', "-b:v", bitrate + 'k', '-c:a', 'libvorbis', '-b:a', '128k', '-threads', '0', '-f', 'matroska', 'pipe:1'];
            } else {
                args = ['-i', 'pipe:0', '-sn', '-c:v', 'libx264', '-preset', 'fast', '-profile:v', 'high', '-deinterlace', "-b:v", bitrate + 'k', '-c:a', 'libvorbis', '-b:a', '64k', '-threads', '0','-f', 'matroska', 'pipe:1'];
            }
        } else if (device === 'tablet') {
            if (host.match(/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)/) !== null) {
                args = ['-i', 'pipe:0','-sn', '-c:v', 'libx264', '-preset', 'fast', '-profile:v', 'high', '-deinterlace', '-c:a', 'libvorbis', '-b:a', '256k', '-threads', '0','-f', 'matroska', 'pipe:1'];
            } else {
                args = ['-i', 'pipe:0','-sn', '-c:v', 'libx264', '-preset', 'fast', '-profile:v', 'high', "-b:v", bitrate + 'k', '-c:a', 'libvorbis', '-b:a', '128k', '-threads', '0','-f', 'matroska', 'pipe:1'];
            }
        } else {
            if (host.match(/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)/) !== null) {
                args = ['-i', 'pipe:0','-sn', '-c:v', 'libx264', '-preset', 'fast', '-profile:v', 'high', '-deinterlace', '-c:a', 'libvorbis', '-b:a', '256k', '-threads', '0', '-f', 'matroska','pipe:1'];
            } else {
                args = ['-i', 'pipe:0', '-sn', '-c:v', 'libx264', '-preset', 'fast', '-profile:v', 'high', '-deinterlace', "-b:v", bitrate + 'k', '-bufsize', bitrate + 'k', '-c:a', 'libvorbis', '-b:a', '128k', '-threads', '0','-f', 'matroska', 'pipe:1'];
            }
        }
    }
    if (process.platform === 'win32') {
        ffmpeg = spawn(exec_path + '/ffmpeg.exe', args);
    } else {
        ffmpeg = spawn(exec_path + '/ffmpeg', args);
    }
    ffar.push(ffmpeg);
    console.log('Spawning ffmpeg ' + args.join(' '));

    ffmpeg.stderr.on('data', function(data) {
        console.log('grep stderr: ' + data);
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
}

// start
startHt5Server();
