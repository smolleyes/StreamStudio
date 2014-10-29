var VERSION = "1.3";

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var util = require('util');
var os = require('os');
var wrench = require('wrench');
var nodeip = require("node-ip");
var temp = require('temp');
var spawn = require('child_process').spawn;
var sudo = require('sudo');
var request = require('request');
var https = require('https');
var http = require('http');
var url = require('url');
var vidStreamer = require("vid-streamer");
var mega = require('mega');
var cp = require("child_process");
var exec = cp.exec;
var chdir = require('chdir');
var AdmZip = require('adm-zip');
var util = require('util');
var deviceType = require('ua-device-type');
var upnpServer = require("upnpserver");
var uuid = require('node-uuid');
var upnpClient = require('upnp-client');
var cli = new upnpClient();
var parseString = require('xml2js').parseString;
var __ = require('underscore');
var rmdir = require('rmdir');

//engines
var dailymotion = require('dailymotion');
var youtube = require('yt-streamer');

//localize
var i18n = require("i18n");
var _ = i18n.__;
var localeList = ['en', 'fr', 'es', 'gr','it'];
var locale = 'en';
var locale_changed = false;
var shares_changed = false;
var plugins_changed = false;

//globals vars
var execDir = path.dirname(process.execPath);
var online_version;
var pbar;
var updatePath;
var settings = {};
var storage = localStorage;
var isDownloading = false;
var valid_vid = 0;
var searchFilters = '';
var search_order = 'relevance';
var current_download = {};
var canceled = false;
var search_engine = 'youtube';
var total_pages = 0;
var pagination_init = false;
var current_channel_link = '';
var current_channel_engine = '';
var channelPagination = false;
var searchDate = 'today';
var videoArray = ["avi", "webm", "mp4", "flv", "mkv", "mpeg", "mp3", "mpg", "wmv", "wma", "mov", "wav", "ogg", "flac", "opus"];
current_search='';
var exec_path = execDir;
var pagination_init = false;
var activeTab = 1;
var confDir;
var extPlayerRunning = false;
//nw window
var gui = require('nw.gui');
var win = gui.Window.get();

//checks
var tmpFolder = path.join(os.tmpDir(), 'ht5Torrents');
if( ! fs.existsSync(tmpFolder) ) { fs.mkdir(tmpFolder); }

// get confdir
if (process.platform === 'win32') {
    var cdir = process.env.APPDATA+'/StreamStudio';
    confDir = cdir.replace(/\\/g,'//');
    if( ! fs.existsSync(confDir) ) { mkdirp(confDir); }
} else {
    confDir = getUserHome()+'/.config/StreamStudio';
    if( ! fs.existsSync(confDir) ) { mkdirp(confDir); }
}


// get user HOMEDIR
function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}
