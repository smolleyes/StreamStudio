function saveSettings() {
	localStorage.StdSettings = JSON.stringify(settings);
}

function showPopup(html,target,cb) {
	$.magnificPopup.open({
        items: {
          src: html+'<div><a href="#" class="mfp-close" style="position:absolute;top:0px;right:20px;font-size:24px;font-weight:bold;">X</a></div>'
        },
        type: 'inline',prependTo : $(target),
        callbacks: {
        	open: function() {
        		if(cb) {
        			return cb();
        		}
		    }
        },
        closeOnContentClick: false,
        closeOnBgClick: false,
        showCloseBtn : false
        // You may add options here, they're exactly the same as for $.fn.magnificPopup call
        // Note that some settings that rely on click event (like disableOn or midClick) will not work here
    }, 0);
}

var cleanSubTitles = function() {
  var dirPath = path.join(execDir, 'subtitles');
  try { var files = fs.readdirSync(dirPath)}
  catch(e) { return; }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = path.join(dirPath, files[i]);
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
    }
};

function scanSubTitles(dir) {
	try {
		var l = decodeURIComponent(dir.replace('file://',''));
		if(l !== execDir+'/subtitles') {
			dir = path.dirname(l);
		}
		var list = dirTree(dir);
		var i = 1;
		$('#videoPlayer').empty();
		Iterator.iterate(list.children).forEach(function (item,index) {
			var ext = path.extname(item.path);
			if(item.type == "file" && ext == ".srt" || ext == ".vtt") {
				fs.createReadStream(item.path).pipe(fs.createWriteStream(execDir+'/subtitles/'+_("Track")+i+ext));
				$('#videoPlayer').append('<track kind="subtitles" src="subtitles/'+_("Track")+i+ext+'" srclang="'+_("Track")+i+'" label="'+path.basename(item.path)+'" />');
				i+=1;
			}
		});
		player.findTracks();
		Iterator.iterate(player.tracks).forEach(function (item,index) { 
			player.loadTrack(index);
		});
		if($('.mejs-captions-button').length == 0 ) {
			setTimeout(function() {
				player.buildtracks(player,player.controls,player.layers,player.media)
				launchPlay();
			},1000);
		} else {
			setTimeout(function() {
				launchPlay();
			},1000);
		}
	} catch(err) {
		console.log(err)
		launchPlay();
	}
}

function getLocalDb(dir,parent) {
	var fileList = [];
	fileList.push(dirTree(dir));
	loadPcFiles(fileList)
}

function loadPcFiles(list,mainParent) {
	$.each(list,function(index,dir) {
		var parent = Math.floor(Math.random()*1000000);
		var obj = { 
			"attr" : { id : ''+parent+'_localSubNode', path : dir.path },
			"data" : dir.name,
			"children" : []
		}
		if(mainParent !== undefined) {
			$("#fileBrowserContent").jstree("create", $("#"+mainParent), "inside", obj, function() {}, true);
			loadchildrens(dir.children,parent,false);
		} else {
			$("#fileBrowserContent").jstree("create", $("#"+_("Local library")+"_rootnode"), "inside", obj, function() {}, true);
			loadchildrens(dir.children,parent,true);
		}
	});
}

function loadchildrens(childs,parent,close) {
	var html;
	if ((childs !== undefined) && (childs !== null) && (childs.length !== 0)) {
		$.each(childs.reverse(),function(index,child) {
			if(child.type==="file") {
				var id = Math.floor(Math.random()*1000000);
				var ext = child.name.split('.').pop().toLowerCase();
				if (ext === 'webm' || ext == '3gp' || ext === 'm4a' || ext === 'mp4' || ext === 'flac' || ext === 'wav' || ext === 'mpg' || ext === 'opus' || ext === 'avi' || ext === 'mpeg' || ext === 'mkv' || ext === 'mp3' || ext === 'ogg' || ext === 'mov') {
					var obj = {
						"attr" : { "id" : id },
						"icon" : "js/jstree/themes/default/movie_file.png",
						"data" : {
							"title" : child.name, 
							"attr" : { "id": id, "parent" : parent, "link" : "file://"+encodeURI(child.path), "class" : "localFile","dir":encodeURI(path.dirname(child.path)),"title":child.name} 
						}
					}
					$("#fileBrowserContent").jstree("create", $("#"+parent+"_localSubNode"), "inside",  obj, function() { }, true);
					$("#"+parent+"_localSubNode").addClass('loaded');
					if(close) {
						$("#fileBrowserContent").jstree('close_all');
					}
				}
			} else {
				if (child.name !== "node_modules") {
					var nid = Math.floor(Math.random()*1000000);
					var obj = { 
						"attr" : { id : ''+nid+'_localSubNode', path : child.path, class : "firstFolder" },
						"data" : child.name,
						"children" : []
					}
					$("#fileBrowserContent").jstree("create", $("#"+parent+"_localSubNode"), "inside", obj, function() {}, true);
					//loadchildrens(child.children,nid);
				}
			}
		});
}
}

