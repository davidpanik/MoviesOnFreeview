// DESCRIPTION: Retrieves a film's metadata from Rotten Tomatoes

var fetch     = require('./helpers/fetch');
var log       = require('./helpers/log');

var key       = 'f4te3bvrxqjc6ukxbkj5q32h';
var searchUrl = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json';


module.exports = function(title, year, callback) {
	if (year < 1900) year = ''; // Fix for bad year information
	
	fetch(
		searchUrl,
		{
			apikey:      key,
			q:           title + ' ' + year,
			page_limit:  1
		},
		function (data) {
			var film = {};

			try {
				var result = data.movies[0];

				film.title = result.title;
				film.year = result.year;
				film.rating = result.mpaa_rating;
				film.score = result.ratings.audience_score;
				film.poster = result.posters.profile.replace('_tmb', '_det');
				if (result.abridged_cast.length > 3) result.abridged_cast.slice(0, 2);
				var cast = '';
				for (var x = 0, length = result.abridged_cast.length; x < length; x++) {
					cast += result.abridged_cast[x].name;
					if (x < length - 1) cast += ', ';
				}
				film.cast = cast;
				// Genres
				film.metadata = true;
			} catch(e) {
				log('Error - no matches for: ' + title);
				film.metadata = false;
			}

			callback(data);
		}
	);
};