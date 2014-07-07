/* thread.js */
/* by illahi khan */


'use strict';

angular.module('clientApp')

	.controller('threadCtrl', function ($scope, socket, $compile, $routeParams) {

		/* Find requested thread... */
		$scope.requestedThread = $routeParams.threadId;

		/* ...in client memory... */


		/* ...from server... */

	});
