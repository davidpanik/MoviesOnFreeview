// DESCRIPTION: Maintains the movie listing data - gets showings from Sky, then adds in metadata


// var print      = require('./back_end/print');

var rotten     = require('./rotten');
var tmdb       = require('./tmdb');
var sky        = require('./sky');
var store      = require('./helpers/store');
var cron       = require('./helpers/cron');
var log        = require('./helpers/log');
var moment     = require('moment');
var Q          = require('q');

var films = {};
var latestDay;


module.exports = function(runImmediately) {
	cron(
		'00 00,12 * * *', // Run everyday at 00:00:00 at 00:12:00
		updateData,
		runImmediately // Run the job immediately?
	)
};

function updateData() {
	log('reset'); // Reset the log file

	getCurrentData()
	.then(removeOldData)
	.then(getFilmsFromSky)
	.then(addMetaData)
	.then(cleanUpShowings)
	.then(done);
}

function getCurrentData() {
	var deferred = Q.defer();

	log('Get current data');

	store.get(function(data) {
		films = data;

		deferred.resolve();
	});

	return deferred.promise;
}

function removeOldData() {	
	var deferred = Q.defer();

	log('Remove old data');

	var today = moment().startOf('day');
	latestDay = today.clone();

	for (var film in films) {
		for (var x = 0; x < films[film].showings.length; x++) {
			var showingTime = moment(films[film].showings[x].date, 'DD/MM/YY').startOf('day');

			if (showingTime < today) { // Remove past showings
				log('Deleted a past showing for ' + film);
				films[film].showings.splice(x, 1);
			} else if (showingTime > latestDay) {
				latestDay = showingTime.clone();
			}
		}

		// Drop any films that no longer have showings
		if (films[film].showings.length === 0) {
			delete films[film];
		}
	}

	deferred.resolve();

	return deferred.promise;
}

function getFilmsFromSky() {
	var deferred = Q.defer();

	log('Get films from sky');

	sky(
		films,
		latestDay,
		function(skyFilms) {
			log('Got all films from Sky')
			films = skyFilms;

			deferred.resolve();
		}
	);

	return deferred.promise;
}

function addMetaData() {
	var deferred = Q.defer();

	log('Add metadata');

	var counter = 0, totalFilms = Object.keys(films).length;

	for (var id in films) {
		var success = function() {
			// log('Film done ' + counter + ' / ' + totalFilms);
			if (++counter === totalFilms) deferred.resolve();
		};

		// Only fetch metadata for films that don't already have it
		if (films[id].hasOwnProperty('metadata'))
			success();
		else
			getFilmTMDB(id).then(success);
	}

	return deferred.promise;
}

function getFilmRotten(id, callback) {
	var deferred = Q.defer();

	log('Getting Rotten metadata for ' + id);

	rotten(films[id].title, films[id].year, function(film) {
		// Merge our response with the main dataset
		for (var x in film) {
			films[id][x] = film[x];
		}

		deferred.resolve();
	});

	return deferred.promise;
}

function getFilmTMDB(id, callback) {
	var deferred = Q.defer();

	log('Getting TMDB metadata for ' + id);

	tmdb(films[id].title, + films[id].year, function(film) {
		// Merge our response with the main dataset
		for (var x in film) {
			films[id][x] = film[x];
		}

		deferred.resolve();
	});

	return deferred.promise;
}

function cleanUpShowings() {
	var deferred = Q.defer();

	log('Cleaning up showings');

	for (var film in films) {
		for (var x = 0; x < films[film].showings.length; x++) {
			var baseTime = films[film].showings[x].timestamp;
			var baseChannel = films[film].showings[x].channel;

			// Look for duplicated/split showings
			for (var z = 0; z < films[film].showings.length; z++) {
				if (
					z !== x &&
					films[film].showings[z].channel === baseChannel &&
					films[film].showings[z].timestamp >= baseTime
				) {
					log('Removed a duplicate/split showing for ' + film);
					films[film].showings.splice(z, 1);
				}
			}
		}

		// Drop any films that no longer have showings
		if (films[film].showings.length === 0) {
			delete films[film];
		}
	}

	deferred.resolve();

	return deferred.promise;
}

function done() {
	// print(films);
	store.set(films);
	log('All done!');
}