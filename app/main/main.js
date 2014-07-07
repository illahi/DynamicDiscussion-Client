// by Illahi Khan
// Home view

'use strict';

angular.module('clientApp')

	.controller('mainCtrl', function ($scope, socket, $compile, $routeParams) {

		$scope.threads = [];
		$scope.replies = {};
		$scope.staging_replies = [];
		$scope.username = "anonymous";

		var staging_reply_counter = 0;  // change to alphanumeric method
		var staging_thread_counter = 0; // change to alphanumeric method

		// Socket Listeners

		// When connected to the server, tell server the username.
		socket.on('connect', function () {
			// TODO: verify username serverside and client side
			//$scope.username = prompt("What's your name?");
			if ($scope.username === undefined || $scope.username == null || $scope.username == "") {
				$scope.username = "anonymous";
			}
			socket.emit('newUser', $scope.username);
		});

		// When client receives confirmation of successful connection, update view.
		socket.on('connectionConfirmed', function (users, threads) {
			// Populate thread view.
			for (var i = 0; i < threads.length; i++) {
				threads[i].status 	= "thread"; // serverside completion
				threads[i].expand 	= "false";	// clientside visual state
				threads[i].expand_v	= "Expand"; // clientside text button
				threads[i].loaded	= "false";	// clientside data state
			}
			for (var i = 0; i < threads.length; i++) {
				$scope.threads.push(threads[i]);
			}
		});

		// When someone else submits a new thread, update the view.
		socket.on('appendThread', function (thread) {
			thread.status 	= "thread";
			thread.expand 	= "false";	// clientside visual state
			thread.expand_v	= "Expand"; // clientside text button
			thread.loaded	= "false";	// clientside data state
			$scope.threads.unshift(thread);
			$scope.threads.pop();
		});

		// Needs fixing - When someone else submits a new reply, update the view.
		socket.on('appendReply', function (reply) {
			// Only append if that thread is already open
			var i = findIndex(reply.origin);
			if ($scope.threads[i].loaded == "true") {
				$scope.replies[reply._id] = reply;
				parent = "#" + reply.parent + "> .replies";
				var string1 =
				'<div id="' + reply._id + '" class="reply"><div class="thread-header"><div class="left-in-three"><p>' + $scope.replies[reply._id].username + '</p></div><div class="center-in-three"><p></p></div><div class="right-in-three"><p>' + $scope.replies[reply._id].date + '</p></div><div class="clear"></div></div><div class="thread-neck"><div class="left-in-three"><p>' + $scope.replies[reply._id].message + '</p></div><div class="center-in-three"><p>-expand-</p></div><div class="right-in-three reply-button" id="r' + reply._id + '"><p>reply</p></div><div class="clear"></div></div><div class="replies"></div></div>';
				$(parent).append(string1);
			}
		});

		// Request more information on a thread.
		$scope.requestThread = function requestThread (id) {
			var i = findIndex(id);
			// If the thread is already expanded, close it.
			if ($scope.threads[i].expand == "true") {
				$scope.threads[i].expand 	= "false";
				$scope.threads[i].expand_v	= "Expand";
			}
			else {
				if ($scope.threads[i].loaded == "true") {
					$scope.threads[i].expand 	= "true";
					$scope.threads[i].expand_v 	= "Collapse";
				}
				else {
					socket.emit('threadRequest', id);
				}
			}
		};

		// When the server responds to your request for more information about a thread.
		socket.on('requestedThread', function (collection) {
			var j = findIndex(collection[0]._id);
			// Set thread properties
			$scope.threads[j].loaded 	= "true";
			$scope.threads[j].expand 	= "true";
			$scope.threads[j].expand_v 	= "Collapse";
			// Append replies to origin - Frowned upon by Angular philosopy
			for (var i = 1; i < collection.length; i++) {
				// Set new properties for this reply
				collection[i].status = "";
				// Add reply to reply hash
				$scope.replies[collection[i]._id] = collection[i];
				// Append and update and link to view
				var parent = "#" + collection[i].parent + "> .replies"
				var id = collection[i]._id;
				var string1 =
				'<div id="' + id + '" class="reply"><div class="thread-header"><div class="left-in-three"><p>' + $scope.replies[id].username + '</p></div><div class="center-in-three"><p></p></div><div class="right-in-three"><p>' + $scope.replies[id].date + '</p></div><div class="clear"></div></div><div class="thread-neck"><div class="left-in-three"><p>' + $scope.replies[id].message + '</p></div><div class="center-in-three"><p>-expand-</p></div><div class="right-in-three reply-button" id="r' + id + '"><p>reply</p></div><div class="clear"></div></div><div class="replies"></div></div>';
				$(parent).append(string1);
			}
		});

		// Create a new thread.
		$scope.newThread = function newThread () {
			// Error checking
			if (typeof $scope.newTitle == 'undefined') { // Title must exist
				return;
			}
			// Create the staging thread.
			var date = new Date();
			var thread = {
				username	: $scope.username,
				title		: $scope.newTitle,
				message 	: $scope.newMessage,
				date 		: date,
				_id			: staging_thread_counter,
				status 		: "staging",
				expand 		: "true",	// clientside visual state
				expand_v	: "Collapse", // clientside text button
				loaded		: "true"	// clientside data state
			};
			$scope.threads.unshift(thread);
			$scope.threads.pop();
			// Send the new thread to the server.
			socket.emit('newThread', thread.title, thread.message, staging_thread_counter);
			staging_thread_counter++;
			// Clear the input boxes
			$scope.newTitle = '';
			$scope.newMessage = '';
		};

		// Receive notification of your newly created thread.
		socket.on('threadStatus', function (id, status, staging_id) {
			if (status == "success") {
				// Change from staging to actual
				var i = findIndex(staging_id);
				$scope.threads[i]._id = id;
				$scope.threads[i].status = "";
			}
			else if (status == "fail") {
				// Append failure notice and deletion option.
				var i = findIndex(staging_id);
				$scope.threads[i].status = "failed";
			}
			else {
				alert("Unknown 'threadStatus' failure.");
			}
		});

		// Create a new reply.
		$scope.reply = function reply (parent_id) {
			// Check if what the user is replying to is staging process or real
			var s = parent_id.toString();
			if (s.indexOf("staging") > -1) {
				alert("The reply has not been processed. Please wait or try again.");
				return;
			}
			// Stage the reply
			var new_reply = {};
			new_reply.message 	= prompt("Please enter a message.");
			// Message error checking
			if (new_reply.message == null || new_reply.message == '') {
				return;
			}
			// Continue
			new_reply.date 		= new Date();
			new_reply.parent 	= parent_id;
			var id = "staging-reply-" + staging_reply_counter;
			new_reply._id 		= id;
			new_reply.status 	= "staging";
			new_reply.username 	= $scope.username;
			// Add the reply to the hash
			$scope.replies[id] = new_reply;
			parent = "#" + parent_id + "> .replies";
			var string1 =
			'<div id="' + id + '" class="reply"><div class="thread-header"><div class="left-in-three"><p>' + $scope.replies[id].username + '</p></div><div class="center-in-three"><p></p></div><div class="right-in-three"><p>' + $scope.replies[id].date + '</p></div><div class="clear"></div></div><div class="thread-neck"><div class="left-in-three"><p>' + $scope.replies[id].message + '</p></div><div class="center-in-three"><p>-expand-</p></div><div class="right-in-three reply-button" id="r' + id + '"><p>reply</p></div><div class="clear"></div></div><div class="replies"></div></div>';
			$(parent).append(string1);
			socket.emit('newReply', new_reply.message, parent_id, staging_reply_counter);
			staging_reply_counter++;
		};

		// Click handler to process reply button clicks - not Angular way
		$("#threads").on("click", ".reply-button", function (event) {
			var id = event.currentTarget.id.slice(1);
			$scope.reply(id);
		});

		// Receive notification of your newly created reply.
		socket.on('replyStatus', function (id, status, staging_id) {
			if (status == "success") {
				// Change div box id
				var box_id = "staging-reply-" + staging_id;
				var element = document.getElementById(box_id);
				element.id = id;
				element.className = "reply";
				$scope.replies[box_id]._id = id;
				$scope.replies[box_id].status = "";
				// Update the reply-button id
				var d = document.getElementById("r" + box_id);
				d.id = "r" + id;
			}
			else if (status == "fail") {
				// Append failure notice and deletion option.
				var box_id = "staging-reply-" + staging_id;
				$scope.replies[box_id].status = "fail";
				// Non angular way to delete 'staging' class from reply and add 'fail' class
				var d = document.getElementById(id);
				d.className = "reply fail";
				d.id = id;
			}
			else {
				alert("Unknown 'replyStatus' failure.");
			}
		});

		// Find the position of a thread in the thread array.
		var findIndex = function findIndex (id) {
			for (var i = 0; i < $scope.threads.length; i++) {
				if ($scope.threads[i]._id == id) {
					return i;
				}
			}
			alert("Not Found!");
		};

	});
