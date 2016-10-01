var mediaDuration;
var stArr = [];

var request = require('request')

function startHt5Server() {
	ht5Server = http.createServer(function(req, res) {
        console.log("MAINREQUEST : ", req)
		if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
            if(upnpToggleOn && mediaRendererType == "chromecast") {
                cleanffar();
            }
			startStreaming(req, res)
		}
	}).listen(8887);
	console.log('StreamStudio Transcoding Server ready on port 8887');
}

var isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var downloadHeader = function (req,resp, info,res) {
    try {
    var code = 200;
    var header;

    // 'Connection':'close',
    // 'Cache-Control':'private',
    // 'Transfer-Encoding':'chunked'
    settings.forceDownload = false
    info.file="test.mp4"

    if (settings.forceDownload) {
        header = {
            Expires: 0,
            //"Cache-Control": "must-revalidate, post-check=0, pre-check=0",
            //"Cache-Control": "private",
            "Content-Type": info.mime,
            //"Content-Disposition": "attachment; filename=" + info.file + ";"
        };
    } else {
        header = {
            //"Cache-Control": "public",
            "Connection": "closed",
            "Content-Type": info.mime,
            //"Content-Disposition": "inline; filename=" + info.file + ";"
        };

        if (info.rangeRequest) {
           code = 206;
            header.Status = "206 Partial Content";
            header["Accept-Ranges"] = "bytes";
            header["Content-Range"] = "bytes " + info.start + "-" + info.end + "/" + info.size;
        }
    }

        if (req.headers.origin) header['Access-Control-Allow-Origin'] = req.headers.origin
        //header.Pragma = "public";
        //header["Content-Transfer-Encoding"] = "binary";
        header["Content-Length"] = info.size;
        header["transferMode.dlna.org"] = 'Streaming';
        header["contentFeatures.dlna.org"] ='DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000';
        //header["realTimeInfo.dlna.org"] = "DLNA.ORG_TLAG=*";


        console.log('FFFMPEGGG HEADERSSSSSSSSSSSS', res)

        res.writeHead(code,header)
    } catch(err) {
        console.log(err)
    }
};

function startProxyServer() {
    if(ffmpegLive) {
        return;
    }
    var pump = require('pump')
    console.log("REQUEST PROXY SERVER")
	proxyServer = http.createServer(function(req, resp) {
        console.log("STREAMING REQ: " ,req)
        resp.setHeader("connection","closed")
		if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
            ffmpegLive = true
            try {
                var link = currentMedia.upnplink;

    			var info ={}

                var reqUrl = url.parse(link, true);

                info.path = typeof reqUrl.pathname === "string" ? reqUrl.pathname.substring(1) : undefined;
        
                if (info.path) {
                    try {
                        info.path = decodeURIComponent(info.path);
                    } catch (exception) {
                        // Can throw URI malformed exception.
                        handler.emit("badRequest", res);
                        return false;
                    }
                }
                info.file = info.path+'.mpeg';

                var file = fs.createWriteStream('/tmp/test.mp4')

                var range = typeof req.headers.range === "string" ? req.headers.range : undefined;
                console.log("RANGE", range)

                  request
                  .get(link)
                  .on('response', function(response) {

                    info.start = 0;
                    info.end = parseInt(response.headers['content-length']) - 1;
                    info.size = parseInt(response.headers['content-length']);
                    info.mime = response.headers['content-type']
                    info.modified = new Date();
                    info.rangeRequest = false;

                    if (range !== undefined && range.match(/(.*)=(\d*)-(\d*)/) != null) {
                        // Check range contains numbers and they fit in the file.
                        // Make sure info.start & info.end are numbers (not strings) or stream.pipe errors out if start > 0.
                        info.start = isNumber(range[1]) && range[1] >= 0 && range[1] < info.end ? range[1] - 0 : info.start;
                        info.end = isNumber(range[2]) && range[2] > info.start && range[2] <= info.end ? range[2] - 0 : info.end;
                        info.rangeRequest = true;
                        
                    } else if (reqUrl.query.start || reqUrl.query.end) {
                        // This is a range request, but doesn't get range headers. So there.
                        info.start = isNumber(reqUrl.query.start) && reqUrl.query.start >= 0 && reqUrl.query.start < info.end ? reqUrl.query.start - 0 : info.start;
                        info.end = isNumber(reqUrl.query.end) && reqUrl.query.end > info.start && reqUrl.query.end <= info.end ? reqUrl.query.end - 0 : info.end;
                        
                    }
                    if (req.headers.origin) response.setHeader('Access-Control-Allow-Origin', req.headers.origin)

                    downloadHeader(req,response,info,resp)
                    //resp.writeHead(200,{'Content-type': ''+response.headers['content-type']+'',"Connection":"closed",'Access-Control-Allow-Origin' : '*','transferMode.dlna.org': 'Streaming','contentFeatures.dlna.org':'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000'});
                    // if(info.rangeRequest) {
                    //     resp.writeHead(206, { 'Content-Range': 'bytes ' + info.start + '-' + info.end + '/' + info.size, 'Accept-Ranges': 'bytes', 'Content-Length': info.size, 'Content-Type': info.mime });
                    // } else {
                    //     resp.writeHead(200, { 'Content-Length': info.size, 'Content-Type': info.mime });
                    // }
                  }).pipe(resp)

            } catch(err) {
                console.log(err)
            }
            
		}
	}).listen(4745);
}

