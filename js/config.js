//~ Copyright (C) 
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

$(document).on('ready', function() {
    $(document).on('change', '.pluginCheckBox', function(e) {
        console.log(this.name + ' ' + this.value + ' ' + this.checked);
        if (this.checked) {
            if (this.name === "twitch") {
                if (livestreamerPath === '') {
                    alert(_('You need Livestreamer >=v1.11.1 installed in /usr/bin or /usr/local/bin to use this plugin ! \n\n Please read install instructions here: \n http://livestreamer.readthedocs.org/en/latest/install.html'));
                    $(this).attr('checked', false);
                    return;
                }
            } else if(this.name === "t411") {
                $('#t411Login').show();
                if(!settings.t411Username || !settings.t411Password) {
                    $('#t411LoginUsername').attr('placeholder', '').focus()
                }
            }
            settings.plugins.push(this.name);
            saveSettings();
        } else {
            if(this.name === "t411") {
                 $('#t411Login').hide();
            }
            settings.plugins.splice(settings.plugins.indexOf(this.name), 1);
            saveSettings();
        }
    });

    if(settings.locale == "fr") {
        $('#subtitles_form').hide();
    }

    $(document).on('change', '#defaultTranscoding', function(e) {
        if (this.checked) {
            settings.transcoding = true;
            saveSettings();
        } else {
            settings.transcoding = false;
            saveSettings();
        }
    });

    $(document).on('keyup', '#t411LoginUsername,#t411LoginPassword', function(e) {
        settings.t411Username = $('#t411LoginUsername').val();
        settings.t411Password = $('#t411LoginPassword').val();
    });

    $(document).on('click', '#aboutStreamStudio', function(e) {
        var html = '<div id="aboutInfos"><h3>'+_("About StreamStudio")+' ('+settings.version+')</h3> \
        <p><u>'+_("Contributors:")+'</u></p><ul><li><b>Smo:</b> '+_("Developer")+'</li><li><b>Beaver:</b> '+_("Administrator")+'</li><li><b>BabyTux:</b> '+_("Community manager")+'</li></ul> \
        <br/><p><u>'+_("Technologies used :")+'</u></p> \
        <p>'+_("StreamStudio is built upon web technologies only like html/css and javascript, extra tools are:")+' \
        <ul> \
            <li><a class="open_in_browser" href="http://nwjs.io/">Nwjs</a></li> \
            <li><a class="open_in_browser" href="http://jquery.com/">Jquery</a></li> \
            <li><a class="open_in_browser" href="http://ffmpeg.org/">FFMpeg</a></li> \
        </ul><br/> \
        <p><u>'+_("Links and informations:")+'</u></p>  \
        '+_('You can find informations on how to use StreamStudio in the <a class="open_in_browser" href="http://wiki.streamstudio.me">wiki</a><br/> \
        Since we don\'t have a specific forum yet, please report any bug <a class="open_in_browser" href="http://forum.streamstudio.me">here</a> or by mail <a class="open_in_browser" href="mailto:staff@streamstudio.me">here</a><br/> \
        (use the "d" key to open the debug console (informations about this console <a class="open_in_browser" href="https://developer.chrome.com/devtools">here</a>) and copy/paste all the errors you can see!)<br/><br/>Thanks for your support !')+'</div>';
        showPopup(html,'body')
    });

});

