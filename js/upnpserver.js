var mediaServer;
playFromUpnp = false;
var MediaRendererClient = require('upnp-mediarenderer-client');
var sanitize = require("sanitize-filename");
var upnpInterval;
function browseUpnpDir(serverId, indexId, parentId) {
    console.log('loading file for server index ' + serverId + " at index " + indexId)

    mediaServer = new Plug.UPnP_ContentDirectory(cli._servers[serverId], {
        debug: false
    });
    mediaServer.index = serverId;

    mediaServer.browse(indexId, null, null, 0, 1000, null).then(function(response) {
        if (response && response.data) {
            try {
                var xml = encodeXML(response.data.Result);
                var channels = [];
                parseString(xml, function(err, result) {
                    var dirs = undefined;
                    try {
                        dirs = result['DIDL-Lite']['container'];
                    } catch (err) {}
                    var items = undefined;
                    try {
                        items = result['DIDL-Lite']['item'];
                    } catch (err) {}
                    $('#items_container').empty().show();
                    if (items) {
                        $.each(items, function(index, dir) {
                            var channel = {};
                            channel.parentId = parentId;
                            channel.serverId = serverId;
                            if (dir['upnp:class'][0].indexOf('object.container') !== -1) {
                                var channel = {};
                                channel.data = dir.$;
                                channel.title = XMLEscape.xmlEscape(dir['dc:title'][0])
                                channel.type = 'folder';
                                channels.push(channel);
                            } else if (dir['upnp:class'][0].indexOf('object.item') !== -1) {
                                channel.data = dir["res"][0]['$'];
                                channel.link = dir["res"][0]["_"] + '&upnp';
                                channel.class= dir['upnp:class'][0];
                                channel.type = 'file';
                                channel.title = XMLEscape.xmlEscape(dir['dc:title'][0])
                                channels.push(channel);
                            }
                            if (index + 1 === items.length) {
                                if (dirs) {
                                    $.each(dirs, function(index, dir) {
                                        var channel = {};
                                        channel.parentId = parentId;
                                        channel.serverId = serverId;
                                        if (dir['upnp:class'][0].indexOf('object.container') !== -1) {
                                            channel.data = dir.$;
                                            channel.title = XMLEscape.xmlEscape(dir['dc:title'][0])
                                            channel.type = 'folder'
                                            channels.push(channel);
                                        } else if (dir['upnp:class'][0].indexOf('object.item') !== -1) {
                                            channel.data = dir["res"][0]['$'];
                                            channel.link = dir["res"][0]["_"] + '&upnp';
                                            channel.class= dir['upnp:class'][0];
                                            channel.type = 'file';
                                            channel.title = XMLEscape.xmlEscape(dir['dc:title'][0])
                                            channels.push(channel);
                                        }
                                        if (index + 1 === dirs.length) {
                                            var sorted = ___.sortBy(channels, 'title');
                                            loadUpnpItems(sorted);
                                        }
                                    });
                                } else {
                                    var sorted = ___.sortBy(channels, 'title');
                                    loadUpnpItems(sorted);
                                }
                            }
                        });
                    } else {
                        if (dirs) {
                            $.each(dirs, function(index, dir) {
                                var channel = {};
                                channel.parentId = parentId;
                                channel.serverId = serverId;
                                if (dir['upnp:class'][0].indexOf('object.container') !== -1) {
                                    channel.data = dir.$;
                                    channel.title = XMLEscape.xmlEscape(dir['dc:title'][0])
                                    channel.type = 'folder'
                                    channels.push(channel);
                                } else if (dir['upnp:class'][0].indexOf('object.item') !== -1) {
                                    channel.data = dir["res"][0]['$'];
                                    channel.link = dir["res"][0]["_"] + '&upnp';
                                    channel.class= dir['upnp:class'][0];
                                    channel.type = 'file';
                                    channel.title = XMLEscape.xmlEscape(dir['dc:title'][0]);
                                    channels.push(channel);
                                }
                                if (index + 1 === dirs.length) {
                                    var sorted = ___.sortBy(channels, 'title');
                                    loadUpnpItems(sorted);
                                }
                            });
                        }
                    }
                });
            } catch (err) {
                console.log("ERRORRRRRR " + err)
            }
        } else {
            console.log("no response")
        }
        $(".mejs-overlay").hide();
        $(".mejs-layer").hide();
        $(".mejs-overlay-loading").hide();

    }).then(null, function(error) { // Handle any errors
        console.log("An error occurred: " + error.description);
        $(".mejs-overlay").hide();
        $(".mejs-layer").hide();
        $(".mejs-overlay-loading").hide();
    });
}

