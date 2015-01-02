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

var playAirMedia = false;
var playUpnpMedia = false;
var airMediaDevices = [];
var airMediaDevice;
var upnpDevices = [];
var upnpDevice = null;
var airMediaLink;
var airMediaPlaying = false;
var upnpMediaPlaying = false;
var torrentPlaying = false;
var continueTransition = false;
var transcoderEnabled= false;
var ffmpeg;
var ffar = [];
var torrentsArr = [];
var UPNPserver;
var airplayToggleOn = false;
var upnpToggleOn = false;
var right = 0;
var left = 0;
var mediaRenderer;
var currentRes = null;
var megaDownload = null;
var extPlayerProc = null;

// global var
var current_download;
var downloads = [];
var ht5Server;
var currentMedia;
var currentAirMedia = {};
var fn;
var loadedTimeout;
var playlistMode = 'normal';

// engines object to store all engines
var engines = {};
// active engine
var engine;
// array of possibles menus
var selectTypes = ["searchTypes", "orderBy", "dateTypes", "searchFilters", "categories"];
// object to store search options passed to engines
var searchOptions = {};
// for navigation mode
var browse = true;

var htmlStr = '<div class="row"> \
<div class="col-xs-4 col-md-3 col-lg-2 well" id="menuContainer" style="height:100%;margin-bottom:5px;">\
<div id="menu"> \
	<div class="panel panel-default" id="searchPanel"> \
			<select id="engines_select" class="selectpicker" data-style="btn-default btn-sm" data-hide-disabled="true"> \
				<option value = "youtube">Youtube</option> \
				<option value = "dailymotion">Dailymotion</option> \
			</select> \
		<form id="video_search" role="form"> \
			<div class="input-group" style="margin-bottom: 15px;"> \
				<input type="text" id="video_search_query" class="form-control" name="video_search_query" placeholder="' + _("Enter your search...") + '"> \
				<div class="input-group-btn"> \
					<button class="btn btn-default" type="submit" style="top: 4px;height: 34px;"><i class="glyphicon glyphicon-search"></i></button> \
				</div> \
			</div> \
				<label id="searchTypesMenu_label">' + _("Search type:") + '</label> \
				<select id="searchTypes_select" class="selectpicker" data-style="btn-default btn-sm" data-hide-disabled="true"> \
					<option value = "videos">' + _("Videos") + '</option> \
					<option value = "playlists">' + _("Playlists") + '</option> \
					<option value = "category">' + _("Categories") + '</option> \
					<option id="channelsOpt" value = "channels">' + _("Channels") + '</option> \
					<option id="topRatedOpt" value = "topRated">' + _("Top rated") + '</option> \
					<option id="mostViewed" value = "mostViewed">' + _("Most viewed") + '</option> \
				</select> \
				<label id="dateTypes_label" style="margin-top: 5px;">' + _("Date:") + '</label> \
				<select id="dateTypes_select" class="selectpicker" data-style="btn-default btn-sm" data-hide-disabled="true"> \
					<option value = "today">' + _("Today") + '</option> \
					<option value = "this_week">' + _("This week") + '</option> \
					<option value = "this_month">' + _("This month") + '</option> \
					<option value = "all_time">' + _("All time") + '</option> \
				</select> \
				<label id="categories_label">' + _("Category:") + '</label> \
				<select id="categories_select" class="selectpicker" data-style="btn-default btn-sm" data-hide-disabled="true"> \
				</select> \
				<label id="orderBy_label">' + _("Order by:") + '</label> \
				<select id="orderBy_select" class="selectpicker" data-style="btn-default btn-sm" data-hide-disabled="true"> \
					<option value = "relevance">' + _("Relevance") + '</option> \
					<option value = "published">' + _("Published") + '</option> \
					<option value = "viewCount">' + _("Views") + '</option> \
					<option value = "rating">' + _("Rating") + '</option> \
				</select> \
				<label id="duration_label" style="margin-top: 5px;">' + _("Duration:") + '</label> \
				<select id="duration_select" class="selectpicker" data-style="btn-default btn-sm" data-hide-disabled="true"> \
					<option data-hidden="true"></option> \
					<option value = "short">' + _("Short (<4 min)") + '</option> \
					<option value = "medium">' + _("Medium (4 <-> 20 min)") + '</option> \
					<option value = "long">' + _("Long (>20 min)") + '</option> \
				</select> \
				<label id="searchFilters_label" style="margin-top: 5px;">' + _("Filters:") + '</label> \
				<select id="searchFilters_select" class="selectpicker" data-style="btn-default btn-sm" data-hide-disabled="true"> \
					<option data-hidden="true"></option> \
					<option value = "hd">HD</option> \
					<option id="3dopt" value = "3d">3D</option> \
				</select> \
			<input id="video_search_btn" type="submit" class="btn btn-success btn-sm" value="' + _("Send") + '" />  \
			<div style="clear:both"></div> \
		</form> \
	</div> \
</div> \
<div class="panel panel-default" style="width: calc(100% + 20px);margin-left: -10px;"> \
	<div class="panel-body"> \
		<span>'+_("Play thru Upnp")+'</span> \
		<div id="upnpRenderersContainer" style="display:none;"><a id="upnp-toggle" class="upnp tiptip upnp-disabled"></a><form id="upnpPopup" style="display:none;"></form></div> \
	</div> \
</div> \
</div> <!-- end lg-3 --> \
<div id="content" class="col-xs-8 col-md-9 col-lg-10"> \
	<div class="tab-content" style="height:100%"> \
		<div class="tab-pane active" id="tabpage_1"> \
				<div id="loading" style="display:None;"><div id="spinner" style="float:left;margin-right:10px;"></div><p style="position:relative;top:5px;">' + _(" Loading videos...") + '</p></div> \
				<div id="search"> \
					<div id="search_results"> \
						<p>'+ _("Welcome to StreamStudio !<br><br>Make a new search or select a category to start...")+'</p> \
					</div> \
					<div id="pagination"></div> \
				</div> \
				<div id="nanoContent" class="nano"> \
					<div id="items_container" class="nano-content"> \
					</div> \
				</div> \
			</div> \
			<div class="tab-pane" id="tabpage_2"> \
				<p>'+_("Use your mouse right click on Youtube or Dailymotion video's titles to bookmark them in this library.")+'</p> \
				<div id="nanoContent" class="nano"> \
					<div id="treeview" class="nano-content"> \
					</div> \
				</div> \
			</div> \
			<div class="tab-pane" id="tabpage_3"> \
					<a id="file_update" href="#"><img src="images/update.png" id="update_img" /> \
					<span>' + _("Update files list...") + '</span></a> \
				<div id="fileBrowser"> \
					<div id="nanoContent" class="nano" style="top:0px !important; height: calc(100% - 145px);"> \
						<div id="fileBrowserContent" class="nano-content"> \
						</div> \
					</div> \
				</div> \
			</div> \
			 <div class="tab-pane" id="tabpage_4"> \
				<div id="nanoContent" class="nano" style="top:0px !important; height: calc(100% - 145px);"> \
					<div id="DownloadsContainer" class="nano-content" > \
					</div> \
				</div> \
			</div> \
			<div class="tab-pane" id="tabpage_5"> \
				<div id="nanoContent" class="nano" style="top:0px !important; height: calc(100% - 135px);"> \
					<div id="UpnpContainer" class="nano-content"> \
					</div> \
				</div> \
			</div> \
			<div class="tab-pane" id="tabpage_7"> \
				<div class="container" style="margin-left:0;width:calc(100% - 15px);padding-top:10px;"> \
					<div class="row"> \
						<legend><h3>StreamStudio Settings <span style="font-size:12px;float:right;margin-top:10px;"><b>(V'+settings.version+')</b></span>:</h3></legend> \
						<div id="nanoContent" class="nano" style="top:0px !important; height: calc(100% - 210px);"> \
				<form role="form" class="nano-content" style="padding-top:10px;"> \
					<div class="form-group"> \
						<label>'+_("Language:")+'</label> \
						<select name="countries" id="countries" style="width:300px;"> \
						  <option value="en" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag gb" data-title="England">English</option> \
						  <option value="fr" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag fr" data-title="France">French</option> \
						  <option value="es" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag es" data-title="Spain">Spanish</option> \
						  <option value="gr" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag gr" data-title="Greek">Greek</option> \
						  <option value="it" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag it" data-title="Italia">Italia</option> \
						</select> \
					</div> \
					<div class="form-group"> \
					  <label>'+_("Maximum resolution:")+'</label> \
					  <div id="resolutions_select_cont" > \
					  <select id="resolutions_select" class="selectpicker"> \
							<option value = "1080p">1080p</option> \
							<option value = "720p">720p</option> \
							<option value = "480p">480p</option> \
							<option value = "360p">360p</option> \
							<option value = "240p">240p</option> \
					  </select> \
					  </div> \
					</div> \
					<div class="form-group"> \
					  <label>'+_("Download directory:")+'</label> \
					  <div> \
							<div class="input-group" style="margin-left:-5px;"> \
								<input type="text" id="download_path"></input><button class="btn btn-default btn-sm" id="choose_download_dir" class="input-group-addon">'+_("Select")+'</button> \
							</div> \
						</div> \
					</div> \
					<div class="form-group"> \
					  <p> \
						<b><u>'+_("Plugins choice:")+'</u></b> \
						<br> \
						'+_("Please read the disclaimer here : <u><a id='disclaimer' style='color:red;' href='#'>disclaimer</a></u>")+' \
					  </p> \
					  <div class="input-group well" style="display: table !important;"> \
						<!--<div class="ItemCheckbox left">\
						  <label for="vimeo">Vimeo</label>\
						  <input class="pluginCheckBox" type="checkbox" id="vimeo" name="vimeo">\
						</div>-->\
						<div class="ItemCheckbox left">\
						  <label for="songza">Songza</label>\
						  <input class="pluginCheckBox" type="checkbox" id="songza" name="songza">\
						</div>\
						<div class="ItemCheckbox left">\
						  <label for="twitch">Twitch</label>\
						  <input class="pluginCheckBox" type="checkbox" id="twitch" name="twitch">\
						</div>\
						<div class="ItemCheckbox left">\
						  <label for="grooveshark">Grooveshark</label>\
						  <input class="pluginCheckBox" type="checkbox" id="grooveshark" name="grooveshark">\
						</div>\
						<div class="ItemCheckbox left">\
						  <label for="omgtorrent">Cpasbien</label>\
						  <input class="pluginCheckBox" type="checkbox" id="cpasbien" name="cpasbien">\
						</div>\
						<div class="ItemCheckbox left">\
						  <label for="omgtorrent">Omgtorrent</label>\
						  <input class="pluginCheckBox" type="checkbox" id="omgtorrent" name="omgtorrent">\
						</div>\
						<div class="ItemCheckbox left">\
						  <label for="t411">T411</label>\
						  <input class="pluginCheckBox" type="checkbox" id="t411" name="t411">\
						</div>\
						<div class="ItemCheckbox left">\
						  <label for="kickass">Kickass</label>\
						  <input class="pluginCheckBox" type="checkbox" id="kickass" name="kickass">\
						</div>\
					  </div>\
					  <div style="clear:both;"></div> \
					</div> \
					<div class="form-group"> \
						<p><u><b>'+_("Default player:")+'</b></u></p> \
						<div id="externalPlayers"> \
							<select id="playerSelect" class="selectpicker"></select> \
						</div> \
					</div> \
					<div class="form-group"> \
						<div style="height:240px;margin-top:30px;"> \
							<p><u><b>'+_("Add or remove directories to scan for your local library:")+'</b></u></p> \
							<select id="shared_dir_select" multiple name="shared_dir" class="well"></select> \
							<div id="shared_dir_controls"> \
								<div style="width:125px;"> \
									<button class="btn btn-success btn-sm" id="add_shared_dir">'+_("Add")+'</button> \
								</div> \
								<div style="width:125px;margin-top:5px;"> \
									<button class="btn btn-danger btn-sm" id="remove_shared_dir" >'+_("Remove")+'</button> \
								</div> \
							</div>\
						</div> \
					</div> \
					<hr> \
					<div class="form-group"> \
						<button id="valid_config" class="btn btn-success">'+_("Save")+'</button> \
					</div> \
					<input style="display:none;" id="fileDialog" type="file" nwdirectory /> \
					<input style="display:none;" id="sharedDirDialog" type="file" nwdirectory /> \
							</form> \
							</div> \
						</div> \
					</div> \
			</div> \
	</div> \
	<div class="panel panel-default" id="subPlayer">\
		<div class="panel-body"> \
			<img id="subPlayer-img" src="images/play-overlay.png" />  \
			<div id="subPlayer-controls"> \
				<a href="#" id="subPlayer-prev"></a> \
				<a href="#" id="subPlayer-play"></a> \
				<a href="#" id="subPlayer-pause" style="display:none;"></a> \
				<a href="#" id="subPlayer-stop"></a> \
				<a href="#" id="subPlayer-next"></a> \
			</div> \
			<div id="subPlayer-progress"> \
				<progress id="progress-bar" min=\'0\' max=\'100\' value=\'0\'></progress> \
			</div> \
			<div id="playlistBtnSub"></div> \
			<div id="transcodingBtnSub"></div> \
			<div id="subPlayer-Timer"><span class="mejs-currenttime">00:00:00</span><span> | </span> <span class="mejs-duration">00:00:00</span></div> \
			<div id="subPlayer-title-container">'+_("Playing:")+'<span id="subPlayer-title"><p> '+_('Waiting...')+'</p></span></div> \
	</div> \
</div> \
<div id="showPlayer"></div> \
    <div id="custom-menu"> \
<ol> \
</ol> \
</div> \
<div id="tipContent" style="display:none;"></div> \
<div id="upnpTipcontent" style="display:none;"></div> \
</div>\
</div> \
</div> <!-- end container -->';

