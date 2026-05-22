<?php
require_once 'config.php';

$conn = getDbConnection();
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