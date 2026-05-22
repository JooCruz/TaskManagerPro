<?php
require_once 'config.php';

ob_start(); ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = getDbConnection();

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