var VERSION = "2.4";

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var util = require('util');
var os = require('os');
var wrench = require('wrench');
var nodeip = require("node-ip");
var temp = require('fs-temp');
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
var psnode = require('ps-node');
var Iterator = require('iterator').Iterator;
var sanitize = require("sanitize-filename");
var events = require("events");
var EventEmitter = require("events").EventEmitter;
// set custom events
var updateTimer = new EventEmitter();
updateTimer.on("timeupdate", function () {
    updateProgressBar()
});

var Jq = $;
//engines
var dailymotion = require('dailymotion');
var youtube = require('yt-streamer');

//localize
var i18n = require("i18n");
var _ = i18n.__;
var localeList = ['en', 'fr', 'es', 'gr','it','de'];
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
var searchDuration = '';
var videoArray = ["avi", "webm", "mp4", "flv", "mkv", "mpeg", "mp3", "mpg", "wmv", "wma", "mov", "wav", "ogg", "flac", "opus"];
current_search='';
var exec_path = execDir;
var pagination_init = false;
var activeTab = 1;
var confDir;
var extPlayerRunning = false;
var cPreloaderTimeout = false;
var spinnerPlay = false;
var itemTitle = '';
var scrollObserver;
var updateLazy = true;
var livestreamerPath = "";
var itemsCount = 0;
var pageLoading = false;
var totalResults = 0;
var ffmpegPath;
var ytId='';
var upnpContinuePlay = true;
var play_next = false;
var play_prev = false;
var ffmpegLive = false;
var enginesList = [];
var saveTorrent = false;
var torrentSaved = false;
var upnpTranscoding = false;
var mediaCurrentTime = 0;
var mediaCurrentPct = 0;
var seekAsked = false;
var playerBarsLocked = false;
var mediaRendererType = 'upnp';
var ytSearchType = 'search';
//storedb
var sdb = storedb('std');
var seriesDb = storedb('seriesDb');
var moviesDb = storedb('moviesDb');
var seriesUpdated = false;
var chromecastPlaying = false;

//checks
temp.mkdir(function(err,path){
	if(err) {
		alert("can t create temp dir, please report the problem!")
	} else {
		tmpFolder = path;
	}
});

// get confdir
if (process.platform === 'win32') {
    var cdir = process.env.APPDATA+'/StreamStudio';
    confDir = cdir.replace(/\\/g,'//');
    if( ! fs.existsSync(confDir) ) { mkdirp(confDir); }
    if( ! fs.existsSync(confDir+'//images') ) { mkdirp(confDir+'//images'); }
    livestreamerPath = execDir+'/livestreamer/livestreamer.exe';
    ffmpegPath = execDir + '/ffmpeg.exe';
    
} else if (process.platform === 'linux' || process.platform === 'darwin') {
    confDir = getUserHome()+'/.config/StreamStudio';
    ffmpegPath = execDir + '/ffmpeg';
    if( ! fs.existsSync(confDir) ) { mkdirp(confDir); }
    if( ! fs.existsSync(confDir+'/images') ) { mkdirp(confDir+'/images'); }
    // livestreamer
    fs.exists('/usr/bin/livestreamer',function(res) {
		if(res) {
			livestreamerPath = "/usr/bin/livestreamer";
		} else {
			fs.exists('/usr/local/bin/livestreamer',function(res) { 
				if(res) {
					livestreamerPath = "/usr/local/bin/livestreamer";
				} else {
					console.log('livestreamer not found ! ')
				}
			})
		}
	})
}


// get user HOMEDIR
function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}
