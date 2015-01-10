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
			score: 6,

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
				'80_90': true,
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
		}
		$scope.greaterThanOrEqual = function(prop, val){
			return function(item) { return (parseFloat(item[prop]) >= parseFloat(val)); }
		}
		$scope.lessThan = function(prop, val){
			return function(item) { return (parseFloat(item[prop]) <  parseFloat(val)); }
		}
		$scope.lessThanOrEqual = function(prop, val){
			return function(item) { return (parseFloat(item[prop]) <= parseFloat(val)); }
		}
	});
}())