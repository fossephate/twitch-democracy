/* Copyright (C) Matthew Fosse - All Rights Reserved*/



var graphDiv;

$(document).ready(function() {

	var socket;
	// Connect to the server
	socket = io('https://fosse.co', {
		path: '/8100/socket.io'
	});


	// When the server is connected to:
	socket.on('connection', function(data) {
		console.log(data);
	});


	$("#chatForm").on("submit", function() {

		event.preventDefault();

		socket.emit("chat message", $("#msgInput").val());

		$("#msgInput").val("");
		return false;

	});




















	socket.on("chat message", function(msg) {
		var newMessage = $('<li>').text(msg);
		$("#messageList").append(newMessage);
		newMessage[0].scrollIntoView(false);
	});
	
	socket.on('updateImage', function(data) {
		
		//$("#boardImage")
		//var ctx = document.getElementById('canvas').getContext('2d');
		var ctx = $("#boardCanvas")[0].getContext("2d");
		
		
		var img = new Image();
		img.src = 'data:image/jpeg;base64,' + data.buffer;
		
		//ctx.canvas.width = 500;
		//ctx.canvas.height = 500;
		
		var winWidth = $(window).width();   // returns width of browser viewport
		var docWidth = $(document).width(); // returns width of HTML document
		
		var scale = (docWidth/img.width)-0.12;
		
		var scaledWidth = scale*img.width;
		var scaledHeight = scale*img.height;
		
		ctx.canvas.width = scaledWidth;
		ctx.canvas.height = scaledHeight;
		
		$("#boardCanvas")[0].style.width = scaledWidth;
		$("#boardCanvas")[0].style.height = scaledHeight;
		
		
		
		ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
		
		
	});
	



	// Chart stuff



	graphDiv = $("#myChart")[0];




	//var xData = [4, 65, 23];
	//var yData = ['C1 C2', 'C2 C3', 'C1 B1'];
	
	var xData = [];
	var yData = [];
	
	var trace1 = {
		x: xData,
		y: yData,
		xaxis: 'x1',
		yaxis: 'y1',
		type: 'bar',
		orientation: 'h',
		marker: {
			color: 'rgba(50,171,96,0.6)',
			line: {
				color: 'rgba(50,171,96,1.0)',
				width: 1
			}
		},
		name: 'votes',

	};

	var data = [trace1];

	var layout = {
		title: "Current Votes",
		xaxis1: {
			range: [0, 100],
			//domain: [0, 0.5],
			zeroline: false,
			showline: false,
			showticklabels: true,
			showgrid: true
		},
		legend: {
			x: 0.029,
			y: 1.238,
			font: {
				size: 10
			}
		},
		margin: {
			l: 100,
			r: 100,
			t: 50,
			b: 50
		},
		width: 600,
		height: 500,
		paper_bgcolor: 'rgb(248,248,255)',
		plot_bgcolor: 'rgb(248,248,255)',
		// 		annotations: [{
		// 			xref: 'paper',
		// 			yref: 'paper',
		// 			x: -0.2,
		// 			y: -0.109,
		// 			text: 'OECD ' + '(2015), Household savings (indicator), ' + 'Household net worth (indicator). doi: ' + '10.1787/cfc6f499-en (Accessed on 05 June 2015)',
		// 			showarrow: false,
		// 			font: {
		// 				family: 'Arial',
		// 				size: 10,
		// 				color: 'rgb(150,150,150)'
		// 			}
		// 		}]
		annotations: []

	};

	for (var i = 0; i < xData.length; i++) {
		var result1 = {
			xref: 'x1',
			yref: 'y1',
			x: xData[i] + 10,
			y: yData[i],
			text: xData[i] + '%',
			font: {
				family: 'Arial',
				size: 12,
				color: 'rgb(50, 171, 96)'
			},
			showarrow: false,
		};
		layout.annotations.push(result1);
	}

	Plotly.newPlot(graphDiv, data, layout, {
		displayModeBar: false
	});











	socket.on("updateChart", function(data) {

		graphDiv.data[0].x = [];
		graphDiv.data[0].y = [];
		graphDiv.layout.annotations = [];

		for (var i = 0; i < data.voteCounts.length; i++) {
			var tally = data.voteCounts[i];

			// (count / total votes)*100 = percent
			//var percent = (tally.count / data.numberOfVotes) * 100;
			var percent = tally.percent;
			//xData.push(percent);
			graphDiv.data[0].x.push(percent);

			var command = tally.vote;
			//yData.push(command);
			graphDiv.data[0].y.push(command);

		}

// 		//1) combine the arrays:
// 		var list = [];
// 		for (var j in graphDiv.data[0].x) {
// 			list.push({
// 				'xData': graphDiv.data[0].x[j],
// 				'yData': graphDiv.data[0].y[j]
// 			});
// 		}

// 		//2) sort:
// 		list.sort(function(a, b) {
// 			return ((a.xData < b.xData) ? -1 : ((a.xData == b.xData) ? 0 : 1));
// 			//Sort could be modified to, for example, sort on the age 
// 			// if the name is the same.
// 		});

// 		//3) separate them back out:
// 		for (var k = 0; k < list.length; k++) {
// 			graphDiv.data[0].x[k] = list[k].xData;
// 			graphDiv.data[0].y[k] = list[k].yData;
// 		}




	for (i = 0; i < graphDiv.data[0].x.length; i++) {
		
		var x = graphDiv.data[0].x[i]
		var percentage = x.toFixed(2);
		var count = ((x/100)*data.numberOfVotes).toFixed(0);
		
		var result1 = {
			xref: 'x1',
			yref: 'y1',
			x: graphDiv.data[0].x[i] + 10,
			y: graphDiv.data[0].y[i],
			text: percentage + "%" + " ("+ count +")",
			font: {
				family: 'Arial',
				size: 12,
				color: 'rgb(50, 171, 96)'
			},
			showarrow: false,
		};
		//layout.annotations.push(result1);
		graphDiv.layout.annotations[i] = result1;
	}



		//console.log("updated");

		//graphDiv.data = newData;

		//Plotly.restyle("myChart", newData, 0);
		Plotly.redraw(graphDiv, 0);
	});







});