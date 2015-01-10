// DESCRIPTION: Fetches movie listings from Sky

var fetch    = require('./helpers/fetch');
var log      = require('./helpers/log');
var moment   = require('moment');

var channels = require('./config/channels');
var genres   = require('./config/genres');
var urls     = require('./config/urls');

var channelIds = [];
var films = {};

var days = 7;

module.exports = function(existingFilms, latestDay, callback) {
	for (var x in channels) {
		channelIds.push(x);
	}

	getDays(channelIds, 7);

	function getDays(channels, days) {
		var date = moment();
		var counter = 0;

		days = days ? days : 7;

		for (var x = 0; x < days; x++) {
			if (x !== 0) date.add(1, 'day');
			getDay(channels, date.format('YYYYMMDD') + '0000', function() {
				log('Finished getting day ' + counter + ' / ' + days);
				if (++counter === days) callback(films);
			});
		}
	}

	function getDay(channels, day, callback) {
		var counter = 0;

		log('Getting day ' + day);

		for (var x = 0, length = channels.length; x < length; x++) {
			log('Getting channel ' + channels[x]);

			fetch(
				urls.listings,
				{
					detail:    2,
					dur:       1440, // Max 2880 (two days)
					time:      day, // Max +7 days
					channels:  channels[x] // Max 20 channels
				},
				function (data) {
					parseResponse(data);
					log('Finished getting channel ' + counter + ' / ' + channels.length);
					if (++counter === channels.length) callback();
				}
			);
		}
	}

	function parseResponse(data) {
		if (!data.channels.length) data.channels = [data.channels]; // Handle if there is only one channel instead of an array of channels

		// Loop through each channel
		for (var x = 0, length = data.channels.length; x < length; x++) {
			var channel = data.channels[x];

			if (channel && channel.program && channel.program.length) { // Check this channel actually gave results
				// Then each program on that channel
				for (var y = 0, length = channel.program.length; y < length; y++) {
					var program = channel.program[y];

					// Is this program a film?
					if (program.genre == 6) {						
						// Attempt to extract a year from the description
						var year = '';
						var position = program.shortDesc.search(/\d{4}/);
						if (position > -1) year = program.shortDesc.substring(position, position+4);
						if (year === undefined) year = '';

						var id = generateId(program.title) + year;

						function round(num) {
							return (Math.round(num * 100) / 100);
						}

						// Register this film if we don't have it yet
						if (!films[id]) {
							films[id] = {
								title:       program.title,
								description: program.shortDesc,
								// duration:    program.dur / 60,
								duration:    round(program.dur / 60 / 60),
								showings:    [],
								year:        year,
								score:       0
							}
						}

						// Register this showing time
						films[id].showings.push({
							channel:   program.channelid,
							date:      program.date,
							timestamp: program.start,
							start:     moment(parseInt(program.start)).format('HH:mm')
						});
					}
				}
			}
		}
	}

	function generateId(string) {
		string = string.toLowerCase();
		// string = string.replace('the', '');
		string = string.replace(/\W/g, '');

		return string;
	}
};