try {
    process.on('uncaughtException', function(err) {
        try {
            var error = err.stack;
            if ((error.indexOf('Error: undefined is not a valid uri or options object.') !== -1) && (search_engine = 'Mega-search')) {
                $.notif({
                    title: 'StreamStudio:',
                    cls: 'red',
                    icon: '&#59256;',
                    timeout: 6000,
                    content: _("Your mega.co link is valid but can't be played yet, (wait a few minutes...)"),
                    btnId: '',
                    btnTitle: '',
                    btnColor: '',
                    btnDisplay: 'none',
                    updateDisplay: 'none'
                });
                initPlayer();
            }
        } catch (err) {}
    });
} catch (err) {
    console.log("exception error" + err);
}


$(document).ready(function() {
    $('#main').empty().append(htmlStr).hide();
	$('#loadingApp p').empty().append(_("Loading StreamStudio..."));
    $('#loadingApp').show();
    // load plugins
    ipaddress = nodeip.address();
	initPlugins();
	
});

function main() {
    // update navbar text
    $('#homeToggle').empty().text(_("Home"));
    $('#webLibToggle').empty().text(_("Web library"));
    $('#localFilesToggle').empty().text(_("Local files"));
    $('#downloads_tab').empty().text(_("Downloads"));
    $('#upnpToggle').empty().text(_("Upnp"));
    $('#playerToggle').empty().text(_("Player"));
    
    win.on('new-win-policy', function(frame, url, policy){
        policy.forceNewWindow({"position": 'center',
              "width": 400,
              "height": 400,
              "toolbar": false })
    });
    
    //show gui
    createLocalRootNodes();
    $('#loadingApp').remove();
    $('#main').show();
    $("#navBar").show();
    $(".myBrand").show();
	$("#settingsContainer").show();
	
	// update youtube-dl
	try {
		var cmd = spawn(exec_path+'/node_modules/youtube-dl/bin/youtube-dl',['-U']); 
		cmd.stdout.on('data', function (data) {
		  console.log('stdout: ' + data);
		});
	} catch(err) {
		console.log("can't update youtube-dl " + err)
	}
    
    // load and hide catgories
    getCategories();
    // start keyevent listener
    fn = function(e) {
        onKeyPress(e);
    };
    // navigation setup
    $(document).on("click", "#tab .btn", function(e){
		try {
			$(".nano").nanoScroller();
			engine.pageLoading = false;
			current_page = engine.currentPage;
		} catch(err) {
			
		}
	  try {
		  var id = $(this).attr('href').split('_')[1];
		  if (id) {
			activeTab = parseInt(id);
			if(activeTab !== 1) {
				updateLazy = false;
				engine.pageLoading = false;
				current_page = engine.currentPage;
			} else {
				updateLazy = true;
			}
		  }
	  } catch(err) {
	  }
	  $('#tab .btn.active').removeClass('active');
		setTimeout(function() {
			$(this).addClass('active');
			if($('#tab .btn.active').attr('id') !== "playerToggle" && $('#tab .btn.active').attr('id') !== "settingsToggle") {
				$('#playerContainer').hide();
				$('#playerTopBar').hide();
			}
		},100);
	});
    
    document.addEventListener("keydown", fn, false);
    // remove listener if input focused
    $('#video_search_query').focusin(function() {
        document.removeEventListener("keydown", fn, false);
    });
    $('#video_search_query').focusout(function() {
        document.addEventListener("keydown", fn, false);
    });
    //password input
    $(document).on('focusin', '.msgbox-inbox input[type="password"]', function() {
        document.removeEventListener("keydown", fn, false);
    });
    $(document).on('focusout', '.msgbox-inbox input[type="password"]', function() {
        document.addEventListener("keydown", fn, false);
    });
    // default parameters
    $('#resolutions_select').val(selected_resolution);
    $('#searchTypes_select').val('videos');

    $('#video_search').bind('submit', function(e) {
        e.preventDefault();
        query = $('#video_search_query').val();
        current_start_index = 1;
        current_prev_start_index = 1;
        current_page = 1;
        searchOptions.currentPage = 1;
        $('#items_container').empty().hide();
        startSearch(query);
        if (activeTab !== 1) {
			$("#homeToggle").click();
		}
		itemsCount = 0;
    });
    // store title of selected item
    $(document).on('click','.item-title',function(e) {
    	e.preventDefault();
        itemTitle = $(this).text();
    });

    // open in browser
    $(document).on('click', '.open_in_browser', function(e) {
        e.preventDefault();
        gui.Shell.openExternal($(this).attr('href'));
    });
    $(document).on('click', '.open_folder', function(e) {
        e.preventDefault();
        gui.Shell.showItemInFolder(settings.download_dir + '/StreamStudio');
    });
    
    $("div.mejs-time").bind('DOMCharacterDataModified', function() {
		if ($('div.mejs-time').html() != $('#subPlayer-Timer').html()) {
			$('#subPlayer-Timer').empty().append($('div.mejs-time').html());
		}
		var img = null;
		if($('#subPlayer-title').text() !== currentMedia.title) {
			$('#subPlayer-title').empty().append('<p>'+currentMedia.title+'</p>');
		}
	});
	
	$("#playlistBtn").bind('DOMNodeInserted DOMNodeRemoved DOMSubtreeModified DOMCharacterDataModified', function() {
		$("#playlistBtnSub").empty().append($("#playlistBtn").html());
	});
	$('button[aria-label="playlist"]').attr('style', 'background-position-y:0px !important');
	$('button[aria-label="playlist"]').attr('style', 'background-position-y:-48px !important');
	$('button[aria-label="playlist"]').attr('title',_('play and stop mode (click to change)'));
	
	$("#transcodeBtnContainer").bind('DOMNodeInserted DOMNodeRemoved DOMSubtreeModified DOMCharacterDataModified', function() {
		$("#transcodingBtnSub").empty().append($("#transcodeBtnContainer").html());
	});
	$("#transcodingBtnSub").empty().append($("#transcodeBtnContainer").html());
	
    // fullscreen signal and callback
    var left;
    var right;
    $(document).on('click', '.mejs-fullscreen-button', function(e) {
		e.preventDefault();
        if (win.isFullscreen === true) {
            win.toggleFullscreen();
            player.isFullScreen = false;
        } else {
            player.isFullScreen = true;
            win.enterFullscreen();
        }
    });

    // start video by clicking title
    $(document).on('click', '.start_video', function(e) {
        e.preventDefault();
        try {
            $('.highlight.well').removeClass('highlight well');
        } catch (err) {}
        try {
			$(this).closest('.youtube_item').addClass('highlight well');
			try {
				$('#items_container').scrollTop($('#items_container').scrollTop() + $('.highlight').position().top);
			} catch(err) {}
			// save current song/page and search for back btn
			try {
				prev_vid = current_song;
			} catch (err) {
				console.log('no media loaded, can\'t save current song...');
			}
			current_song_page = current_page;
			var title = $(this).attr('alt');
			current_song = $(this).closest('.youtube_item').find('.downloads_container').attr('id');
			var vid = $(this).attr('id');
			if ($('#youtube_entry_res_' + vid + ' a.video_link').length === 0) {
				$(this).closest('.youtube_item').find('.spiffy').show();
				if(search_engine === 'youtube') {
					ytId = vid;
					youtube.getVideoInfos('https://youtube.com/watch?v='+vid,1,1,upnpToggleOn, function(datas){
						$('.spiffy').hide();
						$('#youtube_entry_res_' + vid).empty()
						var infos = datas[25];
						mediaDuration = 0;
						if(infos.upnp === false) {
							var resolutions_string = ['1080p','720p', '480p','360p','240p'];
						} else {
							var resolutions_string = ['720p','360p'];
						}
						var resolutions = infos.resolutions;
						var vlink,vlinka;
						for (var i = 0; i < resolutions_string.length; i++) {
							try {
								var resolution = resolutions_string[i];
								var vlink = resolutions[resolution]['link'];
								if(upnpToggleOn) {
									vlink += '&upnp';
								} else {
									if(infos.upnp === false) {
										vlink = resolutions[resolution]['link'];
										vlinka = resolutions[resolution]['linka'];
									}
								}
								if (vlink === 'null') {
									continue;
								}
								var container = resolutions[resolution]['container'];
							} catch (err) {
								continue;
							}
							var img = '';
							if (resolution == "720p" || resolution == "1080p") {
								img = 'images/hd.png';
							} else {
								img = 'images/sd.png';
							}
							// append links
							if(infos.upnp === false){
								$('#youtube_entry_res_' + vid).append('<div class="resolutions_container"><a class="video_link" style="display:none;" href="' + vlink+'::'+vlinka +' " alt="' + resolution + '"><img src="' + img + '" class="resolution_img" /><span>' + resolution + '</span></a><a href="' + vlink+'::'+vlinka + '" alt="' + title + '.' + container + '::' + vid + '" title="' + _("Download") + '" class="download_file_https"><img src="images/down_arrow.png" width="16" height="16" />' + resolution + '</a></div>');
							} else {
								$('#youtube_entry_res_' + vid).append('<div class="resolutions_container"><a class="video_link" style="display:none;" href="' + vlink+' " alt="' + resolution + '"><img src="' + img + '" class="resolution_img" /><span>' + resolution + '</span></a><a href="' + vlink + '" alt="' + title + '.' + container + '::' + vid + '" title="' + _("Download") + '" class="download_file_https"><img src="images/down_arrow.png" width="16" height="16" />' + resolution + '</a></div>');
							}
						}
						startVideo(current_song);
					})
				} else {
					startVideo(current_song);
				}
			} else {
				startVideo(current_song);
			}
		} catch(err) {
			console.log(err)
		}
    });
    
    // load video signal and callback
    $(document).on('click', '.video_link', function(e) {
        e.preventDefault();
        playFromfile = false;
        try {
            $('#' + current_song).closest('.youtube_item').removeClass('highlight well');
        } catch (err) {
            console.log(err);
        }
        current_song_page = current_page;
        current_song = $(this).parent().closest('.youtube_item').find('.downloads_container').attr('id');
        var video = {};
        video.link = $(this).attr('href');
        video.title = $(this).parent().closest('.youtube_item').find('.start_video').attr('alt');
        video.next = next_vid;
        startPlay(video);
        //$('video').trigger('loadPlayer', video);
        $(this).closest('.youtube_item').addClass('highlight well');
    });

    $(document).on('click', '.upnpMedia', function(e) {
        e.preventDefault();
        var stream = {};
        stream.data = $(this).attr('data');
        stream.link = XMLEscape.xmlUnescape($(this).attr('link'));
        stream.title = $(this).text();
        stream.type = $(this).attr('type');
        currentMedia = stream;
        if(upnpToggleOn) {
			if (upnpMediaPlaying === true) {
				upnpMediaPlaying = false;
				continueTransition = false;
				mediaRenderer.stop();
				setTimeout(function() {playUpnpRenderer(stream);},3000);
			} else {
				playUpnpRenderer(stream);
			}
		} else {	
			startPlay(stream);
		}
    });

    $('video').on('loadPlayer', function(e, video) {
        try {
            if ((playAirMedia === false) && (airMediaPlaying === true)) {
                login(stop_on_fbx);
            }
        } catch (err) {}
        startPlay(video);
    });
    
    //play local file
    $(document).on('click', '.localFile', function(e) {
		var videoCodecs = ["avi", "webm", "mp4", "flv", "mkv", "mpeg", "mpg", "wmv", "mov"];
        playFromFile = true;
        var video = {};
        video.link = $(this).attr('link');
        video.dir = $(this).attr('dir');
        video.title = $(this).attr('title');
        video.next = $(this).parent().next();
        $('#song-title').empty().append(_('Playing: ') + video.title);
        if (playAirMedia === true || upnpToggleOn) {
			upnpMediaPlaying = false;
			continueTransition = false;
			checkFileServerSettings(video.dir);
            video.title = video.title;
            video.link = 'http://' + ipaddress + ':8889/' + encodeURIComponent(video.title);
            $('video').trigger('loadPlayer', video, '');
        } else {
            $('video').trigger('loadPlayer', video, '');
        }
        if(videoCodecs.indexOf(video.title.split('.').pop()) !== -1) {
			$('#playerToggle').click();
		}
    });
    
    //load playlist
    $(document).on('click', '.load_playlist', function(e) {
		pageLoading = true;
		itemsCount = 0;
		current_page = 1;
        var pid = $(this).attr('id');
        loadPlaylistSongs(pid);
    });
    //load channels
    $(document).on('click', '.load_channel', function(e) {
		pageLoading = true;
		itemsCount = 0;
		current_page = 1;
		$('#items_container').empty();
        var pid = $(this).attr('id');
        loadChannelSongs(pid);
    });

    // download from plugin
    $(document).on('click', '.start_download', function(e) {
        e.preventDefault();
        var id = Math.floor(Math.random() * 100);
        var obj = JSON.parse(decodeURIComponent($(this).closest("li").find('a.start_media').attr("data")));
        downloadFile(obj.link, obj.title + obj.ext, id);
    });

    // download file signal and callback
    $(document).on('click', '.download_file', function(e) {
        e.preventDefault();
        var link = $(this).attr('href');
        var title = $(this).attr('alt');
        var engine = title.split('::')[2];
        if (search_engine === 'dailymotion') {
            var req = request(link, function(error, response, body) {
                if (!error) {
                    var link = response.request.href;
                    downloadFile(link, title, engine);
                } else {
                    console.log('can\'t get dailymotion download link');
                    return;
                }
            });
        } else {
            downloadFile(link, title, engine);
        }
    });
    
    // download file signal and callback
    $(document).on('click', '.download_file_https', function(e) {
        e.preventDefault();
        var link = $(this).attr('href');
        var title = $(this).attr('alt');
        var engine = title.split('::')[2];
        downloadFFMpeg(link, title, engine,false);
    });
    
    //cancel download
    $(document).on('click', '.cancel', function(e) {
        canceled = true;
        var id = this.id.replace('cancel_', '');
        try {
            current_download[id].abort();
        } catch (err) {
            current_download[id].end();
        }
        try {
			current_download[id].process.kill('SIGKILL');
		} catch(err) {}
    });

    //hide preview
    $(document).on('click', '#closePreview', function(e) {
        e.preventDefault();
        if (win.isFullscreen === true) {
            win.toggleFullscreen();
            player.isFullScreen = false;
        }
        $('#fbxMsg').slideUp();
    });

    //engine select
    $("select#engines_select").change(function() {
        $("select#engines_select option:selected").each(function() {
			$(".nano").nanoScroller({ destroy: true });
            search_engine = $(this).val();
            searchTypes_select = 'videos';
            getCategories();
            pagination_init = false;
            current_page = 1;
            current_search_page = 1;
            current_start_index = 1;
            searchOptions.currentPage = 1;
            itemsCount = 0;
            $("#searchTypes_select").empty().hide();
            $("#searchTypes_label").hide();
            $("#dateTypes_select").empty().hide();
            $("#dateTypes_label").hide();
            $("#duration_select").hide();
            $("#duration_label").hide();
            $("#searchFilters_label").hide();
            $("#searchFilters_select").empty().hide();
            $("#categories_label").hide();
            $("#categories_select").empty().hide();
            $("#orderBy_label").hide();
            $("#orderBy_select").empty().hide();
            $("#search").show();
            $("#searchTypesMenu_label").show();
            $("#items_container").empty().hide();
            $("#cover").remove();
            $('#search').show();
            $('#pagination').hide();
            if($('#fbxMsg2').length !== 0) {
				$('#fbxMsg2').remove();
			};
            try {
                engine = engines[search_engine];
                engine.init(gui, win.window, $.notif);
                $("#search p").empty().append(_("Engine %s ready...!", engine.engine_name)).show();
                // hide not needed menus
                $.each(engine.menuEntries, function(index, type) {
                    $("#" + type + "_select").empty();
                    var is = in_array(type, engine.defaultMenus);
                    if (is === false) {
                        $("#" + type + "_label").hide();
                        $("#" + type + "_select").hide();
                    } else {
                        $("#" + type + "_label").show();
                        $("#" + type + "_select").show();
                    }
                });
                // load searchTypes options
                if (engine.searchTypes !== undefined) {
					$('#searchTypes_select').empty();
                    $.each(engine.searchTypes, function(key, value) {
                        $('#searchTypes_select').append('<option value="' + value + '">' + key + '</option>');
                    });
                    searchTypes_select = engine.defaultSearchType;
                    $("#searchTypes_select").val(searchTypes_select);
                }
                // load orderBy filters
                if (engine.orderBy_filters !== undefined) {
                    $('#orderBy_select').empty();
                    $.each(engine.orderBy_filters, function(key, value) {
                        $('#orderBy_select').append('<option value="' + value + '">' + key + '</option>');
                    });
                    orderBy_select = engine.defaultOrderBy;
                    $("#orderBy_select").val(orderBy_select);
                }

                // load searchFilters filters
                if (engine.searchFilters !== undefined) {
                    $('#searchFilters_select').empty();
                    $.each(engine.searchFilters, function(key, value) {
                        $('#searchFilters_select').append('<option value="' + value + '">' + key + '</option>');
                    });
                    searchFilters_select = engine.defaultSearchFilter;
                    $("#searchFilters_select").val(searchFilters_select);
                }
                
                // load category filters
                if (engine.category_filters !== undefined) {
                    $('#categories_select').empty();
                    $.each(engine.category_filters, function(key, value) {
                        $('#categories_select').append('<option value="' + value + '">' + key + '</option>');
                    });
                    selected_category = engine.defaultCategory;
                    $("#categories_select").val(selected_category);
                } else if (engine.hasCategory) {
					engine.loadCategories();
				}

                $('#video_search_query').prop('disabled', false);
                update_searchOptions();
				$(".nano").nanoScroller({ destroy: true });
				$('.selectpicker').selectpicker('refresh');
            } catch (err) {
                if (search_engine === 'dailymotion') {
                    $("#search p").empty().append(_("Engine %s ready...!", 'dailymotion')).show();
                    var html = '<option value = "relevance">' + _("Relevance") + '</option> \
									<option value = "recent">' + _("Published") + '</option> \
									<option value = "visited">' + _("Views") + '</option> \
									<option value = "rated">' + _("Rating") + '</option>';
                    $('#orderBy_select').empty().append(html);
                    var html = '<option value = "videos">' + _("Videos") + '</option> \
								<option value = "playlists">' + _("Playlists") + '</option> \
								<option value = "category">' + _("Categories") + '</option>';
                    $('#searchTypes_select').empty().append(html);
                    var html = '<option value = ""></option> \
									<option value = "hd">HD</option> \
									<option id="3dopt" value = "3d">3D</option>';
                    $('#searchFilters_select').empty().append(html);

                } else {
                    $("#search p").empty().append(_("Engine %s ready...!", 'youtube')).show();
                    var html = '<option value = "relevance">' + _("Relevance") + '</option> \
									<option value = "published">' + _("Published") + '</option> \
									<option value = "viewCount">' + _("Views") + '</option> \
									<option value = "rating">' + _("Rating") + '</option>';
                    $('#orderBy_select').empty().append(html);
                    var html = '<option value = "videos">' + _("Videos") + '</option> \
								<option value = "playlists">' + _("Playlists") + '</option> \
								<option value = "category">' + _("Categories") + '</option> \
								<option id="channelsOpt" value = "channels">' + _("Channels") + '</option> \
								<option id="topRated" value = "topRated">' + _("Top rated") + '</option> \
								<option id="mostViewed" value = "mostViewed">' + _("Most viewed") + '</option>';
                    $('#searchTypes_select').empty().append(html);
                    var html = '<option value = ""></option> \
									<option value = "hd">HD</option> \
									<option id="3dopt" value = "3d">3D</option>';
                    $('#searchFilters_select').empty().append(html);
                }
                if ((search_engine === 'youtube') || (search_engine === 'dailymotion')) {
                    $('#video_search_query').prop('disabled', false);
                    $("#searchTypes_select").show();
                    $('#searchTypes_label').show();
                    $('#orderBy_label').show();
                    $('#orderBy_select').show();
                    $('#dateTypes_label').hide();
                    $('#dateTypes_select').hide();
                    $('#searchFilters_label').show();
                    $('#searchFilters_select').show();
                }
                if (search_engine === 'youtube') {
					$("#duration_select").show();
                    $('#duration_label').show();
				}
                $(".nano").nanoScroller({ destroy: true });
				$('.selectpicker').selectpicker('refresh');
            }
        });
    });
    // search date select
    $("select#dateTypes_select").change(function() {
        $("select#dateTypes_select option:selected").each(function() {
            pagination_init = false;
            current_start_index = 1;
            current_prev_start_index = 1;
            current_page = 1;
            current_search_page = 1;
            itemsCount = 0;
            searchDate = $(this).val();
        });
    });
    // search date select
    $("select#duration_select").change(function() {
        $("select#duration_select option:selected").each(function() {
            pagination_init = false;
            current_start_index = 1;
            current_prev_start_index = 1;
            current_page = 1;
            current_search_page = 1;
            itemsCount = 0;
            searchDuration = $(this).val();
        });
    });
    // search order
    $("select#orderBy_select").change(function() {
        $("select#orderBy_select option:selected").each(function() {
            pagination_init = false;
            current_start_index = 1;
            current_prev_start_index = 1;
            current_page = 1;
            current_search_page = 1;
            itemsCount = 0;
            search_order = $(this).val();
        });
    });
    // categories 
    $("select#categories_select").change(function() {
        $("select#categories_select option:selected").each(function() {
            selected_category = $(this).val();
            pagination_init = false;
            current_start_index = 1;
            current_prev_start_index = 1;
            current_page = 1;
            current_search_page = 1;
            itemsCount = 0;
            try {
                engine.search_type_changed();
                engine.pagination_init = false;
                searchOptions.currentPage = 1;
            } catch (err) {

            }
        });
    });
    //search filters
    $("select#searchFilters_select").change(function() {
        $("select#searchFilters_select option:selected").each(function() {
            pagination_init = false;
            current_start_index = 1;
            current_prev_start_index = 1;
            current_page = 1;
            current_search_page = 1;
            itemsCount = 0;
            searchFilters = $(this).val();
        });
    });
    // search types
    $("select#searchTypes_select").change(function() {
        $("select#searchTypes_select option:selected").each(function() {
            searchTypes_select = $(this).val();
            pagination_init = false;
            current_start_index = 1;
            current_prev_start_index = 1;
            current_page = 1;
            current_search_page = 1;
            itemsCount = 0;
            try {
                engine.search_type_changed();
                engine.pagination_init = false;
                searchOptions.currentPage = 1;
                $('.selectpicker').selectpicker('refresh');
            } catch (err) {
                console.log(err);
                $('#searchFilters_label').show();
                $('#searchFilters_select').show();
                if(search_engine === 'youtube') {
					$('#duration_label').show();
					$('#duration_select').show();
				}
                if ((searchTypes_select === 'topRated') || (searchTypes_select === 'mostViewed')) {
                    $('#video_search_query').prop('disabled', true);
                    $('#orderBy_label').hide();
                    $('#orderBy_select').hide();
                    $('#searchFilters_label').hide();
                    $('#searchFilters_select').hide();
                    var html = '<option value = "today">' + _("Today") + '</option> \
								<option value = "this_week">' + _("This week") + '</option> \
								<option value = "this_month">' + _("This month") + '</option> \
								<option value = "all_time">' + _("All time") + '</option>';
                    $('#dateTypes_select').empty().append(html).show();
                    $('#dateTypes_label').show();
                    $('#duration_label').hide();
                    $('#duration_select').hide();
                } else {
                    $('#video_search_query').prop('disabled', false);
                    $('#searchTypes_label').show();
                    $('#orderBy_label').show();
                    $('#orderBy_select').show();
                    $('#dateTypes_label').hide();
                    $('#dateTypes_select').hide();
                    $('#searchFilters_label').show();
                    $('#searchFilters_select').show();
                }

                if (searchTypes_select === 'category') {
                    $('#categories_label').show();
                    $('#categories_select').show();
                    $('#orderBy_label').hide();
                    $('#orderBy_select').hide();
                } else {
                    $('#categories_label').hide();
                    $('#categories_select').hide();
                }
                
                if (searchTypes_select === 'playlists' || searchTypes_select === 'channels') {
					$('#dateTypes_label').hide();
                    $('#dateTypes_select').hide();
                    $('#duration_label').hide();
                    $('#duration_select').hide();
                    $('#searchFilters_label').hide();
                    $('#searchFilters_select').hide();
				}
                
                $('.selectpicker').selectpicker('refresh');
            }
        });
    });
    // convert to mp3
    $(document).on('click', '.convert', function(e) {
        e.preventDefault();
        convertTomp3Win($(this).attr('alt'));
    });
    // hide progress
    $(document).on('click', '.hide_bar', function(e) {
        e.preventDefault();
        $(this).closest('.progress').hide();
    });
    //settings
    $('#config_btn').click(function() {
        $('#settingsToggle').click();
    });
    
    $('#playerToggle').click(function() {
        $('#playerContainer').show();
        $('#playerTopBar').show();
    });
    

    // airplay
    $('#airplay-toggle').click(function(e) {
        e.preventDefault();
        if (airplayToggleOn === false) {
            playAirMedia = true;
            airplayToggleOn = true;
            login(getAirMediaReceivers);
            $('#airplay-toggle').removeClass('airplay-disabled').addClass('airplay-enabled');
        } else {
            $('#airplay-toggle').qtip('destroy', true);
            $('#airplay-toggle').removeClass('airplay-enabled').addClass('airplay-disabled');
            airplayToggleOn = false;
            playAirMedia = false;
        }
    });
    
    $('#upnp-toggle').click(function(e) {
        e.preventDefault();
        if (upnpToggleOn === false) {
            playUpnpMedia = true;
            upnpToggleOn = true;
            loadUpnpRenderers();
            $('#upnp-toggle').removeClass('upnp-disabled').addClass('upnp-enabled');
        } else {
            $('#upnp-toggle').qtip('destroy', true);
            $('#upnp-toggle').removeClass('upnp-enabled').addClass('upnp-disabled');
            upnpToggleOn = false;
            playUpnpMedia = false;
        }
    });

    $(document).on('change', '.qtip-content input', function() {
		var inputClass = $(this).attr('class');
        var selected = $(this).prop('name');
        if(inputClass === "freebox") {
			airMediaDevice = selected;
		} else {
			__.some(cli._avTransports, function( el,index ) {
				if(el.friendlyName === selected) { upnpDevice = el._index}
				mediaRenderer = new Plug.UPnP_AVTransport( cli._avTransports[upnpDevice], { debug: false } );
				if(upnpMediaPlaying) {
					initPlayer();
				}
			});
		}
		$(".qtip-content input").each(function() {
			var name = $(this).prop('name');
			if (name !== selected) {
				$(this).prop('checked', '');
			}
		});
    });

    // rotate image
    $('#file_update').click(function(e) {
        e.preventDefault();
        AnimateRotate(1080);
        createLocalRootNodes();
    });

    // start default search
    searchTypes_select = 'videos';
    $('#video_search_query').prop('disabled', false);
    $('#orderBy_label').show();
    $('#orderBy_select').show();
    $('#searchFilters_label').show();
    $('#searchFilters_select').show();
    $('#dateTypes_label').hide();
    $('#dateTypes_select').hide();
    $('#items_container').hide();
    $('#song-title').empty().append(_('Stopped...'));

    window.ondragover = function(e) {
        e.preventDefault();
        return false
    };
    window.ondrop = function(e) {
        e.preventDefault();
        return false
    };

    var holder = document.getElementById('mainContainer');
    holder.ondrop = function(e) {
        e.preventDefault();
        var file = e.dataTransfer.files[0],
            reader = new FileReader();
        reader.onload = function(event) {};
        if (file.type === "application/x-bittorrent") {
            getTorrent(file.path);
        }
        return false;
    };
    
    win.on('maximize', function() {
        setTimeout(function() {
			$(".nano").nanoScroller();
        }, 200);
    });

    win.on('unmaximize', function() {
        setTimeout(function() {
            $(".nano").nanoScroller();
        }, 200);
    });
    
    win.on('resize', function() {
        $(".nano").nanoScroller();
        settings.defaultWidth = win.width;
		settings.defaultHeight = win.height;
		saveSettings();
    });

	// load upnp devices
	cli.searchDevices();
	cli.on('updateUpnpDevice', function() {
		updateUpnpList()
	});
    
    var observer = new MutationObserver(function(mutations) {
      if(spinnerPlay === false) {
		startAnimation();
		spinnerPlay = true;
	  } else {
		stopAnimation();  
		spinnerPlay = false;
	  }
    });
    var target = document.querySelector('#loading');
    observer.observe(target, { attributes: true });
	stopAnimation();
    loadConfig();
    
	if(settings.init) {
		checkUpdates();
		checkFreebox();
	} else {
		$("#settingsToggle").click();
	}
	if(settings.locale_changed) {
		settings.locale_changed=false;
		saveSettings();
	}
	
	var w = 0;
	$.each($("#tab a"),function(index,size) { 
		w+=$(this).width();
		if(index+1 == $("#tab a").length) { 
			var wid = Math.round(w / 2) + 100;
			$("#navBar").css('margin-left','-'+wid+'px')
		}
	})
	
	$('.tab-content').bind('DOMNodeInserted DOMNodeRemoved DOMSubtreeModified DOMCharacterDataModified', function() {
		updateScroller();
	});
	$('.selectpicker').selectpicker({
	  style: 'btn-default btn-sm',
	  hideDisabled : true
	});
}

