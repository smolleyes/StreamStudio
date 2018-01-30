//TODO: Create async tests.
var assert = require('assert'),
    VidInfo = require('./')();
function detect () {
         var errors = [], pass = 0;
         try {
            assert('error' in VidInfo.detect('no url'),"\"detect('no url')\" should return an error.");
            pass++;
         } catch (e) { errors.push(e.message); }
         try {
            var url = "http://www.youtube.com/watch?v=ZRAr354usf8";
            assert(VidInfo.detect(url).api === "youtubecom","\"detect('"+url+"').api\" should return \"youtubecom\".");
            pass++;
         } catch (e) { errors.push(e.message); }
         try {
            var url = "http://www.imdb.com/title/tt0387808/?ref_=nv_sr_1";
            assert(VidInfo.detect(url).api === "imdbcom","\"detect('"+url+"').api\" should return \"imdbcom\".");
            pass++;
         } catch (e) { errors.push(e.message); }
         try {
            var url = "http://vimeo.com/61969130";
            assert(VidInfo.detect(url).id === "61969130","\"detect('"+url+"').id\" should return \"61969130\".");
            pass++;
         } catch (e) { errors.push(e.message); }
         try {
            var url = "http://bambuser.com/v/3453034";
            assert(VidInfo.detect(url).needkey === true,"\"detect('"+url+"').needkey\" should return true.");
            pass++;
         } catch (e) { errors.push(e.message); }
         try {
            var url = "http://bambuser.com/v/3453034";
            assert(VidInfo.detect(url).needkey === true,"\"detect('"+url+"').needkey\" should return true.");
            pass++;
         } catch (e) { errors.push(e.message); }
         try {
            var url = "http://trakt.tv/show/under-the-dome";
            assert(VidInfo.detect(url).id.toString() === "show,under-the-dome","\"detect('"+url+"').id\" should return [\"show\",\"under-the-dome\"].");
            pass++;
         } catch (e) { errors.push(e.message); }
         console.log("[Detect] Number of errors found: "+errors.length+" - Tests passed: "+pass+" ("+((pass/(errors.length+pass)*100))+"%)");
         errors.forEach(function(err) { console.log('\033[1;31mERROR:\033[0m '+err); });
         return !(errors.length);
};
if ([detect()].indexOf(false) !== -1) {
   process.exit(1);
};
