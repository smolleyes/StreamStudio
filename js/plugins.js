var engines = [];
const tp = require('torrent-search-api')
var excludedPlugins = ['mega', 'mega-files', 'vimeo', 'mega-search','grooveshark','omgtorrent','tproject','songza','thepiratebay','cpasbien','t411'];
var pluginsDir;
var pluginsList = ['twitch','songza','cpasbien','thepiratebay','torrent-project','mp3stream','torrent9','global'];

$(document).on('change','.pluginGlobalCheckBox',function(e){
    console.log(this.name + ' ' + this.value + ' ' + this.checked);
    let engine = settings.torrentEngines[this.name];
    if (this.checked) {
        if (!torrentEngine.isProviderActive(this.name)) {
            enableProvider(engine, this.name)
            saveSettings();
            if(!engine.public && engine.password && engine.login) {
                $('#'+this.name+'Login').val(engine.login || '')
                $('#'+this.name+'Password').val(engine.password || '')
            }
        }
    } else {
        torrentEngine.disableProvider(this.name)
        engine.enabled = false;
        saveSettings();
        if(!engine.public) {
            $('#'+this.name+'LoginContainer').hide()
        }
    }
})

// when ? engine password keyup, restart engine
$(document).on('keyup','.torrentEnginePassword',function(e){
    let provider = $(e.target).attr('data-provider');
    console.log(provider)
    enableProvider(settings.torrentEngines[provider], provider)
    saveSettings();
});

function enableProvider(engine, name, fromInit) {
    console.log("in enableProvider", engine, name)
    if (engine.public) {
        torrentEngine.enableProvider(name)
        engine.enabled = true;
        if(!engine.public) {
            $('#'+name+'LoginContainer').show()
        }
    } else {
        console.log("in enableProvider with credential")
        if(engine.login && engine.password) {
            torrentEngine.enableProvider(name, engine.login, engine.password)
            engine.enabled = true;
            engine.initialized = true;
        }
        $('#'+name+'LoginContainer').show()
        $('#'+name+'Login')
    }
}

function initPlugins() {
    pluginsDir = confDir + '/plugins/streamstudio-plugins-master/';
    fs.exists(pluginsDir, function(exists) {
        if (!exists) {
            fs.exists(confDir + '/rev.txt', function(exists) {
                if(exists) {
                    fs.unlinkSync(confDir + "/rev.txt");
                    checkRev();
                } else {
                    checkRev();
                }
            });
        } else {
            checkRev();
        }
    });
}

function loadTorrentEngines(cb) {
    if (settings.torrentEnginesEnabled) {
        loadGlobalSearchEngines();
        cb({success:true})
    } 
}

function checkRev() {
    chdir(confDir, function() {
        $.get('https://github.com/smolleyes/streamstudio-plugins/commits/master.atom').done(function(res) {
            var lastRev;
            try {
                lastRev = $($.find('link', res)[2]).attr('href').split('/').pop();
                console.log('lastRev is : ' + lastRev);
                fs.exists(confDir + '/rev.txt', function(exists) {
                    exists ? compareRev(lastRev) : writeRevFile(lastRev);
                });
            } catch (err) {
                try {
                    lastRev = $('.sha-block', res).attr('href').split('/').pop();
                    console.log('lastRev is : ' + lastRev);
                    fs.exists(confDir + '/rev.txt', function(exists) {
                        exists ? compareRev(lastRev) : writeRevFile(lastRev);
                    });
                } catch (err) {
                    console.log(err)
                    main();
                }
            }
        }).fail(function(err) {
          console.log(err)
          main()
        });
    });
}

function loadGlobalSearchEngines(fromInit) {
    $('#GlobalSearchSettings').empty()
    const supportedEngines = ["Yggtorrent","1337x","Torrent9","Rarbg","torrentz2"]
    if(settings.torrentEnginesEnabled) {
        $('#globalSearchSettingsContainer').show();
        for(let engine of torrentEngine.getProviders()) {
            if(supportedEngines.includes(engine.name)) {
                let enabled = settings.torrentEngines[engine.name].enabled ? 'checked' : '';
                $('#GlobalSearchSettings').append(`
                    <div class="ItemCheckbox left"> \
                    <label for="${engine.name}">${engine.name}</label> \
                    <input class="pluginGlobalCheckBox" data-public="${engine.public}" type="checkbox" id="${engine.name}" name="${engine.name}" ${enabled}> \
                    </div>
                `).show();
                if(enabled) {
                    console.log(settings)
                    enableProvider(settings.torrentEngines[engine.name], engine.name, fromInit)
                }
            }
        }
    } else {
        $('#GlobalSearchSettings').empty().hide();
        $('#globalSearchSettingsContainer').hide();
    }
}

function loadApp() {
    wrench.readdirRecursive(pluginsDir, function(error, files) {
        try {
            $.each(files, function(index, file) {
                if (file.match("node_modules") !== null) {
                    return;
                }
                var name = path.basename(file);
                if (name == 'main.js') {
                    try {
                        var eng = require(pluginsDir + file);
                        if (excludedPlugins.indexOf(eng.engine_name.toLowerCase()) !== -1) {
                            return true;
                        }
                        if (pluginsList.indexOf(eng.engine_name.toLowerCase()) == -1 || settings.plugins.indexOf(eng.engine_name.toLowerCase()) !== -1) {
                            engines[eng.engine_name.toLowerCase()] = eng;
                            enginesList.push(eng.engine_name.toLowerCase())
                            if(eng.protected) {
                                gui.Window.open(eng.url, {show:false})
                            }
                            // add entry to main gui menu
                            $('#engines_select ul').append('<li><a href="#" data-value="' + eng.engine_name.toLowerCase() + '">'+eng.engine_name+'</li>');
                        }
                    } catch (err) {
                        console.log("can't load plugin " + file + ", error:" + err)
                    }
                }
            });
        } catch (err) {}
    });
    main();
}

