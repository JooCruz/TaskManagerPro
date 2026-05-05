<?php
ob_clean(); 
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if(isset($_GET['departamento_id'])) {
    $dept_id = (int)$_GET['departamento_id'];
    $sql = "SELECT id, nome, email, role FROM users WHERE departamento_id = $dept_id";
    
    $result = $conn->query($sql);
    $team = [];
    while($row = $result->fetch_assoc()) { $team[] = $row; }
    echo json_encode(["status" => "sucesso", "team" => $team]);
}
$conn->close();
?>