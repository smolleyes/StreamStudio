function loadSettingsPage(refresh) {
	var html = '<div class="container"><h1 id="config_title">'+_("StreamStudio configuration:")+'</h1> \
	<div style="height:36px;"> \
		<label>'+_("Language:")+'</label> \
		<select name="countries" id="countries" style="width:300px;"> \
		  <option value="en" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag gb" data-title="England">English</option> \
		  <option value="fr" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag fr" data-title="France">French</option> \
		  <option value="es" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag es" data-title="Spain">Spanish</option> \
		  <option value="gr" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag gr" data-title="Greek">Greek</option> \
		  <option value="it" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag it" data-title="Italia">Italia</option> \
		</select> \
    </div> \
    <div style="height:36px;"> \
      <label>'+_("Maximum resolution:")+'</label> \
      <select id="resolutions_select"> \
		    <option value = "1080p">1080p</option> \
		    <option value = "720p">720p</option> \
		    <option value = "480p">480p</option> \
		    <option value = "360p">360p</option> \
      </select> \
    </div> \
    <div style="height:36px;"> \
      <label>'+_("Download directory:")+'</label> \
      <input type="text" id="download_path"></input><button id="choose_download_dir">'+_("Select")+'</button> \
    </div> \
    <div> \
      <p> \
        <b><u>'+_("Plugins choice:")+'</u></b> \
        <br> \
        '+_("Please read the disclaimer here : <u><a id='disclaimer' style='color:red;' href='#'>disclaimer</a></u>")+' \
      </p> \
      <div style="border: 1px solid black;height:34px;"> \
        <!--<div class="ItemCheckbox left">\
          <label for="vimeo">Vimeo</label>\
          <input class="pluginCheckBox" type="checkbox" id="vimeo" name="vimeo">\
        </div>-->\
        <div class="ItemCheckbox left">\
          <label for="songza">Songza</label>\
          <input class="pluginCheckBox" type="checkbox" id="songza" name="songza">\
        </div>\
        <div class="ItemCheckbox left">\
          <label for="grooveshark">Grooveshark</label>\
          <input class="pluginCheckBox" type="checkbox" id="grooveshark" name="grooveshark">\
        </div>\
        <div class="ItemCheckbox">\
          <label for="mega-search">Mega-search.ws</label>\
          <input class="pluginCheckBox" type="checkbox" id="mega-search" name="mega-search">\
        </div>\
        <div class="ItemCheckbox left">\
          <label for="omgtorrent">Cpasbien</label>\
          <input class="pluginCheckBox" type="checkbox" id="cpasbien" name="cpasbien">\
        </div>\
        <div class="ItemCheckbox left">\
          <label for="omgtorrent">Thepiratebay</label>\
          <input class="pluginCheckBox" type="checkbox" id="thepiratebay" name="thepiratebay">\
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
    <p><u><b>'+_("Default player:")+'</b></u></p> \
    <div id="externalPlayers"> \
		<select id="playerSelect"></select> \
    </div> \
    <div style="height:240px;margin-top:30px;"> \
			<p>'+_("Add or remove directories to scan for your local library:")+'</p> \
			<select id="shared_dir_select" multiple name="shared_dir"> \
			</select> \
		</div> \
		<div id="shared_dir_controls"> \
				<button id="add_shared_dir">'+_("Add")+'</button> \
				<button id="remove_shared_dir" >'+_("Remove")+'</button> \
		</div>\
    <br\><br\> \
    <button id="valid_config">'+_("Save")+'</button> \
    <p id="version" style="position:absolute;bottom:-12px;width:100%;" class="list-divider">V '+settings.version+'</p></div> \
    <input style="display:none;" id="fileDialog" type="file" nwdirectory /> \
    <input style="display:none;" id="sharedDirDialog" type="file" nwdirectory /> \
';
$("#tabpage_7").empty().append(html);
loadConfig();
}
