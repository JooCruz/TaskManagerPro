<?php
require_once 'config.php';

ob_start();
ob_clean();

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->email) && isset($data->password)) {
    $conn = getDbConnection();
    $email = $conn->real_escape_string($data->email);
    $password = $data->password; // Em produção, usa password_hash

    $sql = "SELECT id, nome, email, role, departamento_id, empresa_id FROM users WHERE email = '$email' AND senha = '$password'";
    $result = $conn->query($sql);

    if($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode([
            "status" => "sucesso",
            "user" => $user
        ]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Email ou password incorretos"]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos"]);
}
$conn->close();