function startStreaming(req, res, width, height) {
	if(ffmpegLive) {
		return;
	}
    try {
        var baseLink = url.parse(req.url).href;
        var megaKey;
        var link;
        var megaSize;
        //var mediaExt = currentMedia.title.split('.').slice(-1)[0];
        var parsedLink = url.parse(req.url).href.replace(/&amp;/g,'&');
        var device = deviceType(req.headers['user-agent']);
		$('.mejs-overlay, .mejs-overlay-loading').show();
		$('.mejs-overlay-play').hide();

        var info = {}

        var reqUrl = url.parse(req.url, true);

        info.path = typeof reqUrl.pathname === "string" ? reqUrl.pathname.substring(1) : undefined;
        
        if (info.path) {
            try {
                info.path = decodeURIComponent(info.path);
            } catch (exception) {
                // Can throw URI malformed exception.
                handler.emit("badRequest", res);
                return false;
            }
        }

        info.file = "truc.mp4"

        var range = typeof req.headers.range === "string" ? req.headers.range : undefined;
        info.start = 0;
        console.log('REESSS', res)
        try {
            info.end = parseInt(res.headers['content-length']) - 1 || 0;
            info.size = parseInt(res.headers['content-length']);
        } catch(err) {
            info.end = 0;
            info.size = 0;
        }
        info.rangeRequest = false;

        if (range !== undefined && (range = range.match(/bytes=(.+)-(.+)?/)) !== null) {
            // Check range contains numbers and they fit in the file.
            // Make sure info.start & info.end are numbers (not strings) or stream.pipe errors out if start > 0.
            info.start = isNumber(range[1]) && range[1] >= 0 && range[1] < info.end ? range[1] - 0 : info.start;
            info.end = isNumber(range[2]) && range[2] > info.start && range[2] <= info.end ? range[2] - 0 : info.end;
            info.rangeRequest = true;
        } else if (reqUrl.query.start || reqUrl.query.end) {
            // This is a range request, but doesn't get range headers. So there.
            info.start = isNumber(reqUrl.query.start) && reqUrl.query.start >= 0 && reqUrl.query.start < info.end ? reqUrl.query.start - 0 : info.start;
            info.end = isNumber(reqUrl.query.end) && reqUrl.query.end > info.start && reqUrl.query.end <= info.end ? reqUrl.query.end - 0 : info.end;
        }

        var ocode = 200
        if(info.rangeRequest) {
            ocode = 206
        }

        console.log("REQUEST BEFORE HEADER", req.headers)
        if (req.headers.origin) res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
        res.setHeader("accept-ranges","bytes");
        res.setHeader("content-length",5421445);
        res.setHeader("content-range","bytes"+ info.start+"-5421444/5421445");//+info.end+"/"+info.size
        res.setHeader("content-type","video/mpeg");
        res.setHeader("contentfeatures.dlna.org","DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000")
        res.setHeader("transfermode.dlna.org","Streaming")
        //res.setHeader("statusMessage","Partial Content")
        if (req.method === 'HEAD') return res.end()

        console.log('FFFMPEGGG HEADERSSSSSSSSSSSS', res)


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
        if(upnpTranscoding) {
            link = currentMedia.upnplink
        }
		
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
        
        if(os.platform == "win32") {
        	link = link.replace(/ /g,'\ ');
        }

        if(engine && engine.engine_name == "Shoutcast") {
            console.log('play icecast/shoutcast live ', parsedLink)
            ffmpegLive = true;
            var ffmpeg = spawnFfmpeg(iceCastLink, device, '', '256k', 0, function(code) { // exit
                console.log('child process exited with code ' + code);
                res.end();
            });
            ffmpeg.stdout.pipe(res);
        } else if(playFromDailymotionLive) {
				console.log('play dailymotion live')
				var l = parsedLink.replace('/?file=','');
				var link, quality;
				if(l.indexOf('&quality') !== -1) {
					quality = link.split('&quality=')[1];
					link = link.split('&')[0]
				} else {
					quality = "best";
				}
				console.log('Starting dailymotion streaming '+ link + " with quality " + quality);
				ffmpegLive = true;
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
						initPlayer();
					} else if(data.toString().match(/Unable to open URL/) !== null) {
						$("#homeToggle").click();
						$.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:0,content:_("Can't open this url, please retry !"),btnId:'ok',btnTitle:_('Ok'),btnColor:'black',btnDisplay: 'block',updateDisplay:'none'})
						initPlayer();
					}
				});
		} else if(playFromTwitch) {
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
				ffmpegLive = true;
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
		} else if(playFromWat) {
                console.log('play wat.tv stream')
                var l = parsedLink.replace('/?file=','');
                var link, quality;
                if(l.indexOf('&quality') !== -1) {
                    quality = link.split('&quality=')[1];
                    link = link.split('&')[0]
                } else {
                    quality = "best";
                }
                console.log('Starting wat.tv streaming '+ link + " with quality " + quality);
                ffmpegLive = true;
                var st = spawn(livestreamerPath, ['-O',link, 'best']);
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
        } else if(playFromYoutube && !upnpToggleOn) {
			console.log('Opening youtube link')
			var ffmpeg = spawnFfmpeg(link, device, '', bitrate,time, function(code) { // exit
                 console.log('child process exited with code ' + code);
                 //res.end();
            });
            ffmpeg.stdout.pipe(res);
		}
        //if tv/upnp
        else if(playFromUpnp){
			console.log('opening upnp link ' + link) 
			if(parsedLink.indexOf('freeboxtv') !== -1) {
				link = parsedLink.replace('/?file=','');
				currentMedia.link = link;
			}
			var ffmpeg = spawnFfmpeg(link, device, '', bitrate,time, function(code) { // exit
                 console.log('child process exited with code ' + code);
                 //res.end();
            });
            ffmpeg.stdout.pipe(res);
		}
		// external link
		else if(playFromHttp || link.indexOf('&ext') !== -1){
			if(link.indexOf('&ext') !== -1) {
				var link = link.split('&ext')[0];
			}
			console.log('Opening external link ' + link)
			if(link.indexOf('grooveshark.com/stream.php') !== -1) {
				var ffmpeg = spawnFfmpeg(link, device, '', bitrate, 0, function(code) { // exit
                    console.log('child process exited with code ' + code);
                    res.end();
                });
                ffmpeg.stdout.pipe(res);
			} else {
				var ffmpeg = spawnFfmpeg(link, device, '', bitrate,time, function(code) { // exit
                     console.log('child process exited with code ' + code);
                     //res.end();
                });
                ffmpeg.stdout.pipe(res);
			}
		}
        // torrent link
        else if (torrentPlaying) {
			console.log('Opening torrent link')
			var ffmpeg = spawnFfmpeg(link, device, '', bitrate,time, function(code) { // exit
                 console.log('child process exited with code ' + code);
                 //res.end();
            });
            ffmpeg.stdout.pipe(res);
        }
        // if local file
        else if (playFromFile) {
			console.log('Opening file link')
			var ffmpeg = spawnFfmpeg(link, device, '', bitrate,time, function(code) { // exit
                 console.log('child process exited with code ' + code);
                 //res.end();
            });
            ffmpeg.stdout.pipe(res);
        }
        //if mega userstorage link
        else if (link.indexOf('userstorage.mega.co.nz') !== -1) {
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
                            f.link = 'http://' + ipaddress + ':8887' + req.url + '&direct';
                            f.title = megaName;
                            res.end();
                            startPlay(f);
                        }
                    });
                    ffmpeg.stdout.pipe(res);
                    playFromMegaUser = true;
                } else {
                    console.log('playing movie without transcoding');
                    downloadFromMega(decodeURIComponent(link), megaKey).pipe(res);
                }
            } else {
                console.log('fichier non video/audio ou téléchargement demandé... type:' + megaType);
                downloadFileFromMega(megaName, decodeURIComponent(link), megaKey, true, megaSize, '');
            }
            //normal mega link
        } else if (parsedLink.indexOf('mega.nz') !== -1) {
            console.log("opening mega.co file: " + link);
            var file = mega.file(decodeURIComponent(link)).loadAttributes(function(err, file) {
				if (err) { console.log(err)}
                try {
                    megaSize = file.size;
                    megaName = file.name.replace(/ /g, '_');
                    megaType = megaName.split('.').pop().toLowerCase();
                    currentMedia.title = megaName;
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
                        var ffmpeg = spawnFfmpeg('', device, '', bitrate, function(code) { // exit
                            console.log('child process exited with code ' + code);
                            //res.end();
                        });
                        	
                        megaDownload = file.download().pipe(ffmpeg.stdin);
						megaDownload.on('error', function(err) {
							console.log('ffmpeg stdin error...' + err);
							if (err.stack.indexOf('codec') === -1) {
								console.log("Arret demandé !!!!!!!!!!!!!!!!!!!!!!!!!!!!", megaName);
								//res.end();
							} else {
								var f = {};
								f.link = 'http://' + ipaddress + ':8887' + req.url + '&direct';
								f.title = megaName;
								res.end();
								startPlay(f);
							}
						});
						ffmpeg.stdout.pipe(res);
						playFromMega = true;
						
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
		ffmpegLive = false;
        cleanffar();
    });
}

function checkDuration(link, device, host, bitrate,res,seekTo) {
	if(!upnpToggleOn) {
		link = decodeURIComponent(link);
	}
	
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
    console.log("opening link:" + link)
	var start = '00:00:01.00'
    var args;
	if(seekTo !== 0) {
		start = seekTo;
	}
	if(upnpToggleOn || upnpToggleOn && search_engine == 'twitch' || upnpTranscoding) {
		link = decodeURIComponent(link);
        audio = 'libmp3lame';
	} else {
        audio = 'libmp3lame';
    } 
	if (host === undefined || link !== '') {
		//local file...
        var h = window.innerHeight
        var w = window.innerWidth
        if(!playFromYoutube && link.indexOf('videoplayback?') == -1) {
            var obj = JSON.parse(settings.ht5Player);
            var carray = ['wma','ape'];
			if(obj.name == 'StreamStudio' && carray.indexOf(currentMedia.title.split('.').pop()) !== -1 || playFromIcecast) {
                //"[0:a]showwaves=mode=cline:rate=25,format=yuv420p[vid]"
                // "ebur128=video=1:meter=18" 
                // "[0:a]showcqt=fps=30:count=5:fullhd=0,format=yuv420p[vid]"
				args = ['-ss' , start,'-probesize', '32','-re','-i', ''+link+'','-filter_complex', "[0:a]showfreqs=ascale=sqrt:colors=orange|red|white,format=yuv420p[vid]", '-map', "[vid]", '-map', '0:a', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', ''+audio+'','-b:a','256k','-threads', '0','-f', 'matroska','pipe:1'];
			} else {
                if(search_engine !== 'dailymotion') {
				    args = ['-ss' , start,'-re','-i', ''+link+'','-sn','-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2','-preset', 'ultrafast','-c:v', 'libx264', '-c:a', ''+audio+'','-threads', '0','-f', 'matroska','pipe:1'];
			    } else  {
                    args = ['-ss' , start,'-i', ''+link+'','-sn','-vf', "scale=trunc(iw/2)*2:trunc(ih/2)*2",'-preset', 'ultrafast','-c:v', 'libx264', '-c:a', ''+audio+'','-threads', '0','-f', 'matroska','pipe:1'];
                }
            }
		} else {
            var alink,vlink;
            vlink = decodeURIComponent(link).split('::')[0];
            try {
                alink = decodeURIComponent(link).split('::')[1].trim().replace('%20','');
            } catch(err) {}
            if(alink && alink.indexOf('videoplayback') !== -1) {
                args = ['-ss' , start,'-re','-i', vlink, '-ss', start,'-re','-i', alink,'-c:v', 'copy','-c:a', 'copy','-threads', '0','-f','matroska', 'pipe:1'];
            } else {
                args = ['-ss' , start,'-re','-i', vlink, '-c:v', 'copy','-c:a', 'libmp3lame','-threads', '0','-f','matroska', 'pipe:1'];
            }          
		}
	} else {
        if(playFromWat) {
            args = ['-re','-i','pipe:0','-c:v', 'copy','-c:a', 'copy','-threads', '0','-f','matroska', 'pipe:1'];
        } else if (playFromIcecast) {
            args = ['-re','-i','pipe:0','-c:a', 'libopus','-b:a',bitrate,'-f', 'opus', '-threads','0',  'pipe:1'];
        } else {
            args = ['-re','-i', 'pipe:0', '-sn', '-vf', "scale=trunc(iw/2)*2:trunc(ih/2)*2", '-c:v', 'libx264', '-preset', 'ultrafast', '-deinterlace', '-c:a',''+audio+'','-threads', '0','-f', 'matroska', 'pipe:1'];
        }
	}
	console.log("spawn : " + args)
	ffmpeg = spawn(ffmpegPath, args);
	ffar.push(ffmpeg);
	
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
				mediaDuration = parseFloat(seconds);
			} else if (playFromIcecast && total_data.toString().match(/Connection timed out/) !== null) {
                $.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:7000,content:_("Can't connect to this station, please retry later !"),btnId:'',btnTitle:'',btnColor:'black',btnDisplay: 'none',updateDisplay:'none'})
                initPlayer();
            }
			console.log('grep stderr: ' + data);
			
			if (data.toString().substr(0,5) == 'frame') {
				var time = data.toString().match(/time=(\d\d:\d\d:\d\d\.\d\d)/)[1];
				var seconds = parseInt(time.substr(0,2))*3600 + parseInt(time.substr(3,2))*60 + parseInt(time.substr(6,2));
			    var pct = (seconds / total_time) * 100;
                var total = pct+mediaCurrentPct;
				if (parseInt(total) >= 100) {
					return;
				} else if (playFromYoutube) {
                   $('.mejs-time-loaded').css('width', (pct+mediaCurrentPct)+'%').show(); 
                }
			}
			
		}
	});

	return ffmpeg;
}

function cleanffar() {
	player.options.duration = 0;
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

function startWebServer() {
	ht5Server = http.createServer(function(req, res) {
		if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
			if(req.url.indexOf("getAirMediaDevices") !== -1) {
				var list = $(cli._renderers).map(function(i){ 
					return {
						"ip":$(this)[0].baseUrl,
						"id":$(this)[0]._index,
						"name":$(this)[0].friendlyName
						}
					}).get();
				var body = JSON.stringify(list);
                res.end(body);
			}
			// get engines list
			else if(req.url.indexOf("getEngines") !== -1) {
				var body = JSON.stringify(enginesList);
				res.end(body);
			}
			// change engine
			else if(req.url.indexOf("loadEngine") !== -1) {
				var engine = req.url.split('&engine=')[1];
				console.log('changing to engine ' + engine)
				$('#engines_select').val(engine).change();
				res.writeHead(200,{'Content-type': 'text/html','Access-Control-Allow-Origin' : '*'});
				res.end('ok');
			}
		}
	}).listen(8898);
	console.log('StreamStudio WebServer ready on port 8898');
}

// start
startHt5Server();
startProxyServer();
startWebServer();