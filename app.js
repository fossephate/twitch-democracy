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

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8100;


var twitch = require("./server/twitch.js");

server.listen(port, function() {
    console.log('Server listening at port %d', port);
});



var sys = new twitch.system();
sys.validCommands.push("C1");
sys.validCommands.push("C2");
sys.validCommands.push("C3");
sys.validCommands.push("C4");
sys.validCommands.push("C5");
sys.validCommands.push("C6");
sys.validCommands.push("C7");
sys.validCommands.push("C8");
sys.validCommands.push("C9");
sys.validCommands.push("C10");
sys.validCommands.push("C11");
sys.validCommands.push("C12");
sys.validCommands.push("C13");
sys.validCommands.push("C14");
sys.validCommands.push("C15");
sys.validCommands.push("C16");


sys.validCommands.push("B1");
sys.validCommands.push("B2");
sys.validCommands.push("B3");
sys.validCommands.push("B4");
sys.validCommands.push("B5");
sys.validCommands.push("B6");
sys.validCommands.push("B7");
sys.validCommands.push("B8");
sys.validCommands.push("B9");
sys.validCommands.push("B10");
sys.validCommands.push("B11");
sys.validCommands.push("B12");
sys.validCommands.push("B13");
sys.validCommands.push("B14");
sys.validCommands.push("B15");
sys.validCommands.push("B16");


sys.validCommands.push("H1");
sys.validCommands.push("H2");
sys.validCommands.push("H3");
sys.validCommands.push("H4");
sys.validCommands.push("H5");
sys.validCommands.push("H6");
sys.validCommands.push("H7");
sys.validCommands.push("H8");
sys.validCommands.push("H9");
sys.validCommands.push("H10");
sys.validCommands.push("H11");
sys.validCommands.push("H12");
sys.validCommands.push("H13");
sys.validCommands.push("H14");
sys.validCommands.push("H15");
sys.validCommands.push("H16");


sys.validCommands.push("HH");
sys.validCommands.push("PP");
sys.validCommands.push("FACE");

sys.validCommands.push("END");

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
	updateImages();


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
		
		sys.currentImageData = obj;
		
		updateImages();
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

function updateImages() {
	io.emit("updateImage", sys.currentImageData);
}



function updateCharts() {
	var chartData = {};
	chartData.voteCounts = sys.voteCounts;
	chartData.numberOfVotes = sys.numberOfVotes;
	
	io.emit("updateChart", chartData);
	
// 	for(var key in clients) {
// 		var client = clients[key];
// 	}
}


//setInterval(sys.update, 15000);









