/**
 * @file MediaElement Playlist Feature (plugin).
 * @author Andrew Berezovsky <andrew.berezovsky@gmail.com>
 * Twitter handle: duozersk
 * @author Original author: Junaid Qadir Baloch <shekhanzai.baloch@gmail.com>
 * Twitter handle: jeykeu
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
var showText = _('Show/Hide Playlist');

(function($) {
  $.extend(mejs.MepDefaults, {
    loopText: 'Repeat On/Off',
    shuffleText: 'Shuffle On/Off',
    nextText: 'Next Track',
    prevText: 'Previous Track',
    playlistText: showText
  });

  $.extend(MediaElementPlayer.prototype, {
    // LOOP TOGGLE
    buildloop: function(player, controls, layers, media) {
      var t = this;

      var loop = $('<div class="mejs-button mejs-loop-button ' + ((player.options.loop) ? 'mejs-loop-on' : 'mejs-loop-off') + '">' +
        '<button type="button" aria-controls="' + player.id + '" title="' + player.options.loopText + '"></button>' +
        '</div>')
        // append it to the toolbar
        .appendTo(controls)
        // add a click toggle event
        .click(function(e) {
          player.options.loop = !player.options.loop;
          $(media).trigger('mep-looptoggle', [player.options.loop]);
          if (player.options.loop) {
            loop.removeClass('mejs-loop-off').addClass('mejs-loop-on');
            //media.setAttribute('loop', 'loop');
          }
          else {
            loop.removeClass('mejs-loop-on').addClass('mejs-loop-off');
            //media.removeAttribute('loop');
          }
        });

      t.loopToggle = t.controls.find('.mejs-loop-button');
    },
    loopToggleClick: function() {
      var t = this;
      t.loopToggle.trigger('click');
    },
    // SHUFFLE TOGGLE
    buildshuffle: function(player, controls, layers, media) {
      var t = this;

      var shuffle = $('<div class="mejs-button mejs-shuffle-button ' + ((player.options.shuffle) ? 'mejs-shuffle-on' : 'mejs-shuffle-off') + '">' +
        '<button type="button" aria-controls="' + player.id + '" title="' + player.options.shuffleText + '"></button>' +
        '</div>')
        // append it to the toolbar
        .appendTo(controls)
        // add a click toggle event
        .click(function(e) {
          player.options.shuffle = !player.options.shuffle;
          $(media).trigger('mep-shuffletoggle', [player.options.shuffle]);
          if (player.options.shuffle) {
            shuffle.removeClass('mejs-shuffle-off').addClass('mejs-shuffle-on');
          }
          else {
            shuffle.removeClass('mejs-shuffle-on').addClass('mejs-shuffle-off');
          }
        });

      t.shuffleToggle = t.controls.find('.mejs-shuffle-button');
    },
    shuffleToggleClick: function() {
      var t = this;
      t.shuffleToggle.trigger('click');
    },
    // PREVIOUS TRACK BUTTON
    buildprevtrack: function(player, controls, layers, media) {
      var t = this;

      var prevTrack = $('<div class="mejs-button mejs-prevtrack-button mejs-prevtrack">' +
        '<button type="button" aria-controls="' + player.id + '" title="' + player.options.prevText + '"></button>' +
        '</div>')
        .appendTo(controls)
        .click(function(e){
          $(media).trigger('mep-playprevtrack');
          player.playPrevTrack();
        });

      t.prevTrack = t.controls.find('.mejs-prevtrack-button');
    },
    prevTrackClick: function() {
      var t = this;
      t.prevTrack.trigger('click');
    },
    // NEXT TRACK BUTTON
    buildnexttrack: function(player, controls, layers, media) {
      var t = this;

      var nextTrack = $('<div class="mejs-button mejs-nexttrack-button mejs-nexttrack">' +
        '<button type="button" aria-controls="' + player.id + '" title="' + player.options.nextText + '"></button>' +
        '</div>')
        .appendTo(controls)
        .click(function(e){
          $(media).trigger('mep-playnexttrack');
          player.playNextTrack();
        });

      t.nextTrack = t.controls.find('.mejs-nexttrack-button');
    },
    nextTrackClick: function() {
      var t = this;
      t.nextTrack.trigger('click');
    },
    // PLAYLIST TOGGLE
    buildplaylist: function(player, controls, layers, media) {
      var t = this;
      t.playlistTracks = [];
      var playlistToggle = $('<div class="mejs-button mejs-playlist-button mejs-show-playlist">' +
        '<button type="button" aria-controls="' + player.id + '" title="' + player.options.playlistText + '"></button>' +
        '</div>')
        .appendTo(controls)
        .click(function(e) {
          player.options.playlist = !player.options.playlist;
          $(media).trigger('mep-playlisttoggle', [player.options.playlist]);
          if (player.options.playlist) {
            $('.mejs-playlist').show();
            $('.mejs-playlist > ul').show();
            $('.mejs-playlist').css('opacity',1);
            playlistToggle.removeClass('mejs-show-playlist').addClass('mejs-hide-playlist');
          }
          else {
            $('.mejs-playlist').hide();
            $('.mejs-playlist  > ul').hide();
            $('.mejs-playlist').css('opacity',0);
            playlistToggle.removeClass('mejs-hide-playlist').addClass('mejs-show-playlist');
          }
        });

      t.playlistToggle = t.controls.find('.mejs-playlist-button');

      $('#box').keyup(function () {
        var valThis = this.value.toLowerCase(),
            lenght  = this.value.length;

        $('.mejs-playlist > ul >li').each(function () {
          console.log($(this).text())
            var text  = $(this).text(),
                textL = text.toLowerCase(),
                htmlR = '<b>' + text.substr(0, lenght) + '</b>' + text.substr(lenght);
                (textL.indexOf(valThis) !== -1) ? $(this).show() : $(this).hide();
        });

      });
    },
    playlistToggleClick: function() {
      var t = this;
      t.playlistToggle.trigger('click');
    },
    // PLAYLIST WINDOW
    buildplaylistfeature: function(player, controls, layers, media) {
      var txt = _('Search in the playlist...')
      var playlist = $('<div class="mejs-playlist mejs-layer"><input placeholder="'+txt+'" id="box" type="text" />' +
        '<ul class="mejs"></ul>' +
        '</div>')
        .appendTo(layers);
      if (!player.options.playlist) {
        playlist.hide();
      }
      if (player.options.playlistposition == 'bottom') {
        playlist.css('top', player.options.audioHeight + 'px');
      }
      else {
        playlist.css('bottom', player.options.audioHeight + 'px');
      }
      var getTrackName = function(trackUrl) {
        var trackUrlParts = trackUrl.split("/");
        if (trackUrlParts.length > 0) {
          return decodeURIComponent(trackUrlParts[trackUrlParts.length-1]);
        }
        else {
          return '';
        }
      };

      // calculate tracks and build playlist
      var tracks = [];
      //$(media).children('source').each(function(index, element) { // doesn't work in Opera 12.12
      $('#'+player.id).find('.mejs-mediaelement source').each(function(index, element) {
        if ($.trim(this.src) != '') {
          var track = {};
          track.source = $.trim(this.src);
          if ($.trim(this.title) != '') {
            track.name = $.trim(this.title);
          }
          else {
            track.name = getTrackName(track.source);
          }
          tracks.push(track);
        }
      });
      if($('#'+player.id).find('.mejs-mediaelement source') > 1 ) {
        for (var track in tracks) {
          layers.find('.mejs-playlist > ul').append('<li data-url="' + tracks[track].source + '" title="' + tracks[track].name + '">' + tracks[track].name + '</li>');
        }
        //layers.children('.mejs-playlist').show();
      } else {
        layers.children('.mejs-playlist').hide();
      }

      // set the first track as current
      layers.find('li:first').addClass('current played');
      // play track from playlist when clicking it
      layers.find('.mejs-playlist > ul li').click(function(e) {
        if (!$(this).hasClass('current')) {
          $(this).addClass('played');
          player.playTrack($(this));
        }
        else {
          player.play();
        }
      });

      // when current track ends - play the next one
      media.addEventListener('ended', function(e) {
        player.playNextTrack();
      }, false);
    },
    playNextTrack: function() {
      var t = this;
      var tracks = t.layers.find('.mejs-playlist > ul > li');
      var current = tracks.filter('.current');
      var notplayed = tracks.not('.played');
      if (notplayed.length < 1) {
        current.removeClass('played').siblings().removeClass('played');
        notplayed = tracks.not('.current');
      }
      if (t.options.shuffle) {
        var random = Math.floor(Math.random()*notplayed.length);
        var nxt = notplayed.eq(random);
      }
      else {
        var nxt = current.next();
        if (nxt.length < 1 && t.options.loop) {
          nxt = current.siblings().first();
        }
      }
      if (nxt.length == 1) {
        nxt.addClass('played');
        nxt.click()
      }
    },
    playPrevTrack: function() {
      var t = this;
      var tracks = t.layers.find('.mejs-playlist > ul > li');
      var current = tracks.filter('.current');
      var played = tracks.filter('.played').not('.current');
      if (played.length < 1) {
        current.removeClass('played');
        played = tracks.not('.current');
      }
      if (t.options.shuffle) {
        var random = Math.floor(Math.random()*played.length);
        var prev = played.eq(random);
      }
      else {
        var prev = current.prev();
        if (prev.length < 1 && t.options.loop) {
          prev = current.siblings().last();
        }
      }
      if (prev.length == 1) {
        current.removeClass('played');
        prev.click()
      }
    },
    setCurrent : function(id) {
      $('#'+id).addClass('current').siblings().removeClass('current');
    },
    playTrack: function(track) {
      $('.mejs-playlist').hide();
      var id = track.attr('id');
      track = __.find(this.playlistTracks, function(b){
        return b.id === id;
      });
      $('#'+id).addClass('current').siblings().removeClass('current');
      initPlay(track)
    },
    playTrackURL: function(url) {
      var t = this;
      var tracks = t.layers.find('.mejs-playlist > ul > li');
      var track = tracks.filter('[data-url="'+url+'"]');
      initPlay(track);
    },
    cleanTracks: function() {
       var t = this;
       var container = t.layers.find('.mejs-playlist > ul');
       container.empty();
       t.playlistTracks = new Array();
    },
    addTrack : function(media) {
      var t = this;
      var container = t.layers.find('.mejs-playlist > ul');
      media.link = media.link;
      media.title = media.title;
      media.id = generateUUID();
      t.playlistTracks.push(media)
      container.prepend('<li id="'+media.id+'" title="' + media.title + '">' + media.title + '</li>');
      $('.mejs-playlist').hide();
      $('.mejs-playlist  > ul').hide();
      $('.mejs-playlist').css('opacity',0);
      t.layers.find('li:first').addClass('playlistTrack played');
      $('#'+media.id).addClass('current').siblings().removeClass('current');
      initPlay(media)
    },
    addTorrentTrack : function(id,title,size,bytes,tclass,viewed) {
      var exClass = 'played'
      if(!viewed) {
        exClass=''
      }
      var t = this;
      var container = t.layers.find('.mejs-playlist > ul');
      var tid= generateUUID();
      var dejaVu = viewed ? _('watched') : _('Not seen');
      container.append('<li id="'+tid+'" data-id="'+id+'" data-length="'+bytes+'" title="' + title + '">' + title + ' | '+size+' | '+dejaVu+'</li>');
      t.layers.find('li:last').addClass('loadStreaming playFromplaylist '+ tclass + ' '+exClass);
      $('.mejs-playlist').hide();
      $('.mejs-playlist  > ul').hide();
      $('.mejs-playlist').css('opacity',0);
      $('#'+tid).addClass('current').siblings().removeClass('current');
    }
  });

})(mejs.$);
