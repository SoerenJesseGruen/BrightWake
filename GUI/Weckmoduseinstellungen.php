<?php
	session_start();
	require 'Helper/connect.php';
	
	$userwakemodes = array();
	$wakemodes = array();
	$user_Id = 1;
	
	if($results = $connection->query("SELECT * FROM NutzerWeckmodus INNER JOIN Schlafmodus ON FK_Schlaf_Id=Schlafmodus_Id WHERE FK_Nutzer_Id=$user_Id")){
		if($results->num_rows){
			while($row = $results->fetch_object()){
				$userwakemodes[] = $row;
			}
			$results->free();
		}
	}
	if($results = $connection->query("SELECT * FROM Weckmodus")){
		if($results->num_rows){
			while($row = $results->fetch_object()){
				$wakemodes[] = $row;
			}
			$results->free();
		}
	}
	
	if(isset($_POST['wakemode_1'],$_POST['wakemode_2'],$_POST['wakemode_3'])){
		
		$wakemode_1 = $_POST['wakemode_1'];
		$wakemode_2 = $_POST['wakemode_2'];
		$wakemode_3 = $_POST['wakemode_3'];
		
		if(!empty($wakemode_1) && !empty($wakemode_2) && !empty($wakemode_3)){
			$connection->query("UPDATE NutzerWeckmodus SET FK_Weck_Id=$wakemode_1 WHERE FK_Nutzer_Id=$user_Id AND FK_Schlaf_Id=1") or die(mysql_error());
			$connection->query("UPDATE NutzerWeckmodus SET FK_Weck_Id=$wakemode_2 WHERE FK_Nutzer_Id=$user_Id AND FK_Schlaf_Id=2") or die(mysql_error());
			$connection->query("UPDATE NutzerWeckmodus SET FK_Weck_Id=$wakemode_3 WHERE FK_Nutzer_Id=$user_Id AND FK_Schlaf_Id=3") or die(mysql_error());
			
			header("Location: index.html");
		}
	}
?>

<!DOCTYPE HTML>
<html lang="de">
	<head>
		<meta charset="utf-8">
		<title>BightWake Weckmodus-Einstellungen</title>		
		<link rel="stylesheet" href="Styles/style.css">
	</head>
	<body>
		<p class="big-red-text">BrightWake</p>
		<p class="big-red-text">Weckmodus-Einstellungen</p>
		<div class="brightwake-form">
			<form method="POST" action="">
				<?php
					foreach($userwakemodes as $uwm) {
						echo "<div class='input_panel'>";
							echo "<input type='text' id='sleepmode_".$uwm->FK_Schlaf_Id."' name='sleepmode_".$uwm->FK_Schlaf_Id."' value='".$uwm->Schlafmodus_Bezeichnung."' readonly>";
							echo "<select id='wakemode_".$uwm->FK_Schlaf_Id."' name='wakemode_".$uwm->FK_Schlaf_Id."'>";
								foreach($wakemodes as $wmode) {
									echo "<option "; 
									echo "value='".$wmode->Weckmodus_Id."'";
									if($uwm->FK_Weck_Id == $wmode->Weckmodus_Id) {									
										echo " selected";
									}
									echo ">";
									echo $wmode->Weckmodus_Bezeichnung;
									echo "</option>";
								}
							echo "</select>";
						echo "</div>";
					}
				?>
				<button value="submit">Weckmodi speichern</button>
			</form>
		</div>
	</body>
</html>