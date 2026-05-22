#!/bin/bash

# ========================================
# SCRIPT DE SETUP - TaskManager PRO
# Executar: bash setup.sh
# ========================================

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║     TASKMANAGER - SETUP AUTOMÁTICO        ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# ====================  PASSO 1: Solicitar IPs ====================
echo "📌 PASSO 1: Configuração de IPs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Digite o IP ou hostname do Backend (padrão: localhost): " backendHost
backendHost=${backendHost:-localhost}

read -p "Digite a porta do Backend (padrão: 80): " backendPort
backendPort=${backendPort:-80}

read -p "Digite o host da Base de Dados (padrão: localhost): " dbHost
dbHost=${dbHost:-localhost}

read -p "Digite o usuário do MySQL (padrão: root): " dbUser
dbUser=${dbUser:-root}

read -sp "Digite a senha do MySQL (deixe em branco se sem senha): " dbPassword
echo ""

read -p "Digite o nome da base de dados (padrão: taskmanager_db): " dbName
dbName=${dbName:-taskmanager_db}

echo ""
echo "✅ Informações coletadas!"
echo ""

# ====================  PASSO 2: Atualizar .env.local ====================
echo "📌 PASSO 2: Configurando Frontend (.env.local)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

envPath="./MobileTask/.env.local"
cat > "$envPath" << EOF
# BACKEND (API PHP)
EXPO_PUBLIC_BACKEND_HOST=$backendHost
EXPO_PUBLIC_BACKEND_PORT=$backendPort
EXPO_PUBLIC_BACKEND_PROTOCOL=http

# DATABASE
EXPO_PUBLIC_DB_HOST=$dbHost
EXPO_PUBLIC_DB_USER=$dbUser
EXPO_PUBLIC_DB_PASSWORD=$dbPassword
EXPO_PUBLIC_DB_NAME=$dbName
EOF

echo "✅ Arquivo .env.local atualizado!"
echo ""

# ====================  PASSO 3: Criar config.php para Backend ====================
echo "📌 PASSO 3: Configurando Backend (PHP)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

phpConfigPath="./taskmanager_api/config.php"
cat > "$phpConfigPath" << 'EOF'
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
EOF

# Substituir as variáveis no ficheiro (bash)
sed -i "s|\$dbHost|$dbHost|g" "$phpConfigPath"
sed -i "s|\$dbUser|$dbUser|g" "$phpConfigPath"
sed -i "s|\$dbPassword|$dbPassword|g" "$phpConfigPath"
sed -i "s|\$dbName|$dbName|g" "$phpConfigPath"
sed -i "s|\$backendHost|$backendHost|g" "$phpConfigPath"
sed -i "s|\$backendPort|$backendPort|g" "$phpConfigPath"

echo "✅ Arquivo config.php criado!"
echo ""

# ====================  PASSO 4: Exibir Resumo ====================
echo "════════════════════════════════════════════"
echo "✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "════════════════════════════════════════════"
echo ""
echo "📋 Resumo da Configuração:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend Host: $backendHost"
echo "Backend Port: $backendPort"
echo "DB Host: $dbHost"
echo "DB User: $dbUser"
echo "DB Name: $dbName"
echo ""

# ====================  PASSO 5: Criar atalhos de comando ====================
echo "📌 PASSO 5: Próximos Passos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Para rodar o Frontend (React Native):"
echo "    cd MobileTask"
echo "    npm start"
echo ""
echo "2️⃣  Para rodar o Backend (PHP):"
echo "    - Use um servidor PHP (XAMPP, WAMP, Docker, etc)"
echo "    - Coloque a pasta 'taskmanager_api' em htdocs"
echo "    - URL: http://$backendHost:$backendPort/taskmanager_api"
echo ""
echo "3️⃣  Para usar em outro PC:"
echo "    - Execute novamente este script"
echo "    - Digite o novo IP/hostname"
echo ""
echo "════════════════════════════════════════════"
echo "✨ Tudo pronto! Boa sorte! 🚀"
echo "════════════════════════════════════════════"
echo ""