function updateScroller() {
	if(activeTab == 1) {
		setTimeout(function() {
			try {
				$(".nano").nanoScroller();
				try {
					scrollObserver.disconnect();
				} catch(err) {}
				scrollObserver = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						try {
							var pos = $('.nano-pane').height() - ($('.nano-slider').position().top + $('.nano-slider').height());
							if(engine) {
								if(activeTab == 1 && ($('.nano-pane').height() > $('.nano-slider').height() && pos == 0 && $("#items_container ul li").length == engine.lazyStart) || !$('.nano-slider').is(':visible') && $("#items_container ul li").length == engine.lazyStart){
									if(engine.lazyStart !== engine.lazyLength) {
										engine.loadMore();
									}
								} else if (activeTab == 1 && ($('.nano-pane').height() > $('.nano-slider').height() && pos == 0 && !engine.pageLoading ) || $("#items_container ul li").length !== 0 && !$('.nano-slider').is(':visible') && !engine.pageLoading) {
									if($("#items_container ul li").length < engine.totalItems) {
										engine.loadMore();
									}
								}
							} else {
								if (activeTab == 1 && ($('.nano-pane').height() > $('.nano-slider').height() && pos == 0 && !pageLoading ) || $("#items_container div.youtube_item").length !== 0 && !$('.nano-slider').is(':visible') && !pageLoading) {
									if(search_engine === "youtube" && searchTypes_select === "playlists" && $("#items_container div.youtube_item_playlist").length !== 0 && $("#items_container div.youtube_item_playlist").length < totalResults) {	
										current_page += 1;
										pageLoading = true;
										changePage();
									} else if( activeTab == 1 && search_engine === "youtube" && searchTypes_select === "channels" && $("#items_container div.youtube_item_channel").length !== 0 && $("#items_container div.youtube_item_channel").length < totalResults) {	
										current_page += 1;
										pageLoading = true;
										changePage();
									} else if(activeTab == 1 && search_engine === "youtube" && searchTypes_select === "channels" && $("#items_container div.youtube_item").length < totalResults) {	
										current_page += 1;
										pageLoading = true;
										changeChannelPage();
									} else if(activeTab == 1 && $("#items_container div.youtube_item").length < totalResults) {
										current_page += 1;
										pageLoading = true;
										changePage();
									} 
								}
							}
						} catch(err) {
							console.log(err)
						}
					});    
				});
				var target = document.querySelector('.nano-slider');
				scrollObserver.observe(target, { attributes : true, attributeFilter : ['style'] });
		} catch(err) {
			$(".nano").nanoScroller();
		}
		},1000);
	} else {
		$(".nano").nanoScroller();
	}
}

