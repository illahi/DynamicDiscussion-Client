// By Illahi Khan

'use strict';

angular.module('clientApp', ['ngCookies', 'ngSanitize', 'ngRoute'])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'main/main.html',
				controller: 'mainCtrl'
			})
			.when('/thread/:threadId', {
				templateUrl: 'thread/thread.html',
				controller: 'threadCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	});
