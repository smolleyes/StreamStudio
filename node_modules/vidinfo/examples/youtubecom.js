/*
 Formatter example.

 This file is part of the 'VidInfo' project.
 https://github.com/LouisT/VidInfo
*/
module.exports = {
          url: 'http://gdata.youtube.com/feeds/api/videos/{:id}?v=2&alt=json',
          regex: [/(?:https?:\/\/)?(?:.*\.)?youtu(?:\.be\/|be\.com\/(?:watch\?.*?v=)?)([^\?#&\s\[\]\(\)]+)/i],
          shortcuts: 'yt',
          formatter: function (data, error, cb) {
                var ret = {};
                if ('$t' in data.entry.title) {
                   ret.title = data.entry.title.$t;
                   if ('seconds' in data.entry.media$group.yt$duration) {
                      ret.duration = data.entry.media$group.yt$duration.seconds;
                   }
                   if ('yt$statistics' in data.entry &&'viewCount' in data.entry.yt$statistics) {
                      ret.views = data.entry.yt$statistics.viewCount.toString();
                      if ('favoriteCount' in data.entry.yt$statistics) {
                         ret.favorites = data.entry.yt$statistics.favoriteCount.toString();
                      }
                   }
                   if ('gd$rating' in data.entry) {
                      if ('average' in data.entry.gd$rating) {
                         ret.rating = {};
                         ret.rating.average = data.entry.gd$rating.average;
                         if ('numRaters' in data.entry.gd$rating && data.entry.gd$rating.numRaters > 1) {
                            ret.rating.raters = data.entry.gd$rating.numRaters;
                         }
                      }
                      if ('numLikes' in data.entry.yt$rating) {
                         ret.likes = data.entry.yt$rating.numLikes;
                      }
                      if ('numDislikes' in data.entry.yt$rating) {
                         ret.likes = data.entry.yt$rating.numDislikes;
                      }
                   }
                   if ('$t' in data.entry.author[0].name) {
                      ret.author =  data.entry.author[0].name.$t;
                      if ('$t' in data.entry.published) {
                         ret.published = new Date(Date.parse(data.entry.published.$t));
                      }
                   }
                };
                cb(ret,false); 
          },
};
