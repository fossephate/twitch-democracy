/* Copyright (C) Matthew Fosse - All Rights Reserved*/


exports.system = function() {

	this.validCommands = [];
	
	this.uniqueVotes = [];
	this.allVotes = [];
	this.voteCounts = [];
	this.numberOfVotes = 0;
	this.currentImage = {};


	this.recountVotes = function() {
		
		this.numberOfVotes = this.allVotes.length;
		
		this.voteCounts = [];
		
		for (var i = 0; i < this.uniqueVotes.length; i++) {
			var uniqueVote = this.uniqueVotes[i];
			
			// count the votes
			var count = 0;
			for (var j = 0; j < this.allVotes.length; j++) {
				var vote = this.allVotes[j];
				if (vote == uniqueVote) {
					count += 1;
				}
			}
			
			var tally = {};
			tally.count = count;
			tally.vote = uniqueVote;
			tally.percent = (count / this.numberOfVotes)*100;
			tally.moves = uniqueVote.split(" ");
			
			this.voteCounts.push(tally);
			
			//this.voteCounts[uniqueVote] = count;
			
		}
		

		// sort the vote counts
		this.voteCounts.sort(function(a, b) {
			return ((a.percent < b.percent) ? -1 : ((a.percent == b.percent) ? 0 : 1));
			//Sort could be modified to, for example, sort on the age 
			// if the name is the same.
		});
		
		//console.log("vote counts: ");
		//console.log(this.voteCounts);
	}

	this.checkForVote = function(msg, client) {
		// split by spaces
		var commands = msg.split(" ");
		var valid = true;
		for (var i = 0; i < commands.length; i++) {
			var command = commands[i];
			// if one of the seqments is not a command
			if (this.validCommands.indexOf(command) == -1) {
				// the message isn't a command
				valid = false;
			}
		}

		if (valid) {
			
			
			if(!client.hasVoted || true) {
				
				client.hasVoted = true;
			
				// if this command hasn't been voted for yet, add it to the list of unique votes
				if (this.uniqueVotes.indexOf(msg) == -1) {
					this.uniqueVotes.push(msg);
				}

				this.allVotes.push(msg);
				this.recountVotes();

				//console.log("unique votes: ");
				//console.log(this.uniqueVotes);

				//console.log("all votes: ");
				//console.log(this.allVotes);
				
			}
		}
	}
	
	// reset votes
	this.reset = function() {
		this.uniqueVotes = [];
		this.allVotes = [];
		this.voteCounts = [];
		this.numberOfVotes = 0;
		this.currentImageData = {};
	}

}