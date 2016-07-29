<?php
	require 'connect.php';	
	$user_Id = 1;
	
	if(isset($_POST['wakemode_1'],$_POST['wakemode_2'],$_POST['wakemode_3'])){
		
		$wakemode_1 = $_POST['wakemode_1'];
		$wakemode_2 = $_POST['wakemode_2'];
		$wakemode_3 = $_POST['wakemode_3'];
		
		if(!empty($wakemode_1) && !empty($wakemode_2) && !empty($wakemode_3)){
			$connection->query("UPDATE NutzerWeckmodus_DEMO SET FK_Weck_Id=$wakemode_1 WHERE FK_Nutzer_Id=$user_Id AND FK_Schlaf_Id=1") or die(mysql_error());
			$connection->query("UPDATE NutzerWeckmodus_DEMO SET FK_Weck_Id=$wakemode_2 WHERE FK_Nutzer_Id=$user_Id AND FK_Schlaf_Id=2") or die(mysql_error());
			$connection->query("UPDATE NutzerWeckmodus_DEMO SET FK_Weck_Id=$wakemode_3 WHERE FK_Nutzer_Id=$user_Id AND FK_Schlaf_Id=3") or die(mysql_error());
			
			$time = mktime(date('H'), date('i')+1, date('s'));
			$time = date("H:i:s", $time);
			$weekday = jddayofweek(cal_to_jd(CAL_GREGORIAN, date("m"),date("d"), date("Y")), 0);
			if($weekday==0) {
				$weekday = 7;
			}
			$connection->query("INSERT INTO Weckzeiteintrag_DEMO VALUES (NULL, 1, $weekday, '$time')") or die(mysql_error());		
		}
		
	}
	header("Location: ../index.html");
?>