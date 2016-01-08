function getUpnpPosition() {
	 mediaRenderer.getPosition(function(err, position) {
			if (position) {
				mediaRenderer.getDuration(function(err, duration) {
	         if(duration) {
            	var pct = (position * 100 / duration).toFixed(2);
							$('.mejs-time-current').css({width: pct+'%', maxWidth: '100%'})
							$('span.mejs-currenttime').text(secondstotime(position));
							$('span.mejs-duration').text(secondstotime(duration));
							mediaDuration = duration;
							if(upnpToggleOn) {
								mediaCurrentTime = position;
							} else {
								player.media.currentTime = position;
							}
							updateTimer.emit("timeupdate");
	         }
	     	});
		} else {
				console.log("Upnp stopping...");
		}
	});
}