function downloadFile(link, title, vid, toTorrent) {
	if (activeTab !== 4 && (toTorrent === false || toTorrent == undefined)) {
		$("#downloads_tab").click();
	}
	if (vid === undefined) {
		var vid = title.split('::')[1];
	}
	var title = sanitize(title.split('::')[0]);
	var html = '<div id="progress_' + vid + '" class="progress" style="display:none;"> \
	<p><b>' + title + '</b></p> \
	<p> \
	<strong>0%</strong> \
	</p> \
	<progress value="5" min="0" max="100">0%</progress> \
	<a href="#" style="display:none;" class="convert" alt="" title="' + _("Convert to mp3") + '"> \
	<img src="images/video_convert.png"> \
	</a> \
	<a href="#" id="cancel_' + vid + '" style="display:none;" class="cancel" alt="" title="' + _("Cancel") + '"> \
	<img src="images/close.png"> \
	</a> \
	<a class="open_folder" style="display:none;" title="' + _("Open Download folder") + '" href="#">\
	<img src="images/export.png" /> \
	</a> \
	<a href="#" style="display:none;" class="hide_bar" alt="" title="' + _("Close") + '"> \
	<img src="images/close.png"> \
	</a> \
	</div>';
	$('#DownloadsContainer').append(html).show();

	var pbar = $('#progress_' + vid);
	// remove file if already exist
	fs.unlink(download_dir + '/' + title, function(err) {
		if (err) {} else {
			console.log('successfully deleted ' + download_dir + '/' + title);
		}
	});
	// start download
	canceled = false;
	$('#progress_' + vid + ' strong').html(_('Waiting for connection...'));
	var opt = {};
	var val = $('#progress_' + vid + ' progress').attr('value');
	title = title.trim();
	if (toTorrent) {
		title += '.torrent';
	}
	opt.link = link;
	opt.title = title;
	opt.vid = vid;
	var currentTime;
	var startTime = (new Date()).getTime();
	var target = download_dir + '/ht5_download.' + startTime;
	var host;
	var path;
	var parsedLink = url.parse(link);
	try {
		host = parsedLink.host;
		path = parsedLink.path;
	} catch (err) {
		console.log(err + ' ' + link);
	}
	current_download[opt] = opt;
	if (search_engine === 'dailymotion') {
		console.log('DAILYMOTION ' + link)
		current_download[vid] = http.request(link);
	} else {
		current_download[vid] = request(link);
	}
	current_download[vid].on('response', function(response) {
		if (response.statusCode > 300 && response.statusCode < 400 && response.headers.location) {
			// The location for some (most) redirects will only contain the path,  not the hostname;
			// detect this and add the host to the path.
			$('#progress_' + vid).remove();
			return downloadFile(response.headers.location, title, vid, toTorrent);
			// Otherwise no redirect; capture the response as normal            
		} else {
			pbar.show();
			$('#progress_' + vid + ' a.cancel').show();
			var contentLength = response.headers["content-length"];
			if (parseInt(contentLength) === 0) {
				$('#progress_' + vid + ' a.cancelD').hide();
				$('#progress_' + vid + ' strong').html(_("can't download this file..."));
				setTimeout(function() {
					pbar.hide()
				}, 5000);
			}
			var file = fs.createWriteStream(target);
			response.on('data', function(chunk) {
				file.write(chunk);
				var bytesDone = file.bytesWritten;
				currentTime = (new Date()).getTime();
				var transfer_speed = (bytesDone / (currentTime - startTime)).toFixed(2);
				var newVal = bytesDone * 100 / contentLength;
				var txt = Math.floor(newVal) + '% ' + _('done at') + ' ' + transfer_speed + ' kb/s';
				$('#progress_' + vid + ' progress').attr('value', newVal).text(txt);
				$('#progress_' + vid + ' strong').html(txt);
			});
			response.on('end', function() {
				file.end();
				if (canceled === true) {
					fs.unlink(target, function(err) {
						if (err) {} else {
							console.log('successfully deleted ' + target);
						}
					});
					$('#progress_' + vid + ' a.cancel').hide();
					$('#progress_' + vid + ' strong').html(_("Download canceled!"));
					setTimeout(function() {
						pbar.hide()
					}, 5000);
				} else {
					fs.rename(target, download_dir + '/' + title.replace(/  /g, ' ').trim(), function(err) {
						if (err) {} else {
							console.log('successfully renamed ' + download_dir + '/' + title);
							if (toTorrent !== undefined && toTorrent !== false) {
								gui.Shell.openItem(download_dir + '/' + title);
							}
						}
					});
					$('#progress_' + vid + ' strong').html(_('Download ended !'));
					if (title.match('.mp3') === null) {
						$('#progress_' + vid + ' a.convert').attr('alt', download_dir + '/' + title + '::' + vid).show();
					}
					$('#progress_' + vid + ' a.open_folder').show();
					$('#progress_' + vid + ' a.hide_bar').show();
					$('#progress_' + vid + ' a.cancel').hide();
				}
			});
}
});
current_download[vid].end();
}

