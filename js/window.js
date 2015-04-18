onload = function() {
    try {
        cleanffar();
    } catch(err) {}
    try {
        initPlayer();
        win.on('close', function() {
            try {
                var pid = extPlayerProc.pid+1;
                psnode.kill(pid, function( err ) {
                    if (err) {
                        throw new Error('');
                    }
                    else {
                        console.log( 'Process %s has been killed!', pid );
                        extPlayerRunning = false;
                    }
                });
            } catch(err) {}
            try {
                fs.unlinkSync(tmpFolder);
            } catch(err) {}
            try {
                UPNPserver.stop();
            } catch (err) {}
            // close opened pages in engines
            $.each(engines, function(key, value) {
                var page = value.page;
                if (page !== undefined) {
                    if (upnpMediaPlaying || playFromUpnp) {
                        try {
                            mediaRenderer.stop();
                        } catch(err) { }
                    }
                }
            });
            try {
                gui.App.closeAllWindows()
                process.exit()
                gui.App.quit();
            } catch(err) {
                process.exit()
                gui.App.quit();
            }
        });
    } catch (err) {
        if (upnpMediaPlaying || playFromUpnp) {
            try {
                mediaRenderer.stop();
            } catch(err) { }
        }
        try {
            fs.unlinkSync(tmpFolder);
        } catch(err) {}
        // clean torrent dir
        try {
            gui.App.closeAllWindows()
            process.exit()
            gui.App.quit();
        } catch(err) {
            process.exit()
            gui.App.quit();
        }
    }
}


win.on('loaded', function() {
    win.show();
});

win.on('new-win-policy', newWinPolicyHandler);

function newWinPolicyHandler(frame, url, policy) {
    policy.setNewWindowManifest({
        position: 'center',
        frame: true,
        focus: true,
        toolbar:false,
        title:'StreamStudio',
        width:800,
        height:600
    });
}