function loadConfig() {
    $('#config_title').empty().append(_("StreamStudio configuration:"));
    // start flags
    $('#download_path').val(settings.download_dir);
    if (settings.transcoding) {
        $('#defaultTranscoding').attr('checked', settings.transcoding)
    }
    $("select#countries").change(function() {
        $("select#countries option:selected").each(function() {
            locale = $(this).val();
            settings.locale = locale;
            locale_changed = true;
            settings.locale_changed = true;
            setLocale();
            saveSettings();
        });
    });
    $(document).on('click', '#valid_config', function(e) {
        e.preventDefault();
        settings.init = true;
        if(settings.plugins.indexOf('t411') !== -1 && (!settings.t411Username || !settings.t411Password)) {
            $('#t411LoginUsername').attr('placeholder', '').focus();
            swal(_("Error!"), _("Please enter your login/password for t411 engine !"), "error")
            return;
        }
        saveSettings();
        saveConf();
    });
    //sub select
    $(document).on("click", "#sub_countries li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        settings.subLanguage = $(this).attr('data-value');
        saveSettings();
    });
    var subLanguage = settings.subLanguage;
    $("#sub_countries [data-value='" + subLanguage + "']").click();
    //resolutions select
    $(document).on("click", "#resolutions_select li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        settings.resolution = $(this).attr('data-value');
        saveSettings();
    });
    var selected_resolution = settings.resolution || "en";
    $("#resolutions_select [data-value='" + selected_resolution + "']").click();
    // checkbox changes
    $('.pluginCheckBox:checkbox').change(function() {
        plugins_changed = true;
        settings.plugins_changed = true;
    });

    // choose download_dir
    $('#choose_download_dir').click(function(e) {
        e.preventDefault();
        chooseDownloadDir();
    });
    // shared dirs
    $('#add_shared_dir').click(function(e) {
        e.preventDefault();
        addSharedDir();
        shares_changed = true;
        settings.shares_changed = true;
    });
    $('#remove_shared_dir').click(function(e) {
        e.preventDefault();
        selected_toRemove = $($("select#shared_dir_select option:selected")[0]).text().trim();
        var index = $.inArray(selected_toRemove, settings.shared_dirs);
        if (index >= 0) settings.shared_dirs.splice(index, 1);
        $("select#shared_dir_select option:selected").remove();
        saveSettings();
        createLocalRootNodes();
    });
    $(document).on('change', "#sharedDirDialog", function() {
        addDir($('#sharedDirDialog').val());
    });

    $('#shared_dir_select').empty();
    if (settings.shared_dirs !== undefined) {
        $.each(settings.shared_dirs, function(index, dir) {
            $('#shared_dir_select').append('<option value="">' + dir + '</option>');
        });
    }
    $('#countries').val(settings.locale);
    $("#countries").msDropdown();
    //disclaimer
    $('#disclaimer').click(function() {
        var msg = _("The following are terms and conditions for use of StreamStudio including all \
services offered.\n \
\n \
The service is offered to you conditioned on your acceptance without  \
modification of the terms, conditions, and notices contained herein. By  \
visiting and using StreamStudio or any of its affiliate sites and \
services, you are acknowledging your full compliance to the terms listed \
here. \n \
\n \
StreamStudio is based on its links to third party sites. The linked sites \
are not under the control of StreamStudio and StreamStudio is not \
responsible for the content of any linked sites or any links contained in a \
linked site. StreamStudio is providing these links to you only as a \
convenience, and the inclusion of any link does not imply endorsement by \
StreamStudio of the site or any association with their operators. \n \
\n \
StreamStudio's team do not assume any responsibility or liability for the \
audio file, from completeness to legalities.\n \
\n \
StreamStudio user agrees that StreamStudio is hereby absolved from any and  \
all liabilities, losses, costs and claims, including attorney's fees \
asserted against StreamStudio, its agents, officers, employees, or \
associates, that may arise or result from any service provided, performed, \
be agreed to be performed by StreamStudio. \n \
\n \
StreamStudio team makes no warranties, expressed or implied, for the \
services we provide. StreamStudio will not be held responsible for any \
damages you or your business may suffer from using StreamStudio services.\
StreamStudio will not be held responsible for any interruptions, delays, \
failures, inaccuracies, or typographical errors \n \
\n \
StreamStudio team does not represent or warrant that the Service or the \
server that makes it available, are free of viruses or other harmful \
components. StreamStudio does not warrant or represent that the use or the \
results of the use of the Service or the materials made available as part of \
the Service will be correct, accurate, timely, or otherwise reliable \n\
\n \
StreamStudio team reserves the right to update this policy at any time \
without notice.");

        var new_win = gui.Window.open('warning.html', {
            "position": 'center',
            "width": 680,
            "height": 670,
            "toolbar": false,
            "title": _('Warnings')
        });
        new_win.on('close', function() {
            this.hide();
            this.close(true);
        });
        new_win.on('loaded', function() {
            new_win.window.document.body.innerHTML = '<div><pre>' + msg + '</pre></div>';
        });
        new_win.show();
    });

    //plugins
    if (settings.plugins === undefined) {
        settings.plugins = new Array();
    } else {
        var list = settings.plugins;
        $.each(list, function(index, name) {
            if(name=='t411') {
                $('#t411Login').show();
                $('#t411LoginUsername').val(settings.t411Username);
                $('#t411LoginPassword').val(settings.t411Password);
            }
            $('input[name=' + name + ']').attr('checked', 'checked');
        });
    }

    // players
    if (settings.ht5Player === undefined) {
        settings.ht5Player = JSON.stringify({
            "name": 'StreamStudio',
            "path": ''
        });
    }
    $(document).on("click", "#playerSelect li a", function() {
        $(this).parents('.dropdown').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $(this).addClass('active');
        $(this).parents('.dropdown').find('.dropdown-toggle').html($(this).text() + ' <span class="caret"></span>');
        settings.ht5Player = JSON.stringify({
            "name": $(this).text(),
            "path": $(this).attr('data-value')
        });
        saveSettings();
    });

    loadPlayers();
    updateScroller();
}