function downloadFileHttps(link, target, vid, toTorrent,fromYoutubeTrack) {
	if (activeTab !== 4 && toTorrent === undefined || toTorrent === false) {
		$("#downloads_tab").click();
	}
	var vid = ((Math.random() * 1e6) | 0);
	var title = target;
	try{
		title = sanitize(title.split('::')[0]);
	} catch(err) {}
	var html = '<div id="progress_' + vid + '" class="progress" style="display:none;"> \
	<p><b>' + title + '</b></p> \
	<p> \
	<strong>0%</strong> \
	</p> \
	<progress value="5" min="0" max="100">0%</progress> \
	<a href="#" style="display:none;" class="convert" alt="" title="' + _("Convert to mp3") + '"> \
	<img src="images/video_convert.png"> \
	</a> \
	<a href="#" id="cancel_' + vid + '" style="display:none;" class="cancelD" alt="" title="' + _("Cancel") + '"> \
	<img src="images/close.png"> \
	</a> \
	<a class="open_folder" style="display:none;" title="' + _("Open Download folder") + '" href="#">\
	<img src="images/export.png" /> \
	</a> \
	<a href="#" style="display:none;" class="hide_bar" alt="" title="' + _("Close") + '"> \
	<img src="images/close.png"> \
	</a> \
	</div>';
	$('#DownloadsContainer').append(html).show();

	var pbar = $('#progress_' + vid);
	// remove file if already exist
	fs.unlink(download_dir + '/' + title, function(err) {
		if (err) {} else {
			console.log('successfully deleted ' + download_dir + '/' + title);
		}
	});
	// start download
	canceled = false;
	$('#progress_' + vid + ' strong').html(_('Waiting for connection...'));
	var opt = {};
	var val = $('#progress_' + vid + ' progress').attr('value');
	title = title.trim().replace(/\\|\//g,'_');
	if (toTorrent) {
		title += '.torrent';
	}
	opt.link = link;
	opt.title = title;
	opt.vid = vid;
	var currentTime;
	var startTime = (new Date()).getTime();
	var target = download_dir + '/' + title.replace(/  /g, ' ').trim();
	var host;
	var path;
	var parsedLink = url.parse(link);
	try {
		host = parsedLink.host;
		path = parsedLink.path;
	} catch (err) {
		console.log(err + ' ' + link);
	}
	pbar.show();
	current_download[vid] = new XMLHttpRequest();
	current_download[vid].onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			var blob = this.response;
			var arrayBuffer;
			var fileReader = new FileReader();
			fileReader.onload = function() {
				arrayBuffer = this.result;
				var nodeBuffer = new Buffer(arrayBuffer);
				fs.writeFile(target, nodeBuffer, function(err) {
					console.log('done')
				});
			};
			fileReader.readAsBinaryString(blob);
		}
	}
	current_download[vid].open('GET', link);
	current_download[vid].responseType = 'blob';
	current_download[vid].send();

	current_download[vid].onprogress = function(e) {
		if (e.lengthComputable) {
			$('#progress_' + vid + ' a.cancelD').show();
			if (canceled === true) {
				current_download[vid].abort();
				$('#progress_' + vid + ' a.cancelD').hide();
				$('#progress_' + vid + ' strong').html(_("Download canceled!"));
				setTimeout(function() {
					pbar.hide()
				}, 5000);
			} else {
				var pct = (e.loaded / e.total) * 100;
				currentTime = (new Date()).getTime();
				var transfer_speed = (e.loaded / (currentTime - startTime)).toFixed(2);
				var txt = Math.floor(pct) + '% ' + _('done at') + ' ' + transfer_speed + ' kb/s';
				$('#progress_' + vid + ' progress').attr('value', pct).text(txt);
				$('#progress_' + vid + ' strong').html(txt);
				if(pct == 100) {
					$('#progress_' + vid + ' strong').html(_('Download ended !'));
					if (title.match('.mp3') === null && !fromYoutubeTrack) {
						$('#progress_' + vid + ' a.convert').attr('alt', download_dir + '/' + title + '::' + vid).show();
					}
					$('#progress_' + vid + ' a.open_folder').show();
					$('#progress_' + vid + ' a.hide_bar').show();
					$('#progress_' + vid + ' a.cancelD').hide();
				}
			}
		} else {
			$('#progress_' + vid + ' a.cancelD').hide();
			$('#progress_' + vid + ' strong').html(_("can't download this file..."));
			setTimeout(function() {
				pbar.hide()
			}, 5000);
		}
	}
}

