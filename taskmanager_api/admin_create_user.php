<?php
require_once 'config.php';

// Isto impede o PHP de cuspir erros HTML que partem o nosso JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDbConnection();

$data = json_decode(file_get_contents("php://input"));

// Verifica se os dados chegaram
if($data && isset($data->nome) && isset($data->email) && isset($data->senha)) {

    $nome = $conn->real_escape_string($data->nome);
    $email = $conn->real_escape_string($data->email);
    $senha = $conn->real_escape_string($data->senha);
    $role = isset($data->role) ? $conn->real_escape_string($data->role) : 'user';
    
    $empresa_id = isset($data->empresa_id) ? (int)$data->empresa_id : 1;
    $departamento_id = (isset($data->departamento_id) && $data->departamento_id !== '') ? (int)$data->departamento_id : 'NULL';

    // Verifica se o email já existe
    $check_email = "SELECT id FROM users WHERE email='$email'";
    $resultado = $conn->query($check_email);

    if($resultado->num_rows > 0) {
        echo json_encode(["status" => "erro", "mensagem" => "Este email já está a ser utilizado por outro utilizador."]);
    } else {
        // Insere o utilizador
        $sql = "INSERT INTO users (empresa_id, departamento_id, nome, email, senha, role) 
                VALUES ($empresa_id, $departamento_id, '$nome', '$email', '$senha', '$role')";

        if($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "sucesso", "mensagem" => "Utilizador registado com sucesso!"]);
        } else {
            // Em vez de falhar, diz-nos qual foi o erro de SQL!
            echo json_encode(["status" => "erro", "mensagem" => "Erro de SQL: " . $conn->error]);
        }
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos recebidos pelo servidor."]);
}

$conn->close();
?>