function loadUpnpItems(items) {
    $.each(items.reverse(), function(index, file) {
        if (file.type === "folder") {
            var id = Math.floor(Math.random() * 1000000);
            var obj = {
                "attr": {
                    id: '' + id + '_upnpSubNode'
                },
                "data": {
                        "title": XMLEscape.xmlUnescape(file.title),
                        "attr": {
                            "id": '' + id + '_upnpSubNode',
                            "serverId" : file.serverId,
                            "parent": file.parentId,
                            "index": file.data.id
                        }
                },
                "children": []
            }
            $("#UpnpContainer").jstree("create", $("#"+file.parentId), "inside", obj, function() {}, true);
        } else {
			try {
				var ext = file.title.split('.').pop().toLowerCase();
				if(['pdf','txt','html','rar','zip','iso','.torrent','nfo'].indexOf(ext) !== -1) {
					return true;
				}
			} catch(err) {}
			if(ext)
            var id = Math.floor(Math.random() * 1000000);
                var obj = {
                    "attr": {
                        "id": id
                    },
                    "icon": "js/jstree/themes/default/movie_file.png",
                    "data": {
                        "title": XMLEscape.xmlUnescape(file.title),
                        "attr": {
                            "id": id,
                            "parent": file.parentId,
                            "data": JSON.stringify(file.data),
                            "link": file.link,
                            "type" : file.class,
                            "class": "upnpMedia",
                            "title": file.title
                        }
                    }
                }
            $("#fileBrowserContent").jstree("create", $("#"+file.parentId), "inside", obj, function() {}, true);
        }
    });
}


function updateUpnpList() {
    var list = cli._servers;
    $('#upnp_upnpRootNode ul').remove()
    if ($('#UpnpContainer li').length === 0) {
        $(function() {
            $("#UpnpContainer").jstree({
                "plugins": ["themes", "json_data", "ui", "types", "crrm"],
                "json_data": {
                    "data": {
                        "attr": {
                            id: '' + _("upnp") + '_upnpRootNode'
                        },
                        "data": _("Upnp"),
                        "children": []
                    }
                },
                "themes": {
                    "theme": "default"
                },
            }).bind("select_node.jstree", function(e, data) {
                onSelectedItem(data);
            }).bind('before.jstree', function(event, data) {
                if (data.plugin == 'contextmenu') {
                    var settings = data.inst._get_settings();
                    if ((data.inst._get_parent(data.args[0]) == -1) || (data.args[0].id === '')) {
                        settings.contextmenu.items.remove._disabled = true;
                        settings.contextmenu.items.rename._disabled = true;
                        settings.contextmenu.items.create._disabled = false;
                    } else {
                        settings.contextmenu.items.remove._disabled = false;
                        settings.contextmenu.items.rename._disabled = false;
                        settings.contextmenu.items.create._disabled = true;
                    }
                }
            }).bind("loaded.jstree", function(event, data) {
                console.log('upnp tree loaded...')
            });
        });
    }
    $.each(list, function(index, server) {
		// load upnpFolder if not already loaded
        if ($('#' + server._index + '_upnpRootNode').length === 0) {
            var obj = {
                "attr": {
                    id: '' + server._index + '_upnpRootNode'
                },
                "data": XMLEscape.xmlUnescape(server.friendlyName),
                "class": "upnpSubfolder",
                "children": []
            }
            $("#UpnpContainer").jstree("create", $("#" + _("upnp") + "_upnpRootNode"), "inside", obj, function() {}, true);
        }
    })
    if(cli._avTransports.length > 0) {
		$('#upnpRenderersContainer').show();
        $('#upnpBubble').show();
	} else {
        $('#upnpRenderersContainer').hide();
        $('#upnpBubble').hide();
    }
}

