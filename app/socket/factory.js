/* Angular - Socket.io integration for use with DynamicDiscussion server. */
/* By Illahi Khan */

angular.module('clientApp').factory('socket', function ($rootScope) {

	var socket = io.connect('http://localhost:3000');

	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emitc: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		},
		emit: function () {
			var args = Array.prototype.slice.call(arguments, 0);
			socket.emit.apply(socket, args);
		}
	};

});
