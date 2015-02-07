var os = require('os');
var fs = require('node-fs-extra');
var address = require('network-address');
var proc = require('child_process');
var rTorrent = require('read-torrent');
var peerflix = require('peerflix');
var mime = require('mime');

var path = require('path');
var mime = require('mime');
var ___ = require('underscore');
var totalBuffered = 0;

var statsUpdater = null;
var active = function(wire) {
  return !wire.peerChoking;
};

var stateModel = {};
stateModel.state='';
var videoStreamer = null;
var maxTry = 90;
var numTry = 0; 
var streamInfo = {};
var app = {};

// Minimum percentage to open video
var MIN_PERCENTAGE_LOADED = 0.5;
var STREAM_PORT = 21584; // 'PT'!
// Minimum bytes loaded to open video
var BUFFERING_SIZE = 10 * 1024 * 1024;

var playStarted = false;
var downloadedPct = 0;
var torrentSrc = '';
var torrentName = '';

function getTorrent(link) {
	console.log('torrent link: '+ link)
  initPlayer();
  stopTorrent();
  stateModel = {state: 'connecting', backdrop: '',numTry: 0};
  streamInfo = {};
  videoStreamer = null;
  statsUpdater = null;
  playStarted = false;
  downloadedPct = 0;
  rTorrent(link, function(err, torrent) {
    if(err) {
     console.log(err);
     swal(_("Error!"), _("Can't get your torrent file, please retry!"), "error")
   } else {
    askSaveTorrent();
    title = torrent.name;
    var torrentInfo = {
      info: torrent,
      title: title
    };
    var obj = JSON.parse(settings.ht5Player);
    if((activeTab == 1 || activeTab == 2) && (search_engine=== 'dailymotion' || search_engine=== 'youtube' || engine.type == "video") && obj.name === "StreamStudio") {
     $('#playerToggle').click();
   }
   handleTorrent(torrentInfo, stateModel);
 }
});
}

var watchState = function(stateModel) {
  if (videoStreamer != null) {
    var swarm = videoStreamer.swarm;
    var state = 'connecting';

    if(swarm.downloaded > BUFFERING_SIZE) {
      state = 'ready';
    } else if(swarm.downloaded) {
      state = 'downloading';
    } else if(swarm.wires.length) {
      state = 'startingDownload';
    }

    stateModel.state = state;
    stateModel.numTry += 1;
    if(state != 'ready') {
      ___.delay(watchState, 1000, stateModel);
    } else {
      clearTimeout(___.delay(watchState, 1000, stateModel));
    }
  }
};

