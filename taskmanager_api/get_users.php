<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Responde a pedidos "pre-flight" do browser
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if ($conn->connect_error) {
    die(json_encode(["status" => "erro", "mensagem" => "Falha na conexão à BD."]));
}

// Vai buscar todos os utilizadores e junta os nomes das empresas e departamentos
$sql = "SELECT u.id, u.nome, u.email, u.role, e.nome as empresa_nome, d.nome as departamento_nome 
        FROM users u 
        LEFT JOIN empresas e ON u.empresa_id = e.id 
        LEFT JOIN departamentos d ON u.departamento_id = d.id 
        ORDER BY u.id DESC";

$result = $conn->query($sql);

$users = [];
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

echo json_encode(["status" => "sucesso", "users" => $users]);
$conn->close();
?>