function updatePickers() {
	$('.selectpicker').selectpicker('refresh');
}

function changePage() {
	if(activeTab == 1) {
		startSearch(current_search);
	}
}

function onKeyPress(key) {
    if (key.key === 'Esc' && document.activeElement.localName === "body") {
        key.preventDefault();
        if (win.isFullscreen === true) {
            win.toggleFullscreen();
            player.isFullScreen = false;
        }
    } else if (key.key === 'f' && document.activeElement.localName === "body") {
        key.preventDefault();
        if (win.isFullscreen === true) {
            win.toggleFullscreen();
            $('#menu').show();
            player.isFullScreen = false;
        } else {
            player.isFullScreen = true;
            win.enterFullscreen();
        }
    } else if (key.key === 'Spacebar' && document.activeElement.localName === "body") {
        key.preventDefault();
            if(player.media.paused) {
				$('#subPlayer-play').hide();
				$('#subPlayer-pause').show();
				player.play();
			} else {
				$('#subPlayer-play').show();
				$('#subPlayer-pause').hide();
				player.pause();
			}
    } else if (key.key === 'd' && document.activeElement.localName === "body") {
        key.preventDefault();
        win.showDevTools();
    }
}

function update_searchOptions() {
    searchOptions.searchType = $("#searchTypes_select").val();
    searchOptions.orderBy = $("#orderBy_select").val();
    searchOptions.dateFilter = $("#dateTypes_select").val();
    searchOptions.searchFilter = $("#searchFilters_select").val();
    searchOptions.category = $("#categories_select").val();
    engine.search_type_changed();
}

