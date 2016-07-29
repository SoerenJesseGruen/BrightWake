var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var motion = new five.Motion(7);

  motion.on("calibrated", function() {
    console.log("calibrated");
  });

  motion.on("motionstart", function() {
    console.log("motionstart");
  });

  motion.on("motionend", function() {
    console.log("motionend");
  });
  
  
});