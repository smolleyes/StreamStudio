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
  try {
    var list = cli._servers;
    if(!UPNPserverInit) {
      UPNPserverInit = true;
      $('#UpnpContainer ul').empty()
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
    }
    $.each(list, function(index, server) {
      // load upnpFolder if not already loaded
      if ($('#' + server._index + '_upnpRootNode').length === 0) {
        obj = {
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
  } catch(err) {
    console.log('UPNP LIST ERROR', err)
  }

  loadUpnpRenderers()
}

var aiplayPlayersArr = []
var chromecastPlayers = []
var dlnaPlayers = []

function loadUpnpRenderers() {
  if($('#castPopup').children().length == 0) {
    $('#castPopup').append(`
      <span style="position:relative;top:-3px;">${_("Disable")}: </span><input id="upnpToggle" data-name="disable" class="upnp" type="radio" data-type="activate" name="cast" checked><br>
      <div id="upnpTranscoding" style="display:none;"><span style="position:relative;top:-3px;">${_("Transcoding")}: </span><input id="transcodingInput" class="upnp" type="checkbox" data-type="transcoding" name="transcoding"></div>
      <h5 id="dlnaLabel"><img style="height:24px;width:24px;margin-right:5px;" src="images/dlna.png" />Upnp-dlna</h5>
      <div id="dlnaPlayers">
      </div>
      <h5 id="chromecastLabel"><img style="height:24px;width:24px;margin-right:5px;" src="images/chromecast.png" />Chromecast</h5>
      <div id="chromecastPlayers">
      </div>
      <h5 id="airplayLabel"><img style="height:24px;width:24px;margin-right:5px;" src="images/airplay-icon.png" />Airplay</h5>
      <div id="airplayPlayers">
      </div>
      `)
    }
    try {
        $.each(state.devices.dlna.getDevices(),function(index,item) {
          var name = item.name;
          if(name !== "") {
              if(dlnaPlayers.indexOf(name) == -1) {
                $('#dlnaPlayers').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" data-name="'+name+'" type="radio" data-type="upnp" name="cast" value="'+name+'"> <br />');
                upnpDevices.push(name);
                dlnaPlayers.push(name)
              }
          }
        });
        $.each(state.devices.chromecast.getDevices(),function(index,item) {
          var name = item.name;
          if(name.toLowerCase()=="chromecast_") {
            return;
          }
          var id = item.id;
          if(name !== "") {
              if(chromecastPlayers.indexOf(name) == -1) {
                $('#chromecastPlayers').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" data-name="'+name+'" type="radio" data-type="chromecast" name="cast" value="'+id+'"> <br />');
                upnpDevices.push(name);
                chromecastPlayers.push(name)
              }
          }
        });
        $.each(state.devices.airplay.getDevices(),function(index,item) {
          var name = item.name;
          var id = item.id;
          if(name !== "") {
              if(aiplayPlayersArr.indexOf(name) == -1) {
                $('#airplayPlayers').append('<span style="position:relative;top:-3px;">'+name + ' :</span> <input class="upnp" data-name="'+name+'" type="radio" data-type="airplay" name="cast" value="'+id+'"> <br />');
                upnpDevices.push(name);
                aiplayPlayersArr.push(name);
              }
          }
        });
        var pos = $($('button[aria-label="cast"]')[0]).offset().left == 0 ?  $($('button[aria-label="cast"]')[1]).offset() : $($('button[aria-label="cast"]')[0]).offset();
        var height = $('#castPopup').height() + 20;
        var left = pos.left-150;
        $('#castPopup').css({left:left+'px'})
    } catch(err) {
      console.log(err)
    }
      if(airplayPlayers.length == 0) {
        $('#airplayPlayers').hide()
        $('#airplayLabel').hide()
      } else {
        $('#airplayPlayers').show()
        $('#airplayLabel').show()
      }
      if (chromecastPlayers.length == 0) {
        $('#chromecastPlayers').hide()
        $('#chromecastLabel').hide()
      } else {
        $('#chromecastPlayers').show()
        $('#chromecastLabel').show()
      }
      if (dlnaPlayers.length == 0) {
        $('#dlnaPlayers').hide()
        $('#dlnaLabel').hide()
      } else {
        $('#dlnaPlayers').show()
        $('#dlnaLabel').show()
      }
  }

  $(document).on('click','.mejs-cast-button',function() {
    var pos = $('button[aria-label="cast"]').offset()
    if(!$('#castPopup').is(':visible')) {
      Cast.init(state,updateUpnpList)
      var height = $('#castPopup').height() + 20;
      $('#castPopup').css({left:left+'px'}).show().focus()
    } else {
      $('#castPopup').hide()
    }
  })

  $(document).on('click','input[name="cast"]',function() {
    var inputClass = $(this).attr('class');
    var selected = $(this).attr('data-name');
    var type = $(this).attr('data-type');
    console.log('input clicked', selected)
    if(selected == "disable") {
      $('#upnpTranscoding').hide()
      upnpToggleOn = false
      $('.mejs-cast-button').removeClass('cast-on').addClass('cast-off')
    } else {
      upnpToggleOn = true
      $('.mejs-cast-button').removeClass('cast-off').addClass('cast-on')
      $('#upnpTranscoding').show()
    }
    if(type == "upnp") {
      __.some(state.devices.dlna.getDevices(), function(el, index) {
        if (el.name === selected) {
          upnpDevice = el.name
          mediaRenderer = el;
          mediaRendererType = 'upnp';
        }
      });
    } else if (type== 'chromecast'){
      __.some(state.devices.chromecast.getDevices(), function(el, index) {
        if (el.name === selected) {
          upnpDevice= el.device
          mediaRenderer = el;
          mediaRendererType = "chromecast"
        }
      });
    } else {
      __.some(state.devices.airplay.getDevices(), function(el, index) {
        if (el.name === selected) {
          upnpDevice= el.device
          mediaRenderer = el;
          mediaRendererType = "airplay"
        }
      });
    }
    $('#castPopup').hide()
})

$(document).on('click',"#transcodingInput", function(e) {
  if ($(this).is(':checked')) {
    upnpTranscoding = true;
  } else {
    upnpTranscoding = false;
  }
});


  function loadUpnpQtip() {
      var text = $('#castPopup').html();
      $("#upnp-toggle").qtip({
        content : {text: text},
        position: {
          corner: {
            target: 'bottomMiddle',
            tooltip: 'topMiddle'
          }
        },
        show: { ready: false },
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

  function startUPNPserver() {
    try {
      var upnpDirs = [];
      $.each(settings.shared_dirs, function(index, dir) {
        var share = {};
        share.path = dir;
        share.mountPoint = path.basename(dir).replace(' ', '_');
        upnpDirs.push(share);
        if (index + 1 == settings.shared_dirs.length) {
          console.log(upnpDirs)
          UPNPserver = new upnpServer({
            name: 'StreamStudio_' + os.hostname()
          }, upnpDirs);
          UPNPserver.start();
          //UPNPInterval = setInterval(updateDevices,10000);
        }
      });
    } catch(err) {
      console.log(err)
    }
  }


  // start
  startUPNPserver();
