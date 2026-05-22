<?php
require_once 'config.php';

ob_clean(); 
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$conn = getDbConnection();

if(isset($_GET['departamento_id'])) {
    $dept_id = (int)$_GET['departamento_id'];
    $sql = "SELECT t.*, u.nome as funcionario_nome FROM tarefas t 
            JOIN users u ON t.atribuida_a = u.id 
            WHERE t.departamento_id = $dept_id ORDER BY t.data_criacao DESC";
            
    $result = $conn->query($sql);
    $tarefas = [];
    while($row = $result->fetch_assoc()) { $tarefas[] = $row; }
    echo json_encode(["status" => "sucesso", "tarefas" => $tarefas]);
}
$conn->close();
?>