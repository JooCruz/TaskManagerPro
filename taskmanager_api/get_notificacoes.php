<?php
ob_start(); ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if(isset($_GET['user_id'])) {
    $user_id = (int)$_GET['user_id'];
    // Busca as últimas 15 notificações do utilizador
    $sql = "SELECT * FROM notificacoes WHERE user_id = $user_id ORDER BY data_criacao DESC LIMIT 15";
    $result = $conn->query($sql);
    
    $notifs = [];
    $nao_lidas = 0;
    if($result) {
        while($row = $result->fetch_assoc()) {
            $notifs[] = $row;
            if($row['lida'] == 0) $nao_lidas++;
        }
    }
    echo json_encode(["status" => "sucesso", "notificacoes" => $notifs, "nao_lidas" => $nao_lidas]);
}
$conn->close();
?>