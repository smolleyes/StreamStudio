onload = function() {
    try {
        cleanffar();
    } catch(err) {}
    try {
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
            
            if (playAirMedia === true) {
                login(stop_on_fbx);
            }
            // clean torrent dir
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
                    try {
                        page.hide();
                        page.close(true);
                    } catch (err) {
                        console.log(err);
                        if (playAirMedia === true) {
                            login(stop_on_fbx);
                        }
                        try {
                            page.close(true);
                        } catch (err) {
                            process.exit();
                            if (playAirMedia === true) {
                                login(stop_on_fbx);
                            }
                        }
                    }
                }
            });
            win.hide();
            win.close(true);
        });
    } catch (err) {
        try {
            if (playAirMedia === true) {
                login(stop_on_fbx);
            }
        } catch (err) {}
        try {
            fs.unlinkSync(tmpFolder);
        } catch(err) {}
        // clean torrent dir
        win.hide();
        win.close(true);
        process.exit();
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