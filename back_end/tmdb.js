// DESCRIPTION: Retrieves a film's metadata from TMDB

var fetch     = require('./helpers/fetch');
var log       = require('./helpers/log');

var key       = '4ee6a6462853a06d1df79d91c177dfea';
var searchUrl = 'http://api.themoviedb.org/3/search/movie';


module.exports = function(title, year, callback) {
	if (year < 1900) year = ''; // Fix for bad year information

	function search(searchTitle, searchYear, searchCallback) {
		var searchCriteria = {
			api_key:     key,
			query:       searchTitle,
			page:        1
		};

		if (searchYear !== '') searchCriteria.year = searchYear;

		fetch(
			searchUrl,
			searchCriteria,
			function (data) {
				if (data.error) {
					log('Error2 - no matches for: ' + title);
					searchCallback({ metadata: false });
				} else {
					var film = {};

					if (data.results.length === 0 && searchYear !== '') {
						log('No results for ' + searchTitle + ' at ' + searchYear);
						search(searchTitle, '', searchCallback);
						return false;
					}

					try {
						var result = data.results[0];

						film.title = result.title;
						var year = '';
						var position = result.release_date.search(/\d{4}/);
						if (position > -1) year = result.release_date.substring(position, position+4);
						film.tmdb_id = result.id;
						film.year = year;
						// Get the film's score but count for films with very low ratings
						if (result.vote_count < 20)      film.score = 0;
						else if (result.vote_count < 50) film.score = 1;
						else                             film.score = result.vote_average;
						film.poster = result.poster_path;
						film.metadata = true;
					} catch(e) {
						log('Error1 - no matches for: ' + title);
						film.metadata = false;
					}

					searchCallback(film);
				}
			}
		);
	}

	search(title, year, callback);
};