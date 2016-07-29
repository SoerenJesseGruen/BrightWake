var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

	var button1 = new five.Button(2);
	var button2 = new five.Button(4);
  
	button1.on("hold", function() {
		console.log( "Button 1 held" );
	});
	button2.on("hold", function() {
		console.log( "Button 2 held" );
	});

	button1.on("press", function() {
		console.log( "Button 1 pressed" );
	});
	button2.on("press", function() {
		console.log( "Button 2 pressed" );
	});

	button1.on("release", function() {
		console.log( "Button 1 released" );
	});
	button2.on("release", function() {
		console.log( "Button 2 released" );
	});
});