function loadUpnpRenderers() {
	var list = cli._avTransports;
	upnpDevices = [];
	$('#upnpPopup').empty();
	$.each(list,function(index,item) {
		var name = item.friendlyName;
        if(name !== "") {
		if (upnpDevices.length === 0) {
    			$('#upnpPopup').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" type="radio" data-type="upnp" name="'+name+'" checked="true" value="'+name+'"> <br />');
    		} else {
    			$('#upnpPopup').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" type="radio" data-type="upnp" name="'+name+'" value="'+name+'"> <br />');
    		}
            upnpDevices.push(name);
    		if(index+1 === list.length) {
    			return loadUpnpQtip();
    		}
        }
	});

    $.each(chromecastDevices,function(index,item) {
        var name = item.name;
        var id = item.id;
        if(name !== "") {
            if (upnpDevices.length === 0) {
                $('#upnpPopup').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" type="radio" data-type="chromecast" name="'+name+'" checked="true" value="'+id+'"> <br />');
            } else {
                $('#upnpPopup').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" type="radio" data-type="chromecast" name="'+name+'" value="'+id+'"> <br />');
            }
            
            upnpDevices.push(name);
            
            if(index+1 === chromecastDevices.length) {
                console.log('before loasQtip')
                return loadUpnpQtip();
            }
        }
    });
}


function loadUpnpQtip() {
  var type = 'upnp';
  if (upnpDevice !== null && cli._avTransports.length == 1 && chromecastDevices.length == 0) {
    mediaRendererType = "upnp"
  } else if(upnpDevice !== null && cli._avTransports.length == 0 && chromecastDevices.length == 1) {
    mediaRendererType = "chromecast"
  }
  if (upnpDevices.length === 1) {
      upnpDevice = 0
      $('#upnpRenderersContainer').show();
      $('#upnpBubble').show();
  } else if (upnpDevices.length === 0){
      var text = '<p>Aucun Freebox player allumé! <br>Allumez votre freebox player et réactivez ce bouton...</p>';
      $("#upnp-toggle").qtip({
      content : {text: text},
      position: {
        corner: {
          target: 'bottomLeft',
          tooltip: 'bottomLeft'
        },
        position: {
			at: 'bottom left'
		}
      },
      show: { ready: true },
      hide: {
        event: 'unfocus',
        effect: function(offset) {
            $(this).slideDown(1000); // "this" refers to the tooltip
        }
      },
      style: { classes : 'qtip-youtube'},
      // The magic
      api: {
        onRender: function() {
          this.elements.tooltip.click(this.hide) //
        }
      }
    });
  } else {
    var text = $('#upnpPopup').html();
    $("#upnp-toggle").qtip({
      content : {text: text},
      position: {
        corner: {
          target: 'bottomMiddle',
          tooltip: 'topMiddle'
        }
      },
      show: { ready: true },
      hide: {
        event: 'unfocus',
        effect: function(offset) {
            $(this).slideDown(1000); // "this" refers to the tooltip
        }
      },
      style: { classes : 'qtip-youtube'},
      // The magic
      api: {
        onRender: function() {
          this.elements.tooltip.click(this.hide) //
        }
      }
    });
  }

}

var continueTransition = false;
var transitionCount = 0;
upnpStoppedAsked = false;
var upnpDeviceState = '';
var rendererState = {};
rendererState.TransportState = "STOPPED";
function playUpnpRenderer(obj) {
    if(mediaRendererType == "chromecast") {
        return playOnChromecast(obj);
    }
    try {
        mediaRenderer = new MediaRendererClient(cli._avTransports[upnpDevice].location);
        mediaRenderer.on('status', function(status) {
          // Reports the full state of the AVTransport service the first time it fires, 
          // then reports diffs. Can be used to maintain a reliable copy of the 
          // service internal state.
          //console.log("UPNP STATUS EVENT: ", status)
          rendererState = status;
        });

        mediaRenderer.getTransportInfos(function(res) {console.log("RESSSS INFO", res)})

        mediaRenderer.on('error', function(err) {
          console.log("ERREUR UPNP:", err.message);
        });
         
        mediaRenderer.on('loading', function() {
          console.log('UPNP LOADING EVENT');
        });
         
        mediaRenderer.on('playing', function() {
            upnpMediaPlaying = true;
            console.log('UPNP PLAYING EVENT');
        });
         
        mediaRenderer.on('paused', function() {
            console.log('UPNP PAUSE EVENT');
        });
         
        mediaRenderer.on('stopped', function() {
          console.log('UPNP EVENT STOP');
          checkStopped()
        });
    } catch(err) {
        console.log("UPNP ERREUR CATCH IN playUpnpRenderer:", err)
        return;
    }
 
    // Load a stream with subtitles and play it immediately
    if(obj.title.indexOf('opus') !== -1) {
        currentMedia.mime = 'audio/opus'
        currentMedia.type = "audio"
    }
    obj.title = sanitize(XMLEscape.xmlEscape(decodeURIComponent(obj.title.replace(/[^\x00-\x7F]/g, ""))))

    var options = { 
      autoplay: true,
      contentType: "video/mpeg",
      metadata: {
        title: obj.title,
        type: currentMedia.type || "video", // can be 'video', 'audio' or 'image' 
        subtitlesUrl: ''
      }
    };
     console.log("SET UPnP_ContentDirectory OPTIONS: ", options)
    mediaRendererPaused = false;

    var uri = obj.link.replace('&upnp','').replace('&torrent','').replace('&direct','').replace(/&/g,"&amp;").trim();
    
    mediaRenderer.load(uri.trim(), options, function(err, result) {
        if(upnpMediaPlaying) {
            clearInterval(upnpInterval);
        }
        if(err) throw err;
        upnpContinuePlay = true;
        continueTransition = true;
        transitionCount = 0;
        upnpMediaPlaying = false;
        $('.mejs-overlay-button,.mejs-overlay,.mejs-overlay-loading,.mejs-overlay-play').hide();
        upnpInterval = setInterval(getRendererState,1000);
    });
}



