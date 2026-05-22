<?php
require_once 'config.php';

$conn = getDbConnection();

// Verifica se a app enviou o ID da empresa
if(isset($_GET['empresa_id'])) {
    $empresa_id = (int)$_GET['empresa_id'];
    
    // Procura os departamentos apenas desta empresa
    $sql = "SELECT id, nome FROM departamentos WHERE empresa_id = $empresa_id";
    $result = $conn->query($sql);
    
    $departamentos = [];
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $departamentos[] = $row;
        }
    }
    
    echo json_encode(["status" => "sucesso", "departamentos" => $departamentos]);
} else {
    echo json_encode(["status" => "erro", "mensagem" => "ID da empresa em falta."]);
}

$conn->close();
?>