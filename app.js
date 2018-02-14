/* Copyright (C) Matthew Fosse */


// var util = require('util');
// var http = require('http');
// var express = require('express');
// var session = require('express-session');
// var app = express();

// var server = require('http').Server(app);
// var bodyParser = require('body-parser');
// var io = require('socket.io')(server);
// //var mongoose = require('mongoose');
// var shortid = require('shortid');


// var router = express.Router();
// router.all('*', function(req, res, next) {
// 	res.header("Access-Control-Allow-Origin", "*");
// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
// 	res.header("Access-Control-Allow-Methods", "PUT, GET,POST");
// 	next();
// });

// app.use(bodyParser.json()); // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
// 	extended: true
// }));


// app.set('port', 8100);
// //app.set('view engine', 'html');
// app.use(express.static(__dirname + '/public'));
// //require('./server/routes')(app);

// server.listen(8100);
// console.log("Multiplayer app listening on port 8100");

var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8100;


var twitch = require("./server/twitch.js");

server.listen(port, function() {
    console.log("Server listening at port %d", port);
});

var sys = new twitch.system();
var gridWidth = 20;
var gridHeight = 10;
var letters = "ABCDEFGHIJKLMNO";

for(var i = 0; i < gridHeight; i++) {
	for(var j = 0; j < gridWidth; j++) {
		//x = xoffset + (j*horizontalSpacing)
		//y = yoffset + (i*verticalSpacing)
		var num = j;
		var letter = letters[i];
		var move = letter + num;
		//moveList[move] = (x, y);
		sys.validCommands.push(move);
	}
}


var numberOfConnections = 0;
var clients = [];

function Client(socket) {
	this.socket = socket;
	this.ip = socket.request.connection.remoteAddress;
	this.hasVoted = false;
}




io.on('connection', function(socket) {
	
	var client;
	
	var clientIP = socket.request.connection.remoteAddress;
	
	
	
	
	// makes sure people dont vote multiple times // without more effort
	if(typeof(clients[clientIP]) == "undefined") {
		client = new Client(socket);
		clients[clientIP] = client;
	} else {
		client = clients[""+clientIP];
	}
	
	
	numberOfConnections += 1;
	
	//var client = new Client(socket);
	//clients.push(client);
	
    console.log(numberOfConnections + " users connected");
	
    socket.on("disconnect", function() {
		numberOfConnections -= 1;
		console.log(numberOfConnections + " users connected");
    });
	
	updateCharts();
	updateImage();
	
	//setInterval(updateImage, 1000);


//     socket.on("chat message", function(msg) {
//         console.log("message: " + msg);
//     });
	
	
  	socket.on("chat message", function(msg){
		
		if(typeof(msg) != "string") {
			console.log("not a string!");
			return;
		}
		
		sys.checkForVote(msg, clients[socket.request.connection.remoteAddress]);
    	io.emit("chat message", msg);
		
		// fix to only update when there is a vote
		updateCharts();
  	});
	
	socket.on("image", function(data) {
		var obj = {};
		obj.buffer = data;
		sys.currentImage = obj;
		//updateImage();
		setTimeout(updateImage, 10);
	});
	
	
	socket.on("getMoves", function(data) {
		
		sys.recountVotes();
		var topVote;
		if(sys.voteCounts.length === 0) {
// 			var tally = {};
// 			tally.count = 0;
// 			tally.vote = "";
// 			tally.percent = 0;
// 			tally.moves = [];//uniqueVote.split(" ");
			return;
		} else {
			topVote = sys.voteCounts[sys.voteCounts.length-1];
		}
		
		for(var key in clients) {
			var client = clients[key];
			client.hasVoted = false;
		}
		
		// reply
		io.to(socket.id).emit("executeMoves", topVote)
		
		sys.reset();
		
		updateCharts();
		
	});


});

function updateImage() {
	io.emit("updateImage", sys.currentImage);
}



function updateCharts() {
	var chartData = {};
	chartData.voteCounts = sys.voteCounts;
	chartData.numberOfVotes = sys.numberOfVotes;
	
	io.emit("updateChart", chartData);
}

