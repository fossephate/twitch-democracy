# HearthstoneTwitchDemocracy

A democratic twitch plays system written in Node.js and python


This is an older project that I might update in the future, and possibly adapt it for other games.


Here is how it works:


Votes can be entered in the chat, and only valid commands are accepted. Below the chat is the current votes displayed in a horizontal bar chart Unlimited votes per IP per voting cycle is currently on for testing purposes, but can be turned off later Multiple votes can (and should) be entered in a single line. The format is mostly the same as how you current represent the board.


An example vote (as rogue) (hero power, click hero, click face, end turn): PP HH FACE END would be a valid vote


There's an accompanying python script (for the person streaming) that works as follows:


Press I to take a screenshot with the overlay and send it to the website (which is much faster than the twitch stream delay)


Press U to press to play out the current top voted move set, and clear all votes Escape ends the program.