//search
function startSearch(query) {
    $("#search p").empty().append(' ');
    $('#loading p').empty().append(_("Loading..."));

    if ((query === '') && (browse === false) || (query === '') && engine && engine.searchType && engine.searchType == "search") {
        current_search = '';
        if ((searchTypes_select !== 'category') && (searchTypes_select !== 'topRated') && (searchTypes_select !== 'mostViewed')) {
            $('#video_search_query').attr('placeholder', '').focus();
            return;
        }
    }
    $('#search').hide();
    $('#loading').show();
    if (query !== current_search) {
        current_page = 1;
        current_search_page = 1;
        current_start_index = 1;
        searchOptions.currentPage = 1;
        itemsCount = 0;
        pagination_init = false;
        channelPagination = false;
        $('#items_container').empty().hide();
    }
    current_search = query;
    try {
        searchOptions.searchType = $("#searchTypes_select option:selected").val();
        searchOptions.orderBy = $("#orderBy_select option:selected").val();
        searchOptions.dateFilter = $("#dateTypes_select option:selected").val();
        searchOptions.searchFilter = $("#searchFilters_select option:selected").val();
        searchOptions.category = $("#categories_select option:selected").val();
        searchOptions.currentPage = current_page;
        engine.search(query, searchOptions, win.window);
    } catch (err) {
		pageLoading = true;
        if (search_engine === 'dailymotion') {
            if (searchTypes_select === 'videos') {
                dailymotion.searchVideos(query, current_page, searchFilters, search_order, function(datas) {
                    getVideosDetails(datas, 'dailymotion', false);
                });
            } else if (searchTypes_select === 'playlists') {
                dailymotion.searchPlaylists(query, current_page, function(datas) {
                    getPlaylistInfos(datas, 'dailymotion');
                });
            } else if (searchTypes_select === 'category') {
                dailymotion.categories(query, current_page, searchFilters, selected_category, function(datas) {
                    getVideosDetails(datas, 'dailymotion', false);
                });
            }
        } else if (search_engine === 'youtube') {
            if (searchTypes_select === 'videos') {
                youtube.searchVideos(query, current_page, searchFilters, search_order, searchDuration, function(datas) {
                    getVideosDetails(datas, 'youtube', false);
                });
            } else if (searchTypes_select === 'playlists') {
                youtube.searchPlaylists(query, current_page, function(datas) {
                    getPlaylistInfos(datas, 'youtube');
                });
            } else if (searchTypes_select === 'category') {
                youtube.categories(query, current_page, searchFilters, selected_category, duration, function(datas) {
                    getVideosDetails(datas, 'youtube', false);
                });
            } else if (searchTypes_select === 'channels') {
                youtube.searchChannels(query, current_page, function(datas) {
                    getChannelsInfos(datas, 'youtube');
                });
            } else if (searchTypes_select === 'topRated') {
                youtube.standard(current_page, localeCode, 'top_rated', searchDate, function(datas) {
                    getVideosDetails(datas, 'youtube', false);
                });
            } else if (searchTypes_select === 'mostViewed') {
                youtube.standard(current_page, localeCode, 'most_popular', searchDate, function(datas) {
                    getVideosDetails(datas, 'youtube', false);
                });
            }
        }
    }
}

function changeChannelPage() {
    if (current_channel_engine === 'youtube') {
        youtube.loadChannelSongs(current_channel_link, current_page, function(datas) {
            fillPlaylistFromChannel(datas, current_channel_engine);
        });
    }
}
