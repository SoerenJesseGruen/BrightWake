CREATE DATABASE IF NOT EXISTS BrightWake;

USE BrightWake;

CREATE TABLE IF NOT EXISTS Nutzer (
	Nutzer_Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	Nutzername VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Weckmodus (
	Weckmodus_Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	Weckmodus_Bezeichnung VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Schlafmodus (
	Schlafmodus_Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	Schlafmodus_Bezeichnung VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Wochentage (
	Wochentag_Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	Wochentag VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS NutzerWeckmodus (
	FK_Weck_Id INTEGER NOT NULL,
	FK_Schlaf_Id INTEGER NOT NULL,
	FK_Nutzer_Id INTEGER NOT NULL,
	FOREIGN KEY (FK_Weck_Id) REFERENCES Weckmodus(Weckmodus_Id),
	FOREIGN KEY (FK_Schlaf_Id) REFERENCES Schlafmodus(Schlafmodus_Id),
	FOREIGN KEY (FK_Nutzer_Id) REFERENCES Nutzer(Nutzer_Id)
);

CREATE TABLE IF NOT EXISTS NutzerWeckmodus_DEMO (
	FK_Weck_Id INTEGER NOT NULL,
	FK_Schlaf_Id INTEGER NOT NULL,
	FK_Nutzer_Id INTEGER NOT NULL,
	FOREIGN KEY (FK_Weck_Id) REFERENCES Weckmodus(Weckmodus_Id),
	FOREIGN KEY (FK_Schlaf_Id) REFERENCES Schlafmodus(Schlafmodus_Id),
	FOREIGN KEY (FK_Nutzer_Id) REFERENCES Nutzer(Nutzer_Id)
);

CREATE TABLE IF NOT EXISTS Weckzeiteintrag (
	Weckzeiteintrag_Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	FK_Nutzer_Id INTEGER NOT NULL,
	Wochentag INTEGER NOT NULL,
	Weckzeit TIME NOT NULL,
	FOREIGN KEY (FK_Nutzer_Id) REFERENCES Nutzer(Nutzer_Id),
	FOREIGN KEY (Wochentag) REFERENCES Wochentage(Wochentag_Id)
);

CREATE TABLE IF NOT EXISTS Weckzeiteintrag_DEMO (
	Weckzeiteintrag_Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
	FK_Nutzer_Id INTEGER NOT NULL,
	Wochentag INTEGER NOT NULL,
	Weckzeit TIME NOT NULL,
	FOREIGN KEY (FK_Nutzer_Id) REFERENCES Nutzer(Nutzer_Id),
	FOREIGN KEY (Wochentag) REFERENCES Wochentage(Wochentag_Id)
);

-- Test-User anlegen und Rechte geben	
INSERT INTO Nutzer VALUES (NULL, "TestUserBrightWake");

CREATE USER 'bw_user'@'localhost'  IDENTIFIED BY 'bright3WAke8';
GRANT ALL ON * TO 'bw_user'@'localhost';

-- Festdaten initialisieren
INSERT INTO Weckmodus VALUES
	(NULL, "Lichtmodus"),
	(NULL, "Soundmodus"),
	(NULL, "Vibrationsmodus");
	
INSERT INTO Schlafmodus VALUES
	(NULL, "Tiefschlaf"),
	(NULL, "Leichtschlaf"),
	(NULL, "Normalschlaf");
	
INSERT INTO Wochentage VALUES
	(NULL, "Montag"),
	(NULL, "Dienstag"),
	(NULL, "Mittwoch"),
	(NULL, "Donnerstag"),
	(NULL, "Freitag"),
	(NULL, "Samstag"),
	(NULL, "Sonntag");

-- Testdaten initialisieren
INSERT INTO NutzerWeckmodus VALUES
	(1, 1, 1),
	(2, 2, 1),
	(3, 3, 1);
	
INSERT INTO NutzerWeckmodus_DEMO VALUES
	(1, 1, 1),
	(2, 2, 1),
	(3, 3, 1);
	
INSERT INTO Weckzeiteintrag VALUES
	(NULL, 1, 1, '09:00:00'),
	(NULL, 1, 2, '07:30:00'),
	(NULL, 1, 3, '08:00:00'),
	(NULL, 1, 4, '05:45:00'),
	(NULL, 1, 5, '11:30:00'),
	(NULL, 1, 6, '06:00:00');
