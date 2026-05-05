<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Responde a pedidos "pre-flight" do browser
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ligação à base de dados nova
$conn = new mysqli("localhost", "root", "", "taskmanager_db");

if ($conn->connect_error) {
    die(json_encode(["status" => "erro", "mensagem" => "Falha na conexão: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)){
    $email = $conn->real_escape_string($data->email);
    $password = $conn->real_escape_string($data->password);

    // Agora vamos buscar também a empresa_id e o departamento_id!
    $sql = "SELECT id, nome, senha, role, empresa_id, departamento_id FROM users WHERE email='$email'";
    $result = $conn->query($sql);

    if($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        if($password === $row['senha']) {
            echo json_encode([
                "status" => "sucesso", 
                "mensagem" => "Login bem-sucedido",
                "nome" => $row['nome'],
                "role" => $row['role'],
                "user_id" => $row['id'],
                "empresa_id" => $row['empresa_id'],
                "departamento_id" => $row['departamento_id']
            ]);
        } else {
            echo json_encode(["status" => "erro", "mensagem" => "Password incorreta."]);
        }
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Utilizador não encontrado."]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos."]);
}
$conn->close();
?>