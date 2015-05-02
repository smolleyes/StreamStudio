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
var htmlStr ='<div id="menu"> \
    <div class="input-group" style="margin-bottom: 15px;margin: 0 -5px 15px -5px;"> \
        \
        <input type="text" id="video_search_query" class="form-control" name="video_search_query" placeholder="' + _("Enter your search...") + '"> \
        <div class="input-group-btn"> \
            <button class="btn btn-default" type="submit" style="top: 4px;height: 34px;"><i class="glyphicon glyphicon-search"></i></button> \
        </div> \
    </div> \
    <ul id="searchPanel"> \
        <li id="engines_select" class="dropdown btn-default btn-sm"> \
            <a class="dropdown-toggle" data-toggle="dropdown" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
            Youtube \
            <span class="caret"></span> \
            </a> \
            <ul class="dropdown-menu" role="menu" style="width:100%;"> \
                <li class="active"><a href="#" data-value="youtube">Youtube</a></li> \
                <li><a href="#" data-value="dailymotion">Dailymotion</a></li> \
            </ul> \
        </li> \
        <label id="searchTypesMenu_label">' + _("Search type:") + '</label> \
        <li id="searchTypes_select" class="dropdown btn-default btn-sm"> \
            <a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
            ' + _("Videos") + ' \
            <span class="caret"></span> \
            </a> \
            <ul class="dropdown-menu" role="menu" style="width:100%;"> \
                <li class="active"> \
                    <a href="#" data-value="videos"> \
                        ' + _("Videos") + '</option> \
                <li><a href="#" data-value="playlists">' + _("Playlists") + '</option> \
                <li><a href="#" data-value="category">' + _("Categories") + '</option> \
                <li><a href="#" data-value="channels" id="channelsOpt">' + _("Channels") + '</a></li> \
                <li><a href="#" data-value="topRated" id="topRatedOpt">' + _("Top rated") + '</a></li> \
                <li><a href="#" data-value="mostViewed" id="mostViewed">' + _("Most viewed") + '</a></li> \
            </ul> \
        </li> \
        <label id="dateTypes_label" style="margin-top: 5px;">' + _("Date:") + '</label> \
        <li id="dateTypes_select" class="dropdown btn-default btn-sm"> \
            <a class="dropdown-toggle" data-toggle="dropdown" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
            ' + _("Today") + ' \
            <span class="caret"></span> \
            </a> \
            <ul class="dropdown-menu" role="menu" style="width:100%;"> \
                <li class="active"><a href="#" data-value="today">' + _("Today") + '</a></li> \
                <li><a href="#" data-value="this_week">' + _("This week") + '</a></li> \
                <li><a href="#" data-value="this_month">' + _("This month") + '</a></li> \
                <li><a href="#" data-value="all_time">' + _("All time") + '</a></li> \
            </ul> \
        </li> \
        <label id="categories_label">' + _("Category:") + '</label> \
        <li id="categories_select" class="dropdown btn-default btn-sm"> \
            <a class="dropdown-toggle" data-toggle="dropdown" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
            ' + _("No filters") + ' \
            <span class="caret"></span> \
            </a> \
            <ul class="dropdown-menu" role="menu" style="width:100%;"> \
                <li class="active"><a href="#" data-value="">' + _("No filters") + '</a></li> \
            </ul> \
        </li> \
        <label id="orderBy_label">' + _("Order by:") + '</label> \
        <li id="orderBy_select" class="dropdown btn-default btn-sm"> \
            <a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
            ' + _("Relevance") + ' \
            <span class="caret"></span> \
            </a> \
            <ul class="dropdown-menu" role="menu" style="width:100%;"> \
                <li class="active"><a href="#" data-value="relevance">' + _("Relevance") + '</a></li> \
                <li><a href="#" data-value="published">' + _("Published") + '</a></li> \
                <li><a href="#" data-value="viewCount">' + _("Views") + '</a></li> \
                <li><a href="#" data-value="rating">' + _("Rating") + '</a></li> \
            </ul> \
        </li> \
        <label id="duration_label" style="margin-top: 5px;">' + _("Duration:") + '</label> \
        <li id="duration_select" class="dropdown btn-default btn-sm"> \
            <a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
            ' + _("No filters") + ' \
            <span class="caret"></span> \
            </a> \
            <ul class="dropdown-menu" role="menu" style="width:100%;"> \
                <li class="active"><a href="#" data-value="">' + _("No filters") + '</a></li> \
                <li><a href="#" data-value="short">' + _("Short (<4 min)") + '</a></li> \
                <li><a href="#" data-value="medium">' + _("Medium (4 <-> 20 min)") + '</a></li> \
                <li><a href="#" data-value="long">' + _("Long (>20 min)") + '</a></li> \
            </ul> \
        </li> \
        <label id="searchFilters_label" style="margin-top: 5px;">' + _("Filters:") + '</label> \
        <li id="searchFilters_select" class="dropdown btn-default btn-sm"> \
            <a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
            ' + _("No filters") + ' \
            <span class="caret"></span> \
            </a> \
            <ul class="dropdown-menu" role="menu" style="width:100%;"> \
                <li class="active"><a href="#" data-value="">' + _("No filters") + '</a></li> \
                <li><a href="#" data-value="hd">HD</a></li> \
                <li><a href="#" data-value="3d" id="3dopt">3D</a></li> \
            </ul> \
        </li> \
    </ul> \
    <button id="video_search_btn" type="submit" class="btn btn-success btn-sm">' + _("Send") + '</button>  \
</div> \
<div id="upnpBubble" class="panel panel-default" style="display:none;"> \
    <div class="panel-body"> \
        <span>' + _("Play thru Upnp") + '</span> \
        <div id="upnpRenderersContainer" style="display:none;"> \
            <a id="upnp-toggle" class="upnp tiptip upnp-disabled"></a> \
            <form id="upnpPopup" style="display:none;"></form> \
        </div>\
        <div id="upnpTranscoding" style="margin-top:10px;display:none;"> \
            <span>' + _("Enable transcoding") + '</span> \
            <input type="checkbox" id="transcodingInput" name="enableTranscoding"></input> \
        </div>\
    </div>\
</div>\
</div> <!-- end lg-3 -->';

