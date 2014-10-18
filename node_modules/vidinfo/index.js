/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo
*/
(function(){
   var http_get = require('./libs/http_get.js'),
       fs = require('fs');

   var VidInfo = function (settings) {
          if (!(this instanceof VidInfo)) {
             return new VidInfo(settings);
          };
          // Look at the README for available settings.
          this.settings = settings||{format:true};
          // Set the default location of enabled APIs.
          if (!('enabled' in this.settings)) {
             this.settings['enabled'] = __dirname+'/apis/enabled/';
          };
          // Set the default location of disabled APIs.
          if (!('disabled' in this.settings)) {
             this.settings['disabled'] = __dirname+'/apis/disabled/';
          };
          // User-Agent sent on API requests.
          this.userAgent = 'Mozilla/5.0+(compatible; VidInfo/0.2.5; https://github.com/LouisT/VidInfo)';
          // Import supported APIs. (./apis/enabled/)
          this.importAPIs();
   };

   // Pull information from the url.
   VidInfo.prototype.byURL = function (url,cb,opts) {
           var apidat,
               opts = opts||{};
           if (!cb) {
              return false; // Needs a callback!
           };
           if (!('error' in (apidat = this.detect(url,null,opts)))) {
              this.doRequest(apidat['url'],apidat,cb,opts);
            } else {
              cb(apidat,true);
           };
   };

   // Depricate <obj>.byurl for <obj>.byURL -- better standardization.
   VidInfo.prototype.byurl = function (url,cb,opts) {
           console.warn('NOTICE: byurl is depricated, please use byURL.');
           this.byURL(url,cb,opts);
   };

   // Get information for an ID for the specified API.
   VidInfo.prototype.byID  = function (id,api,cb,opts) {
           if (!cb) {
              return false; // Needs a callback!
           };
           var opts = opts||{},
               api = this.byShortcut(api);
           if ((api in this.apis)) {
              var apidat = this.copyObj(this.apis[api]),
                  fields = ((apidat['fields']||[]).join((apidat['fieldsJoiner']||','))),
                  foropts = {id:id,fields:fields};
              if (('apikey' in opts || 'needkey' in apidat)) {
                 if (!('apikey' in opts)) {
                    return cb({error:true,message:'API key is required!'},true);
                  } else {
                    foropts['apikey'] = opts['apikey'];
                 };
              };
              if (('basicauth' in opts || 'basicauth' in apidat)) {
                 if (!('basicauth' in opts)) {
                    return cb({error:true,message:'Basic auth `username:password` is required!'},true);
                  } else {
                    foropts['basicauth'] = opts['basicauth'];
                 };
              };
              this.doRequest(this.stringFormat(apidat["url"],foropts),apidat,cb,opts);
            } else {
              cb({error:true,message:'No such API!'},true);
           };
   };

   // Depricate <obj>.byid for <obj>.byID -- better standardization.
   VidInfo.prototype.byid = function (url,cb,opts) {
           console.warn('NOTICE: byid is depricated, please use byID.');
           this.byID(url,cb,opts);
   };

   // Detect what API to use by video url.
   VidInfo.prototype.detect = function (url,cb,opts) {
           var opts = opts||{},
               matches;
           apiloop:
           for (var api in this.apis) {
               var apidat = this.copyObj(this.apis[api]),
                   fields = ((apidat['fields']||[]).join((apidat['fieldsJoiner']||',')));
               if (('keys' in opts && api in opts['keys'])) {
                  opts['apikey'] = opts['keys'][api];
               };
               if (!(apidat['regex'] instanceof Array)) {
                  apidat['regex'] = [apidat['regex']];
               };
               for (var num in apidat['regex']) {
                   var regex = apidat['regex'][num];
                   if ((matches = regex.exec(url)) !== null) {
                      // Return full URL or a parsed ID.
                      // This is rather hackish. Find a better way to do this.
                      var id = (apidat['fullurl']?matches[0]:matches[1]),
                          foropts = {id:id,fields:fields};
                      if (('apikey' in opts || 'needkey' in apidat)) {
                         if (!('apikey' in opts)) {
                            apidat['error'] = true;
                            apidat['message'] = 'API key is required!';
                          } else {
                            foropts['apikey'] = opts['apikey'];
                         };
                      };
                      if (('basicauth' in opts || 'basicauth' in apidat)) {
                         if (!('basicauth' in opts)) {
                            apidat['error'] = true;
                            apidat['message'] = 'Basic auth `username:password` is required!';
                          } else {
                            foropts['basicauth'] = opts['basicauth'];
                         };
                      };
                      apidat['url'] = this.stringFormat(apidat["url"],foropts);
                      apidat['api'] = api;
                      apidat['id']  = matches[1];
                      break apiloop;
                   };
               };
           };
           // Return an error if not successful.
           if (!('id' in apidat) && !('error' in apidat)) {
              apidat = {error:true,message:'Could not detect API for supplied URL.'};
           };
           if (!cb) {
              return apidat;
            } else {
              cb(apidat,(('error' in apidat)?true:false)); 
           };
   };

   // Get ALL IDs within a string.
   VidInfo.prototype.detectAll = function (str,cb,opts) {
           var str = str.replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ').split(' '),
               strlen = str.length,
               ret = {},
               opts = opts||{};
           // Attempt to get the API key by API shortcut.
           if (('keys' in opts)) {
              for (var apin in opts['keys']) {
                  opts['keys'][this.byShortcut(apin)] = opts['keys'][apin];
              };
           };
           // Scan the split string for URLs.
           for (var i = 0; i < strlen; i++) {
               var detected = this.detect(str[i],false,opts);
               if (('api' in detected && 'id' in detected)) {
                  // Check if `api` has already been added to `ret`.
                  if (!(detected['api'] in ret)) {
                     // Store video IDs in `ids` to prevent detecting the same links.
                     ret[detected['api']] = {ids:[],matches:[]};
                  };
                  // Check to see if the video link was already added to the object.
                  if (opts['nocheck'] || ret[detected['api']]['ids'].indexOf(detected['id']) == -1) {
                     ret[detected['api']]['ids'].push(detected['id']);
                     ret[detected['api']]['matches'].push(detected);
                  };
               };
           };
           // Set `empty` in ret if there are no detections.
           if ((!Object.keys(ret).length)) {
              ret['empty'] = true;
           };
           if (!cb) {
              return ret;
            } else {
              // Set `error` to true if `empty` is in ret.
              cb(ret,('empty' in ret));
           }
   };

   // Make http requests! -- Moved from 'byURL' and 'byID'
   VidInfo.prototype.doRequest = function (url,apidat,cb,opts) {
           // Default to JSON for requests. Custom user agent, accept everything!
           var getopts = {type:'json',headers:{'User-Agent':this.userAgent,'Accept':'*/*'}};
           // Support for JSON, CVS and INI. Maybe XML at some point.
           if (apidat['type']) {
              getopts['type'] = apidat['type'];
           };
           // Run the request.
           var formatter = (opts['formatter']||(apidat['formatter']||false)),
               parent = this;
           http_get(url,getopts,function(content,error) {
                (formatter&&parent.settings['format']?formatter:cb)(content,error,cb);
           });
   };

   // Do not overwrite an existing object, just copy it!
   VidInfo.prototype.copyObj = function (obj) {
           var newObj = ((obj.constructor===Array)?[]:{});
           for (var key in obj) {
               if ((this.getType(obj[key]).match(/(object|array)/i))) {
                  newObj[key] = this.copyObj(obj[key]);
                } else {
                  if (obj.hasOwnProperty(key)) {
                     newObj[key] = obj[key];
                  };
               };
           };
           return newObj;
   };

   // Try and detect the API by shortcut.
   VidInfo.prototype.byShortcut  = function (api) {
           if (!(api in this.apis)) {
              for (var apin in this.apis) {
                  if ('shortcuts' in this.apis[apin] && this.apis[apin].shortcuts.indexOf(api) > -1) {
                     api = apin;
                  };
              };
           };
           return api;
   };

   // Format strings.
   VidInfo.prototype.stringFormat = function (str,opts) {
           return str.replace(/{(\\?:)([^}]+)}/g,function(m,o,k) {
                  return (opts[k]?opts[k]:m);
           });
   };

   // Get the type of an object.
   VidInfo.prototype.getType = function (obj) {
           return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1];
   };

   // Get location of API file.
   VidInfo.prototype.getAPILocation = function (api) {
           var api = (api.indexOf('.js')===-1?api+'.js':api),
               location = false;
           // XXX: Stop using fs.existsSync!?
           if (fs.existsSync(this.settings.disabled+api)) {
              location = {is:false,path:this.settings.disabled,file:api};
           } else if (fs.existsSync(this.settings.enabled+api)) {
              location = {is:true,path:this.settings.enabled,file:api};
           };
           return location;
   };

   // Enable an API.
   VidInfo.prototype.enable = function (api,nomove) {
           var location = this.getAPILocation(api), nf;
           // No API!? What is this nonsense!
           if (!location) {
              return false;
           };
           // Reuse code! "loadAPI.call(this,<location>,<file>)"
           function loadAPI (location,file) {
                    api = file.split('.')[0];
                    this.apis[api] = require(location);
                    // Remove the file from required cache. (Bad idea?)
                    delete require.cache[require.resolve(location)];
                    this.enabled[api] = true;
                    if (('disabled' in this && api in this.disabled)) {
                       delete this.disabled[api];
                    };
                    // Attempt to add shortcuts if available.
                    if (('shortcuts' in this.apis[api])) {
                       return this.addShortcuts(api);
                     } else {
                       return true;
                    };
           };
           // Already in the "enabled" folder, or nomove.
           if (nomove || location.is === true) {
              return loadAPI.call(this,location['path']+location['file'],location['file']);
            } else {
              // Move to the "enabled" filder, then load!
              if ((nf = this.__moveFile(location['file'],location['is']))) {
                 return loadAPI.call(this,newfile,location['file']);
              };
           };
           return false;
   };

   // Disable an API.
   VidInfo.prototype.disable = function (api,nomove) {
           var location = this.getAPILocation(api), nf;
           // No API!? What is this nonsense!
           if (!location) {
              return false;
           };
           // Reuse code! "unloadAPI.call(this,<location>,<file>)"
           function unloadAPI (location,api) {
                    var api = api.split('.')[0],
                        tmp = require(location);
                    this.disabled[api] = true;
                    if (('enabled' in this && api in this.enabled)) {
                       delete this.enabled[api];
                    };
                    var shortcuts = [api],
                        shortcuts = shortcuts.concat(tmp.shortcuts||[]);
                    for (var num in shortcuts) {
                        if ((shortcuts[num] in this)) {
                           delete this[shortcuts[num]];
                        };
                    };
                    // Remove the file from required cache. (Bad idea?)
                    delete require.cache[require.resolve(location)];
                    return true;
           };
           // Already in the "disabled" folder, or nomove.
           if (nomove || location.is === false) {
              return unloadAPI.call(this,location['path']+location['file'],location['file']);
            } else {
              // Move to the "enabled" filder, then load!
              if ((nf = this.__moveFile(location['file'],location['is']))) {
                 return unloadAPI.call(this,nf,location['file']);
              };
           };
           return false;
   }; 

   // Move files around. No need for a user to use this!
   VidInfo.prototype.__moveFile = function (file,mode) {
           var paths;
           // XXX: Is this hacky!?
           switch (mode) {
                  case false:
                     paths = [this.settings.enabled,this.settings.disabled];
                  case true: default:
                     paths = [this.settings.disabled,this.settings.enabled];
           };
           var newfile = paths[0]+file,
               oldfile = paths[1]+file;
           // Move the file from "enabled" to "disabled" -- ignored if "nomove" is passed!
           // XXX: Stop using fs.renameSync and fs.existsSync!?
           fs.renameSync(oldfile,newfile);
           // Check if the move was successful.
           return (fs.existsSync(newfile)?newfile:false);
   };
  
   // Import enabled APIs, make a list of disabled.
   VidInfo.prototype.importAPIs = function () {
           // List of enabled.
           var enabledFiles = fs.readdirSync(this.settings.enabled);
           // List of disabled.
           var disabledFiles = fs.readdirSync(this.settings.disabled);
           // Build the list of disabled APIs.
           this.disabled = {};
           for (var num in disabledFiles) {
               this.disable(disabledFiles[num]);
           };
           // Build the list of enabled APIs.
           this.enabled = {};
           this.apis = {};
           for (var enabled in enabledFiles) {
               this.enable(enabledFiles[enabled]);
           };
           // Return true or false, depending on loaded modules.
           return (!!Object.keys(this.apis).length);
   };

   // Generate an embed.ly config.
   // XXX: Moved from ./embedlyGenerator.js, needs improvement! 
   VidInfo.prototype.genEmbedly = function (cb,servurl) {
           // Do nothing at the end if there is no callback.
           cb = cb||function(){};
           servurl = servurl||'http://api.embed.ly/1/services';
           http_get(servurl,{type:'json'},function (list,err) {
               if (err) return; // Do nothing... for now.
               fs.readFile("./libs/template.js", function (err, data) {
                   if (err) return; // Do nothing... for now.
                   var temp = data.toString(),
                       shortcuts = [],
                       regex = [];
                   for (var num in list) {
                       var data = list[num];
                       if (data.type == "video") {
                          for (var reg in data['regex']) {
                              regex.push(new RegExp(data['regex'][reg].replace(/\*/gi,'(?:.*)').replace(/\//gi,'\\/'),'i'));
                          };
                          // Prevent adding the same shortcut multiple times.
                          var sc = data.name.toLowerCase().replace('www','');
                          if (shortcuts.indexOf(sc) === -1) {
                             shortcuts.push(sc);
                          };
                       };
                   };
                   var obj = {REGEX:regex.join(',\n               '),SHORTCUTS:'\''+shortcuts.join('\',\n               \'')+'\'',SERVICEURL:servurl},
                       location = __dirname+'/apis/embedly.js';
                       data = VidInfo.prototype.stringFormat(temp,obj);
                   fs.writeFile(location,data,function (err) {
                      if (!err) {
                         cb({message:'File saved to '+location,location:location,success:true});
                       } else {
                         cb({message:'Could not save to '+location,location:location,success:false});
                      };
                   });
               });
           });
   };

   // Add 'byID' shortcuts. See ./examples/byapi.js
   VidInfo.prototype.addShortcuts = function (api) {
           if (!(api in this.apis)) {
              return false;
           };
           var shortcuts = [api];
           if (('shortcuts' in this.apis[api])) {
              shortcuts = shortcuts.concat(this.apis[api].shortcuts||[]);
           };
           for (var num in shortcuts) {
               if (!(shortcuts[num] in this)) {
                  // Now with 100% less bind!
                  this[shortcuts[num]] = (function (api) {
                      return function (id,cb,opts) {
                         this.byID(id,api,cb,opts);
                      };
                  })(api);
               };
           };
           return true;
   };
   module.exports = VidInfo;
}).call(this);