app.updateStats = function(streamInfo) {
 $(".mejs-overlay-button").hide();
 var active = function(wire) {return !wire.peerChoking;};
 var swarm = streamInfo.swarm;

			var upload_speed = swarm.uploadSpeed(); // upload speed
			var final_upload_speed = '0 B/s';
			if(!isNaN(upload_speed) && upload_speed != 0){
				var converted_speed = Math.floor( Math.log(upload_speed) / Math.log(1024) );
				final_upload_speed = ( upload_speed / Math.pow(1024, converted_speed) ).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][converted_speed]+'/s';
			}

			var download_speed = swarm.downloadSpeed(); // download speed
			var final_download_speed = '0 B/s';
			if(!isNaN(download_speed) && download_speed != 0){
				var converted_speed = Math.floor( Math.log(download_speed) / Math.log(1024) );
				final_download_speed = ( download_speed / Math.pow(1024, converted_speed) ).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][converted_speed]+'/s';
			}

			this.downloaded = swarm.downloaded;
			this.active_peers=swarm.wires.filter(active).length;
			this.total_peers=swarm.wires.length;

			this.uploadSpeed=final_upload_speed; // variable for Upload Speed
			this.downloadSpeed=final_download_speed; // variable for Download Speed

			this.downloaded = (swarm.downloaded) ? swarm.downloaded : 0;
			this.percent = (swarm.downloaded / (BUFFERING_SIZE / 100)).toFixed(2);
      if(stateModel.state != 'ready') {
        if(stateModel.state === 'connecting') {
          if(parseInt(stateModel.numTry) >= 90) {
            setTimeout(function() {$('#preloadProgress').empty().append(_('Corrupted torrent or no seeders, can\'t open your torrent file'));},5000);
            clearTimeout(statsUpdater);
            return;
          } else {
            $('#preloadProgress').empty().append(_('Connecting... please wait (test %s/%s)',stateModel.numTry,maxTry));
          }
        } else if (stateModel.state === 'downloading' || stateModel.state === 'startingDownload') {
          if (parseInt(this.percent) > 0 && parseInt(this.percent) < 100) {
            $('#preloadProgress').empty().append(_('Downloading %s%% done at %s',this.percent,this.downloadSpeed));
            $('#preloadTorrent progress').attr('value',this.percent).text(this.percent);
            $('#peerStats').empty().append(_('%s / %s connected peers',this.active_peers,this.total_peers));
          }
        }
      } else {
        if (playStarted === false) {
         $('#preloadTorrent').remove();
         var stream = {};
         stream.link = 'http://'+ipaddress+':' + videoStreamer.server.address().port + '/&torrent';
         stream.next = '';
         stream.title = streamInfo.server.index.name;
         sdb.insert({"title":itemTitle},function(err,result){
          if(!err){
            console.log('std database updated successfully!');
          } else {
            console.log(err);
          }
        })
			  //clearTimeout(statsUpdater);
			  startPlay(stream);
			  playStarted = true;
     } else {
      torrentSrc = videoStreamer.path;
      torrentName = videoStreamer.server.index.name;
      try {
        downloadedPct = (swarm.downloaded / streamInfo.server.index.length * 100).toFixed(2);
      } catch(err) {return;}
      if(parseInt(downloadedPct) >= 100){
        var t = _('(%s%% downloaded)',100);
        $("#song-title").empty().text(_('Playing: ')+torrentName+" "+t);
        console.log("SAVING TORRENT " + saveTorrent)
        if(saveTorrent) {
          saveToDisk(torrentSrc,torrentName);
          torrentSaved = true;
          saveTorrent = false;
        }
      } else {
        $('#downloadStats').empty().html('<span style="margin:0 5px;">'+_("Speed:")+'</span><i class="arrow down"></i>' + this.downloadSpeed +' <i class="arrow up"></i>'+ this.uploadSpeed +'<span style="padding:5px;">| '+_("Connected peers: ")+ this.active_peers + ' / ' + this.total_peers + '</span>');
        var t = _('(%s%% downloaded)',downloadedPct);
        if(player.media.paused) {
         totalBuffered = swarm.downloaded;
         totalBytes = streamInfo.server.index.length;
       } else {
         totalBuffered = 0;
         totalBytes = 0;
       }
       if(upnpToggleOn && upnpMediaPlaying && !upnpStoppedAsked) {
         $('.mejs-time-loaded').width(downloadedPct+'%')
       }
       $("#song-title").empty().text(_('Playing: ')+torrentName+" "+t);
     }
   }
 }
 
};

function saveToDisk(src,name) {
	try {
		if (name !== '') {
			fs.remove(download_dir+'/'+name, function(err){
				fs.copy(src, download_dir, function (err) {
					if (err) {
						console.log(err,src,name)
						$.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:5000,content:_("Can't save torrent to your download dir, error: %s",err),btnId:'',btnTitle:'',btnColor:'',btnDisplay: 'none',updateDisplay:'none'})
					} else {
						$.notif({title: 'StreamStudio:',cls:'green',icon: '&#10003;',timeout:5000,content:_('Torrent successfully saved to your ht5 download directory !'),btnId:'',btnTitle:'',btnColor:'',btnDisplay: 'none',updateDisplay:'none'})
					}
				});
			});
		} else {
			$.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:5000,content:_("Can't save torrent to your download dir, error: %s",err),btnId:'',btnTitle:'',btnColor:'',btnDisplay: 'none',updateDisplay:'none'})
		}
	} catch(err) {
		fs.copy(src, download_dir, function (err) {
			if (err) {
				console.log(err,src,name)
				$.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:5000,content:_("Can't save torrent to your download dir, error: %s",err),btnId:'',btnTitle:'',btnColor:'',btnDisplay: 'none',updateDisplay:'none'})
			} else {
				$.notif({title: 'StreamStudio:',cls:'green',icon: '&#10003;',timeout:5000,content:_('Torrent successfully saved to your ht5 download directory !'),btnId:'',btnTitle:'',btnColor:'',btnDisplay: 'none',updateDisplay:'none'})
			}
		});
	}
}

