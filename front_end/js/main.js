(function(){
	var tmdbKey = '4ee6a6462853a06d1df79d91c177dfea';

	angular.module('myapp', [])
	.controller('MyController', function($scope, $http) {
		$scope.loaded    = false;
		$scope.error     = false;
		$scope.errorMessage = 'Something has gone wrong';

		$scope.films     = [];
		$scope.filtered  = [];
		$scope.channels  = {};

		$scope.baseUrl   = '';

		$scope.predicate = 'title';
		$scope.reverse   = false;

		$scope.currentFilter = 'sort';

		$scope.filters = {
			minScore: 6,
			maxScore: 10,

			minDuration: 1,
			maxDuration: 10,

			channels: {
				'bbc'  : true,
				'itv'  : true,
				'four' : true,
				'five' : true,
				'other': false
			},
			day: '7days',
			decades: {
				'40': false,
				'50': false,
				'60': false,
				'70': false,
				'80': false,
				'90': false,
				'00': true,
				'10': true
			},
			region: 'england'
		};



		$http.get('http://api.themoviedb.org/3/configuration?api_key=' + tmdbKey)
		.success(function(data, status, headers, config) {
			$scope.baseUrl = data.images.base_url;

			$http.get('/channels.json')
			.success(function(data, status, headers, config) {
				$scope.channels = data;

				$http.get('/films.json')
				.success(function(data, status, headers, config) {
					// console.log(data);
					for (var x in data) {
						data[x].id = x;
						$scope.films.push(data[x]);
					}

					$scope.loaded = true;
				})
				.error(function(data, status, headers, config) {
					$scope.throwError('Failed loading in films');
				});
			})
			.error(function(data, status, headers, config) {
				$scope.throwError('Failed loading in channels');
			});
		})
		.error(function(data, status, headers, config) {
			$scope.throwError('Failed communicating with TMDB');
		});

		$scope.throwError = function(message) {
			$scope.error = true;
			$scope.errorMessage = message;
		};

		$scope.toggleFilter = function(alpha, beta) {
			$scope.filters[alpha][beta] = !$scope.filters[alpha][beta];
		};

		$scope.niceDuration = function(duration) {
			var hours = Math.floor(duration);
			var minutes = Math.round((duration - hours) * 60) + '';

			if (minutes.length < 2) minutes += '0';

			return hours + ':' + minutes;
		}
	})
	.filter('filmsFilter', function() {
		return function(films, filters, channels) {
			var filteredFilms = [];
			var today    = moment().format('DD/MM/YY');
			var tomorrow = moment().add(1, 'day').format('DD/MM/YY');

			for (var x in films) {
				var film = films[x];

				film.score    = parseInt(film.score);
				film.year     = parseInt(film.year);
				film.duration = parseFloat(film.duration);

				// Filter against score
				if (film.score < filters.minScore) continue;
				if (film.score > filters.maxScore) continue;

				// Filter against duration
				if (film.duration < filters.minDuration) continue;
				if (film.duration > filters.maxDuration) continue;

				// Filter against channels
				var channelMatch = false;
				for (var z in film.showings) {
					var channel = parseInt(film.showings[z].channel);

					if (filters.channels[channels[channel].family]) {
						channelMatch = true;
					}
				}
				if (!channelMatch) continue;

				// Filter against days
				if (filters.day !== '7days') {
					var dayMatch = false;
					for (var z in film.showings) {
						var date = film.showings[z].date;

						if (filters.day === 'today' && date === today) {
							dayMatch = true;
						} else if (filters.day === 'tomorrow' && date === tomorrow) {
							dayMatch = true;
						}
					}
					if (!dayMatch) continue;
				}

				// Filter against years
				var yearMatch = false;
				if (filters.decades['40'] && film.year >= 1940 && film.year <= 1949) yearMatch = true;
				if (filters.decades['50'] && film.year >= 1950 && film.year <= 1959) yearMatch = true;
				if (filters.decades['60'] && film.year >= 1960 && film.year <= 1969) yearMatch = true;
				if (filters.decades['70'] && film.year >= 1970 && film.year <= 1979) yearMatch = true;
				if (filters.decades['80'] && film.year >= 1980 && film.year <= 1989) yearMatch = true;
				if (filters.decades['90'] && film.year >= 1990 && film.year <= 1999) yearMatch = true;
				if (filters.decades['00'] && film.year >= 2000 && film.year <= 2009) yearMatch = true;
				if (filters.decades['10'] && film.year >= 2010) yearMatch = true;
				if (!yearMatch) continue;

				filteredFilms.push(film);
			}

			return filteredFilms;
		};
	})
;
}())