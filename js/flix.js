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
var pt = require('parse-torrent');

var totalBuffered = 0;

var statsUpdater = null;
var active = function(wire) {
    return !wire.peerChoking;
};

var stateModel = {};
stateModel.state = '';
var videoStreamer = null;
var maxTry = 90;
var numTry = 0;
var streamInfo = {};
var app = {};
var mediaCover = '';

// Minimum percentage to open video
var MIN_PERCENTAGE_LOADED = 0.5;
var STREAM_PORT = 21584; // 'PT'!
// Minimum bytes loaded to open video
var BUFFERING_SIZE = 10 * 1024 * 1024 / 2;

var playStarted = false;
var downloadedPct = 0;
var torrentSrc = '';
var torrentName = '';
var torrentInfo = {};


$(document).on('click', '.saveTorrentCheck', function() {
    if ($(this).prop('checked')) {
        saveTorrent = true;
    } else {
        saveTorrent = false;
    }
});

$(document).on('click', '.closePopup', function() {
    $.magnificPopup.close();
});

$(document).off('click', '.loadStreaming');
$(document).on('click', '.loadStreaming', function(evt) {
    evt.preventDefault();
    $.magnificPopup.close();
    var id = $(this).attr('data-id');
    handleTorrent(torrentInfo, stateModel, id);
});

$(document).off('click', '#closeMfp');
$(document).on('click', '#closeMfp', function(evt) {
    $.magnificPopup.close();
    $('#stopBtn').click();
    $('#tab a[href="#tabpage_' + activeTab + '"]').click();
});

function getTorrent(link, cover) {
    if (link.indexOf('magnet:?') !== -1) {
        var id = link.match('btih:(.*?)&')[1];
        $.get('https://getstrike.net/api/v2/torrents/download/?hash=' + id).done(function(res) {
            getTorrent(res.message, cover)
        }).fail(function() {
            loadTorrent(link,cover)
        });
    } else {
        loadTorrent(link,cover)
    }
}

function loadTorrent(link,cover) {
    initPlayer();
    stopTorrent();
    torrentInfo = {};
    if (cover) {
        mediaCover = cover;
    } else {
        mediaCover = '';
    }
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
    stateModel = {
        state: 'connecting',
        backdrop: '',
        numTry: 0
    };
    streamInfo = {};
    videoStreamer = null;
    statsUpdater = null;
    playStarted = false;
    downloadedPct = 0;
    startLoading();
    setTimeout(function() {
        rTorrent(link, function(err, torrent, raw) {
            if (err) {
                console.log(err);
                swal(_("Error!"), _("Can't get your torrent file, please retry!"), "error")
                $('#preloadTorrent').empty();
            } else {
                saveTorrent = false;
                torrentSaved = false;
                title = torrent.name;
                torrentInfo = {
                    info: raw,
                    title: title
                };
                try {
                    if (torrent.files.length > 1) {
                        analyseTorrent(torrent.files);
                    } else {
                        handleTorrent(torrentInfo, stateModel);
                    }
                } catch (err) {
                    handleTorrent(torrentInfo, stateModel);
                }
            }
        });
    }, 1000);
}


function analyseTorrent(list) {
    var files = [];
    var arr = ['nfo', 'txt', 'jpg', 'jpeg', 'png', 'pdf', 'html', 'torrent'];
    $.each(list, function(i, file) {
        if (arr.indexOf(file.name.split('.').pop()) !== -1) {
            if (i + 1 == list.length) {
                loadTable(files)
            }
            return true;
        } else {
            file.index = i;
            files.push(file);
            if (i + 1 == list.length) {
                loadTable(files)
            }
        }
    });
}

var watchState = function(stateModel) {
    if (videoStreamer != null) {
        var swarm = videoStreamer.swarm;
        var state = 'connecting';

        if (swarm.downloaded > BUFFERING_SIZE) {
            state = 'ready';
        } else if (swarm.downloaded) {
            state = 'downloading';
        } else if (swarm.wires.length) {
            state = 'startingDownload';
        }

        stateModel.state = state;
        stateModel.numTry += 1;
        if (state != 'ready') {
            ___.delay(watchState, 1000, stateModel);
        } else {
            clearTimeout(___.delay(watchState, 1000, stateModel));
        }
    }
};


