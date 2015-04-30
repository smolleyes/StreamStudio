//~ Copyright (C) Laguillaumie sylvain
//
//~ This program is free software; you can redistribute it and/or
//~ modify it under the terms of the GNU General Public License
//~ as published by the Free Software Foundation; either version 2
//~ of the License, or (at your option) any later version.
//~ 
//~ This program is distributed in the hope that it will be useful,
//~ but WITHOUT ANY WARRANTY; without even the implied warranty of
//~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//~ GNU General Public License for more details.
//~ 
//~ You should have received a copy of the GNU General Public License
//~ along with this program; if not, write to the Free Software
//~ Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

var clipboard = gui.Clipboard.get();
var activElement = null;

$(document).ready(function() {
	$.event.special.rightclick = {
		bindType: "contextmenu",
		delegateType: "contextmenu"
	};
  $(document).on("rightclick", "body, #video_search_query", function(e) {
  		try {
  			activElement = document.activeElement.id;
  		} catch(err) {}
        var text = clipboard.get('text');
        $('#custom-menu ol').empty();
        if (text.indexOf('mega.co.nz') !== -1) {
            $('#custom-menu ol').empty().append('<li><a id="mega_link" href="#" alt="'+text+'" class="btn btn-default ">'+_("Open mega link")+'</a></li>');
        } else if (text.indexOf('torrent') !== -1 && text.indexOf('magnet:?xt') === -1){
            $('#custom-menu ol').empty().append('<li><a id="torrent_link" href="#" alt="'+text+'" class="btn btn-default ">'+_("Open Torrent")+'</a></li>');
        } else if (text.indexOf('magnet:?xt') !== -1){
            $('#custom-menu ol').empty().append('<li><a id="magnet_link" href="#" alt="'+text+'" class="btn btn-default ">'+_("Open Magnet")+'</a></li>');
        } else {
			if(text !== '' && decodeURIComponent(text).match(/^(http|https)/) !== null && decodeURIComponent(text).indexOf('youtu') == -1) {
				$('#custom-menu ol').empty().append('<li><a id="external_link" href="#" alt="'+decodeURIComponent(text)+'" class="btn btn-default ">'+_("Open external link")+'</a></li>');
			}
		}
		if(clipboard.get('text').trim() !== "" && $('#'+activElement).is("input[type=text]")) {
			$('#custom-menu ol').empty().append('<li><a id="paste_link" href="#" alt="'+decodeURIComponent(text)+'" class="btn btn-default ">'+_("Paste")+'</a></li>');
		}
  });
	$(document).on("rightclick", ".coverPlayImg", function(e) {
		var vid = $(this).closest('.youtube_item').attr('id');
		var title = $(this).closest('.youtube_item').find('.itemTitle').text();
		if (vid === '') {return;}
		try {
			$('#copy_link').parent().remove();
			$('#save_link').parent().remove();
			if (search_engine === 'youtube') {
				var link = "http://www.youtube.com/watch?v="+vid;
				var engine='youtube';
				$('#custom-menu ol').append('<li><a id="copy_link" href="#" alt="'+vid+'::'+title+'::'+link+'::'+engine+'" class="btn btn-default ">'+_("Copy youtube link")+'</a></li>');
				//$('#custom-menu ol').append('<li><a id="save_link" href="#" alt="'+vid+'::'+title+'::'+link+'::'+engine+'" class="btn btn-default ">'+_("Save to playlist")+'</a></li>');
			} else if (search_engine === 'dailymotion') {
				var link = "http://www.dailymotion.com/video/"+vid;
				var engine='dailymotion';
				$('#custom-menu ol').append('<li><a id="copy_link" href="#" alt="'+vid+'::'+title+'::'+link+'::'+engine+'" class="btn btn-default ">'+_("Copy dailymotion link")+'</a></li>');
				//$('#custom-menu ol').append('<li><a id="save_link" href="#" alt="'+vid+'::'+title+'::'+link+'::'+engine+'" class="btn btn-default ">'+_("Save to playlist")+'</a></li>');
			}
		} catch(err) {
			console.log("can't detect link to copy..." + err);
		}
		showContextMenu(e);
		return false;
	});
    //custom context menu
    try {
		$(document).bind("contextmenu", function(e) {
			e.preventDefault();
			try {
  				activElement = document.activeElement.id;
  			} catch(err) {}
			$('#copy_link').parent().remove();
			$('#copy').parent().remove();
			$('#paste_ytlink').parent().remove();
			var ytlink = getYtlinkFromClipboard();
			var textStr = getSelectedText();
			if (textStr !== null) {
				$('#custom-menu ol').append('<li><a id="copy" href="#" class="btn btn-default ">'+_("Copy")+'</a></li>');
			}
			if ((search_engine === 'youtube') && ytlink !== null) {
				$('#custom-menu ol').append('<li><a id="paste_ytlink" href="#" class="btn btn-default ">'+_("Paste/Open youtube link")+'</a></li>');
			}
			if ($('#custom-menu li').length === 0 ) {
				return;
			} else {
				showContextMenu(e);
			}
			return false;
		});
		
		$('#custom-menu').click(function() {
			$('#custom-menu').slideUp();
		});
		$(document).click(function() {
			$('#custom-menu').slideUp();
		});
	} catch (err) {
		console.log(err);
	}
	//copy to clipboard
	$(document).on('click','#copy',function() {
		clipboard.clear();
		var text = getSelectedText();
		if (text !== null) {
			clipboard.set(''+text+'','text');
			$('#custom-menu').slideUp();
		}
    });
    //paste from clipboard
	$(document).on('click','#paste_link',function() {
		var text = clipboard.get('text').trim();
		if (text !== null) {
			if($('#'+activElement).is("input")){
				$('#'+activElement).val(text);
			} else {
				$('#'+activElement).empty().append(text);
			}
			$('#custom-menu').slideUp();
		}
    });
    // paste yt link
    $(document).on('click','#paste_ytlink',function(e) {
		e.preventDefault();
		var ytlink = clipboard.get('text');
		var obj = JSON.parse(settings.ht5Player);
		var ext = false;
		if(obj.name !== 'StreamStudio'){
			ext = true;
		}
		console.log(ytlink)
		try {
			vid = ytlink.match(/.*v=(.*)?&/)[1]
		} catch(err) {
			try {
				vid = ytlink.match(/.*v=(.*)/)[1];
			} catch(err) {
				try {
					vid = ytlink.match(/.*youtu.be\/(.*)/)[1];
				} catch(err) {
					return null;
				}
			}
		}
		console.log(vid)
		youtube.getVideoInfos('https://www.youtube.com/watch?v='+vid,0,1,upnpToggleOn,ext,settings,function(datas) {
			printYtVideoInfos(datas[25], true, false, '', 'youtube');
			console.log($("#"+vid))
			$("#"+vid).find('.start_video').click();
		});
		$('#custom-menu').slideUp();
	});
  // open mega link
	$(document).on('click','#mega_link',function(e) {
		e.preventDefault();
		var vlink = $(this).attr('alt');
    f={}
    f.link='http://'+ipaddress+':8887/?file='+encodeURIComponent(vlink);
    f.title='';
    startPlay(f);
		$('#custom-menu').slideUp();
	});
  // open torrent link
	$(document).on('click','#torrent_link',function(e) {
		e.preventDefault();
		var vlink = $(this).attr('alt');
    if(vlink.indexOf('file://') !== -1) {
      vlink = decodeURIComponent(vlink).replace("file://",'');
    }
    getAuthTorrent(vlink,true,false)
		$('#custom-menu').slideUp();
	});
  // open torrent magnet
	$(document).on('click','#magnet_link',function(e) {
		e.preventDefault();
		var vlink = $(this).attr('alt');
    console.log(vlink);
    getTorrent(vlink);
		$('#custom-menu').slideUp();
	});
	// open external link
	$(document).on('click','#external_link',function(e) {
		e.preventDefault();
		var vlink = $(this).attr('alt');
		console.log(vlink);
		var media = {};
		media.link = 'http://'+ipaddress+':8887/?file='+vlink+'&external';
		media.title = vlink.split('/').pop();
		startPlay(media);
		$('#custom-menu').slideUp();
	});

	// copy link
	$(document).on('click','#copy_link',function(e) {
		e.preventDefault();
		clipboard.clear();
		var text = $(this).attr('alt').split('::')[2];
		clipboard.set(''+text+'','text');
		$('#custom-menu').slideUp();
	});
	// save link
	$(document).on('click','#save_link',function(e) {
		e.preventDefault();
		settings.selectedDir = '';
		var vid = $(this).attr('alt').split('::')[0];
		var title= $(this).attr('alt').split('::')[1];
		var link = $(this).attr('alt').split('::')[2];
		var engine = $(this).attr('alt').split('::')[3];
		var new_win = gui.Window.open('selectdir.html', {
              "position": 'center',
              "width": 400,
              "height": 400,
              "toolbar": false,
              "show" : false
            });
            new_win.on('close', function() {
				settings = JSON.parse(localStorage.StdSettings);
				if ((settings.selectedDir === '') || (settings.selectedDir === undefined)) {
					this.hide();
					this.close(true);
					return;
				}
				var name = settings.selectedDir;
				insertToDb('media',name,title,vid,link,engine,false);
				this.hide();
				this.close(true);
				settings.selectedDir = '';
				saveSettings();
            });
            new_win.on('loaded', function() {
				console.log("loadedd") 
				var x = Math.round((screen.availWidth - 400) / 2);
				var y = Math.round((screen.availHeight - 400) / 2);
				setTimeout(function() {
					new_win.resizeTo(400,400)
					new_win.moveTo(x,y)
					new_win.show();
				},1000);
			});
		$('#custom-menu').slideUp();
		$('#save_link').parent().remove();
	});
});

