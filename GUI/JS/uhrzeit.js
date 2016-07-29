//intervall zur Aktualisierung von Zeit und Datum
val1 = window.setInterval("uhr_anzeigen()", 900);
val2 = window.setInterval("datum_anzeigen()", 900);

//Monatszahl in Text umwandeln
var ArrayMonatText = new Array();
ArrayMonatText[0]="Januar";
ArrayMonatText[1]="Februar";
ArrayMonatText[2]="März";
ArrayMonatText[3]="April";
ArrayMonatText[4]="Mai";
ArrayMonatText[5]="Juni";
ArrayMonatText[6]="Juli";
ArrayMonatText[7]="August";
ArrayMonatText[8]="September";
ArrayMonatText[9]="Oktober";
ArrayMonatText[10]="November";
ArrayMonatText[11]="Dezember";

function MonatText(Zahl) {
return ArrayMonatText[Zahl];
}

//--------------------------------------

//Wochentagzahl in Text umwandeln
var ArrayWochentagText = new Array();
ArrayWochentagText[0]="Sonntag";
ArrayWochentagText[1]="Montag";
ArrayWochentagText[2]="Dienstag";
ArrayWochentagText[3]="Mittwoch";
ArrayWochentagText[4]="Donnerstag";
ArrayWochentagText[5]="Freitag";
ArrayWochentagText[6]="Samstag";

function WochentagText(Zahl) {
return ArrayWochentagText[Zahl];
}

//--------------------------------------

//Uhr
function uhr_anzeigen() {
	var Datum  = new Date();
	var stunde = Datum.getHours();
	var minute = Datum.getMinutes();
	//var sekunde = Datum.getSeconds();

	Zeit = ((stunde < 10) ? " 0" : " ") + stunde;
	Zeit += ((minute < 10) ? ":0" : ":") + minute;
	//Zeit += ((sekunde < 10) ? ":0" : ":") + sekunde;

	document.getElementById('uhr').innerHTML=Zeit;
 }

//Datum
function datum_anzeigen(){
	var Datum = new Date();
	var wtag = Datum.getDay();
	var wtagName = "";
        var tag = Datum.getDate();
        var monat = Datum.getMonth();
        var monatName = "";
	var jahr = Datum.getFullYear();
	
	wtagName = WochentagText(wtag);
	monatName = MonatText(monat);

	datum = wtagName + ", ";
	datum += tag + ". ";
	datum += monatName + " ";
	datum += jahr;

	document.getElementById('datum').innerHTML=datum;	
}

