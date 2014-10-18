var mediaServer;

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
						console.log(items)
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
							console.log(dirs)
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
    $.each(items, function(index, file) {
        console.log(file);
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
	} 
}

function loadUpnpRenderers() {
	var list = cli._avTransports;
	upnpDevices = [];
	$('#upnpPopup').empty();
	$.each(list,function(index,item) {
		var name = item.friendlyName;
		if (upnpDevices.length === 0) {
			$('#upnpPopup').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" type=radio name="'+name+'" checked="true" value="'+name+'"> <br />');
		} else {
			$('#upnpPopup').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" type=radio name="'+name+'" value="'+name+'"> <br />');
		}
		upnpDevices.push(name);
		if(index+1 === list.length) {
			return loadUpnpQtip();
		}
	});
}


function loadUpnpQtip() {
  if (upnpDevice !== null) {
      $("#upnpPopup input").each(function(){
          var name = $(this).prop('name');
          if (name !== upnpDevice) {
              $(this).prop('checked','');
          }
      });
      $("#upnpPopup input[name='"+cli._avTransports[upnpDevice]['friendlyName']+"']").prop('checked','checked');
      mediaRenderer = new Plug.UPnP_AVTransport( cli._avTransports[upnpDevice], { debug: false } );
  } else {
	  if (upnpDevices.length > 0) {
		upnpDevice = 0;
		mediaRenderer = new Plug.UPnP_AVTransport( cli._avTransports[0], { debug: false } );
	  }
  }
  if (upnpDevices.length === 1) {
      upnpDevice = 0;
      mediaRenderer = new Plug.UPnP_AVTransport( cli._avTransports[0], { debug: false } );
      return;
  } else if (upnpDevices.length === 0){
      var text = '<p>Aucun Freebox player allumé! <br>Allumez votre freebox player et réactivez ce bouton...</p>';
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
function playUpnpRenderer(obj) {
	// stop upnp file loading if needed
	timeUpdater = null;
	transitionCount = 0;
	try {
		if (upnpMediaPlaying || continueTransition) {
			mediaRenderer.stop();
			continueTransition = false;
		}
	} catch(err) {}
	if(obj.type === undefined) {
		obj.type = "object.item.videoItem";
	}
	$('.mejs-time-current').width(0+'%');
	$('span.mejs-currenttime').text('00:00:00');
	$('span.mejs-duration').text('00:00:00');
	//'http://'+ipaddress+':8081/?stream='+
	var uri = XMLEscape.xmlEscape(obj.link.replace('&upnp','').replace('&torrent','').replace('&direct',''));
	var infos = JSON.parse(obj.data).protocolInfo;
	var title = XMLEscape.escape(obj.title);
	var type = obj.type;
	currentMedia = obj;
	
	//var metaString = '&lt;DIDL-Lite xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot; xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:dlna=&quot;urn:schemas-dlna-org:metadata-1-0/&quot; xmlns:sec=&quot;http://www.sec.co.kr/&quot;&gt;&lt;item&gt;&lt;dc:title&gt;'+title+'&lt;/dc:title&gt;&lt;upnp:class&gt;'+type+'&lt;/upnp:class&gt;&lt;res protocolInfo=&quot;'+infos+':*&quot; size=&quot;0&quot;&gt;'+uri+'&lt;/res&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;'
	var metaString= '&lt;DIDL-Lite xmlns=\"urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/\" xmlns:upnp=\"urn:schemas-upnp-org:metadata-1-0/upnp/\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dlna=\"urn:schemas-dlna-org:metadata-1-0/\" xmlns:sec=\"http://www.sec.co.kr/\"&gt;&lt;item id=\"0/0/912/145-0\" parentID=\"0/0/912\" restricted=\"1\"&gt;&lt;upnp:class&gt;'+type+'&lt;/upnp:class&gt;&lt;dc:title&gt;'+title+'&lt;/dc:title&gt;&lt;dc:creator&gt;Unknown Artist&lt;/dc:creator&gt;&lt;upnp:artist&gt;Unknown Artist&lt;/upnp:artist&gt;&lt;upnp:album&gt;Unknown Album&lt;/upnp:album&gt;&lt;res protocolInfo=\"'+infos+':*\"&gt;'+uri+'&lt;/res&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;'
	mediaRenderer.setAVTransportURI("0",uri,metaString).then(function(response) {
		if (response && response.data) {
			console.log('UPNP: Ok playing' + uri);
			// start watching for PLAYING state
			mediaRenderer.play();
			continueTransition = true;
			getRendererState('PLAYING');
		} else {
			mediaRenderer.stop();
			continueTransition = false;
			upnpMediaPlaying = false;
			console.log('UPNP: No response for' + uri)
			getRendererState('STOPPED');
		}
		
	}).then( null, function( error ) { // Handle any errors

		console.log( "An error occurred: " + error.description );

	});
}

function getRendererState(state) {
	mediaRenderer.getTransportInfo().then(function(response) {
		if (response && response.data) {
			if(response.data.CurrentTransportState !== state && continueTransition) {
				if(response.data.CurrentTransportState === 'TRANSITIONING') {
					if (transitionCount === 20) {
						upnpMediaPlaying = false;
						continueTransition = false;
						mediaRenderer.stop();
						initPlayer();
					} else {
						transitionCount += 1;
						$('.mejs-time-current').width(0+'%');
						$('span.mejs-currenttime').text('--:--');
						$('span.mejs-duration').text('--:--');
						setTimeout(function(){ 
							getRendererState(state);
							getUpnpPosition(); 
						},1000);
					}
				} else {
					setTimeout(function(){ 
						getRendererState(state);
						getUpnpPosition(); 
					},1000);
				}
			} else {
				console.log("PLAYER STATE " + state)
				if (state === 'PLAYING') {
					upnpMediaPlaying = true;
					continueTransition = true;
					setTimeout(function(){
						$('#song-title').empty().append(_('Playing: ') + decodeURIComponent(currentMedia.title));
						$('.mejs-overlay-button').hide();
						$('.mejs-overlay-loading').hide();
						$('.mejs-container p#fbxMsg').remove();
						$('.mejs-container').append('<p id="fbxMsg" style="height:100px !important;position: absolute;top: 45%;margin: 0 50%;color: white;font-size: 30px;text-align: center;z-index: 10000;width: 450px;right: 50%;left: -225px;">'+_("Playing on your UPNP device !")+'</p>')
						$('.mejs-controls').width('100%');
					},1000);
					// watch for STOPPED state
					console.log("start watching for stopped state")
					getRendererState('STOPPED');
				} else if (state === 'STOPPED') {
					continueTransition = false;
					setTimeout(function(){
					// if user asked stop
						if(upnpMediaPlaying === false) {
							console.log("upnp stopped")
							continueTransition = false;
						// else continue
						} else {
							console.log('upnp finished playing...')
							continueTransition = false;
							upnpMediaPlaying = false;
							on_media_finished();
						}
						try {
							if(torrentPlaying) {
							 stopTorrent();
							}
						} catch (err) {}
						$('.mejs-time-buffering').width(0+'%');
						$('.mejs-time-loaded').width(0+'%');
						$('.mejs-time-current').width(0+'%');
						$('span.mejs-currenttime').text('00:00:00');
						$('span.mejs-duration').text('00:00:00');
						$(".mejs-overlay").show();
						$(".mejs-layer").show();
						$(".mejs-overlay-loading").hide();
						$(".mejs-overlay-button").show();
						$('#fbxMsg').remove();
						$('#song-title').empty().append(_('Stopped...'));
					},2000);
				}
			}
		} else {
			console.log("Service is reporting no response");
		}
	}).then( null, function( error ) { // Handle any errors
		console.log( "An error occurred: " + error );
	});
}

function startUPNPserver() {
    var upnpDirs = [];
    $.each(settings.shared_dirs, function(index, dir) {
        var share = {};
        share.path = dir;
        share.mountPoint = path.basename(dir).replace(' ', '_');
        upnpDirs.push(share);
        if (index + 1 == settings.shared_dirs.length) {
            UPNPserver = new upnpServer({
                name: 'Ht5streamer_' + os.hostname(),
                uuid: uuid.v4()
            }, upnpDirs);
            UPNPserver.start();
        }
    });
}

// start 
startUPNPserver();
