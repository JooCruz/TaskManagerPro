<?php
ob_start();
ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if ($conn->connect_error) {
    die(json_encode(["status" => "erro", "mensagem" => "Falha na ligação à BD"]));
}

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->email) && isset($data->password)) {
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