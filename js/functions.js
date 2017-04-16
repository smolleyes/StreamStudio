var ytl = require('youtube-dl');
var __ = require('underscore');
var cloudscraper = require('cloudscraper');

function saveSettings() {
    localStorage.StdSettings = JSON.stringify(settings);
}

function openYtdlLink(link) {
    console.log(link)
    var options = ["-j"];
    $('#search').hide()
    $('#loading').show();
    ytl.getInfo(link,options,function(err, item){
        console.log(item)
        if(err || !item) {
            $('#items_container').empty()
            $('#search').show();
            $('#search_results').empty().html('<p>' + _("No results found") + '</p>').show();
            $('#loading').hide();
            return;
        }
        $('#items_container').empty()
        var count = 1;
        if($.isArray(item)) {
            __.each(item,function(data) {
                console.log(data)
                loadItem(data,count)
                count+=1;
            })
        } else {
            loadItem(item,count)
        }
    });
}

function loadItem(item, count) {
    console.log(item)
        var title = item.title;
        if(item.thumbnail) {
            var thumb = item.thumbnail.replace('/320','');
        } else {
            var thumb = execDir+'/images/movie.png';
        }
        var pid = generateUUID();
        var length = item.duration == 'NaN' ? _('Unknown') : item.duration;
        var filename = item._filename;
        var ext = item.ext || 'mp4';
        var views = item.view_count || ''
        if(item.formats) {
           var formats = item.formats;
        }

        $('#items_container').append('<div class="youtube_item" style="height:180px;" id="'+pid+'"> \
            <span class="optionsTop" style="display:none;"></span> \
            <div id="optionsTopInfos" style="display:none;"> \
               <span><i class="glyphicon glyphicon-eye-open"></i>'+_("Views:")+views+'</span> \
            </div> \
            <img src="' + thumb + '" class="video_thumbnail" /> \
            <div> \
                <img id="' + pid + '::ytdl" class="coverPlayImg start_video" style="display:none;margin: -75px 0 0 -100px;" /> \
            </div> \
            <span class="optionsBottom" style="display:none;bottom:50px;"></span> \
            <div id="optionsBottomInfos" style="display:none;bottom:50px;"> \
                <span><i class="glyphicon glyphicon-time"></i>'+length+'</span> \
                <div class="dropdown"> \
                    <a style="float:right;margin-top:-12px;" class="dropdown-toggle youtube_downloads" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
                    ' + _("Download") + ' \
                    <span class="caret"></span> \
                    </a> \
                    <ul class="dropdown-menu" role="menu" style="width:100%;max-height:80px;" id="youtube_entry_res_' + pid + '"> \
                    </ul> \
                </div> \
            </div> \
            <div><p style="margin-top:15px;"><a class="itemTitle" title="'+title+'"><b>' + title + '</b></a></p><div> \
        </div>').show();

        if(formats && formats.length > 0 ) {
            for (var i = 0; i < formats.length; i++) {
                try {
                    var resolution = formats[i].format_id.toLowerCase().match(/\d{3,4}p/) !== null ? formats[i].format_id.toLowerCase().match(/\d{3,4}p/) !== null: formats[i].format_id.toLowerCase() ;

                    if (resolution.toLowerCase().indexOf('hd') !== -1) {
                        resolution = '1080p';
                    } else if (formats[i].format.indexOf('1280x720') !== -1 || resolution.toLowerCase().indexOf('mp4_sq') !== -1) {
                        resolution = '720p';
                    } else if (resolution.toLowerCase().indexOf('sd') !== -1 || resolution.toLowerCase().indexOf('mp4_eq') !== -1) {
                        resolution = '480p';
                    } else if (resolution.toLowerCase().indexOf('hls_sq') !== -1 || resolution.toLowerCase().indexOf('mp4_mq') !== -1) {
                        resolution = '360p';
                    } else if (resolution.toLowerCase().indexOf('mobile') !== -1 || resolution.toLowerCase().indexOf('hls_lq') !== -1 || resolution.toLowerCase().indexOf('mp4_lq') !== -1) {
                        resolution = '240p';
                    }
                    var vlink = formats[i].url;
                    if (vlink === 'null' || vlink.toLowerCase().indexOf('rtmp') !== -1 || formats[i].ext !== 'flv' && formats[i].ext !== 'mp4' && formats[i].ext !== 'hls' && formats[i].ext !== 'webm' && formats[i].ext !== 'm3u8' && formats[i].ext !== 'mp3' && formats[i].ext !== 'aac') {
                        continue;
                    }
                    var container = formats[i].ext;
                } catch (err) {
                    continue;
                }
                $('#youtube_entry_res_' + pid).append('<li class="resolutions_container" style="width:auto;"><a class="video_link ytdlQualityLink" style="display:none;margin-left:10px;" href="' + vlink + ' " alt="' + resolution + '"><span>' + resolution + '</span></a><a href="' + vlink + '" alt="' + title + '.' + container + '::' + pid + '" title="' + _("Download") + '" class="download_file_https ytdlQualityLink">' + resolution + '</a></li>');
            }
        } else {
            try {
                    var resolution = item.format_id.toLowerCase().match(/\d{3,4}p/) !== null ? item.format_id.toLowerCase().match(/\d{3,4}p/) !== null: item.format_id.toLowerCase() ;
                    if (resolution.toLowerCase().indexOf('hd') !== -1) {
                        resolution = '1080p';
                    } else if (item.format.indexOf('1280x720') !== -1 || resolution.toLowerCase().indexOf('mp4_sq') !== -1) {
                        resolution = '720p';
                    } else if (resolution.toLowerCase().indexOf('sd') !== -1 || resolution.toLowerCase().indexOf('mp4_eq') !== -1) {
                        resolution = '480p';
                    } else if (resolution.toLowerCase().indexOf('hls_sq') !== -1 || resolution.toLowerCase().indexOf('mp4_mq') !== -1) {
                        resolution = '360p';
                    } else if (resolution.toLowerCase().indexOf('mobile') !== -1 || resolution.toLowerCase().indexOf('hls_lq') !== -1 || resolution.toLowerCase().indexOf('mp4_lq') !== -1) {
                        resolution = '240p';
                    }
                    var vlink = item.url;
                    if (vlink === 'null' || vlink.toLowerCase().indexOf('rtmp') !== -1 || item.ext !== 'mp4' && item.ext !== 'hls' && item.ext !== 'webm' && item.ext !== 'm3u8' && item.ext !== 'mp3' && item.ext !== 'aac') {
                        return;
                    }
                    var container = item.ext;
                } catch (err) {
                    console.log(err)
                }
                $('#youtube_entry_res_' + pid).append('<li class="resolutions_container" style="width:auto;"><a class="video_link ytdlQualityLink" style="display:none;margin-left:10px;" href="' + vlink + ' " alt="' + resolution + '"><span>' + resolution + '</span></a><a href="' + vlink + '" alt="' + title + '.' + container + '::' + pid + '" title="' + _("Download") + '" class="download_file_https ytdlQualityLink">' + resolution + '</a></li>');
        }
        if ($('#youtube_entry_res_' + pid + ' a.video_link').length === 0) {
            $('#youtube_entry_res_' + pid).parent().parent().remove();
        }

        if(item.webpage_url && item.webpage_url.indexOf('www.wat.tv') !== -1) {
            var st = spawn(livestreamerPath, ['--stream-url', item.webpage_url]);
            var out = '';
            st.stdout.on('data', function(data) {
                out = data.toString();
            });
            st.on('exit', function(code) {
                if (code == 0) {
                    if (out.indexOf('Available streams:') !== -1) {
                        $('#youtube_entry_res_' + pid).empty();
                        var list = out.replace('Available streams:', '').replace(/\(.*?\)/g, '').split(',');
                        console.log(list)
                        Iterator.iterate(list).forEach(function(quality) {
                            var quality = quality.trim();
                            if (quality !== 'audio') {
                                $('#youtube_entry_res_' + pid).append('<li class="resolutions_container" style="width:auto;"><a class="video_link ytdlQualityLink" style="display:none;margin-left:10px;" href="' + item.webpage_url + ' " alt="' + quality + '"><span>' + quality + '</span></a><a href="' + vlink + '" alt="' + title + '.' + container + '::' + pid + '" title="' + _("Download") + '" class="download_file_https ytdlQualityLink">' + quality + '</a></li>');
                            }
                        });
                    } else {
                        $.notif({
                            title: 'StreamStudio:',
                            cls: 'red',
                            icon: '&#59256;',
                            timeout: 0,
                            content: _("No streams found for this channel !"),
                            btnId: 'ok',
                            btnTitle: _('Ok'),
                            btnColor: 'black',
                            btnDisplay: 'block',
                            updateDisplay: 'none'
                        })
                        //$('#youtube_entry_res_' + pid).parent().parent().remove();
                    }
                } else {
                    console.log("livestreamer exit 1")
                    $('#youtube_entry_res_' + pid).parent().parent().remove();
                }
            });
        }

        $('#search').show();
        $('#search_results').empty().html('<p><strong>'+count+'</strong> ' + _("videos found") + '</p>').show();
        $('#items_container').show();
        $('#loading').hide();
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};

function showPopup(html, target, cb) {
    $.magnificPopup.open({
        items: {
            src: html + '<div><a href="#" class="mfp-close" style="position:absolute;top:0px;right:20px;font-size:24px;font-weight:bold;">X</a></div>'
        },
        type: 'inline',
        prependTo: $(target),
        callbacks: {
            open: function() {
                if (cb) {
                    return cb();
                }
            }
        },
        closeOnContentClick: false,
        closeOnBgClick: false,
        showCloseBtn: false
            // You may add options here, they're exactly the same as for $.fn.magnificPopup call
            // Note that some settings that rely on click event (like disableOn or midClick) will not work here
    }, 0);
}

var cleanSubTitles = function() {
    var dirPath = path.join(execDir, 'subtitles');
    try {
        var files = fs.readdirSync(dirPath)
    } catch (e) {
        return;
    }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = path.join(dirPath, files[i]);
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
        }
};