app.updateStats = function(streamInfo) {
    $(".mejs-overlay-button").hide();
    var active = function(wire) {
        return !wire.peerChoking;
    };
    var swarm = streamInfo.swarm;

    var upload_speed = swarm.uploadSpeed(); // upload speed
    var final_upload_speed = '0 B/s';
    if (!isNaN(upload_speed) && upload_speed != 0) {
        var converted_speed = Math.floor(Math.log(upload_speed) / Math.log(1024));
        final_upload_speed = (upload_speed / Math.pow(1024, converted_speed)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][converted_speed] + '/s';
    }

    var download_speed = swarm.downloadSpeed(); // download speed
    var final_download_speed = '0 B/s';
    if (!isNaN(download_speed) && download_speed != 0) {
        var converted_speed = Math.floor(Math.log(download_speed) / Math.log(1024));
        final_download_speed = (download_speed / Math.pow(1024, converted_speed)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][converted_speed] + '/s';
    }

    this.downloaded = swarm.downloaded;
    this.active_peers = swarm.wires.filter(active).length;
    this.total_peers = swarm.wires.length;

    this.uploadSpeed = final_upload_speed; // variable for Upload Speed
    this.downloadSpeed = final_download_speed; // variable for Download Speed

    this.downloaded = (swarm.downloaded) ? swarm.downloaded : 0;
    this.percent = parseInt(swarm.downloaded / (BUFFERING_SIZE / 100)).toFixed(2);
    if (stateModel.state != 'ready') {
        if (stateModel.state === 'connecting') {
            if (parseInt(stateModel.numTry) >= 90) {
                setTimeout(function() {
                    $('#preloadProgress').empty().append(_('Corrupted torrent or no seeders, can\'t open your torrent file'));
                }, 5000);
                clearTimeout(statsUpdater);
                return;
            } else {
                $('#preloadProgress').empty().append(_('Connecting... please wait (test %s/%s)', stateModel.numTry, maxTry));
            }
        } else if (stateModel.state === 'downloading' ||  stateModel.state === 'startingDownload') {
            //$('#preloadProgress').empty().append(_("Analysing your torrent, please wait..."));
            stateModel.state = 'ready';
            if (parseInt(this.percent) > 0) {
                increment(this.percent);
                $('#preloadProgress').empty().append(_('Downloading %s%% done at %s', this.percent, this.downloadSpeed));
                $('#peerStats').empty().append(_('%s / %s connected peers', this.active_peers, this.total_peers));
            }
        }
    } else {
        if (playStarted === false) {
            playStarted = true;
            $('#preloadTorrent').remove();
            var stream = {};
            try {
                stream.link = 'http://' + ipaddress + ':' + videoStreamer.server.address().port + '/&torrent';
            } catch (err) {}
            stream.next = '';
            stream.title = streamInfo.server.index.name;
            if (mediaCover !== '') {
                stream.cover = mediaCover;
            }
            if (sdb.find({
                "title": itemTitle
            }).length == 0) {
                sdb.insert({
                    "title": itemTitle
                }, function(err, result) {
                    if (!err) {
                        console.log(itemTitle + ' successfully added to database!');
                    } else {
                        console.log(err);
                    }
                })
            } else if (sdb.find({
                "title": stream.title
            }).length == 0) {
                sdb.insert({
                    "title": stream.title
                }, function(err, result) {
                    if (!err) {
                        console.log(stream.title + ' successfully added to database!');
                    } else {
                        console.log(err);
                    }
                })
            }
            //clearTimeout(statsUpdater);
            try {
                $('#fbxMsg2').remove();
            } catch (err) {}
            $('.mejs-container').append('<div id="fbxMsg2" class="preloadingMsg" style="height:calc(100% - 60px);"><div style="top:62%;position: relative;"><p style="font-weight:bold;text-align: center;">' + _("Please wait while loading your video... (Can take a few seconds)") + '</p></div></div>');
            startPlay(stream);
        } else {
            torrentSrc = videoStreamer.path;
            torrentName = videoStreamer.server.index.name;
            try {
                downloadedPct = (swarm.downloaded / streamInfo.server.index.length * 100).toFixed(2);
            } catch (err) {
                return;
            }
            if (parseInt(downloadedPct) >= 100) {
                var t = _('(%s%% downloaded)', 100);
                $("#song-title").empty().text(_('Playing: ') + torrentName + " " + t);
                if (saveTorrent && !torrentSaved) {
                    saveToDisk(torrentSrc, torrentName);
                    torrentSaved = true;
                    saveTorrent = false;
                }
                $('#downloadStats').empty();
                clearTimeout(statsUpdater);
                statsUpdater = null;
            } else {
                $('#downloadStats').empty().html('<span style="margin:0 5px;">' + _("Speed:") + '</span><i class="arrow down"></i>' + this.downloadSpeed + ' <i class="arrow up"></i>' + this.uploadSpeed + '<span style="padding:5px;">| ' + _("Connected peers: ") + this.active_peers + ' / ' + this.total_peers + '</span>');
                var t = _('(%s%% downloaded)', downloadedPct);
                if (player.media.paused) {
                    totalBuffered = swarm.downloaded;
                    totalBytes = streamInfo.server.index.length;
                } else {
                    totalBuffered = 0;
                    totalBytes = 0;
                }
                if (upnpToggleOn && upnpMediaPlaying && !upnpStoppedAsked) {
                    $('.mejs-time-loaded').width(downloadedPct + '%')
                }
                $("#song-title").empty().text(_('Playing: ') + torrentName + " " + t);
            }
        }
    }

};

