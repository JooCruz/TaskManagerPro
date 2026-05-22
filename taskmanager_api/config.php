<?php
/**
 * ========================================
 * CONFIGURAÇÃO CENTRAL - TaskManager Backend
 * ========================================
 * 
 * ARQUIVO DE CONFIGURAÇÃO CENTRALIZADO PARA TODO O BACKEND
 * Modifica apenas aqui para trocar de servidor, IP ou credenciais
 * 
 * Este arquivo é gerado automaticamente pelo script setup.ps1 ou setup.sh
 * Não edite manualmente a menos que saiba o que está fazendo
 */

// ==================== CONFIGURAÇÃO DA BASE DE DADOS ====================
define('DB_HOST', 'localhost');          // IP ou hostname do servidor MySQL
define('DB_USER', 'root');               // Usuário do MySQL
define('DB_PASSWORD', '');               // Senha do MySQL
define('DB_NAME', 'taskmanager_db');     // Nome da base de dados

// ==================== CONFIGURAÇÃO DA API ====================
define('API_URL', 'http://localhost:80/taskmanager_api');  // URL base da API
define('API_PORT', 80);                  // Porta do servidor web
define('API_PROTOCOL', 'http');          // http ou https

// ==================== CONFIGURAÇÃO CORS ====================
// Define que domínios podem acessar a API (for proteger contra acesso não autorizado)
define('ALLOWED_ORIGINS', array(
    'localhost',
    '127.0.0.1',
    'localhost:3000',
    'localhost:8000',
    'localhost:19006',  // Expo default
    '172.20.10.5',      // Docker container
    '*'                 // Permitir todos (não recomendado em produção)
));

// ==================== HABILITAÇÃO DE CORS ====================
// Estas headers devem ser incluídas em todos os ficheiros PHP
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// ==================== RESPOSTA PREFLIGHT ====================
// Responder a requisições OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==================== FUNÇÃO PARA CONECTAR À BASE DE DADOS ====================
/**
 * Conecta à base de dados usando as credenciais definidas
 * Retorna conexão MySQLi ou null se falhar
 */
function getDbConnection() {
    $conn = new mysqli(
        defined('DB_HOST') ? DB_HOST : 'localhost',
        defined('DB_USER') ? DB_USER : 'root',
        defined('DB_PASSWORD') ? DB_PASSWORD : '',
        defined('DB_NAME') ? DB_NAME : 'taskmanager_db'
    );
    
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Erro na conexão com a base de dados: ' . $conn->connect_error
        ]);
        exit();
    }
    
    $conn->set_charset("utf8");
    return $conn;
}

// ==================== FUNÇÕES ÚTEIS ====================

/**
 * Retorna uma resposta JSON padronizada
 */
function responderJSON($status, $mensagem = '', $dados = null) {
    $resposta = [
        'status' => $status,
        'mensagem' => $mensagem
    ];
    
    if ($dados !== null) {
        $resposta = array_merge($resposta, $dados);
    }
    
    http_response_code($status === 'sucesso' ? 200 : 400);
    echo json_encode($resposta, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Valida se o request é JSON válido
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        responderJSON('erro', 'JSON inválido: ' . json_last_error_msg());
    }
    
    return $data;
}

?>