function scanSubTitles(dir) {
    try {
        var l = decodeURIComponent(dir.replace('file://', ''));
        if (l !== execDir + '/subtitles') {
            dir = path.dirname(l);
        }
        var list = dirTree(dir);
        var i = 1;
        $('#videoPlayer').empty();
        Iterator.iterate(list.children).forEach(function(item, index) {
            var ext = path.extname(item.path);
            if (item.type == "file" && ext == ".srt" || ext == ".vtt") {
                fs.createReadStream(item.path).pipe(fs.createWriteStream(execDir + '/subtitles/' + _("Track") + i + ext));
                $('#videoPlayer').append('<track kind="subtitles" src="subtitles/' + _("Track") + i + ext + '" srclang="' + _("Track") + i + '" label="' + path.basename(item.path) + '" />');
                i += 1;
            }
        });
        player.findTracks();
        Iterator.iterate(player.tracks).forEach(function(item, index) {
            player.loadTrack(index);
        });
        if ($('.mejs-captions-button').length == 0) {
            setTimeout(function() {
                player.buildtracks(player, player.controls, player.layers, player.media)
                launchPlay();
            }, 1000);
        } else {
            setTimeout(function() {
                launchPlay();
            }, 1000);
        }
    } catch (err) {
        console.log(err)
        launchPlay();
    }
}

