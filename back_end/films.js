// DESCRIPTION: Maintains the movie listing data - gets showings from Sky, then adds in metadata


// var print      = require('./back_end/print');

var rotten     = require('./rotten');
var tmdb       = require('./tmdb');
var sky        = require('./sky');
var store      = require('./helpers/store');
var cron       = require('./helpers/cron');
var log        = require('./helpers/log');
var moment     = require('moment');

var films = {};
var latestDay;


module.exports = function() {
	cron(
		'00 00,12 * * *', // Run everyday at 00:00:00 at 00:12:00
		updateData,
		false // Run the job immediately?
	)
};

function updateData() {
	log('reset'); // Reset the log file

	getCurrentData(function() {
		removeOldData(function() {
			getFilmsFromSky(function() {
				addMetaData(function() {
					done();
				});
			});
		});
	});
}

function getCurrentData(callback) {
	store.get(function(data) {
		films = data;

		callback();
	});
}

function removeOldData(callback) {	
	var today = moment(moment().format('YYYYMMDD') + '0000', 'YYYYMMDDHHMM');
	latestDay = today.clone();

	for (var film in films) {
		for (var x = 0; x < films[film].showings.length; x++) {
			var showingTime = moment(films[film].showings[x].date, 'DD/MM/YY');

			if (showingTime < today) { // Remove past showings
				films.splice(x, 1);
			} else if (showingTime > latestDay) {
				latestDay = showingTime.clone();
			}
		}

		// Drop any films that no longer have showings
		if (films[film].showings.length === 0) {
			delete films[film];
		}
	}

	callback();
}

function getFilmsFromSky(callback) {
	sky(
		films,
		latestDay,
		function(skyFilms) {
			log('Got all films from Sky')
			films = skyFilms;

			callback();
		}
	);
}

function addMetaData(callback) {
	log('Adding metadata');

	var counter = 0, totalFilms = Object.keys(films).length;

	for (var id in films) {
		getFilmTMDB(id, function() {
			log('Film done ' + counter + ' / ' + totalFilms);
			if (++counter === totalFilms) callback();
		})
	}
}

function getFilmRotten(id, callback) {
	log('Getting Rotten metadata for ' + id);

	rotten(films[id].title, films[id].year, function(film) {
		// Merge our response with the main dataset
		for (var x in film) {
			films[id][x] = film[x];
		}

		callback();
	});
}

function getFilmTMDB(id, callback) {
	log('Getting TMDB metadata for ' + id);

	tmdb(films[id].title, + films[id].year, function(film) {
		// Merge our response with the main dataset
		for (var x in film) {
			films[id][x] = film[x];
		}

		callback();
	});
}

function done() {
	// print(films);
	store.set(films);
	log('All done!');
}