var matroska = require('../index.js');

var url = process.argv[2];

if (!url) {
	url = "http://download.wavetlan.com/SVV/Media/HTTP/mkv/H264_PCM(mkvmerge).mkv";
}

console.log("Fast and incomplete parsing : " + url);

var t1 = Date.now();

matroska.Decoder.parseInfoTagsAndAttachments(url, function(error, document) {
	var t2 = Date.now();

	console.log("Delta=" + (t2 - t1) + "ms");

	if (error) {
		console.error(error);
		return;
	}

	console.log(document.print());
});
