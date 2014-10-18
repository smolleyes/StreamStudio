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

$(document).ready(function() {
	
loadDb(function() {createRootNodes()});

});

function loadDb() {
	bongo.db({
		name: 'ht5',
		collections: ["Library"]
	});
}

function insertToDb(type,parent,title,vid,flink,engine) {
	bongo.db('ht5').collection('Library').insert({
	  type : type,
	  parent : parent,
	  title : title,
	  vid: vid,
	  flink: flink,
	  engine: engine
	},function(error,id) {
	  if(!error) {
		if (type === 'media') {
			console.log(title + ' inserted successfully in database');
			var obj = {
				"attr" : { "id" : id },
				"icon" : "js/jstree/themes/default/movie_file.png",
				"data" : {
					"title" : title, 
					"attr" : { "id": id, "vid" : vid, "flink" : flink, "engine" : engine, "parent" : parent  } 
				}
			}
			$("#treeview").jstree("create", $("#"+parent+"_rootnode"), "inside",  obj, function() { }, true);
			var tree = $.jstree._reference("#treeview");
			tree.refresh();
			createRootNodes();
		} else {
			console.log(type + ' inserted successfully in database');
			createRootNodes();
		}
	  }
	});
}

function findInDb(title) {
	bongo.db('ht5').collection('Library').find({
		title: title
	}).toArray(function(error,results) {
		if(!error) {
			return true;
			console.log(results);
		} else {
			return false;
		}
	});
}

function removeFromDb(id) {
	bongo.db('ht5').collection('Library').remove(id, function(error, data) {
		if(!error) {
			console.log('id: '+id+', successfully removed from db');
		}
	});
}

function getAllItems(cb) {
	bongo.db('ht5').collection('Library').find({}).limit(10000).toArray(function(error,results) {
		if(!error) {
			cb(results);
		}
	});
}

function addCollection(name,parent,selected) {
	insertToDb('folder',parent,name);
}



function createRootNodes(cb) {
	
	$(function () {
		$("#treeview").jstree({
			"plugins" : [ "themes", "json_data", "ui", "contextmenu","types","crrm" ],
			"json_data" : {
			"data" : { 
					"attr" : { id : ''+_("Library")+'_rootnode' },
					"data" : _("Library"),
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
				onSelectedItem(data); 
				console.log('clicked')
		}).bind("rename.jstree", function (e, data) { 
				renameItem(data);
		}).bind("remove.jstree", function (e, data) { 
				removeItem(data.rslt.obj.prevObject[0].attributes); 
		}).bind("create.jstree", function (e, data) { 
				onCreateItem(data);
		}).bind('before.jstree', function(event, data){
			if(data.plugin == 'contextmenu'){
				var settings = data.inst._get_settings();
				if((data.inst._get_parent(data.args[0])==-1) || (data.args[0].id === '')){
          if (data.args[0].innerHTML.indexOf(_('Library')) === -1) {
              settings.contextmenu.items.remove._disabled = false;
          } else {
              settings.contextmenu.items.remove._disabled = true;
          }
					settings.contextmenu.items.rename._disabled = true;
					settings.contextmenu.items.create._disabled = false;
				} else {
					settings.contextmenu.items.remove._disabled = false;
					settings.contextmenu.items.rename._disabled = false;
					settings.contextmenu.items.create._disabled = true;
				}
			} 
		}).bind("loaded.jstree", function (event, data) {
			getAllItems(function(results) { loadNodes(results); });
			getAllItems(function(results) { showItems(results); });
		});
	});
}

function loadNodes(results){
	for (var i=0; i<results.length;i++) {
		var parent = results[i].parent;
		var type = results[i].type;
		if (type === 'folder') {
			var obj = { 
					"attr" : { id : ''+results[i].title+'_rootnode' },
					"data" : results[i].title,
					"children" : []
			}
			$("#treeview").jstree("create", $("#"+parent+"_rootnode"), "inside", obj, function() {}, true);
		}
	}
}
