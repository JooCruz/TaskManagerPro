<?php
require_once 'config.php';

ob_clean(); header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = getDbConnection();

if(isset($_GET['user_id'])) {
    $user_id = (int)$_GET['user_id'];
    
    // Busca só as tarefas DESTE utilizador
    $sql = "SELECT t.*, u.nome as criador_nome 
            FROM tarefas t 
            JOIN users u ON t.criador_id = u.id 
            WHERE t.atribuida_a = $user_id 
            ORDER BY t.data_criacao DESC";
            
    $result = $conn->query($sql);
    $tarefas = [];
    while($row = $result->fetch_assoc()) { $tarefas[] = $row; }
    echo json_encode(["status" => "sucesso", "tarefas" => $tarefas]);
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Falta o ID do user"]);
}
$conn->close();
?>