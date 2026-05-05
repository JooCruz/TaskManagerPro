<?php
ob_start();
ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if(isset($_GET['tarefa_id'])) {
    $tarefa_id = (int)$_GET['tarefa_id'];
    
    $sql = "SELECT c.*, u.nome 
            FROM comentarios c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.tarefa_id = $tarefa_id 
            ORDER BY c.data_criacao ASC";
            
    $result = $conn->query($sql);
    
    $comentarios = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $comentarios[] = $row;
        }
    }
    echo json_encode(["status" => "sucesso", "comentarios" => $comentarios]);
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Falta o ID da tarefa"]);
}
$conn->close();
?>