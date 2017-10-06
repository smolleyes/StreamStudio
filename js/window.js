onload = function() {
  win.on('close', function() {
      try {
          gui.App.closeAllWindows(true)
          gui.App.quit();
          process.exit()
      } catch(err) {
          gui.App.quit();
          process.exit()
      }
    });
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
