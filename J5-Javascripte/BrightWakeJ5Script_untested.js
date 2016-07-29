var five = require("johnny-five");
var mysql = require("mysql");
var raspi = require("raspi-io");
var Sound = require('node-aplay');
var arduino = new five.Board();
var raspi = new five.Board({
	io: new raspi()
});

var User_Id = 1;	// Standart-User_Id zu Demozwecken
var isButtonPressed = false;
var lastGyroDetection;
var lcd;
var motion;
var button;
var gyro;
var motor;
var rgb;
var execMode = "Demo_Mode"; // "Demo_Mode" oder "DB_Mode"
var motionStartTime = null;
var motionDuration = 0;
var demoWakeTime;

raspi.on("ready", function () {
	//lcd = new five.LCD({ pins: [7, 8, 9, 10, 11, 12] });	// TODO: LED-Display implementieren
	
	//lcd.print("Hello BrightWake!!!");
	//setInterval(function() {
		//lcd.print(currentTimeString());
	//}, 1000);	// Uhrzeit auf Display sekündlich updaten
	
});

arduino.on("ready", function() {
	
	button = new five.Button({
		pin: 2,
		isPullup: true		
	});

	gyro = new five.Gyro({
		controller: "ANALOG",
		sensitivity: 0.67,
		pins: ["A0", "A1"]
	});
	gyro.recalibrate();
	
	motion = new five.Motion(7);

	motor = new five.Motor(5);

	rgb = new five.Led.RGB([9, 10, 11]);	
	
	lastGyroDetection = new Date();
	var gyroCalibration = 123;
	
	// EVENTS
	gyro.on("change", function() {
		if(this.x<=gyroCalibration || this.y<=gyroCalibration) {
			lastGyroDetection = new Date();
			console.log("gyro");
		}		
	});

	button.on("down", function() {
			isButtonPressed = true;
	});
	button.on("up", function() {
			isButtonPressed = false;
	});

	motion.on("motionstart", function() {
		motionDuration = 0;
		motionStartTime = new Date();
		console.log('motion detected - ' + motionStartTime);
	});
	motion.on("motionend", function() {
		console.log('motion end');
		motionStartTime = null;
	});

	// EIGENTLICHES PROGRAMM
	console.log("Start\nMode is " + execMode);
	if(execMode=="Demo_Mode") {
		DemoMode();
	} else {
		DbMode();
	}
	
});

function getDbConnection () {
	var mysql_con = mysql.createConnection({
		host: "localhost",
		user: "bw_user",
		password: "bright3WAke8",
		database: "BrightWake"
	});
	
	return mysql_con;
}

var dbQueryResult = [];
function getContentFromDB (query) {
	var mysql_con = getDbConnection();
	mysql_con.connect(function(err){
		if(err){
			console.log('Error connecting to Db');
			return;
		}
	});

	mysql_con.query(query, function(err, rows){
		if(err) {
			console.log("err: " + err);
		} else {
			for(var i = 0; i < rows.length; ++i) {
				dbQueryResult.push(rows[i]);
			}
		}
	});
	setTimeout( function () {
		mysql_con.end(function(err) {});
	}, 1000);
}

