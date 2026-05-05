<?php
ob_start();
ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

// Ligação à base de dados que já criaste
$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if ($conn->connect_error) {
    die(json_encode(["status" => "erro", "mensagem" => "Falha na conexão"]));
}

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