function chooseDownloadDir(confDir) {
    var download_dir = '';
    var chooser = $('#fileDialog');
    chooser.trigger('click');
    chooser.change(function(evt) {
        if (process.platform === 'win32') {
            download_dir = $(this).val().replace(/\\/g, '//');
        } else {
            download_dir = $(this).val();
        }
        settings.download_dir = download_dir;
        $('#download_path').val(download_dir);
    });
}

function addSharedDir() {
    var selected_dir = '';
    var chooser = $('#sharedDirDialog');
    chooser.trigger('click');
}

function addDir(dir) {
    if (settings.shared_dirs === undefined) {
        settings.shared_dirs = [];
    }
    var selected_dir;
    if (process.platform === 'win32') {
        selected_dir = dir.replace(/\\/g, '//');
    } else {
        selected_dir = dir;
    }
    settings.shared_dirs.push(selected_dir);
    $('#shared_dir_select').append('<option value="">' + selected_dir + '</option>');
    saveSettings();
    createLocalRootNodes();
}

function loadConf(confDir) {
    // clear cache
    try {
        if (settings.edit === true) {
            return;
        }
    } catch (err) {}
}

function getInterfaces() {
    $("#interface_select").empty();
    if ((settings.interface === undefined) || (settings.interface === '') || (settings.ipaddress === undefined) || (settings.ipaddress === '')) {
        $("#interface_select").append("<option value=''></option>");
    }
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var alias = 0;
        ifaces[dev].forEach(function(details) {
            if (details.family == 'IPv4') {
                if ((dev !== 'lo') || (dev.match('tun') !== null)) {
                    $("#interface_select").append("<option value=" + encodeURIComponent(dev) + ">" + dev + "</option>");
                }
                ++alias;
            }
        });
    }
}

function getIpaddress() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var alias = 0;
        ifaces[dev].forEach(function(details) {
            if (details.family == 'IPv4') {
                if (dev === decodeURIComponent(settings.interface)) {
                    settings.ipaddress = details.address;
                    var ip = nodeip.address();
                    if (settings.ipaddress !== ip) {
                        settings.ipaddress = ip;
                    }
                }
                ++alias;
            }
        });
    }
}

function saveConf() {
    if (settings.download_dir === '') {
        $('#download_path').val(_('REQUIRED!!!')).css({
            'color': 'red'
        });
        return;
    }

    var plugins_length = settings.plugins.length;
    if (settings.locale_changed) {
        locale_changed = true;
        settings.locale_changed = false;
        settings.locale = locale;
    }
    ////plugins
    //var list = $('.pluginCheckBox');
    //settings.plugins = [];
    //$.each(list,function(index,plugin){
    //var name = $(this).attr('name');
    //if ($('input[name="'+name+'"]').is(':checked') === true) {
    //settings.plugins.push(name);
    //}
    ////reload plugins if needed
    //if (index+1 === list.length) {
    //if(settings.plugins_changed === true) {
    //saveSettings();
    //reloadPlugins();
    //}
    //}
    //});

    if (settings.shares_changed === true) {
        settings.shares_changed = false;
        settings.scan_dirs = true;
    } else {
        settings.scan_dirs = false;
    }

    if (locale_changed) {
        $('#settings').slideToggle();
        swal(_("success!"), _("Please restart StreamStudio to apply your settings !"), "success")
        $('#homeTopButton').click();
        reloadPlugins();
    } else {
        $('#homeTopButton').click();
        reloadPlugins();
    }
    console.log("ht5config config updated successfully!");
}