function DemoMode () {
	var wakeMode = "";
	
	// Demo mit GUI-Anstoss
	var timeInterval = setInterval( function () {
		var query = "SELECT Weckzeit FROM Weckzeiteintrag_DEMO ORDER BY Weckzeit LIMIT 1;";

		getContentFromDB(query);
		console.log("Waiting for button-click...");
		if(dbQueryResult!=[] && dbQueryResult.length!=0) {
			var wakeTimeString = String(dbQueryResult[0].Weckzeit);
			var wakeTimeSplits = wakeTimeString.split(":");
			demoWakeTime = new Date();

			demoWakeTime.setHours(parseInt(wakeTimeSplits[0]));
			demoWakeTime.setMinutes(parseInt(wakeTimeSplits[1]));
			demoWakeTime.setSeconds(parseInt(wakeTimeSplits[2]));
		}
		if(demoWakeTime!=null) {
			query = "DELETE FROM Weckzeiteintrag_DEMO WHERE Weckzeit='" + wakeTimeString + "';";
			getContentFromDB(query);
			
			clearInterval(timeInterval);
		}
	}, 1000);

	// Demo zum schnellen Testing
	//demoWakeTime = new Date ();
	//demoWakeTime.setMinutes(demoWakeTime.getMinutes()+1);

	var waitInterval = setInterval( function() {
		if(demoWakeTime!=null) {
			wakeMode = waitForNextWakeEvent_Demo(demoWakeTime);
		}
	}, 500);

	var wakeInterval = setInterval( function () {
		if(wakeMode!="") {
			clearInterval(waitInterval);
			clearInterval(wakeInterval);

			startWakeMode(wakeMode);
			if(wakeMode=="Lichtmodus") {
				
				var query = "SELECT Weckmodus_Bezeichnung FROM Weckmodus wm INNER JOIN NutzerWeckmodus_DEMO nwm ON wm.Weckmodus_Id=nwm.FK_Weck_Id INNER JOIN Schlafmodus sm "
					+ "ON nwm.FK_Schlaf_Id=sm.Schlafmodus_Id WHERE sm.Schlafmodus_Bezeichnung='Leichtschlaf' AND nwm.FK_Nutzer_Id=" + User_Id + " LIMIT 1;";
				getContentFromDB(query);
				
				var secondMode = "";
				if(dbQueryResult!=[] && dbQueryResult.length!=0) {
					secondMode = String(dbQueryResult[0].Weckmodus_Bezeichnung);
				}
				if(secondMode != "") {
					mode = secondMode;
				} else {
					console.log("Failed to get secondMode from DB");
				}
				
				var realWakeInterval = setInterval( function() {
					if(currentTime.getHours()==nextWakeTime.getHours() && currentTime.getMinutes()==nextWakeTime.getMinutes() && currentTime.getSeconds()==nextWakeTime.getSeconds()) {
						startWakeMode(secondMode);
						clearInterval(realWakeInterval);
					}
				}, 500);
			}
			wakeMode = "";
		}
	}, 1000);
}

function waitForNextWakeEvent_Demo (nextWakeTime) {
	var mode = "";
	var currentTime = new Date();
	var lastGyroXSecondsAgo = currentTime.getSeconds()-lastGyroDetection.getSeconds();
	if(lastGyroXSecondsAgo<0) {
		lastGyroXSecondsAgo = 60 + lastGyroXSecondsAgo
	}
	console.log("Waiting for " + nextWakeTime + "\tCurrent Time: " + currentTime + "\tlastGyro: " + lastGyroXSecondsAgo);
	
	// 1. Prüfzeitpunkt => Tiefschlaf-Weckmodus wird gestartet, wenn 20 Sekunden vor dem Wecken die letzte Bewegung vor mehr als 1 Sekunde war
	if(((nextWakeTime.getSeconds()-currentTime.getSeconds())==20 || (nextWakeTime.getSeconds()-currentTime.getSeconds())==(-40)) && lastGyroXSecondsAgo>=1) {		
		var query = "SELECT Weckmodus_Bezeichnung FROM Weckmodus wm INNER JOIN NutzerWeckmodus_DEMO nwm ON wm.Weckmodus_Id=nwm.FK_Weck_Id INNER JOIN Schlafmodus sm " 
			+ "ON nwm.FK_Schlaf_Id=sm.Schlafmodus_Id WHERE sm.Schlafmodus_Bezeichnung='Tiefschlaf' AND nwm.FK_Nutzer_Id=" + User_Id + " LIMIT 1;";
		
		getContentFromDB(query);
		var deepSleepMode = "";
		if(dbQueryResult!=[] && dbQueryResult.length!=0) {
			deepSleepMode = String(dbQueryResult[0].Weckmodus_Bezeichnung);
		}
		if(deepSleepMode != "") {
			mode = deepSleepMode;
			console.log(mode);
		} else {
			console.log("Failed to get deepSleepMode from DB");
		}
	}
	 var sleep = "Normalschlaf";
	// 2. Prüfzeitpunkt => wenn das Weckereignis jetzt ausgeführt werden soll
	if(currentTime.getHours()==nextWakeTime.getHours() && currentTime.getMinutes()==nextWakeTime.getMinutes() && currentTime.getSeconds()==nextWakeTime.getSeconds()) {
		// letzte Bewegung vor mehr als 5 Sekunden vor dem Wecken wahrgenommen => Nutzer in Normalschlaf
		if (lastGyroXSecondsAgo>=5) {
			sleep = "Normalschlaf";
		}
		// letzte Bewegung vor weniger als 5 Sekunden vor dem Wecken wahrgenommen => Nutzer in Leichtschlaf
		else if (lastGyroXSecondsAgo<5) {
			sleep = "Leichtschlaf";
		}
		
		query = "SELECT Weckmodus_Bezeichnung FROM Weckmodus wm INNER JOIN NutzerWeckmodus nwm ON wm.Weckmodus_Id=nwm.FK_Weck_Id INNER JOIN Schlafmodus sm "
		+ "ON nwm.FK_Schlaf_Id=sm.Schlafmodus_Id WHERE sm.Schlafmodus_Bezeichnung='" + sleep + "' AND nwm.FK_Nutzer_Id=" + User_Id + " LIMIT 1;";
		getContentFromDB(query);
		
		var wakeNowMode = "";
		if(dbQueryResult!=[] && dbQueryResult.length!=0) {
			wakeNowMode = String(dbQueryResult[0].Weckmodus_Bezeichnung);
		}
		if(wakeNowMode != "") {
			mode = wakeNowMode;
		} else {
			console.log("Failed to get wakeNowMode from DB");
		}
	}

	return mode;	
}

