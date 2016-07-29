var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
	var button = new five.Button({
		pin: 2,
		isPullup: true
	});
	var rgb = new five.Led.RGB([9, 10, 11]);

	button.on("down", function() {
			rgb.on();
			console.log('Button pressed');
	});
	button.on("up", function() {
			rgb.off();
			console.log('Button released');
	});

});
