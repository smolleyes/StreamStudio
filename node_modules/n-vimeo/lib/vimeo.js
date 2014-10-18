/*
 * Vimeo API interaction
 * @author: Alejandro Morales <vamg008[at]gmail[dot]com>
 * @license: MIT 
 */

var request = require('request')
  , vimeoV2 = "http://vimeo.com/api/v2/"
  , endPoints = {
      rest     : "http://vimeo.com/api/rest/v2/",
      video    : vimeoV2 + "video/",
      activity : vimeoV2 + "activity/", 
      album    : vimeoV2 + "album/",
      root     : vimeoV2
    }
  ;

// shorthand 
var ep = endPoints;

// Helpers
var userOption = {
  info          : "user info for the specified user",
  videos        : "Videos created by user",
  likes         : "Videos the user likes",
  appears_in    : "Videos that the user appears in",
  all_videos    : "Videos that the user appears in and created",
  subscriptions : "Videos the user is subscribed to",
  albums        : "Albums the user has created",
  channels      : "Channels the user has created and subscribed to",
  groups        : "Groups the user has created and joined"
}

var activityOptions = {
  user_did         :"Activity by the user",
  happened_to_user :"Activity on the user",
  contacts_did     :"Activity by the user's contacts",
  everyone_did     :"Activity by everyone"
}

var groupOption =  {
  videos :"Videos added to that group",
  users  :"Users who have joined the group",
  info   :"Group info for the specified group"
}

var channelOption = {
  videos :"Videos in the channel",
  info   :"Channel info for the specified channel"
}

var albumOption = {
  videos :"Videos in the album",
  info   :"Album info for the specified album"
}

/*
 *  video
 * @api Public
 * expose the video api through the client
*/
function video(id, cb){
  var now = Date.now()
    , url = ep.video + id + '.json'
    ;

  request(ep.video + id + '.json', function(err,dres){
    if (!err && dres.statusCode === 200 && dres.body.length > 0) {
      try {
        var raw = JSON.parse(dres.body)[0];

        var thumb =  { 
          s: raw.thumbnail_small,
          m: raw.thumbnail_medium,
          l: raw.thumbnail_large 
        };

        var username = { 
          name     : raw.user_name, 
          portrait : raw.user_portrait_medium
        };

        var data = {
          time       : Date.now() - now,
          statusCode : dres.statusCode,
          raw        : raw,
          thumb      : thumb,
          username   : username
        }

        cb(null, data);

       } catch(e) {
         cb(new Error('parsing error'));
       }
    } else if (!err) {
      cb(null,dres)
    } else {
      cb(err);
    }
  });
}



function user (usr, opt, cb) {
  var now = Date.now();

  if (userOption.hasOwnProperty(opt)) {

    request(ep.root + usr + '/' + opt + '.json', function(err, response) {

      if (response.statusCode === 200){
          var body = JSON.parse(response.body) || [];            
          var data = {
            time       : Date.now() - now ,
            statusCode : response.statusCode,
            body       : body,
            items      : body.length
          };
          cb(null, data);
      } else {
        cb(new Error('User no exists'));
      }

    });

  } else {     
    cb(new Error( 'The request type do not exists see nvimeo.info'));
  }
}

function activity (usr,opt,cb) {

  var now = Date.now();

  if (activityOptions.hasOwnProperty(opt)){
    request(ep.activity + usr + '/' + opt + '.json', function(error,response){

      if (!error && response.statusCode === 200) {
        var body = JSON.parse(response.body);
        var data = {
          time       : new Date().getTime() - now ,
          statusCode : response.statusCode,
          body       : body,
          items      : body.length
        }
        cb(null, data);
      } else {
        cb(error);
      }

    });

  } else {
    cb(new Error("Invalid Request"));
 }
}

function vimeo (type, id, opt, cb) {
  if (arguments.length !== 4 ){ 
    throw new Error("One of the params is missing see nvimeo.info" );
  } else {
    
    var now = Date.now()
      , error = null
      , url
      ;

    switch(type) {
      case 'group':
        if (groupOption.hasOwnProperty(opt)) {   
          url = ep.root  + 'group/' + id + '/' + opt ;
        } else {
          error = {};
          error.data = groupOption;
        }
        break;
      case 'activity':
        if (activityOptions.hasOwnProperty(opt)){
          url = ep.activity +id + '/'+ opt 
        } else { 
          error = {};
          error.data = activityOptions;
        }
        break;   
      case 'user':
        if (userOption.hasOwnProperty(opt)){
          url = ep.root + id + '/' + opt;
        } else {
          error = {};
          error.data = userOption;
        }
        break; 
      case 'video':
        url = ep.video + id;
        var video = true;
        break;
      case 'channel':
        if (channelOption.hasOwnProperty(opt)) {
          url = ep.root + 'channel/' + id + '/' + opt;
        } else { 
          error = {}; 
          error.data = channelOption;
        }
        break;
      case 'album':
        if (albumOption.hasOwnProperty(opt)){
          url = ep.root + 'album/' + id + '/' +opt;
        } else { 
          error = {};
          error.data = albumOption
        }
        break;
      default:
        error = {};
        error.data= 'METHOD not allowed';
        break;
    }
    if (!error && video){
      request( url + '.json', function(error,response){
        if (!error && response.statusCode === 200) {
          try {
            var raw = JSON.parse(response.body)[0];
            var thumb =  {
              s :raw.thumbnail_small,
              m :raw.thumbnail_medium,
              l :raw.thumbnail_large
            };
            var username = { 
              name: raw.user_name, 
              portrait: raw.user_portrait_medium
            };
            var data = {
              time     : Date.now() - now,
              raw      : raw,
              thumb    : thumb,
              username : username
            }
            cb(null,data);
          } catch (e){
            cb (new Error('Parser error'));
          }
        } else {
          cb( error );
        }
      });
    } else if (!error){
      request( url + '.json', function(err,response){
        if (!err && response.statusCode === 200) {
            var body = JSON.parse(response.body);
            var data = {
              status:'ok',
              statusCode: response.statusCode,
              time: Date.now() - now,
              items: body.length,
              body: body
            }
            cb(null, data);
        } else {
          cb(new Error('User do not exists'));
        }
      });
    } else {
      cb(new Error('Invalid option see nvimeo.info'));
    }
  }
}

/*
 * Public API
*/

module.exports = {
  user: user,
  activity: activity,
  vimeo: vimeo,
  video: video,
  info: {
    "methods": ["channel","user","activity","video","album"],
    "params": ["ID", "request", "TODO format"]
  }
}