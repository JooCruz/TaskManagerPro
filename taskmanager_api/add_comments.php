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
if ($conn->connect_error) { die(json_encode(["status" => "erro", "mensagem" => "Falha na conexão"])); }

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->tarefa_id) && isset($data->user_id) && isset($data->comentario)) {
    $tarefa_id = (int)$data->tarefa_id;
    $user_id = (int)$data->user_id;
    $comentario = $conn->real_escape_string($data->comentario);

    $sql = "INSERT INTO comentarios (tarefa_id, user_id, comentario) VALUES ($tarefa_id, $user_id, '$comentario')";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sucesso"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos enviados para o PHP."]);
}
$conn->close();
?>