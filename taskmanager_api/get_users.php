<?php
require_once 'config.php';

// Responde a pedidos "pre-flight" do browser
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDbConnection();

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