function getRendererState() {
    mediaRenderer.getTransportInfos(function(err,res) {
        rendererState = res;
        if(!rendererState.TransportState) {
            rendererState.TransportState = rendererState.CurrentTransportState;
        }
        if(rendererState.TransportState == 'TRANSITIONING' && continueTransition) {
                if (transitionCount === 120 && search_engine !== "twitch" && search_engine !== 'dailymotion') {
                    upnpMediaPlaying = false;
                    continueTransition = false;
                    upnpStoppedAsked = true;
                    stopUpnp();
                } else {
                    transitionCount += 1;
                    $('.mejs-time-current').width(0+'%');
                    $('span.mejs-currenttime').text('--:--');
                    $('span.mejs-duration').text('--:--');
                    $('.mejs-overlay-play').hide();
                    $('.mejs-overlay,.mejs-overlay-loading').show()
                    setTimeout(function(){ 
                        getRendererState();
                    },1000);
                }
        } else if (rendererState.TransportState === 'PLAYING') {
                transitionCount = 0;
                upnpMediaPlaying = true;
                continueTransition = true;
                upnpLoading = false;
                updateMiniPlayer()
                $('#subPlayer-title').empty().append(_('Playing: ') + decodeURIComponent(currentMedia.title));
                setTimeout(function(){
                    $('#song-title').empty().append(_('Playing: ') + decodeURIComponent(currentMedia.title));
                    $('.mejs-overlay-button').hide();
                    $('.mejs-overlay-loading').hide();
                    $('.mejs-container p#fbxMsg').remove();
                    $('#fbxMsg2').remove()
                    $('.mejs-overlay-button,.mejs-overlay,.mejs-overlay-loading,.mejs-overlay-play').hide()
                    $('.mejs-container').append('<p id="fbxMsg" style="height:300px !important;position: absolute;top: 50%;margin: 0 50%;margin-top:-150px;color: white;font-size: 30px;text-align: center;z-index: 10000;width: 450px;right: 50%;left: -225px;">'+_("Playing on your UPNP device !")+'</p>')
                    $('.mejs-controls').width('100%');
                },1000);
            // watch for STOPPED state
        } else if (rendererState.TransportState === 'STOPPED') {
                 continueTransition = false;
                 upnpStoppedAsked = false;
                 stopUpnp();
        }
    })
    getUpnpPosition();
}

function checkStopped() {
    console.log('upnp state checkStopped '+rendererState.TransportState)
    if(rendererState.TransportState == 'STOPPED' || rendererState.TransportState === 'NO_MEDIA_PRESENT') {
        on_media_finished();
    } else {
        setTimeout(function(){
            checkStopped()
        },1000);
    }
}

