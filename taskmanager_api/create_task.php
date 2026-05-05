<?php
ob_clean(); 
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "taskmanager_db");
if ($conn->connect_error) { die(json_encode(["status" => "erro", "mensagem" => "Falha na conexão"])); }

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->titulo) && isset($data->atribuida_a)) {
    // Escapar strings para segurança
    $titulo = $conn->real_escape_string($data->titulo);
    $descricao = isset($data->descricao) ? $conn->real_escape_string($data->descricao) : '';
    $data_entrega = isset($data->data_entrega) ? $conn->real_escape_string($data->data_entrega) : '';
    $hora_entrega = isset($data->hora_entrega) ? $conn->real_escape_string($data->hora_entrega) : '';
    
    // Fallbacks de segurança para os IDs (Evita o erro "Undefined property")
    $empresa_id = isset($data->empresa_id) ? (int)$data->empresa_id : 1;
    $criador_id = isset($data->criador_id) ? (int)$data->criador_id : 1;
    $atribuida_a = isset($data->atribuida_a) ? (int)$data->atribuida_a : 0;
    $departamento_id = !empty($data->departamento_id) ? (int)$data->departamento_id : "NULL";

    $sql = "INSERT INTO tarefas (empresa_id, departamento_id, criador_id, atribuida_a, titulo, descricao, data_entrega, hora_entrega, progresso, status) 
            VALUES ($empresa_id, $departamento_id, $criador_id, $atribuida_a, '$titulo', '$descricao', '$data_entrega', '$hora_entrega', 0, 'Pendente')";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sucesso"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Erro na Base de Dados: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos enviados pelo React."]);
}
$conn->close();
?>