var htmlContent =
'<div class="tab-content" style="height:100%;padding: 0 10px;"> \
    <div class="tab-pane active" id="tabpage_1"> \
        <div id="loading" style="display:None;"> \
            <div id="spinner" style="float:left;margin-right:10px;"></div> \
            <p style="position:relative;top:5px;">' + _(" Loading videos...") + '</p> \
        </div> \
        <div id="search"> \
            <div id="search_results"> \
                <p>' + _("Welcome to StreamStudio !<br><br>Make a new search or select a category to start...") + '</p> \
            </div> \
        </div> \
        <div id="nanoContent1" class="nano" style="height:calc(100% - 201px);"> \
            <div id="items_container" class="nano-content"></div> \
        </div> \
    </div> \
    <div class="tab-pane" id="tabpage_3"> \
        <a id="file_update" href="#"><img src="images/update.png" id="update_img" /> \
        <span>' + _("Update files list...") + '</span></a> \
        <div id="fileBrowser"> \
            <div id="nanoContent3" class="nano"> \
                <div id="fileBrowserContent" class="nano-content"></div> \
            </div> \
        </div> \
    </div> \
    <div class="tab-pane" id="tabpage_4"> \
        <a style="visibility: hidden;" href="#">test</a> \
        <div id="nanoContent5" class="nano" style="height:calc(100% - 170px);top:-15px;"> \
            <div id="DownloadsContainer" class="nano-content" ></div> \
        </div> \
    </div> \
    <div class="tab-pane" id="tabpage_5"> \
        <a style="visibility: hidden;" href="#">test</a> \
        <div id="nanoContent5" class="nano" style="height:calc(100% - 170px);top:-15px;"> \
            <div id="UpnpContainer" class="nano-content"></div> \
        </div> \
    </div> \
    <div class="tab-pane" id="tabpage_6"> \
        <a style="visibility: hidden;" href="#">test</a> \
        <div id="favoritesPage"> \
            <div id="tab" class="btn-group" data-toggle="buttons-radio" style="width:100%;"> \
                <ul style="display:none;" class="nav nav-tabs" role="tablist"> \
                    <li style="width:100%;" role="presentation" class="active"><a href="#subtabpage_8" id="seriesToggle" class="tab-pane active" data-toggle="tab">'+_("Series")+'</a></li> \
                    <li style="width:50%;" role="presentation"><a href="#subtabpage_9" id="moviesToggle" style="display:none;" class="tab-pane" data-toggle="tab">'+_("Movies")+'</a></li> \
                </ul> \
                <div class="container-fluid"> \
                    <div class="row"> \
                        <div class="tab-pane" id="subtabpage_8" style="display:none;"> \
                            <div id="nanoContent8"> \
                                <div id="searchSeriesContainer"> \
                                    <div id="searchSeries"> \
                                        <label>'+_("Search serie :")+'</label> \
                                        <input type="text" id="searchSerieByName" placeholder="'+_("search by name...")+'"></input> \
                                        <button href="#" class="btn btn-success" id="searchSerieSend">'+_("Search")+'</button> \
                                        <button href="#" class="btn btn-info" id="refreshSeries">'+_("Refresh your series")+'</button> \
                                    </div> \
                                </div> \
                                <div id="seriesContainer"> \
                                    <p></p> \
                                    <ul id="mySeries"></ul> \
                                </div> \
                            </div> \
                        </div> \
                        <div class="tab-pane" id="subtabpage_9" style="display:none;"> \
                            <div id="nanoContent9"> \
                                <div id="moviesContainer" > \
                                    <p></p> \
                                    <ul id="myMovies"></ul> \
                                </div> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
            </div> \
        </div> <!-- end fav content --> \
    </div> \
    <div class="tab-pane" id="tabpage_7"> \
        <div class="container" style="width:calc(100% - 5px);"> \
            <div class="row"> \
                <legend> \
                    <h3>' + _("StreamStudio Settings") + '<span style="font-size: 12px;margin-top: 11px;position: relative;top: -2px;left: 10px;"><b>(V' + settings.version + ')</b></span><span id="aboutStreamStudio"><a href="#">'+_("About StreamStudio")+'</a></span></h3><hr style="margin-right:20px;"> \
                    <form style="float-right;margin-left:10px;" id="donate" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"> \
                        <input type="hidden" name="cmd" value="_s-xclick"> \
                        <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----MIIHLwYJKoZIhvcNAQcEoIIHIDCCBxwCAQExggEwMIIBLAIBADCBlDCBjjELMAkGA1UEBhMCVVMxCzAJBgNVBAgTAkNBMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtQYXlQYWwgSW5jLjETMBEGA1UECxQKbGl2ZV9jZXJ0czERMA8GA1UEAxQIbGl2ZV9hcGkxHDAaBgkqhkiG9w0BCQEWDXJlQHBheXBhbC5jb20CAQAwDQYJKoZIhvcNAQEBBQAEgYCwVDYGgBMWnaN3E9OJh5EjGoAQSv4MeQ7B+vSM+ol6rw243J5GnTGv7J6AaYUrhs8T+qwUFgiYW4W70YgyEJ6/jAKkppI5uLpURWgJb5xVa8+wKD3RHzDFD8tjxW8l4Uv/bfGfg/KeUhg8uCqxkCmXXS4xH+qc2bCRBCNVxEEOJDELMAkGBSsOAwIaBQAwgawGCSqGSIb3DQEHATAUBggqhkiG9w0DBwQITiGpDY6oRtmAgYiSdKnwAaA4mM+khmwASQ2ghy4lb4C5TvkKvfkwhvqXoIQct9wpNuczmrs4XejZoacDzVtAuCs8WDu3FdOvmtKZ/xyPozsKiz8dcmH4KSwJxlP0SxOlUBFFV67H/+LOPqGBQdb6Wp03Tal618gICDi9hrsuSwKMpoz0wzDnXZK4m1Z4P1SjSGwfoIIDhzCCA4MwggLsoAMCAQICAQAwDQYJKoZIhvcNAQEFBQAwgY4xCzAJBgNVBAYTAlVTMQswCQYDVQQIEwJDQTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEUMBIGA1UEChMLUGF5UGFsIEluYy4xEzARBgNVBAsUCmxpdmVfY2VydHMxETAPBgNVBAMUCGxpdmVfYXBpMRwwGgYJKoZIhvcNAQkBFg1yZUBwYXlwYWwuY29tMB4XDTA0MDIxMzEwMTMxNVoXDTM1MDIxMzEwMTMxNVowgY4xCzAJBgNVBAYTAlVTMQswCQYDVQQIEwJDQTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEUMBIGA1UEChMLUGF5UGFsIEluYy4xEzARBgNVBAsUCmxpdmVfY2VydHMxETAPBgNVBAMUCGxpdmVfYXBpMRwwGgYJKoZIhvcNAQkBFg1yZUBwYXlwYWwuY29tMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBR07d/ETMS1ycjtkpkvjXZe9k+6CieLuLsPumsJ7QC1odNz3sJiCbs2wC0nLE0uLGaEtXynIgRqIddYCHx88pb5HTXv4SZeuv0Rqq4+axW9PLAAATU8w04qqjaSXgbGLP3NmohqM6bV9kZZwZLR/klDaQGo1u9uDb9lr4Yn+rBQIDAQABo4HuMIHrMB0GA1UdDgQWBBSWn3y7xm8XvVk/UtcKG+wQ1mSUazCBuwYDVR0jBIGzMIGwgBSWn3y7xm8XvVk/UtcKG+wQ1mSUa6GBlKSBkTCBjjELMAkGA1UEBhMCVVMxCzAJBgNVBAgTAkNBMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtQYXlQYWwgSW5jLjETMBEGA1UECxQKbGl2ZV9jZXJ0czERMA8GA1UEAxQIbGl2ZV9hcGkxHDAaBgkqhkiG9w0BCQEWDXJlQHBheXBhbC5jb22CAQAwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQUFAAOBgQCBXzpWmoBa5e9fo6ujionW1hUhPkOBakTr3YCDjbYfvJEiv/2P+IobhOGJr85+XHhN0v4gUkEDI8r2/rNk1m0GA8HKddvTjyGw/XqXa+LSTlDYkqI8OwR8GEYj4efEtcRpRYBxV8KxAW93YDWzFGvruKnnLbDAF6VR5w/cCMn5hzGCAZowggGWAgEBMIGUMIGOMQswCQYDVQQGEwJVUzELMAkGA1UECBMCQ0ExFjAUBgNVBAcTDU1vdW50YWluIFZpZXcxFDASBgNVBAoTC1BheVBhbCBJbmMuMRMwEQYDVQQLFApsaXZlX2NlcnRzMREwDwYDVQQDFAhsaXZlX2FwaTEcMBoGCSqGSIb3DQEJARYNcmVAcGF5cGFsLmNvbQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMTQxMDI3MjAzNTQ2WjAjBgkqhkiG9w0BCQQxFgQUj+h927d/XDJyRjOX60NVYbDARnEwDQYJKoZIhvcNAQEBBQAEgYC4cy8N6cI4s0wjvpfg7mxVtSESKkYrexKJAgl2B3xaXZu8EUUIv6/L9ImsW337y1nWTU5TAzGXUrbOKxbmYp+MoGICsAPwkTZ21DN1eUREljb5RG6Agn8y/Q8H5Izz/G0IoaZQq3Iw4HVoacbIGcIJcVQZuNo5KDR06NxgEnHDOQ==-----END PKCS7----- "> \
                        <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"> \
                        <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"> \
                    </form> \
                </legend> \
                <div id="nanoContent7" class="nano" class="nano-content" style="height:calc(100% - 205px);top:-25px;"> \
                    <form role="form" class="nano-content" style="padding-top:10px;"> \
                        <div class="form-group"> \
                            <label>' + _("Language:") + '</label> \
                            <select name="countries" id="countries" style="width:300px;"> \
                                <option value="en" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag gb" data-title="England">English</option> \
                                <option value="fr" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag fr" data-title="France">Français</option> \
                                <option value="es" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag es" data-title="Spain">Spanish</option> \
                                <option value="gr" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag gr" data-title="Greek">Greek</option> \
                                <option value="it" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag it" data-title="Italia">Italian</option> \
                                <option value="de" data-image="images/msdropdown/icons/blank.gif" data-imagecss="flag de" data-title="Deutsch">German</option> \
                            </select> \
                        </div> \
                        <div class="form-group"> \
                            <label>' + _("Maximum resolution:") + '</label> \
                            <li id="resolutions_select_cont" class="dropdown btn-default btn-sm"> \
                                <a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
                                1080p \
                                <span class="caret"></span> \
                                </a> \
                                <ul class="dropdown-menu" id="resolutions_select" role="menu" style="width:100%;"> \
                                    <li class="active"><a href="#" data-value="1080p">1080p</a></li> \
                                    <li><a href="#" data-value="720p">720p</a></li> \
                                    <li><a href="#" data-value="480pp">480p</a></li> \
                                    <li><a href="#" data-value="360p">360p</a></li> \
                                    <li><a href="#" data-value="240p">240p</a></li> \
                                </ul> \
                            </li> \
                        </div> \
                        <div class="form-group"> \
                            <label>' + _("Download directory:") + '</label> \
                            <div> \
                                <div class="input-group" style="margin-left:-5px;"> \
                                    <input type="text" id="download_path"></input><button class="btn btn-default btn-sm" id="choose_download_dir" class="input-group-addon">' + _("Select") + '</button> \
                                </div> \
                            </div> \
                        </div> \
                        <div class="form-group"> \
                            <p><b><u>'+ _("Plugins choice:")+'</u></b><br>'+_("Please read the disclaimer here : <u><a id='disclaimer' style='color:red;' href='#'>disclaimer</a></u>")+'</p> \
                            <div class="input-group well" style="display: table !important;"> \
                                <!--<div class="ItemCheckbox left"> \
                                    <label for="vimeo">Vimeo</label> \
                                    <input class="pluginCheckBox" type="checkbox" id="vimeo" name="vimeo"> \
                                    </div>--> \
                                <div class="ItemCheckbox left"> \
                                    <label for="songza">Songza</label> \
                                    <input class="pluginCheckBox" type="checkbox" id="songza" name="songza"> \
                                </div> \
                                <div class="ItemCheckbox left"> \
                                    <label for="twitch">Twitch</label> \
                                    <input class="pluginCheckBox" type="checkbox" id="twitch" name="twitch"> \
                                </div> \
                                <div class="ItemCheckbox left"> \
                                    <label for="thepiratebay">Piratebay</label> \
                                    <input class="pluginCheckBox" type="checkbox" id="thepiratebay" name="thepiratebay"> \
                                </div> \
                                <div class="ItemCheckbox left"> \
                                    <label for="omgtorrent">Cpasbien</label> \
                                    <input class="pluginCheckBox" type="checkbox" id="cpasbien" name="cpasbien"> \
                                </div> \
                                <div class="ItemCheckbox left"> \
                                    <label for="omgtorrent">Omgtorrent</label> \
                                    <input class="pluginCheckBox" type="checkbox" id="omgtorrent" name="omgtorrent"> \
                                </div> \
                                <div class="ItemCheckbox left"> \
                                    <label for="t411">T411</label> \
                                    <input class="pluginCheckBox" type="checkbox" id="t411" name="t411"> \
                                </div> \
                                <div class="ItemCheckbox left"> \
                                    <label for="kickass">Kickass</label> \
                                    <input class="pluginCheckBox" type="checkbox" id="kickass" name="kickass"> \
                                </div> \
                                <div id="t411Login" style="display:none;"> \
                                    <p><u><b>' + _("T411 login informations:") + '</b></u></p> \
                                    <p style="font-size:10px;font-weight:bold;">'+_("Note: No informations are stored or sended to streamstudio's servers !")+'</p> \
                                    <label style="float:left;">'+_("Username:")+'</label> \
                                    <input type="text" id="t411LoginUsername" placeholder=""> \
                                    <label style="float:left;">'+_("Password:")+'</label> \
                                    <input type="password" id="t411LoginPassword"> \
                                </div> \
                            </div> \
                            <div style="clear:both;"></div> \
                            \
                        </div> \
                        <div class="form-group"> \
                            <label>' + _("Default subtitles language:") + '</label> \
                            <li id="sub_countries_cont" class="dropdown btn-default btn-sm"> \
                                <a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
                                 \
                                <span class="caret" style="float: right !important;top: 7px;position: relative !important;"></span> \
                                </a> \
                                <ul class="dropdown-menu" id="sub_countries" role="menu" style="width:100%;"> \
                                <li><a href="#" data-value="ar" data-title="(ar) العربية"><img src="" class="flags flags-ar" />لعربية</a></li> \
                                <li><a href="#" data-value="bg" data-title="(bg) български език"><img src="" class="flags flags-bg" />български език</a></li> \
                                <li><a href="#" data-value="ca" data-title="(ca) Català"><img src="" class="flags flags-ca" />Català</a></li> \
                                <li><a href="#" data-value="cs" data-title="(cs) Čeština"><img src="" class="flags flags-cs" />Čeština</a></li> \
                                <li><a href="#" data-value="da" data-title="(da) Dansk"><img src="" class="flags flags-da" />Dansk</a></li> \
                                <li><a href="#" data-value="de" data-title="(de) Deutsch"><img src="" class="flags flags-de" />Deutsch</a></li> \
                                <li><a href="#" data-value="el" data-title="(el) Ελληνικά"><img src="" class="flags flags-el" />Ελληνικά</a></li> \
                                <li><a class="active" href="#" data-value="en" data-title="(en) English"><img src="" class="flags flags-en" />English</a></li> \
                                <li><a href="#" data-value="eo" data-title="(eo) Esperanto"><img src="" class="flags flags-eo" />Esperanto</a></li> \
                                <li><a href="#" data-value="es" data-title="(es) Español"><img src="" class="flags flags-es" />Español</a></li> \
                                <li><a href="#" data-value="et" data-title="(et) Eesti keel"><img src="" class="flags flags-et" />Eesti keel</a></li> \
                                <li><a href="#" data-value="eu" data-title="(eu) Basque"><img src="" class="flags flags-eu" />Basque</a></li> \
                                <li><a href="#" data-value="fa" data-title="(fa) فارسی"><img src="" class="flags flags-fa" />فارسی</a></li> \
                                <li><a href="#" data-value="fi" data-title="(fi) Suomi"><img src="" class="flags flags-fi" />Suomi</a></li> \
                                <li><a href="#" data-value="fr" data-title="(fr) Français"><img src="" class="flags flags-fr" />Français</a></li> \
                                <li><a href="#" data-value="gl" data-title="(gl) Galego"><img src="" class="flags flags-gl" />Galego</a></li> \
                                <li><a href="#" data-value="he" data-title="(he) עִבְרִית"><img src="" class="flags flags-he" />עִבְרִית</a></li> \
                                <li><a href="#" data-value="hi" data-title="(hi) हिन्दी"><img src="" class="flags flags-hi" />हिन्दी</a></li> \
                                <li><a href="#" data-value="hr" data-title="(hr) Hrvatski jezik"><img src="" class="flags flags-hr" />Hrvatski jezik</a></li> \
                                <li><a href="#" data-value="hu" data-title="(hu) Magyar"><img src="" class="flags flags-hu" />Magyar</a></li> \
                                <li><a href="#" data-value="id" data-title="(id) Bahasa Indonesia"><img src="" class="flags flags-id" />Bahasa Indonesia</a></li> \
                                <li><a href="#" data-value="is" data-title="(is) Icelandic"><img src="" class="flags flags-is" />Icelandic</a></li> \
                                <li><a href="#" data-value="it" data-title="(it) Italiano"><img src="" class="flags flags-it" />Italiano</a></li> \
                                <li><a href="#" data-value="ja" data-title="(ja) 日本語"><img src="" class="flags flags-ja" />日本語</a></li> \
                                <li><a href="#" data-value="ka" data-title="(ka) Georgian"><img src="" class="flags flags-ka" />Georgian</a></li> \
                                <li><a href="#" data-value="km" data-title="(km) ភាសាខ្មែរ"><img src="" class="flags flags-km" />ភាសាខ្មែរ</a></li> \
                                <li><a href="#" data-value="ko" data-title="(ko) 한국어"><img src="" class="flags flags-ko" />한국어</a></li> \
                                <li><a href="#" data-value="mk" data-title="(mk) македонски јазик"><img src="" class="flags flags-mk" />македонски јазик</a></li> \
                                <li><a href="#" data-value="ms" data-title="(ms) Malay"><img src="" class="flags flags-ms" />Malay</a></li> \
                                <li><a href="#" data-value="nl" data-title="(nl) Nederlands"><img src="" class="flags flags-nl" />Nederlands</a></li> \
                                <li><a href="#" data-value="no" data-title="(no) Norsk"><img src="" class="flags flags-ano" />Norsk</a></li> \
                                <li><a href="#" data-value="oc" data-title="(oc) Occitan"><img src="" class="flags flags-oc" />Occitan</a></li> \
                                <li><a href="#" data-value="pb" data-title="(pb) Português (BR)"><img src="" class="flags flags-pb" />Português (BR)</a></li> \
                                <li><a href="#" data-value="pl" data-title="(pl) Polski"><img src="" class="flags flags-pl" />Polski</a></li> \
                                <li><a href="#" data-value="pt" data-title="(pt) Português"><img src="" class="flags flags-pt" />Português</a></li> \
                                <li><a href="#" data-value="ro" data-title="(ro) Română"><img src="" class="flags flags-ro" />Română</a></li> \
                                <li><a href="#" data-value="ru" data-title="(ru) русский язык"><img src="" class="flags flags-ru" />русский язык</a></li> \
                                <li><a href="#" data-value="si" data-title="(si) සිංහල"><img src="" class="flags flags-si" />සිංහල</a></li> \
                                <li><a href="#" data-value="sk" data-title="(sk) Slovenčina"><img src="" class="flags flags-sk" />Slovenčina</a></li> \
                                <li><a href="#" data-value="sl" data-title="(sl) Slovenščina"><img src="" class="flags flags-sl" />Slovenščina</a></li> \
                                <li><a href="#" data-value="sq" data-title="(sq) Shqip"><img src="" class="flags flags-sq" />Shqip</a></li> \
                                <li><a href="#" data-value="sr" data-title="(sr) Cрпски"><img src="" class="flags flags-sr" />Cрпски</a></li> \
                                <li><a href="#" data-value="sv" data-title="(sv) Svenska"><img src="" class="flags flags-sv" />Svenska</a></li> \
                                <li><a href="#" data-value="th" data-title="(th) ภาษาไทย"><img src="" class="flags flags-th" />ภาษาไทย</a></li> \
                                <li><a href="#" data-value="tl" data-title="(tl) Tagalog"><img src="" class="flags flags-tl" />Tagalog</a></li> \
                                <li><a href="#" data-value="tr" data-title="(tr) Türkçe"><img src="" class="flags flags-tr" />Türkçe</a></li> \
                                <li><a href="#" data-value="uk" data-title="(uk) українська мова"><img src="" class="flags flags-uk" />українська мова</a></li> \
                                <li><a href="#" data-value="vi" data-title="(vi) Tiếng Việt"><img src="" class="flags flags-vi" />Tiếng Việt</a></li> \
                                <li><a href="#" data-value="zh" data-title="(zh) 汉语"><img src="" class="flags flags-zh" />汉语</a></li> \
                                <li><a href="#" data-value="zt" data-title="(zt) 漢語"><img src="" class="flags flags-zt" />漢語</a></li> \
                            </ul> \
                        </li> \
                        <div class="form-group"> \
                            <p><u><b>' + _("Default player:") + '</b></u></p> \
                            <li id="externalPlayers" class="dropdown btn-default btn-sm"> \
                                <a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"> \
                                \
                                <span class="caret"></span> \
                                </a> \
                                <ul class="dropdown-menu" id="playerSelect" role="menu" style="width:100%;"> \
                                </ul> \
                            </li> \
                            <ul id="playerSelect"> \
                            </ul> \
                        </div> \
                        <div class="form-group"> \
                            <div class="ItemCheckbox left"> \
                                <label for="transcoding">' + _("Enable transcoding by default:") + '</label> \
                                <input class="pluginCheckBox" type="checkbox" id="defaultTranscoding" name="defaultTranscoding"> \
                            </div> \
                        </div> \
                        <div class="form-group"> \
                            <div style="height:240px;top:25px;clear:both;position:relative;"> \
                                <p><u><b>' + _("Add or remove directories to scan for your local library:") + '</b></u></p> \
                                <select id="shared_dir_select" multiple name="shared_dir" class="well"></select> \
                                <div id="shared_dir_controls"> \
                                    <div style="width:125px;"> \
                                        <button class="btn btn-success btn-sm" id="add_shared_dir">' + _("Add") + '</button> \
                                    </div> \
                                    <div style="width:125px;margin-top:5px;"> \
                                        <button class="btn btn-danger btn-sm" id="remove_shared_dir" >' + _("Remove") + '</button> \
                                    </div> \
                                </div> \
                            </div> \
                        </div> \
                        <hr style="margin-top:30px;margin-right:20px;"> \
                        <div class="form-group"> \
                            <button id="valid_config" class="btn btn-success">' + _("Save") + '</button> \
                        </div> \
                        <input style="display:none;" id="fileDialog" type="file" nwdirectory /> \
                        <input style="display:none;" id="sharedDirDialog" type="file" nwdirectory /> \
                    </form> \
                </div> \
            </div> \
        </div> \
    </div> \
</div> \
<div class="panel panel-default" id="subPlayer"> \
    <div class="panel-body"> \
        <img id="subPlayer-img" src="images/play-overlay.png" />  \
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
        <div id="playlistBtnSub"></div>  \
        <div id="transcodingBtnSub"></div> \
        <div id="subPlayer-Timer"><span class="mejs-currenttime">00:00:00</span><span> | </span> <span class="mejs-duration">00:00:00</span></div> \
        <div id="subPlayer-title-container">' + _("Playing:") + '<span id="subPlayer-title"><p> ' + _('Waiting...') + '</p></span></div> \
    </div> \
