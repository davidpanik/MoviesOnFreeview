(function(){
	var tmdbKey = '4ee6a6462853a06d1df79d91c177dfea';

	angular.module('myapp', [])
	.controller('MyController', function($scope, $http) {
		$scope.loaded    = false;

		$scope.films     = [];
		$scope.filtered  = [];
		$scope.channels  = {};

		$scope.baseUrl   = '';

		$scope.predicate = 'title';
		$scope.reverse   = false;

		$scope.minScore  = 6;
		$scope.maxScore  = 10;
		$scope.minYear   = (new Date().getFullYear()) - 10;
		$scope.maxYear   = (new Date().getFullYear());
		
		$scope.filters = {
			minScore: 6,
			maxScore: 10,

			minDuration: 0,
			maxDuration: 5,

			channels: {
				'bbc'  : true,
				'itv'  : true,
				'four' : true,
				'five' : true,
				'other': false
			},
			days: {
				'today'   : false,
				'tomorrow': false,
				'7days'   : true
			},
			decades: {
				'40_50': false,
				'60_70': false,
				'80_90': false,
				'00_10': true
			}
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
					alert('AJAX failed!');
				});
			})
			.error(function(data, status, headers, config) {
				alert('AJAX failed!');
			});


		})
		.error(function(data, status, headers, config) {
			alert('AJAX failed!');
		});

		$scope.greaterThan = function(prop, val){
			return function(item) { return (parseFloat(item[prop]) >  parseFloat(val)); }
		};
		$scope.greaterThanOrEqual = function(prop, val){
			return function(item) { return (parseFloat(item[prop]) >= parseFloat(val)); }
		};
		$scope.lessThan = function(prop, val){
			return function(item) { return (parseFloat(item[prop]) <  parseFloat(val)); }
		};
		$scope.lessThanOrEqual = function(prop, val){
			return function(item) { return (parseFloat(item[prop]) <= parseFloat(val)); }
		};

		$scope.toggleFilter = function(alpha, beta) {
			$scope.filters[alpha][beta] = !$scope.filters[alpha][beta];
		}
	})
	.filter('filmsFilter', function() {
		return function(films, filters) {
			var filteredFilms = [];

			for (var x in films) {
				var film = films[x];

				film.score    = parseInt(film.score);
				film.year     = parseInt(film.year);
				film.duration = parseFloat(film.duration);

				if (film.score < filters.minScore) continue;
				if (film.score > filters.maxScore) continue;

				if (film.duration < filters.minDuration) continue;
				if (film.duration > filters.maxDuration) continue;

				var yearMatch = false;
				if (filters.decades['40_50'] && film.year >= 1940 && film.year <= 1959) yearMatch = true;
				if (filters.decades['60_70'] && film.year >= 1940 && film.year <= 1979) yearMatch = true;
				if (filters.decades['80_90'] && film.year >= 1940 && film.year <= 1999) yearMatch = true;
				if (filters.decades['00_10'] && film.year >= 2000) yearMatch = true;
				if (!yearMatch) continue;

				// Filter by days
				// Filter by channel family

				filteredFilms.push(film);
			}

			return filteredFilms;
		};
	})
;
}())