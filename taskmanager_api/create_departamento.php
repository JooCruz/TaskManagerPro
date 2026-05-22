<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = getDbConnection();
$data = json_decode(file_get_contents("php://input"));

if(isset($data->nome) && isset($data->empresa_id)) {
    $nome = $conn->real_escape_string($data->nome);
    $empresa_id = (int)$data->empresa_id;
    $sql = "INSERT INTO departamentos (empresa_id, nome) VALUES ($empresa_id, '$nome')";
    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sucesso", "mensagem" => "Departamento criado com sucesso!"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Erro ao criar departamento: " . $conn->error]);
    }
}
$conn->close();
?>