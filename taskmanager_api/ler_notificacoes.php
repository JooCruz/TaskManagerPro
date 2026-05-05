<?php
ob_start(); ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = new mysqli("localhost", "root", "", "taskmanager_db");
$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->user_id)) {
    $user_id = (int)$data->user_id;
    // Marca todas como lidas para este user
    $conn->query("UPDATE notificacoes SET lida = 1 WHERE user_id = $user_id");
    echo json_encode(["status" => "sucesso"]);
}
$conn->close();
?>