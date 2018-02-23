// Copyright (C)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

//nw window
var gui = require('nw.gui');
console.log(gui)
var win = gui.Window.get();
var nodeip = require('ip')
var path = require('path');
const torrentSearch = require('torrent-search-api');
const torrentEngine = new torrentSearch();
process.execPath = path.dirname(process.mainModule.filename);
// create default settings or load from localstorage
if (localStorage.StdSettings === undefined) {
	settings.ipaddress = nodeip.address();
	settings.version = VERSION;
	settings.download_dir = "";
	settings.shared_dirs = [];
	settings.locale = "en";
	settings.subLanguage = "en";
	settings.resolution = "720p";
	settings.os = getOsType();
	settings.collections=[{"name":"Library","parent":""}];
	settings.selectedDir="";
	settings.plugins=[];
	settings.init=false;
	settings.transcoding=false;
	settings.defaultWidth = Math.round(window.screen.availWidth * 0.8);
	settings.defaultHeight = Math.round(window.screen.availHeight * 0.8);
	settings.StreamStudioPlayer = {"name":"StreamStudio","path":""};
	settings.torrentEnginesEnabled = false;
	localStorage.StdSettings = JSON.stringify(settings);
}

// load settings
settings = JSON.parse(localStorage.StdSettings);
ipaddress = settings.ipaddress;
selected_resolution = settings.resolution;
download_dir = settings.download_dir;
locale = settings.locale;

// check torrentSearchApi object
if(!settings.hasOwnProperty('torrentEngines')) {
	settings.torrentEnginesEnabled = false;
	settings.torrentEngines = {
		"Torrent9" : {
			public: true,
			enabled: false
		},
		"Yggtorrent" : {
			public: false,
			enabled: false,
			login: "",
			password: "",
			initialized: false
		},
		"Torrentz2" : {
			public: true,
			enabled: false
		},
		"1337x" : {
			public: true,
			enabled: false
		},
		"Rarbg" : {
			public: true,
			enabled: false
		}
	}
	saveSettings()
}

// check transcoding
if(settings.transcoding) {
	transcoderEnabled = true;
} else {
	transcoderEnabled = false;
}

// locale code (for youtube)
var localeCode = 'US';
if (settings.locale === 'fr') {
	localeCode = 'FR';
}

// check stored VERSION and update if necessary
if(settings.version !== VERSION) {
	settings.version = VERSION;
	storage.StdSettings = JSON.stringify(settings);
}

// get confdir
if (process.platform === 'win32') {
    var cdir = process.env.APPDATA+'/StreamStudio';
    confDir = cdir.replace(/\\/g,'//');
} else {
    confDir = getUserHome()+'/.config/StreamStudio';
}

// setup locale
function setLocale() {
	i18n.configure({
		defaultLocale: 'en',
		locales:localeList,
		directory: execDir + '/locales',
		updateFiles: true
	});
	if ($.inArray(settings.locale, localeList) >-1) {
		locale=settings.locale;
		i18n.setLocale(locale);
	} else {
		i18n.setLocale('en');
	}
}

//get os type
function getOsType() {
    var arch = process.arch;
    if (process.platform === 'win32') {
        return 'windows';
    } else if (process.platform === 'darwin') {
       return 'mac';
    } else {
        if (arch === 'ia32') {
            return 'linux-32';
        } else if (arch === 'x64') {
            return 'linux-64';
        }
    }
}

// get user HOMEDIR
function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

var ScreenResolution = {
	get SD() {
		return window.screen.width < 1280 || window.screen.height < 720;
	},
	get HD() {
		return window.screen.width >= 1280 && window.screen.width < 1920 || window.screen.height >= 720 && window.screen.height < 1080;
	},
	get FullHD() {
		return window.screen.width >= 1920 && window.screen.width < 2000 || window.screen.height >= 1080 && window.screen.height < 1600;
	},
	get UltraHD() {
		return window.screen.width >= 2000 || window.screen.height >= 1600;
	},
	get QuadHD() {
		return window.screen.width >= 3000 || window.screen.height >= 1800;
	},
	get Standard() {
		return window.devicePixelRatio <= 1;
	},
	get Retina() {
		return window.devicePixelRatio > 1;
	}
};

// code from popcorn time (popcorntime.io)
function setResolution() {
    var zoom = 0;
    var screen = window.screen;

    if (ScreenResolution.QuadHD) {
        zoom = 2;
    } else if (ScreenResolution.UltraHD || ScreenResolution.Retina) {
        zoom = 1;
    }

    var width = localStorage.width ? localStorage.width : settings.defaultWidth;
    var height = localStorage.height ? localStorage.height : settings.defaultHeight;
    var x = localStorage.posX ? localStorage.posX : Math.round((screen.availWidth - settings.defaultWidth) / 2);
    var y = localStorage.posY ? localStorage.posY : Math.round((screen.availHeight - settings.defaultHeight) / 2);

    win.zoomLevel = zoom;
    win.resizeTo(width, height);
    win.moveTo(x, y);
}


//start
setLocale();
setResolution();
