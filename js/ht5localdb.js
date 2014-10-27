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

var fileList;

function createLocalRootNodes() {
	$("#fileBrowserContent").empty();
	$(function () {
		$("#fileBrowserContent").jstree({
			"plugins" : [ "themes", "json_data", "ui","types","crrm" ],
			"json_data" : {
			"data" : { 
					"attr" : { id : ''+_("Local library")+'_rootnode' },
					"data" : _("Local library"),
					"children" : []
				}
			},
				"themes" : {
				"theme" : "default"
			},
			"contextmenu" : {
				items: {
					"ccp": false,
					// Some key
					"remove" : {
						// The item label
						"label"				: _("Remove"),
						// The function to execute upon a click
						"action"			: function (obj) { this.remove(obj); },
						// All below are optional 
						"_disabled"			: false,		// clicking the item won't do a thing
						"separator_before"	: false,	// Insert a separator before the item
						"separator_after"	: false,		// Insert a separator after the item
						// false or string - if does not contain `/` - used as classname
						"icon"				: false
					},
					"create" : {
						// The item label
						"label"				: _("Add folder"),
						// The function to execute upon a click
						"action"			: function (obj) {
												this.create(obj); 
											},
						// All below are optional 
						"_disabled"			: false,		// clicking the item won't do a thing
						"separator_before"	: false,	// Insert a separator before the item
						"separator_after"	: false,		// Insert a separator after the item
						// false or string - if does not contain `/` - used as classname
						"icon"				: false
					},
					"rename" : {
						// The item label
						"label"				: _("Rename"),
						// The function to execute upon a click
						"action"			: function (obj) { this.rename(obj); },
						// All below are optional 
						"_disabled"			: false,		// clicking the item won't do a thing
						"separator_before"	: false,	// Insert a separator before the item
						"separator_after"	: false,		// Insert a separator after the item
						// false or string - if does not contain `/` - used as classname
						"icon"				: false
					}
				}
			},
		}).bind("select_node.jstree", function (e, data) { 
				//onSelectedItem(data); 
		}).bind("rename.jstree", function (e, data) { 
				//renameItem(data);
		}).bind("remove.jstree", function (e, data) { 
				//removeItem(data.rslt.obj.prevObject[0].attributes); 
		}).bind("create.jstree", function (e, data) { 
				//onCreateItem(data);
		}).bind('before.jstree', function(event, data){
			if(data.plugin == 'contextmenu'){
				var settings = data.inst._get_settings();
				if((data.inst._get_parent(data.args[0])==-1) || (data.args[0].id === '')){ 
					settings.contextmenu.items.remove._disabled = true;
					settings.contextmenu.items.rename._disabled = true;
					settings.contextmenu.items.create._disabled = false;
				} else {
					settings.contextmenu.items.remove._disabled = false;
					settings.contextmenu.items.rename._disabled = false;
					settings.contextmenu.items.create._disabled = true;
				}
			} 
		}).bind("loaded.jstree", function (event, data) {
			loadLocalDb();
		});
	});
}

function loadLocalNodes(results){
	for (var i=0; i<results.length;i++) {
		var parent = results[i].parent;
		var type = results[i].type;
		if (type === 'folder') {
			var obj = { 
					"attr" : { id : ''+results[i].title+'_rootnode' },
					"data" : results[i].title,
					"children" : []
			}
			$("#fileBrowserContent").jstree("create", $("#"+parent+"_rootnode"), "inside", obj, function() {}, true);
		}
	}
}

function loadLocalDb() {
	$("#fileBrowserContent").empty();
	try {
		var dirs = settings.shared_dirs;
		if ((dirs === undefined) || (dirs.length === 0)) {
			$("#fileBrowserContent").append('<p>'+_("Please add local folders to scan in the settings")+'</p>');
			return;
		}
	} catch(err) {
		console.log("shared dirs error : "+ err);
		return;
	}
	$.each(dirs,function(index,dir){
		var parent = Math.floor(Math.random()*1000000);
		var obj = { 
					"attr" : { id : ''+parent+'_rootnode' },
					"data" : path.basename(dir),
					"children" : []
		}
		$("#fileBrowserContent").jstree("create", $("#"+_("Local library")+"_rootnode"), "inside", obj, function() {}, true);
		scanForDirs(dir,parent);
	});	
}

function scanForDirs(dir,parent,list) {
	try {
		fs.readdir(dir, function (error, files) {
			$.each(files,function(index,file) {
				var target = dir+'/'+file;
				if (fs.lstatSync(target).isDirectory()) {
					var id = Math.floor(Math.random()*1000000);
					var obj = { 
						"attr" : { id : ''+id+'_rootnode' },
						"data" : path.basename(target),
						"children" : []
					}
					$("#fileBrowserContent").jstree("create", $("#"+parent+"_rootnode"), "inside", obj, function() {}, true);
					scanForDirs(target,id,list);
				} else {
					var id = Math.floor(Math.random()*1000000);
					var ext = path.extname(file);
					if ((ext === '.webm') || (ext === '.mp4') || (ext === '.wav') || (ext === '.mpg') || (ext === '.opus') || (ext === '.avi') || (ext === '.mpeg') || (ext === '.mkv') || (ext === '.mp3') || (ext === '.ogg')) {
							var obj = {
							"attr" : { "id" : id },
							"icon" : "js/jstree/themes/default/movie_file.png",
							"data" : {
								"title" : path.basename(file), 
								"attr" : { "id": id, "parent" : parent, "link" : "file://"+encodeURI(dir+'/'+file), "class" : "localFile","dir":encodeURI(dir),"title":path.basename(file)} 
							}
						}
					} else {
						return true;
					}
					$("#fileBrowserContent").jstree("create", $("#"+parent+"_rootnode"), "inside",  obj, function() { }, true);
					$("#fileBrowserContent").jstree('close_all');
				}
			});
		});
	} catch(err) {
		console.log(err);
	}
}
