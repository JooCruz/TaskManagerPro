<?php
require_once 'config.php';

ob_clean(); header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = getDbConnection();
$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->tarefa_id) && isset($data->progresso)) {
    $tarefa_id = (int)$data->tarefa_id;
    $progresso = (int)$data->progresso;
    
    // Se o progresso for 100, muda automaticamente o status para "Concluída"
    $status = ($progresso == 100) ? 'Concluída' : 'Em Andamento';

    $sql = "UPDATE tarefas SET progresso = $progresso, status = '$status' WHERE id = $tarefa_id";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sucesso", "novo_status" => $status]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos"]);
}
$conn->close();
?>