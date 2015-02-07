var engines = [];
var excludedPlugins = ['mega', 'mega-files', 'vimeo', 'mega-search','thepiratebay'];
var pluginsDir;
var pluginsList = ['grooveshark','twitch','songza','cpasbien','thepiratebay','omgtorrent','t411','kickass'];

function initPlugins() {
    pluginsDir = confDir + '/plugins/streamstudio-plugins-master/';
    chdir(confDir, function() {
        $.get('https://github.com/smolleyes/streamstudio-plugins/commits/master.atom', function(res) {
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
        });
    });
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
                            // add entry to main gui menu
                            $('#engines_select').append('<option value="' + eng.engine_name.toLowerCase() + '">' + eng.engine_name + '</option>');
                            $('.selectpicker').selectpicker('refresh');
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
    console.log("Updating plugins");
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
        $.notif({title: 'StreamStudio update:',icon: '&#128229;',timeout:0,content:'',btnId:'',btnTitle:'',btnColor:'',btnDisplay: 'none',updateDisplay:'block'});
        var pbar = $('#updateProgress');
        $('#updateProgress strong').html(_('Waiting for connection...'));
        var val = $('#updateProgress progress').attr('value');
        var currentTime;
        var startTime = (new Date()).getTime();
        var contentLength = resp.headers["content-length"];
        if (parseInt(contentLength) === 0) {
            $('#updateProgress strong').html(_("can't download this file..."));
            setTimeout(function(){pbar.hide()},5000);
        }
        resp.on('data', function(chunk) {
            file.write(chunk);
            var bytesDone = file.bytesWritten;
            currentTime = (new Date()).getTime();
            var transfer_speed = (bytesDone / ( currentTime - startTime)).toFixed(2);
            var newVal= bytesDone*100/contentLength;
            var txt = Math.floor(newVal)+'% '+ _('done at')+' '+transfer_speed+' kb/s';
            $('#updateProgress progress').attr('value',newVal).text(txt);
            $('#updateProgress strong').html(txt);
        }).on("end", function(e) {
            console.log("update terminated");
            file.end();
            $('#updateProgress b').empty();
            $('#updateProgress strong').html(_('Download ended !'));
            $('#updateProgress progress').hide();
             $('#updateProgress strong').html(_('Installing update...'));
            try {
                if (!fs.existsSync(confDir + "/plugins")) {
                    fs.mkdir(confDir + "/plugins");
                }
                setTimeout(function() {
                    var zip = new AdmZip(confDir + '/master.zip');
                    zip.extractAllTo(confDir + "/plugins", true);
                    $('.notification').click();
                    loadApp();
                }, 5000);
            } catch (err) {
                console.log("plugins update error" + err);
            }
        });
    }).on("error", function(e) {
        console.log("Got error: " + e.message);
    });
    req.end();
}


function reloadPlugins() {
    console.log('Reloading plugins');
    pluginsDir = confDir + '/plugins/streamstudio-plugins-master/';
    $('#engines_select').empty();
    updatePickers();
    $('#engines_select').append('<option value="youtube">Youtube</option>');
    $('#engines_select').append('<option value="dailymotion">Dailymotion</option>');
    var currentEngine = search_engine;
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
                            $('#engines_select').append('<option value="' + eng.engine_name + '">' + eng.engine_name + '</option>');
                            updatePickers()
                        }
                    } catch (err) {
                        console.log("can't load plugin " + file + ", error:" + err)
                    }
                }
            });
        } catch (err) {}
    });
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