function saveToDisk(src, name) {
    try {
        if (name !== '') {
            fs.remove(download_dir + '/' + name, function(err) {
                fs.copy(src, download_dir, function(err) {
                    if (err) {
                        console.log(err, src, name)
                        $.notif({
                            title: 'StreamStudio:',
                            cls: 'red',
                            icon: '&#59256;',
                            timeout: 5000,
                            content: _("Can't save torrent to your download dir, error: %s", err),
                            btnId: '',
                            btnTitle: '',
                            btnColor: '',
                            btnDisplay: 'none',
                            updateDisplay: 'none'
                        })
                    } else {
                        $.notif({
                            title: 'StreamStudio:',
                            cls: 'green',
                            icon: '&#10003;',
                            timeout: 5000,
                            content: _('Torrent successfully saved to your ht5 download directory !'),
                            btnId: '',
                            btnTitle: '',
                            btnColor: '',
                            btnDisplay: 'none',
                            updateDisplay: 'none'
                        })
                    }
                });
            });
        } else {
            $.notif({
                title: 'StreamStudio:',
                cls: 'red',
                icon: '&#59256;',
                timeout: 5000,
                content: _("Can't save torrent to your download dir, error: %s", err),
                btnId: '',
                btnTitle: '',
                btnColor: '',
                btnDisplay: 'none',
                updateDisplay: 'none'
            })
        }
    } catch (err) {
        fs.copy(src, download_dir, function(err) {
            if (err) {
                console.log(err, src, name)
                $.notif({
                    title: 'StreamStudio:',
                    cls: 'red',
                    icon: '&#59256;',
                    timeout: 5000,
                    content: _("Can't save torrent to your download dir, error: %s", err),
                    btnId: '',
                    btnTitle: '',
                    btnColor: '',
                    btnDisplay: 'none',
                    updateDisplay: 'none'
                })
            } else {
                $.notif({
                    title: 'StreamStudio:',
                    cls: 'green',
                    icon: '&#10003;',
                    timeout: 5000,
                    content: _('Torrent successfully saved to your ht5 download directory !'),
                    btnId: '',
                    btnTitle: '',
                    btnColor: '',
                    btnDisplay: 'none',
                    updateDisplay: 'none'
                })
            }
        });
    }
}

