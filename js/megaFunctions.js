function downloadFileFromMega(title, link, key, fromMegacypter, length, stream) {
    initPlayer();
    if ($('.tabActiveHeader').attr('id') !== 'tabHeader_4') {
        $("#tabHeader_4").click();
    }
    var vid = ((Math.random() * 1e6) | 0);
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
    try {
        canceled = false;
        var opt = {};
        var val = $('#progress_' + vid + ' progress').attr('value');
        opt.link = link;
        opt.title = title;
        opt.vid = vid;
        var currentTime;
        var startTime = (new Date()).getTime();
        var target = download_dir + '/' + title + '.' + startTime;
        var file = fs.createWriteStream(target);
        var contentLength = length;
        if (fromMegacypter === true) {
            current_download[vid] = downloadFromMega(link, key, length);
            current_download[vid].pipe(file);
        } else {
            current_download[vid] = stream.download();
            current_download[vid].pipe(file);
        }
        pbar.show();
        $('#progress_' + vid + ' a.cancel').show();
        current_download[vid].on('data', function(chunk) {
            var bytesDone = file.bytesWritten;
            currentTime = (new Date()).getTime();
            var transfer_speed = (bytesDone / (currentTime - startTime)).toFixed(2);
            var newVal = bytesDone * 100 / contentLength;
            var txt = Math.floor(newVal) + '% ' + _('done at') + ' ' + transfer_speed + ' kb/s';
            $('#progress_' + vid + ' progress').attr('value', newVal).text(txt);
            $('#progress_' + vid + ' strong').html(txt);
        });
        current_download[vid].on('error', function(err) {
            console.log('error: ' + err);
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
            }
        });
        current_download[vid].on('end', function() {
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
                fs.rename(target, download_dir + '/' + title.replace(/  /g, ' '), function(err) {
                    if (err) {} else {
                        console.log('successfully renamed ' + download_dir + '/' + title);
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
    } catch (err) {
        console.log("downloadFileFromMega error: " + err);
    }
}

function downloadFromMega(link, key, size) {
    var id = ((Math.random() * 1e6) | 0);
    var m = new mega.File({
        downloadId: id,
        key: key
    });
    console.log(m,link,key)
    var stream = mega.decrypt(m.key);
    var r = request(link);
    r.pipe(stream);
    var i = 0;
    r.on('data', function(d) {
        i += d.length;
        stream.emit('progress', {
            bytesLoaded: i,
            bytesTotal: size
        })
    });
    r.on('end', function(d) {
        console.log("download end");
    });
    return stream
}
