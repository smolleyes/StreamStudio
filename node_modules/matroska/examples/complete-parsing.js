var matroska = require('../index.js');

var url = process.argv[2];

if (!url) {
	url = "http://download.wavetlan.com/SVV/Media/HTTP/mkv/H264_mp3(mkvmerge).mkv";
}

console.log("Complete parsing : " + url);

var decoder = new matroska.Decoder();

var t1 = Date.now();

decoder.parse(url, function(error, document) {
	var t2 = Date.now();

	console.log("Delta=" + (t2 - t1) + "ms");

	if (error) {
		console.error(error);
		return;
	}

	console.log(document.print());
});
