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
    die(json_encode(["status" => "erro", "mensagem" => "Falha na conexão: " . $conn->connect_error]));
}

$sql = "SELECT id, nome FROM empresas";
$result = $conn->query($sql);

$empresas = [];
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $empresas[] = $row;
    }
}

echo json_encode(["status" => "sucesso", "empresas" => $empresas]);
$conn->close();
?>