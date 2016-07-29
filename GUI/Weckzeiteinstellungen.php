<?php
	session_start();
	require 'Helper/connect.php';
	
	$waketimeEntries = array();
	$weekdays = array();
	$user_Id = 1;
	
	if($results = $connection->query("SELECT * FROM Weckzeiteintrag WHERE FK_Nutzer_Id=$user_Id")){
		if($results->num_rows){
			while($row = $results->fetch_object()){
				$waketimeEntries[] = $row;
			}
			$results->free();
		}
	}
	if($results = $connection->query("SELECT * FROM Wochentage")){
		if($results->num_rows){
			while($row = $results->fetch_object()){
				$weekdays[] = $row;
			}
			$results->free();
		}
	}

	if(isset($_POST['waketime_1'],$_POST['wakedate_1'],$_POST['waketime_2'],$_POST['wakedate_2'])){
		
		$waketime_1 = $_POST['waketime_1'];
		$wakedate_1 = $_POST['wakedate_1'];
		$waketime_2 = $_POST['waketime_2'];
		$wakedate_2 = $_POST['wakedate_2'];
		
		if(!empty($waketime_1) && !empty($wakedate_1) && !empty($waketime_2) && !empty($wakedate_2)){
			$connection->query("UPDATE WeckzeitEintrag SET Wochentag = $wakedate_1, Weckzeit = '$waketime_1' WHERE FK_Nutzer_Id=$user_Id AND Weckzeiteintrag_Id=1") or die(mysql_error());
			$connection->query("UPDATE WeckzeitEintrag SET Wochentag = $wakedate_2, Weckzeit = '$waketime_2' WHERE FK_Nutzer_Id=$user_Id AND Weckzeiteintrag_Id=2") or die(mysql_error());
			
			header("Location: index.html");
		}
	}
?>

<!DOCTYPE HTML>
<html lang="de">
	<head>
		<meta charset="utf-8">
		<title>BightWake Weckzeit-Einstellungen</title>		
		<link rel="stylesheet" href="Styles/style.css">
	</head>
	<body>
		<p class="big-red-text">BrightWake</p>
		<p class="big-red-text">Weckzeit-Einstellungen</p>
		<div class="brightwake-form">
			<form method="POST" action="">
				<?php
					foreach($waketimeEntries as $wte) {
						echo "<div class='input_panel'>";
							echo "<input type='time' id='waketime_".$wte->Weckzeiteintrag_Id."' name='waketime_".$wte->Weckzeiteintrag_Id."' value='".$wte->Weckzeit."'/>";
							echo "<select id='wakedate_".$wte->Weckzeiteintrag_Id."' name='wakedate_".$wte->Weckzeiteintrag_Id."'>";
								foreach($weekdays as $day) {
									echo "<option "; 
									echo "value='".$day->Wochentag_Id."'";
									if($wte->Wochentag == $day->Wochentag_Id) {									
										echo " selected";
									}
									echo ">";
									echo $day->Wochentag;
									echo "</option>";
								}
							echo "</select>";
							//echo "<button action="removeWakeNode(this)">-</button>";
						echo "</div>";
					}
				?>
				<!-- TODO: automatisiertes Einfügen von neuen "Weckknoten" per JS einbauen -->
				<!-- <button action="addNewWakeNode()">+</button> -->
				<button value="submit">Weckzeiten speichern</button>
			</form>
		</div>
	</body>
</html>
