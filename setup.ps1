# ========================================
# SCRIPT DE SETUP - TaskManager PRO
# Executar: .\setup.ps1
# ========================================

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     TASKMANAGER - SETUP AUTOMÁTICO        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ====================  PASSO 1: Solicitar IPs ====================
Write-Host "📌 PASSO 1: Configuração de IPs" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$backendHost = Read-Host "Digite o IP ou hostname do Backend (padrão: localhost)"
if ([string]::IsNullOrWhiteSpace($backendHost)) { $backendHost = "localhost" }

$backendPort = Read-Host "Digite a porta do Backend (padrão: 80)"
if ([string]::IsNullOrWhiteSpace($backendPort)) { $backendPort = "80" }

$dbHost = Read-Host "Digite o host da Base de Dados (padrão: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbUser = Read-Host "Digite o usuário do MySQL (padrão: root)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "root" }

$dbPassword = Read-Host "Digite a senha do MySQL (deixe em branco se sem senha)"
$dbName = Read-Host "Digite o nome da base de dados (padrão: taskmanager_db)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "taskmanager_db" }

Write-Host ""
Write-Host "✅ Informações coletadas!" -ForegroundColor Green
Write-Host ""

# ====================  PASSO 2: Atualizar .env.local ====================
Write-Host "📌 PASSO 2: Configurando Frontend (.env.local)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$envPath = Join-Path $PSScriptRoot "MobileTask\.env.local"
$envContent = @"
# BACKEND (API PHP)
EXPO_PUBLIC_BACKEND_HOST=$backendHost
EXPO_PUBLIC_BACKEND_PORT=$backendPort
EXPO_PUBLIC_BACKEND_PROTOCOL=http

# DATABASE
EXPO_PUBLIC_DB_HOST=$dbHost
EXPO_PUBLIC_DB_USER=$dbUser
EXPO_PUBLIC_DB_PASSWORD=$dbPassword
EXPO_PUBLIC_DB_NAME=$dbName
"@

Set-Content -Path $envPath -Value $envContent -Encoding UTF8
Write-Host "✅ Arquivo .env.local atualizado!" -ForegroundColor Green
Write-Host ""

# ====================  PASSO 3: Criar config.php para Backend ====================
Write-Host "📌 PASSO 3: Configurando Backend (PHP)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$phpConfigPath = Join-Path $PSScriptRoot "taskmanager_api\config.php"
$phpContent = @"
<?php
// ========================================
// CONFIGURAÇÃO CENTRAL - BACKEND PHP
// ========================================
// Gerado automaticamente pelo script de setup

define('DB_HOST', '$dbHost');
define('DB_USER', '$dbUser');
define('DB_PASSWORD', '$dbPassword');
define('DB_NAME', '$dbName');
define('API_URL', 'http://$backendHost:$backendPort/taskmanager_api');

// Habilitação de CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

?>
"@

Set-Content -Path $phpConfigPath -Value $phpContent -Encoding UTF8
Write-Host "✅ Arquivo config.php criado!" -ForegroundColor Green
Write-Host ""

# ====================  PASSO 4: Exibir Resumo ====================
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Resumo da Configuração:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Backend Host: $backendHost" -ForegroundColor White
Write-Host "Backend Port: $backendPort" -ForegroundColor White
Write-Host "DB Host: $dbHost" -ForegroundColor White
Write-Host "DB User: $dbUser" -ForegroundColor White
Write-Host "DB Name: $dbName" -ForegroundColor White
Write-Host ""

# ====================  PASSO 5: Criar atalhos de comando ====================
Write-Host "📌 PASSO 5: Próximos Passos" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Para rodar o Frontend (React Native):" -ForegroundColor Cyan
Write-Host "    cd MobileTask" -ForegroundColor Green
Write-Host "    npm start" -ForegroundColor Green
Write-Host ""
Write-Host "2️⃣  Para rodar o Backend (PHP):" -ForegroundColor Cyan
Write-Host "    - Use um servidor PHP (XAMPP, WAMP, Docker, etc)" -ForegroundColor Green
Write-Host "    - Coloque a pasta 'taskmanager_api' em htdocs" -ForegroundColor Green
Write-Host "    - URL: http://$backendHost`:$backendPort/taskmanager_api" -ForegroundColor Green
Write-Host ""
Write-Host "3️⃣  Para usar em outro PC:" -ForegroundColor Cyan
Write-Host "    - Execute novamente este script" -ForegroundColor Green
Write-Host "    - Digite o novo IP/hostname" -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ Tudo pronto! Boa sorte! 🚀" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