function loadPlayers() {
    var path = require('path');
    var fs = require('fs');
    var readdirp = require('readdirp');
    var async = require('async');
    var child = require('child_process');
    var __ = require('underscore');

    function getPlayerName(loc) {
        return path.basename(loc).replace(path.extname(loc), '');
    }

    function getPlayerCmd(loc) {
        var name = getPlayerName(loc);
        return players[name].cmd;
    }

    function getPlayerSwitches(loc) {
        var name = getPlayerName(loc);
        return players[name].switches || '';
    }

    var players = {
        'VLC': {
            type: 'Vlc',
            cmd: '/Contents/MacOS/VLC',
            switches: ' --no-video-title-show --sub-file=',
            stop: 'vlc://quit',
            pause: 'vlc://pause'
        },
        'MPlayer OSX Extended': {
            type: 'Mplayer',
            cmd: '/Contents/Resources/Binaries/mpextended.mpBinaries/Contents/MacOS/mplayer',
            switches: ' -font "/Library/Fonts/Arial Bold.ttf" -sub '
        },
        'mpv': {
            type: 'Mpv',
            switches: ' --sub-file='
        },
        'MPC-HC': {
            type: 'Mpc-hc',
            switches: ' /sub '
        },
        'MPC-HC64': {
            type: 'Mpc-hc64',
            switches: ' /sub '
        },
        'SMPlayer': {
            type: 'Smplayer',
            switches: ' -sub ',
            stop: 'smplayer -send-action quit',
            pause: 'smplayer -send-action pause'
        },
        'cmplayer': {
            type: 'Cmplayer',
            switches: ' /sub'
        },
        'mplayer': {
            type: 'Mplayer',
            switches: ' /sub'
        },
        'mplayer2': {
            type: 'Mplayer2',
            switches: ' /sub'
        }
    };

    /* map name back into the object as we use it in match */
    __.each(players, function(v, k) {
        players[k].name = k;
    });
    var searchPaths = [];
    var searchPathsDir = {
        linux: ['/usr/bin', '/usr/local/bin'],
        darwin: ['/Applications'],
        win32: ['C://Program Files//', 'C://Program Files (x86)//']
    };

    var folderName = '';
    var found = {};
    extPlayers = [];
    extPlayers.push({
        id: 'StreamStudio',
        type: 'StreamStudio',
        name: 'StreamStudio',
        path: ''
    });

    $.each(searchPathsDir[process.platform], function(index, dir) {
        if (fs.existsSync(dir)) {
            searchPaths.push(dir);
        }
        if (index + 1 === searchPathsDir[process.platform].length) {
            async.each(searchPaths, function(folderName, pathcb) {
                folderName = path.resolve(folderName);
                console.log('Scanning: ' + folderName);

                var appIndex = -1;
                var fileStream = readdirp({
                    root: folderName,
                    depth: 3
                });
                fileStream.on('data', function(d) {
                    var app = d.name.replace('.app', '').replace('.exe', '').toLowerCase();
                    var match = __.filter(players, function(v, k) {
                        return k.toLowerCase() === app;
                    });

                    if (match.length) {
                        match = match[0];
                        //console.log('Found External Player: ' + app + ' in ' + d.fullParentDir);
                        extPlayers.push({
                            id: match.name,
                            type: 'external-' + match.type,
                            name: match.type,
                            path: d.fullPath
                        });

                    }
                });
                fileStream.on('end', function() {
                    pathcb();
                });

            }, function(err) {

                if (err) {
                    console.error(err);
                    return;
                } else {
                    extPlayers = __.uniq(extPlayers, function(item) {
                        return JSON.stringify(item);
                    })
                    $('#playerSelect').empty();
                    $.each(extPlayers, function(index, player) {
                        $('#playerSelect').append('<li><a href="#" data-name="' + player.name + '" data-value="' + player.path + '">' + player.name + '</a></li>')
                        if (index + 1 === extPlayers.length) {
                            if (settings.ht5Player !== null) {
                                $("#playerSelect [data-name='" + JSON.parse(settings.ht5Player).name + "']").click();
                            } else {
                                $("#playerSelect [data-name='StreamStudio']").click();
                            }
                        }
                    });
                    return;
                }
            });
        }
    });
}

// extend array
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}