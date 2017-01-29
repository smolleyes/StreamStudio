var mediaDuration;
var stArr = [];
var ip = require('ip');
var rangeParser = require('range-parser')

function startHt5Server() {
    ht5Server = http.createServer()
    ht5Server.on('request', function (req, res) {
      console.log("HT5SERVER REQUEST:", req)
        if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
            if(upnpToggleOn && mediaRendererType == "chromecast") {
                cleanffar();
            }

            currentRes = res;

            res.setHeader('Accept-Ranges', 'bytes')
            res.setHeader('Content-Type', 'video/mp4')
            res.setHeader('transferMode.dlna.org', 'Streaming')
            res.setHeader('contentFeatures.dlna.org', 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000')
            startStreaming(req, res)

            res.on("close", function() {
                currentRes= null;
                console.log('request end!!!!!!!!!!!!!!!!')
                ffmpegLive = false;
                state.playing.state = "STOPPED"
                cleanffar();
            });
        }
    })

    ht5Server.listen(8887);

    ht5Server.on('connection', function (socket) {
      socket.setTimeout(0)
    })

    console.log('StreamStudio Transcoding Server ready on port 8887');
}

function startProxyServer() {
    proxyServer = http.createServer(function(req, resp) {
        if ((req.url !== "/favicon.ico") && (req.url !== "/")) {
            // twitch login
            if(req.url.indexOf('code=') !== -1) {
              try {
                var token = req.url.match(/code=(.*?)&/)[1]
                if(token) {
                  settings.twitchToken=token;
                  saveSettings()
                  setTimeout(function(){
                    twitchWindow.close()
                  },2000)
                }
                resp.writeHead(200,{'Content-type': 'application/json;charset=utf-8'});
                resp.end(JSON.stringify({success:true,token:token}));
              } catch(err) {}
            } else {
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
        }
    }).listen(8091);
    proxyServer.on('connection', function (socket) {
      socket.setTimeout(36000000)
    })
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
        var megaName = $('.song-title').text().replace(_('Playing: '), '');
        var megaType = megaName.split('.').pop().toLowerCase();
        var x = null;

        if(os.platform == "win32") {
            link = link.replace(/ /g,'\ ');
        }

        if(playFromIcecast) {
            console.log('play icecast/shoutcast live ', iceCastLink)
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
                var st = spawn(livestreamerPath, ['-O','--twitch-oauth-token','7r98hdtbfxnivxrgwwenr0n3sjnc3n',link, quality]);
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
                    $('.song-title').empty().html(_('Playing: ') + megaName);
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
    link = decodeURIComponent(link);
    console.log("opening link:" + link)
    var start = '00:00:01.00'
    var args;
    if(seekTo !== 0) {
        start = seekTo;
    }
    if(upnpToggleOn) {
        link = decodeURIComponent(link);
        audio = 'libmp3lame';
    } else {
        audio = 'aac';
    }
    if (host === undefined || link !== '') {
        //local file...
        var h = window.innerHeight
        var w = window.innerWidth
        if(!playFromYoutube && link.indexOf('videoplayback?') == -1) {
            var obj = JSON.parse(settings.ht5Player);
            var carray = ['mp3','opus','wav','flac','m4a','wma','ape'];
            if(obj.name == 'StreamStudio' && carray.indexOf(currentMedia.title.split('.').pop()) !== -1 || playFromIcecast) {
                //"[0:a]showwaves=mode=cline:rate=25,format=yuv420p[vid]"
                // "ebur128=video=1:meter=18"
                // "[0:a]showcqt=fps=30:count=5:fullhd=0,format=yuv420p[vid]"
                args = ['-ss' , start,'-probesize', '32','-re','-i', ''+link+'','-filter_complex', "[0:a]showfreqs=ascale=sqrt:colors=orange|red|white,format=yuv420p[vid]", '-map', "[vid]", '-map', '0:a', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', ''+audio+'', '-b:a','256k','-threads', '0','-f', 'matroska','pipe:1'];
            } else {
                if(search_engine !== 'dailymotion') {
                    if(transcodeAudioOnly) {
                      console.log('Transcoding audio only!')
                      args = ['-ss' , start,'-re','-i', ''+link+'','-analyzeduration','2147483647','-probesize', '2147483647','-preset', 'ultrafast','-map', '0:0', '-map', '0:1', '-c:v', 'copy', '-c:a:0', 'ac3','-threads', '0','-f', 'matroska','pipe:1'];
                    } else if (transcodeVideoOnly) {
                      console.log('Transcoding video only!')
                      args = ['-ss' , start,'-re','-i', ''+link+'','-analyzeduration','2147483647','-probesize', '2147483647','-preset', 'ultrafast','-c:v', 'libx264', '-c:a', 'copy','-threads', '0','-f', 'matroska','pipe:1'];
                    } else {
                      console.log('Transcoding video and audio')
                      args = ['-ss' , start,'-re','-i', ''+link+'','-analyzeduration','2147483647','-probesize', '2147483647','-preset', 'ultrafast','-c:v', 'libx264', '-c:a', ''+audio+'','-threads', '0','-f', 'matroska','pipe:1'];
                    }
                } else  {
                    args = ['-ss' , start,'-i', ''+link+'','-sn','-vf','-preset', 'ultrafast','-c:v', 'libx264', '-c:a', ''+audio+'','-threads', '0','-f', 'matroska','pipe:1'];
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
                args = ['-ss' , start,'-re','-i', vlink, '-c:v', 'copy','-c:a', 'libopus','-threads', '0','-f','matroska', 'pipe:1'];
            }
        }
    } else {
        if(playFromWat) {
            args = ['-re','-i','pipe:0','-c:v', 'copy','-c:a', 'copy','-threads', '0','-f','matroska', 'pipe:1'];
        } else if (playFromIcecast) {
            args = ['-ss' , start,'-probesize', '32','-re','-i', ''+link+'','-filter_complex', "[0:a]showfreqs=ascale=sqrt:colors=orange|red|white,format=yuv420p[vid]", '-map', "[vid]", '-map', '0:a', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', ''+audio+'', '-b:a',''+bitrate+'','-threads', '0','-f', 'matroska','pipe:1'];
        } else {
            args = ['-re','-i', 'pipe:0', '-sn', '-vf', "scale=trunc(iw/2)*2:trunc(ih/2)*2", '-c:v', 'libx264', '-preset', 'ultrafast', '-deinterlace', '-c:a',''+audio+'','-threads', '0','-f', 'matroska', 'pipe:1'];
        }
    }
    console.log("spawn : " + args)
    ffmpeg = spawn(ffmpegPath, args);
    ffar.push(ffmpeg);

    var total_time = 0,
        total_data = '';

  ffmpeg.on('exit',function(err,code) {
    console.log('FFMPEG PROCESS DIED WITH CODE', err, code)
  })


    ffmpeg.stderr.on('data', function(data) {
        if(data) {
            total_data += data.toString();
            if (total_data.toString().match(/Duration:\s\d\d:\d\d:\d\d\.\d\d/)) {
                var time = total_data.toString().match(/Duration:\s(\d\d:\d\d:\d\d)/).toString().substring(10,21);
                var seconds = parseInt(time.substr(0,2))*3600 + parseInt(time.substr(3,2))*60 + parseInt(time.substr(6,2));
                total_data = '';
                total_time = seconds;
                mediaDuration = parseFloat(seconds);
            } else if (playFromIcecast && total_data.toString().match(/Connection timed out/) !== null) {
                $.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:7000,content:_("Can't connect to this station, please retry later !"),btnId:'',btnTitle:'',btnColor:'black',btnDisplay: 'none',updateDisplay:'none'})
                initPlayer();
            }
            //console.log('grep stderr: ' + data);

            if (data.toString().substr(0,5) == 'frame') {
              return;
                var time = data.toString().match(/time=(\d\d:\d\d:\d\d)/)[1];
                var seconds = parseInt(time.substr(0,2))*3600 + parseInt(time.substr(3,2))*60 + parseInt(time.substr(6,2));
                var pct = (seconds / total_time) * 100;
                var total = pct+mediaCurrentPct;
                if (parseInt(total) >= 100) {
                    return;
                } else if (playFromYoutube || upnpTranscoding) {
                   $('.mejs-time-loaded').css('width', (pct+mediaCurrentPct)+'%').show();
                   if(upnpToggleOn && upnpTranscoding) {
                     $('.mejs-time-current').css('width', pct+'%');
                     if(seekTo) {
                       state.playing.currentTime = seconds + hmsToSecondsOnly(seekTo)
                     } else {
                       state.playing.currentTime = seconds
                     }
                     state.playing.duration = mediaDuration
                     updateMiniPlayer()
                     updateProgressBar()
                     state.playing.state = "PLAYING"
                   }
                }
            }

        }
    });

    return ffmpeg;
}

function cleanffar(seek) {
    state.playing.state = "STOPPED"
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
    if(seek) {
      launchPlay()
    }
}

// start
startHt5Server();
startProxyServer();
