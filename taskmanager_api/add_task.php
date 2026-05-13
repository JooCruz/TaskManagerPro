<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "erro", "mensagem" => "Falha na conexão"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['titulo']) && isset($data['status'])) {
    $titulo = $conn->real_escape_string($data['titulo']);
    $status = $conn->real_escape_string($data['status']);

    $sql = "INSERT INTO tasks (titulo, status) VALUES ('$titulo', '$status')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sucesso", "mensagem" => "Tarefa adicionada!"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Erro ao guardar."]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos."]);
}
$conn->close();
?>