<?php
	$mysqlhost = "localhost";
	$mysqluser = "bw_user";
	$mysqlpwd = "bright3WAke8";
	$mysqldb = "BrightWake";

	$connection = mysqli_connect($mysqlhost, $mysqluser, $mysqlpwd, $mysqldb)or die("DB Connection ERROR!");
?>