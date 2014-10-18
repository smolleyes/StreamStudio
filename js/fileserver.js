var serverSettings;

function checkFileServerSettings(vpath) {
	if (serverSettings.rootFolder !== decodeURIComponent(vpath)+'/') {
		try {
			server.close();
		} catch (err) {}
		serverSettings = {
			"mode": "development",
			"forceDownload": false,
			"random": false,
			"rootFolder": decodeURIComponent(vpath) + '/',
			"rootPath": "",
			"server": "VidStreamer.js/0.1.4"
		}
		server = http.createServer(vidStreamer.settings(serverSettings));
		server.listen(8889);
	}
}

function createServer() {
    try {
        server.close();
    } catch (err) {}
    var homeDir = getUserHome();
    serverSettings = {
        "mode": "development",
        "forceDownload": false,
        "random": false,
        "rootFolder": "/",
        "rootPath": "",
        "server": "VidStreamer.js/0.1.4"
    }
    server = http.createServer(vidStreamer.settings(serverSettings));
    server.listen(8889);
    createLocalRootNodes();
}

// start file server
if (settings.shared_dirs.length !== 0) {
	createServer();
}
