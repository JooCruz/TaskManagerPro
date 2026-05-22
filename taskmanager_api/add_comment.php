<?php
require_once 'config.php';

ob_start();
ob_clean();

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->tarefa_id) && isset($data->user_id) && isset($data->comentario)) {
    $conn = getDbConnection();
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