</div> \
<div id="showPlayer"></div> \
<div id="custom-menu"> \
    <ol></ol> \
</div> \
</div><!-- end container --> \
<div id="tipContent" style="display:none;"></div> \
<div id="upnpTipcontent" style="display:none;"> \
</div>';
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
    $('#menuContainer').append(htmlStr).hide();
    $('#content').append(htmlContent).hide();
    $('#loadingApp p').empty().append(_("Loading StreamStudio..."));
    $('#loadingApp').show();
    // load plugins
    ipaddress = nodeip.address();
    initPlugins();
    wipeTmpFolder();

    $.magnificPopup.instance._onFocusIn = function(e) {
          // Do nothing if target element is select2 input
          if( $(e.target).hasClass('.saveTorrentCheck') ) {
            return true;
          } 
          // Else call parent method
          $.magnificPopup.proto._onFocusIn.call(this,e);
    };
});

function main() {
    // win headers
    win.isMaximized = false;
    // Min
    $('#windowControlMinimize').attr('title',_("Minimize"));
    $('#windowControlMaximize').attr('title',_("Maximize"));
    $('#windowControlClose').attr('title',_("Close"));
    $(document).on('click','#windowControlMinimize',function(e) {
        e.preventDefault()
        win.minimize();
    });
    // Close
    document.getElementById('windowControlClose').onclick = function() {
        win.close();
    };
    // Max
    document.getElementById('windowControlMaximize').onclick = function() {
        if (win.isMaximized)
            win.unmaximize();
        else
            win.maximize();
    };
    win.on('maximize', function() {
        win.isMaximized = true;
    });
    win.on('unmaximize', function() {
        win.isMaximized = false;
    });
    // update navbar text
    $('#homeToggle').empty().text(_("Home"));
    //$('#webLibToggle').empty().text(_("Web library"));
    $('#localFilesToggle').empty().text(_("Local files"));
    $('#downloads_tab').empty().text(_("Downloads"));
    $('#upnpToggle').empty().text(_("Upnp"));
    $('#playerToggle').empty().text(_("Player"));

    win.on('new-win-policy', function(frame, url, policy) {
        policy.forceNewWindow({
            "position": 'center',
            "width": 400,
            "height": 400,
            "toolbar": false
        })
    });

    //show gui
    createLocalRootNodes();
    $('#loadingApp').remove();
    $('#menuContainer').show();
    $('#content').show();
    $("#settingsContainer").show();
    // show transcoding buttons if less than 4 cores cpu
    //if (os.cpus().length < 4 && !transcoderEnabled) {
        //$('#transcodingBtnSub').show();
        //$('#subPlayer-title-container').css('margin-left', '270px');
    //} else {
        $('#transcodingBtnSub').hide();
        $('#subPlayer-title-container').css('margin-left', '250px');
   // }

    // update youtube-dl
    try {
        var cmd = spawn(exec_path + '/node_modules/youtube-dl/bin/youtube-dl', ['-U']);
        cmd.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
    } catch (err) {
        console.log("can't update youtube-dl " + err)
    }

    // load and hide catgories
    getCategories();
    // start keyevent listener
    fn = function(e) {
        onKeyPress(e);
    };

    $(document).on('click','#homeTopButton',function() {
        if(!$(this).hasClass('active')) {
            $('#homeToggle').click();
            $('#tabpage_1').addClass('active');
        }
    })

    // navigation setup
    $(document).on("click", "li a.tab-pane", function(e) {
        updateLazy = false;
        try {
            engine.pageLoading = false;
            current_page = engine.currentPage;
            engine.pageLoading = false;
        } catch(err){}        
        pageLoading = false;
        updateLazy = false;
        pageLoading = false;
        try {
            var cid = activeTab;
            var id = $(this).attr('href').split('_')[1];
            activeTab = parseInt(id);
            if(!id) {
                activeTab = cid;
            }
        } catch(err) {}
        $(".nano").nanoScroller();
        setTimeout(function() {
            if ($('#tab li.active a').attr('id') !== "playerToggle" && $('#tab li.active a').attr('id') !== "settingsToggle" && $('#tab li.active a').attr('id') !== "favoritesToggle") {
                $('#playerContainer').hide();
                $('#playerTopBar').hide();
            }
        }, 100);
    });
    $(document).on("click", "#sectionsContainer a", function(e) {
        var id;
        try {
            engine.pageLoading = false;
        } catch(err) {}
        try {
            id = $(this).attr('href').split('_')[1];
            activeTab = parseInt(id);
            if(id && id == 6 || id == 7) {
                if(id == 6) {
                    $('#favoritesPage').show();
                    $('#seriesToggle').parent().addClass('active');
                    $('#seriesToggle').click();
                }
                $('.navbar-header').hide();
            } else {
                $('.navbar-header').show();
                $('#favoritesPage').hide();
            }
        } catch(err) {
            console.log(err)
        }
        updateLazy = false;
        pageLoading = false;
        $(".nano").nanoScroller();
        if (id == 7) {
            $('#tab li.active').removeClass('active');
        }
        $('#sectionsContainer .btn.active').removeClass('active');
        $(this).addClass('active');
    });

    $(document).on("click", "#seriesToggle,#moviesToggle", function(e) {
        e.preventDefault();
        if($(this).attr('id') == 'seriesToggle') {
            $('#subtabpage_8').show();
            $('#subtabpage_9').hide();
            if($('#mySeries li').length == 0) {
                loadMySeries();
            }
        } else {
            $('#subtabpage_8').hide();
            $('#subtabpage_9').show();
            if($('#mySeries li').length == 0) {
                loadMyMovies();
            }
        }
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
    $('#menu input').keypress(function(e) {
        if (e.which == 13) {
            query = $('#video_search_query').val();
            current_start_index = 1;
            current_prev_start_index = 1;
            current_page = 1;
            searchOptions.currentPage = 1;
            $('#items_container').empty().hide();
            startSearch(query);
            if (activeTab !== 1) {
                if($("#homeTopButton").hasClass('active')) {
                    $("#homeToggle").click();
                } else {
                    $("#homeTopButton").click();
                    $('.navbar-header').show();
                }          
            }
            itemsCount = 0;
        }
    })
    $('#menu button').click(function(e) {
        e.preventDefault();
        query = $('#video_search_query').val();
        current_start_index = 1;
        current_prev_start_index = 1;
        current_page = 1;
        searchOptions.currentPage = 1;
        $('#items_container').empty().hide();
        startSearch(query);
        if (activeTab !== 1) {
            if($("#homeTopButton").hasClass('active')) {
                $("#homeToggle").click();
            } else {
                $("#homeTopButton").click();
                 $('.navbar-header').show();
            }            
        }
        itemsCount = 0;
    });
    // store title of selected item
    $(document).on('click', '.item-title', function(e) {
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
        if ($('#subPlayer-title').text() !== currentMedia.title) {
            $('#subPlayer-title').empty().append('<p>' + currentMedia.title + '</p>');
        }
    });

    $("#playlistBtn").bind('DOMNodeInserted DOMNodeRemoved DOMSubtreeModified DOMCharacterDataModified', function() {
        $("#playlistBtnSub").empty().append($("#playlistBtn").html());
    });
    $('button[aria-label="playlist"]').attr('style', 'background-position-y:0px !important');
    $('button[aria-label="playlist"]').attr('style', 'background-position-y:-48px !important');
    $('button[aria-label="playlist"]').attr('title', _('play and stop mode (click to change)'));

    $("#transcodeBtnContainer").bind('DOMNodeInserted DOMNodeRemoved DOMSubtreeModified DOMCharacterDataModified', function() {
        $("#transcodingBtnSub").empty().append($("#transcodeBtnContainer").html());
    });
    $("#transcodingBtnSub").empty().append($("#transcodeBtnContainer").html());
    $("#transcodingInput").on('click', function(e) {
        if ($('#transcodingInput').is(':checked')) {
            upnpTranscoding = true;
            $('button[aria-controls="transcodeBtn"]').removeClass('transcoder-disabled').addClass('transcoder-enabled');
            $('button[aria-controls="transcodeBtn"]').attr('title', _('transcoding enabled'));
        } else {
            upnpTranscoding = false;
            $('button[aria-controls="transcodeBtn"]').removeClass('transcoder-enabled').addClass('transcoder-disabled');
            $('button[aria-controls="transcodeBtn"]').attr('title', _('transcoding disabled'));
        }
    });

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
        activeItem($(this).closest('.youtube_item').find('.itemTitle').parent());
        try {
            try {
                prev_vid = current_song;
            } catch (err) {
                console.log('no media loaded, can\'t save current song...');
            }
            current_song_page = current_page;
            $(this).hide();
            var title = $(this).closest('.youtube_item').find('.itemTitle').attr('title');
            var vid = $(this).closest('.youtube_item').attr('id');
            if ($('#youtube_entry_res_' + vid + ' a.video_link').length === 0 || $('#youtube_entry_res_' + vid + ' a.video_link').length !== 0 && upnpToggleOn && $('#youtube_entry_res_' + vid + ' a.video_link')[0].href.indexOf('::') !== -1) {
                $('#youtube_entry_res_' + vid).empty();
                $(this).closest('.youtube_item').find('.spiffy').show();
                if (search_engine === 'youtube') {
                    ytId = vid;
                    var obj = JSON.parse(settings.ht5Player);
                    var ext = false;
                    if (obj.name !== 'StreamStudio') {
                        ext = true;
                    }
                    youtube.getVideoInfos('https://youtube.com/watch?v=' + vid, 1, 1, upnpToggleOn, ext, settings,function(datas) {
                        $('.spiffy').hide();
                        $('#youtube_entry_res_' + vid).empty()
                        var infos = datas[25];
                        mediaDuration = 0;
                        if (infos.upnp === false && !ext) {
                            var resolutions_string = ['1080p', '720p', '480p', '360p', '240p'];
                        } else {
                            var resolutions_string = ['720p', '360p'];
                        }
                        var resolutions = infos.resolutions;
                        var vlink, vlinka;
                        for (var i = 0; i < resolutions_string.length; i++) {
                            try {
                                var resolution = resolutions_string[i];
                                var vlink = resolutions[resolution]['link'];
                                if (upnpToggleOn) {
                                    vlink += '&upnp';
                                } else {
                                    if (!infos.upnp && !ext) {
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
                            // append links
                            if (!infos.upnp && !ext && resolution !== '720p' && resolution !== "360p") {
                                $('#youtube_entry_res_' + vid).append('<li class="resolutions_container"><a class="video_link twitchQualityLink" style="display:none;" href="' + vlink + '::' + vlinka + ' " alt="' + resolution + '"><span class="twitchQualityLink">' + resolution + '</span></a><a href="' + vlink + '::' + vlinka + '" alt="' + title + '.' + container + '::' + vid + '" title="' + _("Download") + '" class="download_file_https twitchQualityLink">' + resolution + '</a></li>');
                            } else {
                                $('#youtube_entry_res_' + vid).append('<li class="resolutions_container"><a class="video_link twitchQualityLink" style="display:none;" href="' + vlink + ' " alt="' + resolution + '"><span>' + resolution + '</span></a><a href="' + vlink + '" alt="' + title + '.' + container + '::' + vid + '" title="' + _("Download") + '" class="download_file_https twitchQualityLink">' + resolution + '</a></li>');
                            }
                        }
                        startVideo(vid);
                    })
                } else {
                    startVideo(vid);
                }
            } else {
                startVideo(vid);
            }
        } catch (err) {
            console.log(err)
        }
    });

    // load video signal and callback
    $(document).on('click', '.video_link', function(e) {
        e.preventDefault();
        playFromfile = false;
        // try {
        //     $('#' + current_song).closest('.youtube_item').removeClass('highlight well');
        // } catch (err) {
        //     console.log(err);
        // }
        current_song_page = current_page;
        current_song = $(this).parent().closest('.youtube_item').find('.downloads_container').attr('id');
        var video = {};
        video.link = $(this).attr('href');
        video.title = $(this).closest('.youtube_item').find('.itemTitle').attr('title');
        video.next = next_vid;
        video.cover = $(this).closest('.youtube_item').find('.video_thumbnail').attr('src');
        startPlay(video);
        //$('video').trigger('loadPlayer', video);
        //$(this).closest('.youtube_item').addClass('highlight well');
    });
    $(document).on('click', '.upnpMedia', function(e) {
        e.preventDefault();
        var stream = {};
        stream.data = $(this).attr('data');
        stream.link = XMLEscape.xmlUnescape($(this).attr('link'));
        stream.title = $(this).text();
        stream.type = $(this).attr('type');
        currentMedia = stream;
        if (upnpToggleOn) {
            if (upnpMediaPlaying === true) {
                upnpMediaPlaying = false;
                continueTransition = false;
                mediaRenderer.stop();
                setTimeout(function() {
                    playUpnpRenderer(stream);
                }, 3000);
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
        var obj = JSON.parse(settings.ht5Player);
        if (videoCodecs.indexOf(video.title.split('.').pop()) !== -1 && obj.name === 'StreamStudio') {
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
        downloadFFMpeg(link, title, engine, false);
    });

    //cancel download
    $(document).on('click', '.cancelD', function(e) {
        canceled = true;
        var id = this.id.replace('cancel_', '');
        try {
            current_download[id].abort();
        } catch (err) {
            current_download[id].end();
        }
        try {
            current_download[id].process.kill('SIGKILL');
        } catch (err) {}
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
    $(document).on("click", "#engines_select li a", function() {
        $(".nano").nanoScroller({
            destroy: true
        });
        search_engine = $(this).attr('data-value');
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        searchTypes_select
        getCategories();
        pagination_init = false;
        current_page = 1;
        current_search_page = 1;
        current_start_index = 1;
        searchOptions.currentPage = 1;
        itemsCount = 0;
        $("#searchTypes_select ul").empty()
        $("#searchTypes_select").hide();
        $("#searchTypes_label").hide();
        $("#dateTypes_select ul").empty();
        $("#dateTypes_select").hide();
        $("#dateTypes_label").hide();
        $("#duration_select ul").hide();
        $("#duration_select").hide();
        $("#duration_label").hide();
        $("#searchFilters_select ul").empty();
        $("#searchFilters_select").hide();
        $("#searchFilters_label").hide();
        $("#categories_select ul").empty();
        $("#categories_select").hide();
        $("#categories_label").hide();
        $("#orderBy_label").hide();
        $("#orderBy_select ul").empty();
        $("#orderBy_select").hide();
        $("#search").show();
        $("#searchTypesMenu_label").show();
        $("#items_container").empty().hide();
        $("#cover").remove();
        $('#search').show();
        $('#pagination').hide();
        if ($('#fbxMsg2').length !== 0) {
            $('#fbxMsg2').remove();
        };
        try {
            engine = engines[search_engine];
            engine.init(gui, win.window, $.notif);
            $("#search p").empty().append(_("Engine %s ready...!", engine.engine_name)).show();
            // hide not needed menus
            $.each(engine.menuEntries, function(index, type) {
                $("#" + type + "_select ul").empty();
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
                $('#searchTypes_select ul').empty();
                $.each(engine.searchTypes, function(key, value) {
                    $('#searchTypes_select ul').append('<li><a href="#" data-value="' + value + '">' + key + '</a></li>');
                });
                searchTypes_select = engine.defaultSearchType;
                $("#searchTypes_select [data-value='" + engine.defaultSearchType + "']").addClass('active').click();
            }
            // load orderBy filters
            if (engine.orderBy_filters !== undefined) {
                $('#orderBy_select ul').empty();
                $.each(engine.orderBy_filters, function(key, value) {
                    $('#orderBy_select ul').append('<li><a href="#" data-value="' + value + '">' + key + '</a></li>');
                });
                orderBy_select = engine.defaultOrderBy;
                $("#orderBy_select [data-value='" + engine.defaultOrderBy + "']").addClass('active').click();
            }
            // load searchFilters filters
            if (engine.searchFilters !== undefined) {
                $('#searchFilters_select ul').empty();
                $.each(engine.searchFilters, function(key, value) {
                    $('#searchFilters_select ul').append('<li><a href="#" data-value="' + value + '">' + key + '</a></li>');
                });
                searchFilters_select = engine.defaultSearchFilter;
                $("#searchFilters_select [data-value='" + engine.defaultSearchFilter + "']").addClass('active').click();
            }

            // load category filters
            if (engine.category_filters !== undefined) {
                $('#categories_select ul').empty();
                $.each(engine.category_filters, function(key, value) {
                    $('#categories_select ul').append('<li><a href="#" data-value="' + value + '">' + key + '</a></li>');
                });
                selected_category = engine.defaultCategory;
                $("#categories_select [data-value='" + engine.defaultCategory + "']").addClass('active').click();
            } else if (engine.hasCategory) {
                engine.loadCategories();
            }
            $('#video_search_query').prop('disabled', false);
            update_searchOptions();
            $(".nano").nanoScroller({
                destroy: true
            });
        } catch (err) {
            console.log(err)
            if (search_engine === 'dailymotion') {
                $("#search p").empty().append(_("Engine %s ready...!", 'dailymotion')).show();
                var html = '<li class="active"><a href="#" data-value="relevance" class="active">' + _("Relevance") + '</a></li> \
        <li><a href="#" data-value="recent">' + _("Published") + '</a></li> \
        <li><a href="#" data-value="visited">' + _("Views") + '</a></li> \
        <li><a href="#" data-value="rated">' + _("Rating") + '</a></li>';
                $('#orderBy_select ul').empty().append(html);
                $('#orderBy_select a.active').click();
                var html = '<li class="active"><a href="#" data-value="videos" class="active">' + _("Videos") + '</a></li> \
        <li><a href="#" data-value="playlists">' + _("Playlists") + '</a></li> \
        <li><a href="#" data-value="category">' + _("Categories") + '</a></li> \
        <li><a href="#" data-value="live">' + _("Lives") + '</a></li>';
                $('#searchTypes_select ul').empty().append(html);
                $('#searchTypes_select a.active').click();
                var html = '<li class="active"><a href="#" data-value="" class="active">' + _("No filters") + '</a></li> \
        <li><a href="#" data-value="hd">HD</a></li> \
        <li><a href="#" data-value="3dopt" value = "3d">3D</a></li>';
                $('#searchFilters_select ul').empty().append(html);
                $('#searchFilters_select a.active').click();
            } else {
                $("#search p").empty().append(_("Engine %s ready...!", 'youtube')).show();
                var html = '<li class="active"><a href="#" data-value="relevance" class="active">' + _("Relevance") + '</a></li> \
        <li><a href="#" data-value="published">' + _("Published") + '</a></li> \
        <li><a href="#" data-value="viewCount">' + _("Views") + '</a></li> \
        <li><a href="#" data-value="rating">' + _("Rating") + '</a></li>';
                $('#orderBy_select ul').empty().append(html);
                $('#orderBy_select a.active').click();
                var html = '<li class="active"><a href="#" data-value="videos" class="active">' + _("Videos") + '</a></li> \
        <li><a href="#" data-value="playlists">' + _("Playlists") + '</a></li> \
        <li><a href="#" data-value="category">' + _("Categories") + '</a></li> \
        <li><a href="#" data-value="channels" id="channelsOpt">' + _("Channels") + '</a></li> \
        <li><a href="#" data-value="topRated" id="topRated">' + _("Top rated") + '</a></li> \
        <li><a href="#" data-value="mostViewed" id="mostViewed">' + _("Most viewed") + '</a></li>';
                $('#searchTypes_select ul').empty().append(html);
                $('#searchTypes_select a.active').click();
                var html = '<li class="active"><a href="#" data-value="" class="active">' + _("No filters") + '</a></li> \
        <li><a href="#" data-value="hd">HD</a></li> \
        <li><a href="#" data-value="3d" id="3dopt">3D</a></li>';
                $('#searchFilters_select ul').empty().append(html);
                $('#searchFilters_select a.active').click();
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
            $(".nano").nanoScroller({
                destroy: true
            });
        }
    });
    // search date select
    $(document).on("click", "#dateTypes_select li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        pagination_init = false;
        current_start_index = 1;
        current_prev_start_index = 1;
        current_page = 1;
        current_search_page = 1;
        itemsCount = 0;
        searchDate = $(this).attr('data-value');
    });
    // search date select
    $(document).on("click", "#duration_select li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        pagination_init = false;
        current_start_index = 1;
        current_prev_start_index = 1;
        current_page = 1;
        current_search_page = 1;
        itemsCount = 0;
        searchDuration = $(this).attr('data-value');
    });
    // search order
    $(document).on("click", "#orderBy_select li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        pagination_init = false;
        current_start_index = 1;
        current_prev_start_index = 1;
        current_page = 1;
        current_search_page = 1;
        itemsCount = 0;
        search_order = $(this).attr('data-value');
    });
    // categories
    $(document).on("click", "#categories_select li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        selected_category = $(this).attr('data-value');
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
        } catch (err) {}
    });
    //search filters
    $(document).on("click", "#searchFilters_select li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        pagination_init = false;
        current_start_index = 1;
        current_prev_start_index = 1;
        current_page = 1;
        current_search_page = 1;
        itemsCount = 0;
        searchFilters = $(this).attr('data-value');
    });
    // search types
    $(document).on("click", "#searchTypes_select li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        searchTypes_select = $(this).attr('data-value');
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
            $('#searchFilters_label').show();
            $('#searchFilters_select').show();
            if (search_engine === 'youtube') {
                $('#duration_label').show();
                $('#duration_select').show();
            }
            if ((searchTypes_select === 'topRated') || (searchTypes_select === 'mostViewed')) {
                $('#video_search_query').prop('disabled', true);
                $('#orderBy_label').hide();
                $('#orderBy_select').hide();
                $('#searchFilters_label').hide();
                $('#searchFilters_select').hide();
                var html = '<li class="active"><a href="#" data-value="today" class="active">' + _("Today") + '</a></li> \
            <li><a href="#" data-value="this_week">' + _("This week") + '</a></li> \
            <li><a href="#" data-value="this_month">' + _("This month") + '</a></li> \
            <li><a href="#" data-value="all_time">' + _("All time") + '</a></li>';
                $('#dateTypes_select').show();
                $('#dateTypes_select ul').empty().append(html);
                $('#dateTypes_select a.active').click();
                $('#dateTypes_label').show();
                $('#duration_label').hide();
                $('#duration_select').hide();
                $('#video_search_btn').click();
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
        }
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
        loadConfig();
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
            $('#upnpTranscoding').show();
        } else {
            $('#upnp-toggle').qtip('destroy', true);
            $('#upnp-toggle').removeClass('upnp-enabled').addClass('upnp-disabled');
            $('#upnpTranscoding').hide();
            upnpToggleOn = false;
            playUpnpMedia = false;
        }
    });
    $(document).on('change', '.qtip-content input', function() {
        var inputClass = $(this).attr('class');
        var selected = $(this).prop('name');
        var type = $(this).attr('data-type');
        console.log(type)
        if (inputClass === "freebox") {
            airMediaDevice = selected;
        } else {
            if(type == "upnp") {
                __.some(cli._avTransports, function(el, index) {
                    if (el.friendlyName === selected) {
                        upnpDevice = el._index
                    }
                    mediaRendererType = 'upnp';
                    mediaRenderer = new Plug.UPnP_AVTransport(cli._avTransports[upnpDevice], {
                        debug: false
                    });
                    if (upnpMediaPlaying) {
                        initPlayer();
                    }
                });
            } else {
                __.some(chromecastDevices, function(el, index) {
                    if (el.name === selected) {
                       mediaRenderer = el.device
                       mediaRendererType = "chromecast"
                    }
                    if (upnpMediaPlaying) {
                        initPlayer();
                    }
                });
            }
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
    cli.on('updateUpnpDevice', function() {
        updateUpnpList()
    });
    try {
        UPNPserver.stop()
    } catch(err) {}

    var observer = new MutationObserver(function(mutations) {
        if (spinnerPlay === false) {
            startAnimation();
            spinnerPlay = true;
        } else {
            stopAnimation();
            spinnerPlay = false;
        }
    });
    var target = document.querySelector('#loading');
    observer.observe(target, {
        attributes: true
    });
    stopAnimation();
    loadConfig();

    if (settings.init) {
        checkUpdates();
        checkFreebox();
    } else {
        $("#settingsToggle").click();
    }
    if (settings.locale_changed) {
        settings.locale_changed = false;
        saveSettings();
    }

    $('.tab-content').bind('DOMNodeInserted DOMNodeRemoved DOMSubtreeModified DOMCharacterDataModified', function() {
        updateScroller();
    });
    
    cli.searchDevices();
    setTimeout(function(){
        cli.searchDevices();
    },2000)
}

$(document).bind("scrollend", ".nano",function(e){
    setTimeout(function() {
        updateScroller();
    },200)
});

function updateScroller() {
    if (activeTab == 1) {
        try {
            $(".nano").nanoScroller();
            try {
                var pos = $('.nano-pane').height() - ($('.nano-slider').position().top + $('.nano-slider').height());
                if (engine) {
                    if (activeTab == 1 && ($('.nano-pane').height() > $('.nano-slider').height()) && pos == 0 && !engine.pageLoading ||  $("#items_container ul li").length !== 0 && !$('.nano-slider').is(':visible') && !engine.pageLoading) {
                        if ($("#items_container ul li").length < engine.totalItems) {
                            engine.loadMore();
                        }
                    }
                } else {
                    if (activeTab == 1 && ($('.nano-pane').height() > $('.nano-slider').height() && pos == 0 && !pageLoading) ||  $("#items_container .youtube_item").length !== 0 && !$('.nano-slider').is(':visible') && !pageLoading) {
                        if (search_engine === "youtube" && searchTypes_select === "playlists" && $("#items_container .youtube_item_playlist").length !== 0 && $("#items_container .youtube_item_playlist").length < totalResults) {
                            current_page += 1;
                            pageLoading = true;
                            changePage();
                        } else if (activeTab == 1 && search_engine === "youtube" && searchTypes_select === "channels" && $("#items_container .youtube_item_channel").length !== 0 && $("#items_container .youtube_item_channel").length < totalResults) {
                            current_page += 1;
                            pageLoading = true;
                            changePage();
                        } else if (activeTab == 1 && search_engine === "youtube" && searchTypes_select === "channels" && $("#items_container .youtube_item_channel").length == 0 && $("#items_container .youtube_item").length < totalResults) {
                            current_page += 1;
                            pageLoading = true;
                            changeChannelPage();
                        } else if (activeTab == 1 && $("#items_container .youtube_item").length < totalResults) {
                            current_page += 1;
                            pageLoading = true;
                            changePage();
                        }
                    }
                }
            } catch (err) {
                console.log(err)
            }
        } catch (err) {
            $(".nano").nanoScroller();
        }
    } else {
        $(".nano").nanoScroller();
    }
}

function updatePickers() {
    return;
}

function changePage() {
    console.log('changepage')
    if (activeTab == 1) {
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
        if (player.media.paused) {
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
        searchOptions.searchType = $("#searchTypes_select a.active").attr('data-value');
        searchOptions.orderBy = $("#orderBy_select a.active").attr('data-value');
        searchOptions.dateFilter = $("#dateTypes_select a.active").attr('data-value');
        searchOptions.searchFilter = $("#searchFilters_select a.active").attr('data-value');
        searchOptions.category = $("#categories_select a.active").attr('data-value');
        engine.search_type_changed();
    }
    //search
function startSearch(query) {
    $("#search p").empty().append(' ');
    $('#loading p').empty().append(_("Loading..."));
    if ((query === '') && (browse === false) || (query === '') && engine && engine.searchType && engine.searchType == "search" || query === '' && search_engine == 'dailymotion') {
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
        searchOptions.searchType = $("#searchTypes_select a.active").attr('data-value');
        searchOptions.orderBy = $("#orderBy_select a.active").attr('data-value');
        searchOptions.dateFilter = $("#dateTypes_select a.active").attr('data-value');
        searchOptions.searchFilter = $("#searchFilters_select a.active").attr('data-value');
        searchOptions.category = $("#categories_select a.active").attr('data-value');
        searchOptions.currentPage = current_page;
        engine.search(query, searchOptions, win.window);
    } catch (err) {
        console.log(err)
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
            } else if (searchTypes_select === 'live') {
                dailymotion.lives(query, current_page, searchFilters, function(datas) {
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
                youtube.categories(query, current_page, searchFilters, selected_category, searchDuration, function(datas) {
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

function addSerieToDb(title) {
    $('#mySeries').empty();
    searchTVdb(title,function(data){
        console.log(data)
    },true);
}

function changeChannelPage() {
    if (current_channel_engine === 'youtube') {
        youtube.loadChannelSongs(current_channel_link, current_page, function(datas) {
            fillPlaylistFromChannel(datas, current_channel_engine);
        });
    }
}

function activeItem(item) {
    if($('.highlight').length > 0 ) {
        $('.highlight').removeClass('highlight');
    }
    $(item).addClass('highlight');
    if($('#items_container .list-row_small').length > 0) {
        try {
            $('#items_container').scrollTop($('#items_container').scrollTop() + $('#items_container .highlight').position().top - 160);
        } catch(err) {}
    } else if ($('#items_container .list-row').length > 0) {
        try {
            $('#items_container').scrollTop($('#items_container').scrollTop() + $('#items_container .highlight').position().top - 200);
        } catch(err) {}
    } else {
        try {
            $('#items_container').scrollTop($('#items_container').scrollTop() + $('#items_container .highlight').position().top - 130);
        } catch(err) {}
    }
}