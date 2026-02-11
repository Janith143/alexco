<?php
$servername = "127.0.0.1";
$username = "u624100610_alexco2";
$password = "ZXas1234za";
$dbname = "u624100610_alexco2";
$port = 3306;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully to database: " . $dbname . "\n";

// Show tables
$sql = "SHOW TABLES";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  echo "Tables found: \n";
  while($row = $result->fetch_array()) {
    echo $row[0] . "\n";
  }
} else {
  echo "0 tables found\n";
}

$conn->close();
?>
