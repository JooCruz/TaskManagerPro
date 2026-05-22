<?php
require_once 'config.php';

ob_start();
ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

// Ligação à base de dados que já criaste
$conn = getDbConnection();

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->tarefa_id)) {
    $tarefa_id = (int)$data->tarefa_id;
    
    // Este comando inverte o valor da coluna 'importante': 0 vira 1, 1 vira 0
    $sql = "UPDATE tarefas SET importante = NOT importante WHERE id = $tarefa_id";
    
    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sucesso"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "ID da tarefa não enviado."]);
}
$conn->close();
?>