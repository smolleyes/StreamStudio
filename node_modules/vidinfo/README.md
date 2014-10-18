VidInfo (v0.2.5)
======

Install: npm install vidinfo

This project is [Unlicensed](http://unlicense.org/ "Title").
In other words, I don't care what you do with it.
However, if you make something interesting, I would like to check it out.

Current APIs supported:
------
   Supported Formats: JSON, CSV, INI -- XML via [YQL](http://developer.yahoo.com/yql/console/ "Title").

   [archive.org](http://archive.org/ "Title")
   [bambuser.com (1)](http://bambuser.com/api/ "Title")
   [blip.tv](http://blip.tv/ "Title")
   [dailymotion.com](http://www.dailymotion.com/ "Title")
   [facebook.com (1,3)](http://louist.github.io/VidInfo/accessToken.html "Title")
   [flickr.com (1)](http://www.flickr.com/services/api/ "Title")
   [giantbomb.com (1,2)](http://www.giantbomb.com/api/ "Title")
   [imdb.com (2,3)](http://imdb.com/ "Title")
   [justin.tv (2)](http://www.justin.tv/ "Title")
   [mag.ma](http://mag.ma/ "Title")
   [on.aol.com](http://on.aol.com/ "Title")
   [themoviedb.org (1)](http://www.themoviedb.org/documentation/api "Title")
   [twitch.tv (2)](http://www.twitch.tv/ "Title")
   [ustream.tv (2)](http://www.ustream.tv/ "Title")
   [videolog.tv](http://videolog.tv/ "Title")
   [vimeo.com](http://vimeo.com/ "Title")
   [vzaar.com](http://vzaar.com/ "Title")
   [webcams.travel (1)](http://www.webcams.travel/developers/ "Title")
   [wistia.com (4)](http://wistia.com/doc/developers "Title")
   [youtube.com](http://www.youtube.com/ "Title")

    1) API key required. See "bambuser" example at the bottom.
    2) This method is BETA.
    3) More information available. See "More Information" below.
    4) Requires basic auth (username:password). See "wista" example at the bottom.

oEmbed APIs:
------
   For more information on oEmbed visit [oEmbed.com](http://oembed.com/ "Title").
   
   [clickthrough.com](http://clickthrough.com/ "Title")
   [collegehumor.com](http://collegehumor.com/ "Title")
   [comedycentral.com (2)](http://comedycentral.com/ "Title")
   [coub.com](http://coub.com/ "Title")
   [crackle.com (2)](http://crackle.com/ "Title")
   [dotsub.com](http://dotsub.com/ "Title")
   [funnyordie.com (2)](http://funnyordie.com/ "Title")
   [hulu.com](http://hulu.com/ "Title")
   [jest.com](http://jest.com/ "Title")
   [liveleak.com (2)](http://liveleak.com/ "Title")
   [nfb.ca](http://nfb.ca/ "Title")
   [qik.com](http://qik.com/ "Title")
   [revision3.com](http://revision3.com/ "Title")
   [ted.com (1)](http://ted.com/ "Title")
   [trailers.apple.com (1)](http://trailers.apples.com/ "Title")
   [viddler.com](http://viddler.com/ "Title")
   [yahoo.com (2)](http://screen.yahoo.com/ "Title")

    1) Uses a 3rd party oEmbed API. (https://noembed.com/)
    2) Uses a 3rd party oEmbed API. (https://embed.ly/) 
       Requires API key, otherwise you have limited requests.

   I will add more (most common) oEmbed APIs from [embed.ly](http://embed.ly/ "Title") eventually.
      
[Embed.ly](http://embed.ly/ "Title") API:
------
    WARNING: Do NOT enable embedly (./apis/embedly.js) with any other APIs!
   
    Embedly is a HUGE oEmbed provider and as such supports some of the APIs already in use.
    Because of this there are conflicts. To generate the embedly.js file, see functions below.
    After you run the embedly generator, a new file will be created at: ./apis/embedly.js
    Embedly is too massive to display what websites it supports, so you'll have to read embedly.js yourself
    or check the embed.ly providers list here: http://embed.ly/embed/features/providers

    Services URL: http://api.embed.ly/1/services
    API key required, signup here: https://app.embed.ly/signup/

Experimental APIs: 
------
   [livevideo.com (1)](http://www.livevideo.com/api/ "Title")
   [metacafe.com](http://metacafe.com/ "Title")
   [movieclips.com](http://movieclips.com/ "Title")
   [muzu.tv (1)](http://www.muzu.tv/api/ "Title")
   [traileraddict.com](http://www.traileraddict.com/ "Title")
  
    1) API key required. See "bambuser" example at the bottom.

NOTE: These use [YQL](http://developer.yahoo.com/yql/console/ "Title") to convert XML to JSON.
      Might switch from YQL to xml2json. "http_get" already supports this.

More Information:
------
    (imdb.com)
        IMDB uses a 3rd party API. (http://imdbapi.org/)

    (facebook.com)
        Facebook requires an access token to be generated. The generator makes an access token
        that lasts for 60 days. You can revisit the generator to find out when your token will expire.
        I will look for a better method later on, but for now this is how it has to be.
        Generator: http://louist.github.io/VidInfo/accessToken.html

TODO:
------
    1) Find more API's to use. -- Please suggest some.
       I have a list I'm working from, but it takes time to get them working.
    2) Create tests.
    3) Improve basic auth and API key support.
    4) Clean up code and find a use for "detectAll".
    5) Make a better facebook access token generator.
       (http://louist.github.io/VidInfo/accessToken.html)

    *)  Support events? I'm not sure about this yet.
    **) Better support for XML? (Switch from YQL to xml2json?)

Options:
------
    apikey - The API key, when needed.
    basicauth - Your basic auth `username:password`, when needed.
    formatter - The formatter to use on your JSON data. See ./examples/youtubecom.js

    (detectAll options)
    nocheck - Return information on a video more than once if found multiple times. See ./examples/detectAll.js
    keys -  An object with API keys.
    Example: {keys:{bambuser:'EXAMPLE-KEY',themoviedb:'ANOTHER-KEY'},nocheck:true}

Settings:
------
    format - Use the formatter, true or false.
    enabled - Path to enabled API configs. -- Default: ./apis/enabled/
    disabled - Path to disabled API configs. -- Default: ./apis/disabled/
   
Settings usage:
------
    var VidInfo = require('vidinfo')({format:true});

Shortcuts:
------
    Archive.org:                arch, archive, archiveorg
    Bambuser.com:               bam, bambuser, bambusercom
    Blip.tv:                    blip, bliptv
    Clickthrough.com:           cthrough, clickthrough, clickthroughcom
    Collegehumor.com*:          chumor, college, collegehumor, collegehumorcom
    Comedycentral.com:          comcen, comedycentral, comedycentralcom
    Coub.com:                   coub, coubcom
    Crackle.com:                crackle, cracklecom
    Dailymotion.com:            dmo, dailymo, dailymotion, dailymotioncom
    Dotsub.com:                 dotsub, dotsubcom
    Facebook.com:               fbook, fbvideo, facebook, facebookcom
    Flickr.com:                 flickr, flickrcom
    Funnyordie.com:             ford, funnyor, funnyordie, funnyordiecom
    GiantBomb.com:              gbomb, giantbomb, giantbombcom
    Hulu.com:                   hulu, hulucom
    IMDB.com:                   imdb, imdbapiorg
    Jest.com:                   jest, jestcom
    Justin.tv (stream):         jtvs, jstream, justintvstream
    Justin.tv (video clip):     jtvc, jclip, justintvclip
    Liveleak.com:               lleak, liveleak, liveleakcom
    Livevideo.com*:             lvid, lvideo, livevideo, livevideocom
    Mag.ma:                     mag, magma
    Metacafe.com*:              meta, mcafe, metacafe, metacafecom
    Movieclips.com*:            mclips, movieclips, movieclipscom
    Muzu.tv*:                   muzu, muzutv
    Nfb.ca:                     nfb, nfbca
    on.aol.com:                 onaol, onaolcom
    Qik.com:                    qik, qikcom
    Revision3.com:              revis, revision3, revision3com
    Ted.com:                    ted, tedcom
    Themoviedb.org:             tdb, tmdb, themoviedborg
    Traileraddict.com*:         tadd, taddict, traileraddict, traileraddictcom
    Trailers.apple.com:         tapple, trailersapple, trailersapplecom
    Twitch.tv (stream):         ttvs, tstream, twitchtvstream
    Twitch.tv (video clip):     ttvc, tclip, twitchtvclip
    Ustream.tv (stream):        utvs, ustream, ustreamtvstream
    Ustream.tv (video clip):    utvc, uclip, ustreamtvclip
    Viddler.com:                vidd, viddler, viddlercom
    Videolog.tv:                vlog, videolog, videologtv
    Vimeo.com:                  vimeo, vimeocom
    Vzaar.com:                  vzaar, vzaarcom
    Webcams.travel:             wct, webtra, wtravel, webcamstravel
    Wistia.com:                 wistia, wistacom
    Yahoo.com:                  yahoo, yvideo, yahoocom
    YouTube.com:                yt, youtube, youtubecom

    *  See "Experimental APIs" above.

    Examples:
        VidInfo.youtube('ZRAr354usf8',console.log);
        VidInfo.yt('ZRAr354usf8',console.log); // YouTube
        VidInfo.dmo('xycczk',console.log); // Dailymotion

Functions:
------
    VidInfo.detect(url[,callback[,options]]) - Parse a URL and create an object used for 'byURL'.
         See ./examples/detect.js

    VidInfo.detectAll(string[,callback[,options]]) - Parse a string and return an object with all the IDs.
         Options: keys - The list of keys for APIs that might need them.
                  nocheck - Return information on a video more than once if found multiple times.
                  Example: {keys:{bambuser:'EXAMPLE-KEY',themoviedb:'ANOTHER-KEY'},nocheck:true}
         See ./examples/detectAll.js

    VidInfo.byID(id,api,callback[,options]) - Connects to the (should be) correct API for video information.
         See ./examples/byid.js - Changed from "byid" for standardization.

    VidInfo.byURL(url,callback[,options]) - Connects to the (should be) correct API for video information.
         See ./examples/byurl.js - Changed from "byurl" for standardization.

    VidInfo.<apiname>(id,callback[,options]) -- Shortcut for 'byID'.
         See ./examples/byapi.js
 
    VidInfo.getAPILocation(apiname) - Get the location of an API config file. The "apiname" is the full name, such as "youtubecom."
         Returns: {is:<true/false>,path:<location>,file:<filename>} -- "is" is in enabled (true) or disabled (false) folder.

    VidInfo.enable(apiname[,nomove]) - Enable an API. The "apiname" is the full name, such as "youtubecom."
         NOTE: Moves <apiname> from ./apis/disabled/ to ./apis/enabled/ unless "nomove" is true.

    VidInfo.disable(apiname[,nomove]) - Disable an API. The "apiname" is the full name, such as "youtubecom."
         NOTE: Moves <apiname> from ./apis/enabled/ to ./apis/disabled/ unless "nomove" is true.   

    VidInfo.genEmbedly([callback[,services url]]) - Generate/update the embedly.js config from the services url.
          Services url: http://api.embed.ly/1/services
          Callback arguments: {message:<string>,location:<string>,success:<boolean>}

Example Usage - Look in "examples" folder for more examples.
-------
```javascript
var VidInfo = require('vidinfo')({format:true});

// YouTube -- Only return the title and published date, using 'formatter'.
VidInfo.byURL('http://www.youtube.com/watch?v=ZRAr354usf8',console.log,{formatter: function (data,cb) {
       var ret = {};
       if ('$t' in data.entry.title) {
          ret.title = data.entry.title.$t;
          if ('$t' in data.entry.published) {
             ret.published = new Date(Date.parse(data.entry.published.$t));
          }
       };
       cb(ret);
}});
  
// YouTube by video ID.
VidInfo.byID('ZRAr354usf8','youtube',console.log,{formatter: function (data,cb) {
       var ret = {};
       if ('$t' in data.entry.title) {
          ret.title = data.entry.title.$t;
          if ('$t' in data.entry.published) {
             ret.published = new Date(Date.parse(data.entry.published.$t));
          }
       };
       cb(ret);
}});
   
// 'byID' shortcut.
VidInfo.vimeo('61969130',console.log);
VidInfo.youtube('ZRAr354usf8',console.log);
VidInfo.yt('ZRAr354usf8',console.log); // YouTube

// Bambuser (API Key required)
VidInfo.byURL('http://bambuser.com/v/3453034',function (obj) {
       console.log(obj);
},{apikey:'APIKEY'});

// Wista (Basic auth required)
VidInfo.byURL('http://ltdev.wistia.com/medias/piywx9v8rr',function (obj,e) {
   if (!e) {
      console.log('(byapi) wista: '+JSON.stringify(obj)+'\n\n');
    } else {
      console.log('(byapi - ERROR) wista: '+JSON.stringify({error:true,message:obj})+'\n\n');
   }
},{basicauth:'USERNAME:PASSWORD'});

// Facebook (requires access token - http://louist.github.io/VidInfo/accessToken.html)
VidInfo.byURL('https://www.facebook.com/photo.php?v=10101580633888836&set=vb.225034700870481&type=3&theater',function (obj) {
   console.log(JSON.stringify(obj)+'\n\n');
},{apikey:'ACCESS TOKEN'});

// 'detect' example. -- Prints video ID and API link in an object.
console.log(VidInfo.detect('http://www.youtube.com/watch?v=ZRAr354usf8'));

// 'detectAll' example. Prints an object with multiple 'detect' objects.
console.log(VidInfo.detectAll('http://www.youtube.com/watch?v=ZRAr354usf8 http://bambuser.com/v/3453034 http://ltdev.wistia.com/medias/piywx9v8rr http://flic.kr/p/e9964e'));
```