function handleTorrent(torrent, stateModel, id) {
    $('#preloadTorrent').remove();
    $('.mejs-container').append('<div id="preloadTorrent" \
          style="position: absolute;top: 45%;margin: 0 50%;color: white;font-size: 12px;text-align: center;z-index: 1002;width: 400px;right: 50%;left: -200px;"> \
          <p><b id="preloadProgress"></b></p> \
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

    temp.mkdir(function(err, path) {
        if (err) {
            alert("can t create temp dir, please report the problem!")
        } else {
            tmpFolder = path;
        }
        if (typeof id !== "undefined") {
            videoStreamer = peerflix(torrent.info, {
                connections: 150,
                path: tmpFolder,
                index: parseInt(id),
                analysed: true
            });
        } else {
            videoStreamer = peerflix(torrent.info, {
                connections: 150,
                path: tmpFolder,
                gui: win.window,
                analysed: false
            });
        }

        streamInfo = new app.updateStats(videoStreamer);
        statsUpdater = setInterval(___.bind(app.updateStats, streamInfo, videoStreamer), 1000);
        stateModel.streamInfo = streamInfo;
        watchState(stateModel);

        var checkReady = function() {
            if (stateModel.state === 'ready') {
                // we need subtitle in the player
                streamInfo.title = torrent.title;
                stateModel.state = 'ready';
                try {
                    stateModel.destroy();
                } catch (err) {}
            }
        };

        videoStreamer.server.on('listening', function() {
            if (!videoStreamer || videoStreamer == null) {
                return;
            }
            torrentPlaying = true;
            streamInfo.src = 'http://' + ipaddress + ':' + videoStreamer.server.address().port + '/';
            streamInfo.type = 'video/mp4';
            var item = {};
            try {
                item.name = videoStreamer.server.index.name;
            } catch (err) {}
            item.obj = videoStreamer;
            torrentsArr.push(item);
            console.log('peerrlifx listening on http://' + ipaddress + ':' + videoStreamer.server.address().port + '/')
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
    });
}


function loadTable(files) {
    var html = '<div style="margin-top:50px;" class="panel panel-default"><div class="panel-heading"><h3 class="panel-title">' + _("Select the file to open...") + '</h3><a id="closeMfp" href="#" style="position:absolute;right:15px;top:60px;font-weight:bold;">X</a></div><div class="panel-body"><table class="table table-stripped table-hover table-bordered table-responsive"><thead><tr><th data-field="name">' + _("Name") + '</th><th data-field="viewed">' + _("Status") + '</th><th data-field="size">' + _("Size") + '</th></tr></thead><tbody>';
    $('#preloadTorrent').empty().remove();
    $('#fbxMsg2').remove();
    var list = ___.sortBy(files, function(obj) {
        return obj.name.toLowerCase().match(/s\d{1,2}e\d{1,2}/);
    });
    $.each(list, function(i, file) {
        var c = sdb.find({
            "title": file.name
        });
        var viewed = c.length > 0 ? 'block' : 'none';
        var watched = c.length > 0 ? _("already watched") : _("Not seen");
        html += '<tr><td><a href="#" class="loadStreaming" data-id="' + file.index + '">' + file.name + '</a></td><td><span><i style="display:' + viewed + ';line-height: 23px;margin-right:5px;float:left;" class="glyphicon glyphicon-eye-open"></i>' + watched + '</span></td><td> ' + bytesToSize(file.length, 2) + '</td></tr>';
        if (i + 1 == list.length) {
            $('#fbxMsg2').remove();
            html += '</tbody></table></div></div>';
            $.magnificPopup.open({
                items: {
                    src: html
                },
                type: 'inline',
                prependTo: $('.mejs-container'),
                closeOnContentClick: false
                // You may add options here, they're exactly the same as for $.fn.magnificPopup call
                // Note that some settings that rely on click event (like disableOn or midClick) will not work here
            }, 0);
            if ($('.loadStreaming').length == 1) {
                $('.loadStreaming').click();
            }
        }
    })
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

var worker = null;
var loaded = 0;

function increment(pct) {
    var loaded = parseInt(pct);
    $('#counter').html(loaded + '%');
    $('#drink').css('top', (100 - loaded * .9) + '%');
    if (loaded > 100) return;
    if (loaded > 25 && $('#cubes div:nth-child(1)').is(':hidden')) {
        $('#cubes div:nth-child(1)').show();
    }
    if (loaded > 50 && $('#cubes div:nth-child(2)').is(':hidden')) {
        $('#cubes div:nth-child(2)').show();
    }
    if (loaded > 75 && $('#cubes div:nth-child(3)').is(':hidden')) {
        $('#cubes div:nth-child(3)').show();
    }
    if (loaded > 95 && $('#lemon').is(':hidden')) {
        $('#lemon').show();
        $('#straw').show();
        loaded = 0;
    }
}

function startLoading() {
    $('#lemon').hide();
    $('#straw').hide();
    $('#cubes div').hide();
}