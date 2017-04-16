var subs = require("./index.js");

var query = {
    imdbid: "tt1844624",
    season: "2",
    episode: "3",
    filename: "American.Horror.Story.S02E03.720p.HDTV.X264-DIMENSION"
};

subs.searchEpisode(query, 'OSTestUserAgent')
    .then(function(result) {
        console.log(result);
    }).fail(function(error) {
        console.log(error);
    });