function getYtlinkFromClipboard() {
	var vid='';
	var text = clipboard.get('text');
	try {
		vid = text.match('.*v=(.*)?&')[1]
		return "https://www.youtube.com/watch?v="+vid;
	} catch(err) {
		try {
			vid = text.match('.*v=(.*)')[1];
			return "https://www.youtube.com/watch?v="+vid;
		} catch(err) {
			try {
				vid = text.match('youtu.be/(.*)')[1];
				return "https://www.youtube.com/watch?v="+vid;
			} catch(err) {
				return null;
			}
		}
	console.log('youtube id: ' + vid);
	}
}

function getSelectedText() {
	var t='';
	if(window.getSelection){
		t = window.getSelection();
	}else if(document.getSelection){
		t = document.getSelection();
	}else if(document.selection){
		t = document.selection.createRange().text;
	}
	if (t.toLocaleString() === '') {
		return null;
	} else {
		return t.toLocaleString();
	}
}

function showContextMenu(e) {
	if(activeTab !== 2 && activeTab !== 3 && activeTab !== 5) {
		var x = e.pageX - $('#menuContainer').width() - 50;
		var y = e.pageY - 60;
		$("#custom-menu").css({ top: y + "px", left: x + "px" }).slideDown("slow",function() { 
			var w = $("#custom-menu li").width();
			$('#custom-menu').css('width',w+'px');
		});
	}
}
