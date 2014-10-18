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

var db;
// settings

$(document).ready(function() {
	createRootNodes();
});

function showItems(results) {
	for (var i=0; i<results.length;i++) {
		var parent = results[i].parent;
		var type = results[i].type;
		if (type === 'media') {
			var obj = {
				"attr" : { "id" : results[i]._id },
				"icon" : "js/jstree/themes/default/movie_file.png",
				"data" : {
					"title" : results[i].title, 
					"attr" : { "type": "media", "id": results[i]._id, "vid" : results[i].vid, "flink" : results[i].flink, "engine" : results[i].engine, "parent" : parent,"title" : results[i].title } 
				}
			}
			$("#treeview").jstree("create", $("#"+parent+"_rootnode"), "inside",  obj, function() { }, true);
			$("#treeview").jstree('close_all');
		}
	}
}

function onSelectedItem(data) {
	$(".mejs-overlay").show();
	$(".mejs-layer").show();
	$(".mejs-overlay-play").hide();
	$(".mejs-overlay-loading").show();
	var id = data.rslt.obj[0].id;
	if(id.indexOf('upnpRootNode') !== -1 && $('#'+id).hasClass('loaded') === false) {
		var serverId = parseInt(id.split('_')[0]);
		$('#'+id).addClass('loaded');
		return browseUpnpDir(serverId,'0',id);
	} else if (id.indexOf('upnpSubNode') !== -1 && $('#'+id).hasClass('loaded') === false) {
		var serverId = parseInt(id.split('_')[0]);
		var item = data.rslt.obj.prevObject[0].attributes;
		$('#'+id).addClass('loaded');
		return browseUpnpDir(item.serverId.value,item.index.value,id);
	}
	
	var item = data.rslt.obj.prevObject[0].attributes;
	try {
		var vid = item.vid.value;
		var flink = item.flink.value;
		var engine = item.engine.value;
		var id = item.id.value;
		var title = item.title.value;
		var next_vid = '';
		var next= '';
		try {
			next = data.inst._get_next()[0].id;
			next_vid = $('#'+id+' a')[0].id;
		} catch(err) {
			next_vid = '';
			console.log("no more videos to play in this playlist");
		}
		if (engine === 'youtube') {
			youtube.getVideoInfos('http://www.youtube.com/watch?v='+vid,0,1,function(datas) {showInfos(datas,next_vid,vid,flink,engine,title)});
		} else if (engine === 'dailymotion'){
			dailymotion.getVideoInfos(vid,0,1,function(datas) {showInfos(datas,next_vid,vid,flink,engine,title)});
		}
	} catch(err) {
		console.log(err);
	}
}

function renameItem(item) {
	var attr = item.rslt.obj[0].lastChild.attributes;
	var old_name = item.rslt.old_name;
	var new_name = item.rslt.new_name;
	if (old_name === new_name) {
		return;
	}
	var vid = attr.vid.value;
	var flink = attr.flink.value;
	var engine = attr.engine.value;
	var id = attr.id.value;
	var parent = attr.parent.value;
	var type = attr.type.value;
	removeFromDb(id);
	item.rslt.obj.remove();
	insertToDb(type,parent,new_name,vid,flink,engine,true);
}

function removeItem(item) {
	var id = item.id.value;
  if (id.indexOf('_rootnode') !== -1) {
    removeDir(id.split('_rootnode')[0]);
  } else {
    removeFromDb(id);
  }
}

function removeDir(name) {
  bongo.db('ht5').collection('Library').find({
    parent: name }).toArray(function(error,results) {
    if(!error) {
      if (results.length === 0) {
        bongo.db('ht5').collection('Library').find({
          title: name }).toArray(function(error,results) {
            if(!error) {
              console.log("directory "+name+" removed successfully");
              removeFromDb(results[0]._id);
            }
        });
      } else {
        $.each(results,function(index,res){
          if(res.type === 'folder') {
              removeDir(res.title);
              removeFromDb(res._id);
          } else {
            removeFromDb(res._id);
          }
          if (index+1 === results.length) {
              bongo.db('ht5').collection('Library').find({
                title: name }).toArray(function(error,results) {
                  if(!error) {
                    console.log("directory "+name+" removed successfully");
                    try {
                      removeFromDb(results[0]._id);
                    } catch(err) {}
                  }
              });
          }
        });
      }
    } else { 
      console.log(error);
    }
  });
}

function onCreateItem(item) {
	if (item.args.length === 1) {
		var name = item.rslt.name;
		if (name.match(' ') !== null) {
			alert(_("Please do not use spaces or special characters in your playlist name!"));
			item.rslt.obj.remove();
		} else {
			var parent = $.trim(item.args[0].prevObject[0].innerText);
			addCollection(name,parent,'');
		}
	}
}

function showInfos(datas,next_vid,vid,flink,engine,title) {
	var link = {};
	link.link= '';
	link.next = next_vid;
	link.title = title;
	if (datas === 'null') {return;}
    var resolutions_string = ['1080p','720p','480p','360p'];
    if (engine === 'youtube') {
		var resolutions = datas[25].resolutions;
	} else {
		var resolutions = datas[0].resolutions;
	}
	var arr = [];
	var l=0;
	for(var i=0; i<resolutions_string.length; i++) {
		var res = resolutions_string[i];
		if ((resolutions[res] === undefined) || (resolutions[res].link === 'null')){
			if ( i === 3) {
				link.link = arr[0];
				$('video').trigger('loadPlayer',link,'');
				break;
			} else {
				continue;
			}
		} else {
			if (res === selected_resolution) {
				link.link = resolutions[res].link
				$('video').trigger('loadPlayer',link,'');
				break;
			} else {
				arr[l] = resolutions[res].link;
				l+=1;
			}
			if ( i === 3) {
				link.link = arr[0];
				$('video').trigger('loadPlayer',link,'');
				break;
			}
		}
	}
	// show the video in the playlist
	if (engine === 'youtube') {
		youtube.getVideoInfos(flink,0,1,function(datas) {fillPlaylist(datas,false,'','youtube')});
	} else if (engine === 'dailymotion'){
		dailymotion.getVideoInfos(vid,0,1,function(datas) {fillPlaylist(datas,false,'','dailymotion')});
	}
}
