<?php
// Limpa qualquer espaço em branco ou erro anterior
ob_start();
ob_clean();

// AS PORTAS ABERTAS (Isto é o que resolve o erro vermelho!)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Ignora pedidos preflight de segurança do browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    exit; 
}

// Ligação à BD
$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if ($conn->connect_error) {
    die(json_encode(["status" => "erro", "mensagem" => "Falha na ligação à BD"]));
}

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->tarefa_id) && isset($data->user_id) && isset($data->comentario)) {
    $tarefa_id = $conn->real_escape_string($data->tarefa_id);
    $user_id = $conn->real_escape_string($data->user_id);
    $comentario = $conn->real_escape_string($data->comentario);

    $sql = "INSERT INTO comentarios (tarefa_id, user_id, comentario) VALUES ('$tarefa_id', '$user_id', '$comentario')";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sucesso", "mensagem" => "Comentário adicionado!"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Erro na BD: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos"]);
}

$conn->close();
?>