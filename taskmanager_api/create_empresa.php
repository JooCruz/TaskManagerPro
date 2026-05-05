<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = new mysqli("localhost", "root", "", "taskmanager_db");
$data = json_decode(file_get_contents("php://input"));

if(isset($data->nome)) {
    $nome = $conn->real_escape_string($data->nome);
    $sql = "INSERT INTO empresas (nome) VALUES ('$nome')";
    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sucesso", "mensagem" => "Nova empresa registada com sucesso!"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Erro ao criar empresa: " . $conn->error]);
    }
}
$conn->close();
?>