function getLocalDb(dir, parent) {
    var fileList = [];
    fileList.push(dirTree(dir));
    loadPcFiles(fileList)
}

function loadPcFiles(list, mainParent) {
    $.each(list, function(index, dir) {
        var parent = Math.floor(Math.random() * 1000000);
        var obj = {
            "attr": {
                id: '' + parent + '_localSubNode',
                path: dir.path
            },
            "data": dir.name,
            "children": []
        }
        if (mainParent !== undefined) {
            $("#fileBrowserContent").jstree("create", $("#" + mainParent), "inside", obj, function() {}, true);
            loadchildrens(dir.children, parent, false);
        } else {
            $("#fileBrowserContent").jstree("create", $("#" + _("Local library") + "_rootnode"), "inside", obj, function() {}, true);
            loadchildrens(dir.children, parent, true);
        }
    });
}

function loadchildrens(childs, parent, close) {
    var html;
    if ((childs !== undefined) && (childs !== null) && (childs.length !== 0)) {
        $.each(childs.reverse(), function(index, child) {
            if (child.type === "file") {
                var id = Math.floor(Math.random() * 1000000);
                var ext = child.name.split('.').pop().toLowerCase();
                if (ext === 'webm' || ext === 'aac' ||  ext == '3gp' || ext === 'm4a' || ext === 'mp4' || ext === 'flac' || ext === 'wav' || ext === 'mpg' || ext === 'opus' || ext === 'avi' || ext === 'mpeg' || ext === 'mkv' || ext === 'mp3' || ext === 'ogg' || ext === 'mov') {
                    var obj = {
                        "attr": {
                            "id": id
                        },
                        "icon": "js/jstree/themes/default/movie_file.png",
                        "data": {
                            "title": child.name,
                            "attr": {
                                "id": id,
                                "parent": parent,
                                "link": "file://" + encodeURI(child.path),
                                "class": "localFile",
                                "dir": encodeURI(path.dirname(child.path)),
                                "title": child.name
                            }
                        }
                    }
                    $("#fileBrowserContent").jstree("create", $("#" + parent + "_localSubNode"), "inside", obj, function() {}, true);
                    $("#" + parent + "_localSubNode").addClass('loaded');
                    if (close) {
                        $("#fileBrowserContent").jstree('close_all');
                    }
                }
            } else {
                if (child.name !== "node_modules") {
                    var nid = Math.floor(Math.random() * 1000000);
                    var obj = {
                        "attr": {
                            id: '' + nid + '_localSubNode',
                            path: child.path,
                            class: "firstFolder"
                        },
                        "data": child.name,
                        "children": []
                    }
                    $("#fileBrowserContent").jstree("create", $("#" + parent + "_localSubNode"), "inside", obj, function() {}, true);
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

function downloadFileHttps(link, target, vid, toTorrent, fromYoutubeTrack) {
    if (activeTab !== 4 && toTorrent === undefined || toTorrent === false) {
        $("#downloads_tab").click();
    }
    var vid = ((Math.random() * 1e6) | 0);
    var title = target;
    try {
        title = sanitize(title.split('::')[0]);
    } catch (err) {}
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
    title = title.trim().replace(/\\|\//g, '_');
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
    current_download[vid].onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
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
                if (pct == 100) {
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

function downloadFFMpeg(link, title, vid, toTorrent, audio) {
    var child_process = require('child_process');
    var sys = require('sys');

    if (activeTab !== 4) {
        $("#downloads_tab").click();
    }
    var vlink = null;
    var alink = null;
    var vid = ((Math.random() * 1e6) | 0);
    console.log("download link :" + link)
    if(link.indexOf('m3u8') == -1) {
        if (!audio) {
            vlink = link.split('::')[0];
            try {
                alink = link.split('::')[1].replace('%20', '');
                if (alink.indexOf('videoplayback?') == -1) {
                    return downloadFileHttps(vlink, title, vid, toTorrent);
                }
            } catch (err) {
                return downloadFileHttps(vlink, title, vid, toTorrent);
            }
            var title = sanitize(title.split('::')[0].trim().replace(/\\|\//g, '_').replace('.webm', '.mkv'));
        } else {
            title = sanitize(title.replace('.mp4', '.mp3'));
        }
    } else {
        vlink = link;
    }
    title = sanitize(title);
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
    if (!audio && vlink && alink) {
        encoder = child_process.spawn(ffmpegPath, ['-y', '-i', vlink, '-i', alink, '-c:v', 'libx264', '-c:a', 'copy', '-f', 'matroska', target]);
    } else if (!audio && vlink && !alink) {
        encoder = child_process.spawn(ffmpegPath, ['-y', '-i', link, '-c:a', 'libmp3lame', '-c:v', 'libx264', '-preset', 'fast', target]);
    } else {
        encoder = child_process.spawn(ffmpegPath, ['-y', '-i', link, '-c:a', 'libmp3lame', '-b:a', '320k', target]);
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
                var time = total_data.toString().match(/Duration:\s(\d\d:\d\d:\d\d\.\d\d)/).toString().substring(10, 21);
                console.log('DATA: ' + total_data.toString());
                console.log('Time: ' + time);
                var seconds = parseInt(time.substr(0, 2)) * 3600 + parseInt(time.substr(3, 2)) * 60 + parseInt(time.substr(6, 2));
                total_data = '';
                total_time = seconds;
            }

            if (data.toString().substr(0, 5) == 'frame' ||  data.toString().substr(0, 4) == 'size') {
                var time = data.toString().match(/time=(\d\d:\d\d:\d\d\.\d\d)/)[1];
                var seconds = parseInt(time.substr(0, 2)) * 3600 + parseInt(time.substr(3, 2)) * 60 + parseInt(time.substr(6, 2));
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
                    if (pct == 100) {
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
    var args = ['-y', '-i', title, '-ab', '192k', target];
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
    if (fs.existsSync(tmpDir2)) {
        var tmpDir2 = path.join(os.tmpDir(), 'torrent-stream');
        rmdir(tmpDir2, function(err, dirs, files) {
            console.log('file ' + files + ' removed');
        });
    }

    if (process.platform == 'darwin') {
        rmdir('/tmp/torrent-stream', function(err, dirs, files) {
            console.log('file ' + files + ' removed');
        });
    }

    if (typeof tmpFolder != 'string') {
        return;
    }
    fs.readdir(tmpFolder, function(err, files) {
        $.each(files, function(index, dir) {
            try {
                rmdir(tmpFolder + '/' + dir, function(err, dirs, files) {
                    console.log('file ' + files + ' removed');
                });
            } catch (err) {
                console.log('can t remove file ' + files)
            }
        });
    });
}

var cleanSubtitles = function() {
    fs.readdirSync(execDir + '/subtitles').forEach(function(fileName) {
        fs.unlinkSync(execDir + '/subtitles/' + fileName);
    });
}

function askSaveTorrent() {
    saveTorrent = false;
    torrentSaved = false;
    swal({
            title: _("Save torrent file?"),
            text: _("Save torrent file when download finished ?"),
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "green",
            confirmButtonText: _("Yes"),
            cancelButtonText: _("No"),
            closeOnConfirm: false,
            closeOnCancel: true
        },
        function(isConfirm) {
            if (isConfirm) {
                saveTorrent = true;
                swal("Ok!", _("Your torrent will be saved once download finished!"), "success");
            }
        });
}

function stopTorrent(restart, data) {
    torrentPlaying = false;
    mediaCurrentTime = 0;
    mediaDuration = 0;
    mediaCurrentPct = 0;
    seekAsked = false;
    $('#downloadStats').empty();
    try {
        videoStreamer.deselect()
        videoStreamer.files.pop()
        videoStreamer.selection.forEach(function(sel) {
            videoStreamer.selection.pop();
        })
        videoStreamer.swarm.destroy()
        videoStreamer.destroy();
        videoStreamer = null;
        wipeTmpFolder();
    } catch (err) {}
    if (torrentsArr.length > 0) {
        $.each(torrentsArr, function(index, torrent) {
            try {
                console.log("stopping torrent :" + torrent.name);
                var flix = torrent.obj;
                torrentsArr.pop(index, 1);
                flix.destroy();
                delete flix;
                $('.mejs-time-loaded').width(0 + '%');
            } catch (err) {
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
    } catch (err) {
        console.log(err)
        torrentPlaying = false;
    }
    fromPlayList = false;

    player.currentTime = 0;
    player.current[0].style.width = 0;
    player.loaded[0].style.width = 0;
    player.durationD.html('00:00:00');
    $('.mejs-time-loaded').width(0 + '%');
    $('.mejs-time-buffering').width(0 + '%');
    $('.mejs-time-current').width(0 + '%');
    $('.mejs-currenttime').text('00:00:00');
    $('.mejs-duration').text('00:00:00');
    $("#preloadTorrent").remove();
    $(".mejs-overlay").show();
    $(".mejs-layer").show();
    $(".mejs-overlay-loading").hide();
    if (restart) {
        getTorrent(data);
    }
}

function changeTorrent(torrentInfo, stateModel, id) {
    $('#downloadStats').empty();
    try {
        videoStreamer.deselect()
        videoStreamer.swarm.destroy()
        wipeTmpFolder();
    } catch (err) {}
    if (torrentsArr.length > 0) {
        $.each(torrentsArr, function(index, torrent) {
            try {
                console.log("stopping torrent :" + torrent.name);
                var flix = torrent.obj;
                torrentsArr.pop(index, 1);
                flix.destroy();
                delete flix;
                $('.mejs-time-loaded').width(0 + '%');
            } catch (err) {
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
    } catch (err) {
        console.log(err)
        torrentPlaying = false;
    }
    loadTorrent(null, null, id, torrentInfo)
    fromPlayList = true;
}

// get user HOMEDIR
function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function getAuthTorrent(url, stream, toFbx, cover,fallback,tor2magnet) {
    $('.mejs-overlay-button,.mejs-overlay,.mejs-overlay-loading,.mejs-overlay-play').hide();
    var obj = JSON.parse(settings.ht5Player);
        if ((activeTab == 1 || activeTab == 2) && (search_engine === 'dailymotion' || search_engine === 'youtube' ||  engine.type == "video") && obj.name === "StreamStudio") {
            $('#playerToggle').click();
        }
        $('#preloadTorrent').remove();
        $('.mejs-container').append('<div id="preloadTorrent" \
          style="position: absolute;top: 45%;margin: 0 50%;color: white;font-size: 12px;text-align: center;z-index: 1002;width: 450px;right: 50%;left: -225px;"> \
          <p><b id="preloadProgress">' + _("Loading your torrent, please wait...") + '</b></p> \
          <div id="torrLoader">  \
          <div id="lemon"></div>  \
        <div id="straw"></div>  \
        <div id="glass">  \
            <div id="cubes">  \
                <div style="display:none;"></div>  \
                <div style="display:none;"></div>  \
                <div style="display:none;"></div>  \
            </div>  \
            <div id="drink"></div>  \
            <span id="counter"></span>  \
        </div>  \
        <div id="coaster"></div>  \
        </div> \
          <div id="peerStats"></div></div>');
    if(url.indexOf('t411') !== -1) {
        $.get('http://irc.t411.ch/ip/index.php',function(res) {
            var state = $($(res).find('tr:contains("tracker")').find('th')[2]).text()
            if(state !== "ON-LINE") {
                $('#tab a[href="#tabpage_1"]').click();
                t411.notif({
                    title: 'StreamStudio:',
                    cls: 'red',
                    icon: '&#59256;',
                    content: _("t411.ch Tracker DOWN !"),
                    btnId: '',
                    btnTitle: '',
                    btnColor: '',
                    btnDisplay: 'none',
                    updateDisplay: 'none',
                    timeout: 0
                });
                return;
            }
        })
    }
    if (url.indexOf('magnet:?xt') !== -1) {
        if (stream) {
            if (cover) {
                getTorrent(url, cover);
            } else {
                getTorrent(url);
            }
        } else {
            if (toFbx) {
                addFreeboxDownload(url);
            } else {
                gui.Shell.openItem(url);
            }
        }
    } else {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var blob = this.response;
                var arrayBuffer;
                var fileReader = new FileReader();
                fileReader.onload = function() {
                    arrayBuffer = this.result;
                    var nodeBuffer = new Buffer(arrayBuffer, 'binary');
                    if (stream) {
                        if (cover) {
                            getTorrent(nodeBuffer, cover);
                        } else {
                            getTorrent(nodeBuffer);
                        }
                    } else {
                        var id = ((Math.random() * 1e6) | 0);
                        var p = path.join(os.tmpDir(), '' + id + '.torrent');
                        fs.writeFile(p, nodeBuffer, function(err) {
                            if (err) throw err;
                            if (toFbx) {
                                var FormData = require('form-data');
                                var form = new FormData();
                                form.append('download_file', fs.createReadStream(p));
                                form.submit({
                                    host: 'mafreebox.freebox.fr',
                                    path: '/api/v3/downloads/add',
                                    headers: {
                                        'Content-Type': 'multipart/form-data;' + form.getBoundary(),
                                        'Content-Length': blob.size,
                                        'X-Requested-With': 'XMLHttpRequest',
                                        'X-Fbx-App-Auth': session_token
                                    }
                                }, function(err, res) {
                                    if (res.statusCode === 200) {
                                        $.notif({
                                            title: 'StreamStudio:',
                                            cls: 'green',
                                            icon: '&#10003;',
                                            content: _("Téléchargement ajouté avec succès sur la freebox!"),
                                            btnId: '',
                                            btnTitle: '',
                                            btnColor: '',
                                            btnDisplay: 'none',
                                            updateDisplay: 'none'
                                        });
                                    } else {
                                        $.notif({
                                            title: 'StreamStudio:',
                                            cls: 'red',
                                            icon: '&#59256;',
                                            timeout: 0,
                                            content: _("Impossible d'ajouter le téléchargement... !"),
                                            btnId: '',
                                            btnTitle: '',
                                            btnColor: '',
                                            btnDisplay: '',
                                            updateDisplay: 'none'
                                        });
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

function parseM3uFile(file) {
    var dirname = path.dirname(file.path);
    console.log(file,dirname)
    var parsers = require("playlist-parser");
    var M3U = parsers.M3U;
    var playlist = M3U.parse(fs.readFileSync(file.path, { encoding: "utf8" }));
    console.log(playlist)
    if(playlist && playlist.length > 0) {
        __.each(playlist,function(media) {
            var f = {}
            f.title = media.title;
            f.link = media.file;
            player.addTrack(f, true)
        })
    } else {
        swal(_("error!"), _("Can't read your playlist file or playlist empty !"), "error")
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
        s = 0,
        m = 1;
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

var decodeXML = function(str) {
    return str.replace(/&quot;/g, '"')
        .replace(/&\#39;/g, '\'')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
};

var encodeXML = function(str) {
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