function downloadFFMpeg(link,title,vid,toTorrent,audio) {
	var child_process = require('child_process');
	var sys = require('sys');
	
	if (activeTab !== 4) {
		$("#downloads_tab").click();
	}
	var vid = ((Math.random() * 1e6) | 0);

	if(!audio) {
		var vlink = link.split('::')[0];
		try {
			var alink = link.split('::')[1].replace('%20','');
		} catch(err) {
			return downloadFileHttps(link,title,vid,toTorrent);
		}
		var title = sanitize(title.split('::')[0].trim().replace(/\\|\//g,'_').replace('.webm','.mkv'));
	} else {
		title = sanitize(title.replace('.mp4','.aac'));
	}

	var html = '<div id="progress_' + vid + '" class="progress" style="display:none;"> \
	<p><b>' + title + '</b></p> \
	<p> \
	<strong>0%</strong> \
	</p> \
	<progress value="5" min="0" max="100">0%</progress> \
	<a href="#" style="display:none;" class="convert" alt="" title="' + _("Convert to mp3") + '"> \
	<img src="images/video_convert.png"> \
	</a> \
	<a href="#" id="cancel_' + vid + '" style="display:none;" class="cancelD" alt="" title="' + _("Cancel") + '"> \
	<img src="images/close.png"> \
	</a> \
	<a class="open_folder" style="display:none;" title="' + _("Open Download folder") + '" href="#">\
	<img src="images/export.png" /> \
	</a> \
	<a href="#" style="display:none;" class="hide_bar" alt="" title="' + _("Close") + '"> \
	<img src="images/close.png"> \
	</a> \
	</div>';
	$('#DownloadsContainer').append(html).show();

	var pbar = $('#progress_' + vid);
	// remove file if already exist
	fs.unlink(download_dir + '/' + title, function(err) {
		if (err) {} else {
			console.log('successfully deleted ' + download_dir + '/' + title);
		}
	});
	// start download
	canceled = false;
	$('#progress_' + vid + ' strong').html(_('Waiting for connection...'));
	var opt = {};
	var val = $('#progress_' + vid + ' progress').attr('value');
	if (toTorrent) {
		title += '.torrent';
	}
	opt.link = link;
	opt.title = title;
	opt.vid = vid;
	var target = download_dir + '/' + title.replace(/  /g, ' ').trim();
	pbar.show();

	var encoder;
	if(!audio){
		encoder = child_process.spawn(ffmpegPath,['-y','-i', vlink,'-i',alink, '-c:v', 'libx264', '-c:a', 'copy', '-f','matroska',target]);
	} else {
		encoder = child_process.spawn(ffmpegPath,['-y','-i', link,'-c:a', 'aac', '-b:a', '240k', '-strict', '-2',target]);
	}
	opt.process = encoder;
	current_download[vid] = opt;
	var total_time = 0,
	total_data = '';

	encoder.stderr.on('data', function(data) {
		if (data) {
			total_data += data.toString();
			if (total_data.toString().match(/Duration:\s\d\d:\d\d:\d\d\.\d\d/)) {
				$('#progress_' + vid + ' a.cancelD').show();
				var time = total_data.toString().match(/Duration:\s(\d\d:\d\d:\d\d\.\d\d)/).toString().substring(10,21);
				console.log('DATA: ' + total_data.toString());
				console.log('Time: ' + time);
				var seconds = parseInt(time.substr(0,2))*3600 + parseInt(time.substr(3,2))*60 + parseInt(time.substr(6,2));
				total_data = '';
				total_time = seconds;
			}

			if (data.toString().substr(0,5) == 'frame' || data.toString().substr(0,4) == 'size') {
				var time = data.toString().match(/time=(\d\d:\d\d:\d\d\.\d\d)/)[1];
				var seconds = parseInt(time.substr(0,2))*3600 + parseInt(time.substr(3,2))*60 + parseInt(time.substr(6,2));
				if (canceled === true) {
					current_download[vid].process.kill('SIGKILL');
					$('#progress_' + vid + ' a.cancelD').hide();
					$('#progress_' + vid + ' strong').html(_("Download canceled!"));
					fs.unlink(target, function(err) {
						if (err) {} else {
							console.log('successfully deleted ' + target);
						}
					});
					setTimeout(function() {
						pbar.hide()
					}, 5000);
				} else {
					var pct = Math.floor((seconds / total_time) * 100);
				//currentTime = (new Date()).getTime();
				//var transfer_speed = (e.loaded / (currentTime - startTime)).toFixed(2);
				var txt = pct + '% ' + _('done');
				$('#progress_' + vid + ' progress').attr('value', pct).text(txt);
				$('#progress_' + vid + ' strong').html(txt);
				if(pct == 100) {
					$('#progress_' + vid + ' strong').html(_('Download ended !'));
					if (title.match('.mp3') === null && !audio) {
						$('#progress_' + vid + ' a.convert').attr('alt', download_dir + '/' + title + '::' + vid).show();
					}
					$('#progress_' + vid + ' a.open_folder').show();
					$('#progress_' + vid + ' a.hide_bar').show();
					$('#progress_' + vid + ' a.cancelD').hide();
				}
			}
		}
	}
});

encoder.stderr.on('exit', function(data) {
	console.log('Encoding done: ' + data);
});
}



function convertTomp3Win(file) {
	var vid = file.split('::')[1];
	var title = file.split('::')[0];
	var pbar = $('#progress_' + vid);
	var target = title.substring(0, title.lastIndexOf('.')) + '.mp3';
	$('#progress_' + vid + ' strong').html(_("Converting video to mp3, please wait..."));
	var args = ['-y','-i', title, '-ab', '192k', target];
	if (process.platform === 'win32') {
		var ffmpeg = spawn(exec_path + '/ffmpeg.exe', args);
	} else {
		var ffmpeg = spawn(exec_path + '/ffmpeg', args);
	}
	console.log('Spawning ffmpeg ' + args.join(' ') + ' --- ffmpeg path:' + exec_path + '/ffmpeg');
	ffmpeg.on('exit', function() {
		console.log('ffmpeg exited');
		$('#progress_' + vid + ' strong').html(_("video converted successfully !"));
	});
	ffmpeg.stderr.on('data', function(data) {
		console.log('grep stderr: ' + data);
	});
}

var wipeTmpFolder = function() {
	var tmpDir2 = path.join(os.tmpDir(), 'torrent-stream');
	if( fs.existsSync(tmpDir2) ) {
		var tmpDir2 = path.join(os.tmpDir(), 'torrent-stream');
		rmdir( tmpDir2, function ( err, dirs, files ){
			console.log( 'file '+files+' removed' );
		});
	}

	if(process.platform == 'darwin'){
		rmdir('/tmp/torrent-stream', function ( err, dirs, files ){
			console.log( 'file '+files+' removed' );
		});
	}

	if( typeof tmpFolder != 'string' ){ return; }
	fs.readdir(tmpFolder, function(err, files){
		$.each(files,function(index,dir) {
			try {
				rmdir( tmpFolder+'/'+dir, function ( err, dirs, files ){
					console.log( 'file '+files+' removed' );
				});
			} catch(err) {
				console.log('can t remove file '+files)
			}
		});
	});
}

var cleanSubtitles = function() {
	fs.readdirSync(execDir+'/subtitles').forEach(function(fileName) {
        fs.unlinkSync(execDir+'/subtitles/'+fileName);
    });
}

function askSaveTorrent() {
	saveTorrent = false;
	torrentSaved = false;
	swal({title: _("Save torrent file?"),
		text: _("Save torrent file when download finished ?"),
		type: "info",
		showCancelButton: true,
		confirmButtonColor: "green",
		confirmButtonText: _("Yes"),
		cancelButtonText: _("No"),
		closeOnConfirm: false,
		closeOnCancel: true }, 
		function(isConfirm){   
			if (isConfirm) {
				saveTorrent = true;   
				swal("Ok!", _("Your torrent will be saved once download finished!"), "success");   
			}
		});
}

function stopTorrent(restart,data) {
	torrentPlaying = false;
	mediaCurrentTime = 0;
	mediaDuration = 0;
	mediaCurrentPct = 0;
	seekAsked = false;
	$('#downloadStats').empty();
	try {
		videoStreamer.deselect()
		videoStreamer.files.pop()
		videoStreamer.selection.forEach(function(sel){
			videoStreamer.selection.pop();
		})
		videoStreamer.swarm.destroy()
		videoStreamer.destroy();
		videoStreamer = null;
		wipeTmpFolder();
	} catch(err) {}
	if(torrentsArr.length > 0) {
		$.each(torrentsArr,function(index,torrent) {
			try {
				console.log("stopping torrent :" + torrent.name);
				var flix = torrent.obj;
				torrentsArr.pop(index,1);
				flix.destroy();
				delete flix;
				$('.mejs-time-loaded').width(0+'%');
			} catch(err) {
				console.log(err);
			}
		});
	}
	try {
		torrentPlaying = false;
		clearTimeout(statsUpdater);
		streamInfo = {};
		statsUpdater = null;
		playStarted = false;
	} catch(err) { 
		console.log(err)
		torrentPlaying = false;
	}

	player.currentTime = 0;
	player.current[0].style.width = 0;
	player.loaded[0].style.width = 0;
	player.durationD.html('00:00:00');
	$('.mejs-time-loaded').width(0+'%');
	$('.mejs-time-buffering').width(0+'%');
	$('.mejs-time-current').width(0+'%');
	$('.mejs-currenttime').text('00:00:00');
	$('.mejs-duration').text('00:00:00');
	$("#preloadTorrent").remove();
	$(".mejs-overlay").show();
	$(".mejs-layer").show();
	$(".mejs-overlay-loading").hide();
	if(restart) {
		getTorrent(data);
	}
}

// get user HOMEDIR
function getUserHome() {
	return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function getAuthTorrent(url,stream,toFbx,cover) {
	if(url.indexOf('magnet:?xt') !== -1) {
		if(stream) {
			if(cover){
				getTorrent(url,cover);
			} else {
				getTorrent(url);
			}
		} else {
			if(toFbx) {
				addFreeboxDownload(url);
			} else {
				gui.Shell.openItem(url);
			}
		}
	} else {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				var blob = this.response;
				var arrayBuffer;
				var fileReader = new FileReader();
				fileReader.onload = function() {
					arrayBuffer = this.result;
					var nodeBuffer = new Buffer(arrayBuffer,'binary');
					if(stream) {
						if(cover){
							getTorrent(nodeBuffer,cover);
						} else {
							getTorrent(nodeBuffer);
						}
					} else {
						var id = ((Math.random() * 1e6) | 0);
						var p = path.join(os.tmpDir(),''+id+'.torrent');
						fs.writeFile(p, nodeBuffer, function(err) {
							if (err) throw err;
							if(toFbx) {
								var FormData = require('form-data');
								var form = new FormData();
								form.append('download_file',fs.createReadStream(p));
								form.submit({
									host: 'mafreebox.freebox.fr',
									path: '/api/v3/downloads/add',
									headers: {'Content-Type': 'multipart/form-data;'+form.getBoundary(),
									'Content-Length': blob.size,
									'X-Requested-With':'XMLHttpRequest',
									'X-Fbx-App-Auth': session_token
								}
							}, function(err, res) {
								if(res.statusCode === 200) {
									$.notif({title: 'StreamStudio:',cls:'green',icon: '&#10003;',content:_("Téléchargement ajouté avec succès sur la freebox!"),btnId:'',btnTitle:'',btnColor:'',btnDisplay: 'none',updateDisplay:'none'});  
								} else {
									$.notif({title: 'StreamStudio:',cls:'red',icon: '&#59256;',timeout:0,content:_("Impossible d'ajouter le téléchargement... !"),btnId:'',btnTitle:'',btnColor:'',btnDisplay: '',updateDisplay:'none'});
								}
							});
							} else {
								gui.Shell.openItem(p);
							}
						});
					}
				}
				fileReader.readAsBinaryString(blob);
			}
		}
		xhr.open('GET', url);
		xhr.responseType = 'blob';
		xhr.send();
	}	
}

function dirTree(filename) {
	var stats = fs.lstatSync(filename),
	info = {
		path: filename,
		name: path.basename(filename)
	};
	if (stats.isDirectory()) {
		info.type = "folder";
		info.children = fs.readdirSync(filename).map(function(child) {
			return dirTree(filename + '/' + child);
		});
	} else {
		// Assuming it's a file. In real life it could be a symlink or
		// something else!
		info.type = "file";
	}
	return info;
}

function in_array(needle, haystack) {
	var found = 0;
	for (var i = 0, len = haystack.length; i < len; i++) {
		if (haystack[i] === needle) {
			return true;
		}
		found++;
	}
	return false;
}

function secondstotime(secs) {
	var t = new Date(1970, 0, 1);
	t.setSeconds(secs);
	var s = t.toTimeString().substr(0, 8);
	if (secs > 86399)
		s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
	return s;
}

function hmsToSecondsOnly(str) {
	var p = str.split(':'),
	s = 0, m = 1;
	while (p.length > 0) {
		s += m * parseInt(p.pop(), 10);
		m *= 60;
	}
	return s;
}

var decodeUri = function(uri) {
	if (uri.match(/\/%25\//) !== null) {
		uri = uri.replace(/\/%25\//g, '/');
	}
	if (uri.match(/%2525/) !== null) {
		uri = uri.replace(/%2525/g, '%');
	}
	if (uri.match(/%25/) !== null) {
		uri = uri.replace(/%25/g, '%');
	}
	// test double http
	if (uri.match(/http/g).length > 1) {
		uri = "http://" + uri.split('http').pop();
	}
	return encodeXML(uri);
}

var XMLEscape = {
	escape: function(string) {
		return this.xmlEscape(string);
	},
	unescape: function(string) {
		return this.xmlUnescape(string);
	},
	xmlEscape: function(string) {
		string = string.replace(/&/g, "&amp;");
		string = string.replace(/"/g, "&quot;");
		string = string.replace(/'/g, "&apos;");
		string = string.replace(/</g, "&lt;");
		string = string.replace(/>/g, "&gt;");
		return string;
	},
	xmlUnescape: function(string) {
		string = string.replace(/&amp;/g, "&");
		string = string.replace(/&quot;/g, "\"");
		string = string.replace(/&apos;/g, "'");
		string = string.replace(/&lt;/g, "<");
		string = string.replace(/&gt;/g, ">");
		return string;
	}
};

var decodeXML = function ( str ) {
	return str.replace(/&quot;/g, '"')
	.replace(/&\#39;/g, '\'')
	.replace(/&gt;/g, '>')
	.replace(/&lt;/g, '<')
	.replace(/&amp;/g, '&');
};

var encodeXML = function ( str ) {
	return str.replace(/&/g, '&amp;');         
};

//SET CURSOR POSITION
$.fn.setCursorPosition = function(pos) {
	this.each(function(index, elem) {
		if (elem.setSelectionRange) {
			elem.setSelectionRange(pos, pos);
		} else if (elem.createTextRange) {
			var range = elem.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	});
	return this;
};


function AnimateRotate(angle) {
	// caching the object for performance reasons
	$('#file_update span').text(_('Updating...'));
	var $elem = $('#update_img');

	// we use a pseudo object for the animation
	// (starts from `0` to `angle`), you can name it as you want
	$({
		deg: 0
	}).animate({
		deg: angle
	}, {
		duration: 2000,
		step: function(now) {
			// in the step-callback (that is fired each step of the animation),
			// you can use the `now` paramter which contains the current
			// animation-position (`0` up to `angle`)
			$elem.css({
				transform: 'rotate(' + now + 'deg)'
			});
			if (now === 1080) {
				$('#file_update span').text(_('Update files list...'));
			}
		}
	});
}

function bytesToSize(bytes, precision)
{	
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