function stopUpnp() {
    clearInterval(upnpInterval);
	// if user asked stop
	if(upnpMediaPlaying === false) {
        $('#progress-bar').val(0)
        $('.mejs-duration,.mejs-currenttime').text('00:00:00')
		continueTransition = false;
        mediaRenderer.stop()
        initPlayer()
        upnpStoppedAsked = false;
        $('#playPauseBtn').css('background-position','0 0')
		// else continue
	} else {
		console.log('upnp finished playing...')
		continueTransition = false;
		upnpMediaPlaying = false;
		playFromUpnp = false;
		upnpStoppedAsked = false;
        $('#playPauseBtn').css('background-position','0 0')
        initPlayer()
        on_media_finished();
	}
}

function startUPNPserver() {
    try {
    var upnpDirs = [];
    $.each(settings.shared_dirs, function(index, dir) {
        var share = {};
        share.path = dir;
        share.mountPoint = path.basename(dir).replace(' ', '_');
        upnpDirs.push(share);
        if (index + 1 == settings.shared_dirs.length) {
            UPNPserver = new upnpServer({
                name: 'StreamStudio_' + os.hostname(),
                uuid: uuid.v4()
            }, upnpDirs);
            UPNPserver.start();
        }
    });
} catch(err) {
    console.log(err)
}
}

function playOnChromecast(currentMedia,yt) {
    if(transcoderEnabled) {
        var link = 'http://'+ipaddress+':8887/?file='+currentMedia.link.replace('&upnp','');
        currentMedia.link = link;
    }
    mediaRenderer = upnpDevice == 0 ? chromecastDevices[upnpDevice].device : upnpDevice;
    mediaRenderer.play(currentMedia.link,null,null,win.window);
    ChromecastInterval = setInterval(getChromeCastPos,1000);
    mediaRenderer.on('status',function(status) {
        if(status.playerState == 'IDLE') {
            on_media_finished();
            if(chromeCastplaying) {
                clearInterval(ChromecastInterval);
                chromeCastplaying = false;
            }
        } else if(status.playerState == 'PLAYING' || status.playerState == 'BUFFERING') {
            $('.mejs-overlay-button,.mejs-overlay,.mejs-overlay-loading,.mejs-overlay-play').hide()
            $('#fbxMsg2,#fbxMsg').remove();
            chromeCastplaying = true;
            upnpContinuePlay = true;
            updateProgressBar();
            updateMiniPlayer();
            $('#subPlayer-play').hide();
            $('#subPlayer-pause').show();
            $('#playPauseBtn').css('background-position','0 -16px')
            if(currentMedia.cover) {
                $('.mejs-container').append('<div id="fbxMsg2" style="height:calc(100% - 60px);"><div style="top:50%;position: relative;"><img style="margin-left: 50%;left: -100px;position: relative;top: 50%;margin-top: -100px;width:200px;max-height:200px;" src="'+currentMedia.cover+'" /><h3 style="font-weight:bold;text-align: center;">'+currentMedia.title+'</h3></div></div>');
                $('.mejs-container').append('<p id="fbxMsg" style="height:45px !important;position: absolute;top: 50%;margin: 0 50%;color: white;font-size: 30px;text-align: center;z-index: 10000;width: 100%;right: 50%;left: -50%;top: calc(50% - 200px);">'+_("Playing on your Chromecast device !")+'</p>')
            } else {
                $('.mejs-container').append('<p id="fbxMsg" style="height:200px !important;position: absolute;top: 50%;margin: 0 50%;margin-top:-100px;color: white;font-size: 30px;text-align: center;z-index: 10000;width: 100%;right: 50%;left: -50%;">'+currentMedia.title+' <br/> '+_("Playing on your Chromecast device !")+'</p>')
            }
            $('.mejs-overlay-button,.mejs-overlay,.mejs-overlay-loading,.mejs-overlay-play').hide()
        } else if(status.playerState == 'BUFFERING') {
            $('#fbxMsg2').remove();
            $('.mejs-overlay-button,.mejs-overlay,.mejs-overlay-loading,.mejs-overlay-play').show()
            $('.mejs-overlay-play').hide()
        }
    });
}

function getChromeCastPos() {
    mediaRenderer.getStatus(function(data){
        try {
            if(!upnpTranscoding) {
                mediaDuration = data.media.duration;
                player.media.duration = mediaDuration;
                player.media.currentTime = data.currentTime;
                updateProgressBar();
            } else {
                player.media.duration = mediaDuration;
                player.media.currentTime = data.currentTime;
                updateProgressBar();
            }
        } catch(err) {

        }

    })
}

// start 
startUPNPserver();
