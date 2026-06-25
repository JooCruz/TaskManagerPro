#!/usr/bin/env node

/**
 * Script para configurar automaticamente o .env.local
 * Detecta a IP local do computador e configura para mobile
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

// Encontrar a IP local (192.168.x.x ou 10.x.x.x)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4 e não é loopback
      if (iface.family === 'IPv4' && !iface.internal) {
        // Preferir 192.168.x.x, depois 10.x.x.x
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback para localhost se não encontrar
  return 'localhost';
}

// Configuração do .env.local
function setupEnv() {
  const envPath = path.join(__dirname, '.env.local');
  const localIP = getLocalIP();
  const isLocalhost = localIP === 'localhost';
  
  const envContent = `# Configuração automática gerada - ${new Date().toLocaleString()}
# IP do computador: ${localIP}
# Data de criação: ${new Date().toISOString()}

EXPO_PUBLIC_BACKEND_HOST=${localIP}
EXPO_PUBLIC_BACKEND_PORT=8000
EXPO_PUBLIC_BACKEND_PROTOCOL=http

# Backend URL: http://${localIP}:8000/taskmanager_api
${isLocalhost ? '# ⚠️ AVISO: Usando localhost - só funciona no PC, não em dispositivo físico!\n# Para dispositivo físico, altere EXPO_PUBLIC_BACKEND_HOST para a IP LAN' : ''}
`;

  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log(`✅ .env.local configurado automaticamente!`);
  console.log(`📱 Backend: http://${localIP}:8000/taskmanager_api`);
  
  if (isLocalhost) {
    console.warn(`\n⚠️  AVISO: Usando localhost`);
    console.warn(`   - Web (http://localhost:8081): ✅ Funciona`);
    console.warn(`   - Físico/Emulador: ❌ Não funciona`);
  } else {
    console.log(`\n✅ Configuração para dispositivo físico:`);
    console.log(`   - IP: ${localIP}`);
    console.log(`   - Scanneia o QR code: exp://${localIP}:8081`);
  }
}

// Executar
try {
  setupEnv();
} catch (error) {
  console.error('❌ Erro ao configurar .env.local:', error.message);
  process.exit(1);
}