function DbMode () {
	var wakeMode = "";
	var nextWakeTime = null;
	
	var getTimeInterval = setInterval( function() {
		nextWakeTime = getNextWakeTimeFromDb();
	}, 1000);
	
	var waitInterval = setInterval( function() {
		if(nextWakeTime != null) {
			wakeMode = waitForNextWakeEvent_DB(nextWakeTime);
			clearInterval(getTimeInterval);
		}
	}, 1000);

	var wakeInterval = setInterval( function () {
		if(wakeMode!="") {
			console.log(wakeMode);
			clearInterval(waitInterval);
			clearInterval(wakeInterval);

			startWakeMode(wakeMode);
			if(wakeMode=="Lichtmodus") {
				
				var query = "SELECT Weckmodus_Bezeichnung FROM Weckmodus wm INNER JOIN NutzerWeckmodus nwm ON wm.Weckmodus_Id=nwm.FK_Weck_Id INNER JOIN Schlafmodus sm "
					+ "ON nwm.FK_Schlaf_Id=sm.Schlafmodus_Id WHERE sm.Schlafmodus_Bezeichnung='Leichtschlaf' AND nwm.FK_Nutzer_Id=" + User_Id + " LIMIT 1;";
				getContentFromDB(query);
				
				var secondMode = "";
				if(dbQueryResult!=[] && dbQueryResult.length!=0) {
					secondMode = String(dbQueryResult[0].Weckmodus_Bezeichnung);
				}
				if(secondMode != "") {
					mode = secondMode;
				} else {
					console.log("Failed to get secondMode from DB");
				}
				
				var realWakeInterval = setTimeout(function() {
					if(currentTime.getHours()==nextWakeTime.getHours() && currentTime.getMinutes()==nextWakeTime.getMinutes())) {
						startWakeMode(secondMode);
						clearInterval(realWakeInterval);
					}
				}, 500);
			}
			wakeMode = "";
		}
	}, 1000);
}

