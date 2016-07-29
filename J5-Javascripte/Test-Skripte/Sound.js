var Sound = require('node-aplay');

var music = new Sound('/home/pi/Desktop/BrightWake/wecken_science_fiction2.wav');

setInterval( function () {
	music.play();
}, 3000);