function updatePlugins(url) {
    try {
    $('#loadingApp p').empty().append(_('Downloading plugins...'));
    var req = https.request(url);
    req.on('response', function(resp) {
        if (resp.statusCode > 300 && resp.statusCode < 400 && resp.headers.location) {
            return updatePlugins(resp.headers.location);
        }
        var contentLength = resp.headers["content-length"];
        if(isNaN(contentLength)) {
            return updatePlugins(resp.headers.location);
        }
        var file = fs.createWriteStream(confDir + '/master.zip', {
            flags: 'w'
        });
        var currentTime;
        var startTime = (new Date()).getTime();
        var contentLength = resp.headers["content-length"];
        if (parseInt(contentLength) === 0) {
            $('#loadingApp p').empty().append(_("can't download this file..."));
            setTimeout(function(){
                fs.unlinkSync(confDir + "/rev.txt");
                initPlugins()
            },2000)
        }
        resp.on('data', function(chunk) {
            file.write(chunk);
            var bytesDone = file.bytesWritten;
            currentTime = (new Date()).getTime();
            var transfer_speed = (bytesDone / ( currentTime - startTime)).toFixed(2);
            var newVal= bytesDone*100/contentLength;
            var txt = Math.floor(newVal)+'% '+ _('done at')+' '+transfer_speed+' kb/s';
            $('#loadingApp p').empty().html('<p>'+_('Downloading plugins...')+'</p><p>'+txt+'</p>');
        }).on("end", function(e) {
            console.log("update terminated");
            file.end();
            $('#loadingApp p').empty().append(_('Installing update...'));
            try {
                if (!fs.existsSync(confDir + "/plugins")) {
                    fs.mkdir(confDir + "/plugins");
                }
                setTimeout(function() {
                    var zip = new AdmZip(confDir + '/master.zip');
                    zip.extractAllTo(confDir + "/plugins", true);
                    loadApp();
                }, 5000);
            } catch (err) {
                console.log("plugins update error" + err);
                setTimeout(function(){
                    fs.unlinkSync(confDir + "/rev.txt");
                    initPlugins()
                },2000)
            }
        });
    }).on("error", function(e) {
        fs.unlinkSync(confDir + "/rev.txt");
        initPlugins()
        console.log("Got error: " + e.message);
    });
    req.end();
    } catch(err) {
        console.log(err)
      setTimeout(function(){
        fs.unlinkSync(confDir + "/rev.txt");
        initPlugins()
      },2000)
    }
}


function reloadPlugins() {
    console.log('Reloading plugins');
    pluginsDir = confDir + '/plugins/streamstudio-plugins-master/';
    $('#engines_select ul').empty();
    updatePickers();
    $('#engines_select ul').append('<li><a href="#" data-value="youtube">Youtube</a></li> ');
    $('#engines_select ul').append('<li><a href="#" data-value="dailymotion">Dailymotion</a></li>');
    var currentEngine = search_engine;
    var name = $("#engines_select li a [data-value='"+search_engine+"']").text();
    if(settings.plugins.indexOf(search_engine) !== -1) {
        $("#engines_select li a [data-value='"+search_engine+"']").addClass('active');
        $("#engines_select li a [data-value='"+search_engine+"']").parents('.dropdown').find('.dropdown-toggle').html(name+' <span class="caret"></span>');
    } else {
        $("#engines_select li a [data-value='youtube']").addClass('active').click();
    }
    engines = {};
    wrench.readdirRecursive(pluginsDir, function(error, files) {
        try {
            $.each(files, function(index, file) {
                if (file.match("node_modules") !== null) {
                    return;
                }
                var name = path.basename(file);
                if (name == 'main.js') {
                    try {
                        var eng = require(pluginsDir + file);
                        if (excludedPlugins.indexOf(eng.engine_name.toLowerCase()) !== -1) {
                            return true;
                        }
                        if (pluginsList.indexOf(eng.engine_name.toLowerCase()) == -1 || settings.plugins.indexOf(eng.engine_name.toLowerCase()) !== -1) {
                            engines[eng.engine_name.toLowerCase()] = eng;
                            enginesList.push(eng.engine_name.toLowerCase())
                            // add entry to main gui menu
                            $('#engines_select ul').append('<li><a href="#" data-value="' + eng.engine_name.toLowerCase() + '">'+eng.engine_name+'</li>');
                        }
                    } catch (err) {
                        console.log("can't load plugin " + file + ", error:" + err)
                    }
                }
            });
        } catch (err) {}
    });
    $('#engines_select li:eq(0)').before('<li><a href="#" data-value="global">'+_('Global')+'</li>');
}

function writeRevFile(lastRev) {
    console.log("Creating rev file...");
    fs.writeFile(confDir + '/rev.txt', lastRev, {
        overwrite: true
    }, function(err) {
        if (err) return console.log(err);
        console.log(lastRev + ' > rev.txt');
        updatePlugins('https://github.com/smolleyes/streamstudio-plugins/archive/master.zip');
    });
}

function compareRev(lastRev) {
    console.log("Compare rev file...");
    fs.readFile(confDir + '/rev.txt', function(err, data) {
        if (err) throw err;
        var rev = data.toString();
        if ((rev !== '') && (rev !== null) && (rev === lastRev)) {
            loadApp();
        } else {
            writeRevFile(lastRev);
        }
    });
}