function getNextWakeTimeFromDb () {
	var query = "SELECT * FROM Weckzeiteintrag wze INNER JOIN Wochentage wt ON wze.Wochentag=wt.Wochentag_Id "
		+ "WHERE wt.wochentag = '" + currentWeekday() + "' AND wze.Weckzeit>'" + currentTimeString() + "' ORDER BY Weckzeit;";	
	getContentFromDB(query);
	
	var nextWakeTime = null;
	if(dbQueryResult!=[] && dbQueryResult.length!=0) {
		var wakeTimeString = String(dbQueryResult[0].Weckzeit);
		var wakeTimeSplits = wakeTimeString.split(":");
		nextWakeTime = new Date();

		nextWakeTime.setHours(parseInt(wakeTimeSplits[0]));
		nextWakeTime.setMinutes(parseInt(wakeTimeSplits[1]));
		nextWakeTime.setSeconds(parseInt(wakeTimeSplits[2]));
	}

	return nextWakeTime;
}

function waitForNextWakeEvent_DB (nextWakeTime) {
	var sleep = "Normalschlaf";
	var mode = "";
	var currentTime = new Date();
	var lastGyroXMinutesAgo = currentTime.getSeconds()-lastGyroDetection.getSeconds();
	
	if(lastGyroXMinutesAgo<0) {
		lastGyroXMinutesAgo = 60 + lastGyroXMinutesAgo;
	}
	
	// 1. Prüfzeitpunkt => Tiefschlaf-Weckmodus wird gestartet, wenn 30 Minuten vor dem Wecken die letzte Bewegung vor mehr als 10 Minuten war
	if(((nextWakeTime.getSeconds()-currentTime.getSeconds())==30 || (nextWakeTime.getSeconds()-currentTime.getSeconds())==(-30)) && (lastGyroXMinutesAgo>=10 || lastGyroXMinutesAgo<=-10)) {
		var query = "SELECT Weckmodus_Bezeichnung FROM Weckmodus wm INNER JOIN NutzerWeckmodus nwm ON wm.Weckmodus_Id=nwm.FK_Weck_Id INNER JOIN Schlafmodus sm " 
			+ "ON nwm.FK_Schlaf_Id=sm.Schlafmodus_Id WHERE sm.Schlafmodus_Bezeichnung='Tiefschlaf' AND nwm.FK_Nutzer_Id=" + User_Id + " LIMIT 1;";
		
		getContentFromDB(query);
		var deepSleepMode = "";
		if(dbQueryResult!=[] && dbQueryResult.length!=0) {
			deepSleepMode = String(dbQueryResult[0].Weckmodus_Bezeichnung);
		}
		if(deepSleepMode != "") {
			mode = deepSleepMode;
		} else {
			console.log("Failed to get deepSleepMode from DB");
		}
	}
	
	// 2. Prüfzeitpunkt => wenn das Weckereignis jetzt ausgeführt werden soll
	if(currentTime.getHours()==nextWakeTime.getHours() && currentTime.getMinutes()==nextWakeTime.getMinutes()) {
		// letzte Bewegung vor mehr 5 Minuten vor dem Wecken wahrgenommen => Nutzer in Normalschlaf
		if (lastGyroXMinutesAgo>=5) {
			sleep = "Normalschlaf";
		}
		// letzte Bewegung vor weniger als 5 Minuten vor dem Wecken wahrgenommen => Nutzer in Leichtschlaf
		else if (lastGyroXMinutesAgo<5) {
			sleep = "Leichtschlaf";
		}
		
		query = "SELECT Weckmodus_Bezeichnung FROM Weckmodus wm INNER JOIN NutzerWeckmodus nwm ON wm.Weckmodus_Id=nwm.FK_Weck_Id INNER JOIN Schlafmodus sm "
		+ "ON nwm.FK_Schlaf_Id=sm.Schlafmodus_Id WHERE sm.Schlafmodus_Bezeichnung='" + sleep + "' AND nwm.FK_Nutzer_Id=" + User_Id + " LIMIT 1;";
		getContentFromDB(query);
		
		var wakeNowMode = "";
		if(dbQueryResult!=[] && dbQueryResult.length!=0) {
			wakeNowMode = String(dbQueryResult[0].Weckmodus_Bezeichnung);
		}
		if(wakeNowMode != "") {
			mode = wakeNowMode;
		} else {
			console.log("Failed to get wakeNowMode from DB");
		}
	}	
	
	return mode;	
}