function handleTorrent(torrent, stateModel) {
  var tmpFilename = torrent.info.infoHash;
  tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') +'-'+ (new Date()*1);
  var tmpFile = path.join(tmpFolder, tmpFilename);

  $('#preloadTorrent').empty().remove();
  setTimeout(function() {
   $('.mejs-container').append('<div id="preloadTorrent" \
     style="position: absolute;top: 45%;margin: 0 50%;color: white;font-size: 12px;text-align: center;z-index: 10000;width: 450px;right: 50%;left: -225px;"> \
     <p><b id="preloadProgress">'+_("Connecting... please wait")+'</b></p> \
     <progress value="5" min="0" max="100">0%</progress> \
     <div id="peerStats"></div></div>');
   $(".mejs-overlay-button").hide();
 },1000);
  videoStreamer = peerflix(torrent.info, {
      connections: 100, // Max amount of peers to be connected to.
      path: tmpFile, // we'll have a different file name for each stream also if it's same torrent in same session
      buffer: (1.5 * 1024 * 1024).toString() // create a buffer on torrent-stream
    });
  
  streamInfo = new app.updateStats(videoStreamer);
  statsUpdater = setInterval(___.bind(app.updateStats, streamInfo, videoStreamer), 1000);
  stateModel.streamInfo = streamInfo;
  watchState(stateModel);
  
  var checkReady = function() {
    if(stateModel.state === 'ready') {
        // we need subtitle in the player
        streamInfo.title = torrent.title;

        stateModel.state = 'ready';
        stateModel.destroy();
      }
    };

    videoStreamer.server.on('listening', function(){
     torrentPlaying = true;
     streamInfo.src = 'http://'+ipaddress+':' + videoStreamer.server.address().port + '/';
     streamInfo.type = 'video/mp4';
     var item = {};
     item.name = videoStreamer.files[0].name;
     item.obj = videoStreamer;
     torrentsArr.push(item);
     console.log('peerrlifx listening on http://'+ipaddress+':' + videoStreamer.server.address().port + '/')

      // TEST for custom NW
      //streamInfo.set('type', mime.lookup(videoStreamer.server.index.name));
      //stateModel.on('change:state', checkReady);
      checkReady();
    });
    
    
  // not used anymore
  videoStreamer.on('ready', function() {});

  videoStreamer.on('uninterested', function() {
    if (videoStreamer) {
      videoStreamer.swarm.pause();
    }
    
  });

  videoStreamer.on('interested', function() {
    if (videoStreamer) {
      videoStreamer.swarm.resume();
    }            
  });
}

function bytesToSize(bytes, precision) {	
	var kilobyte = 1024;
	var megabyte = kilobyte * 1024;
	var gigabyte = megabyte * 1024;
	var terabyte = gigabyte * 1024;

	if ((bytes >= 0) && (bytes < kilobyte)) {
		return bytes + ' Bits';

	} else if ((bytes >= kilobyte) && (bytes < megabyte)) {
		return (bytes / kilobyte).toFixed(precision) + ' Ko';

	} else if ((bytes >= megabyte) && (bytes < gigabyte)) {
		return (bytes / megabyte).toFixed(precision) + ' Mo';

	} else if ((bytes >= gigabyte) && (bytes < terabyte)) {
		return (bytes / gigabyte).toFixed(precision) + ' Go';

	} else if (bytes >= terabyte) {
		return (bytes / terabyte).toFixed(precision) + ' To';
	} else {
		return bytes + 'Bits';
	}
}
