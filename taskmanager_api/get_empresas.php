<?php
require_once 'config.php';

$conn = getDbConnection();

$sql = "SELECT id, nome FROM empresas";
$result = $conn->query($sql);

$empresas = [];
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $empresas[] = $row;
    }
}

echo json_encode(["status" => "sucesso", "empresas" => $empresas]);
$conn->close();
?>