function startWakeMode(mode) {
		
	console.log("Start Wakemode: " +  mode);
	switch (mode) {
		case "SoundModus":
			SoundMode(); break;
		case "Vibrationsmodus":
			VibrationMode(); break;
		case "Lichtmodus":
			LightMode(); break;
	}
	
	motion = null;
}

function SoundMode() {	// Wird auf Raspi ausgeführt
	var music = new Sound('/home/pi/Desktop/BrightWake/wecken_science_fiction2.wav');

	var inSnooze = false;
	var soundInterval = setInterval( function () {
			music.play();
		}, 2000);

	var checkInterval = setInterval( function () {				
		if(isButtonPressed) {
			music.stop();

			clearInterval(checkInterval);
			clearInterval(soundInterval);
		} else {
			if(inSnooze==false) {
				if(motionStartTime != null) {			
					motionDuration = new Date().getSeconds() - motionStartTime.getSeconds();
				}

				if(motionDuration>=1 || motionDuration<=-59) {
					clearInterval(soundInterval);
					
					inSnooze = true;
					motionDuration = 0;
					motionStartTime = null;

					setTimeout( function() {
				
						soundInterval = setInterval( function () {
							music.play();
						}, 2000);
						inSnooze = false;
					}, 5000); 	
				}
			}
		}
		
	}, 100);
}

function VibrationMode() {
	motor.start();
	
	var inSnooze = false;
	
	var checkInterval = setInterval( function () {
		if(isButtonPressed) {
			motor.stop();

			clearInterval(checkInterval);
		} else {
			if(inSnooze==false) {
				if(motionStartTime != null) {			
					motionDuration = new Date().getSeconds() - motionStartTime.getSeconds();
				}

				if(motionDuration>=1 || motionDuration<=-59) {
					motor.stop();					
					inSnooze = true;
					motionDuration = 0;
					motionStartTime = null;

					setTimeout(function() {
						motor.start();
						inSnooze = false;
					}, 5000); 	
				}
			}
		}
		
	}, 500);
}

function LightMode() {
	var index = 0;
	var intensity = 0;
	var sunbeam = ["BF3F00", "C24800", "C55100", "C85A00", "CB6400", "CE6D00", "D17600", "D47F00", "D78800", "DA9100", "DD9A00", "E1A400", "E4AD00", "E7B600", "EABF00", "EDC800", "F0D100", "F3DA00", "F6E400", "F9ED00", "FCF600", "FFFF00"];
	var exitLightMode = false;
	
	rgb.intensity(0);
	rgb.color(sunbeam[index++]);
	rgb.on();
	
	var lightInterval = setInterval( function () {
		rgb.intensity(intensity++);

		if(intensity%5 == 0) {
			rgb.color(sunbeam[index++]);
		}
		if (index == sunbeam.length || intensity == 100) {
		  exitLightMode = true;
		}
	}, 200);
	
	var checkInterval = setInterval( function () {
		if(isButtonPressed || exitLightMode) {
			clearInterval(lightInterval);
			clearInterval(checkInterval);
			rgb.off();
		}		
	}, 500);
}

// Datums- und Zeitfunktionen
function currentTimeString() {
    var today = new Date();
    var h = setLeadingZero(today.getHours());
    var m = setLeadingZero(today.getMinutes());
	var s = setLeadingZero(today.getSeconds());

    return (h + ":" + m + ":" + s);
}

function setLeadingZero(number) {
	if(number<9) {
		return "0" + number;
	}
	return number;
}

function currentWeekday() {
	var d = new Date();	
	var weekdays = new Array(7);
	weekdays[0]=  "Sonntag";
	weekdays[1] = "Montag";
	weekdays[2] = "Dienstag";
	weekdays[3] = "Mittwoch";
	weekdays[4] = "Donnerstag";
	weekdays[5] = "Freitag";
	weekdays[6] = "Samstag";

	return weekdays[d.getDay()];
}
