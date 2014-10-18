onload = function() {
    try {
        win.on('close', function() {
            if (playAirMedia === true) {
                login(stop_on_fbx);
            }
            // clean torrent dir
            try {
                wipeTmpFolder();
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
        // clean torrent dir
        win.hide();
        win.close(true);
        process.exit();
    }
}

win.on('loaded', function() {
    win.show();
});
