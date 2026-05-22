<?php
require_once 'config.php';

ob_start(); ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = getDbConnection();
$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->user_id)) {
    $user_id = (int)$data->user_id;
    // Marca todas como lidas para este user
    $conn->query("UPDATE notificacoes SET lida = 1 WHERE user_id = $user_id");
    echo json_encode(["status" => "sucesso"]);
}
$conn->close();
?>