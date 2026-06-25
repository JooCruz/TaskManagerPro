# 🔧 Configuração Automática do Environment

## Como Funciona

O `setup-env.js` **detecta automaticamente a IP local** do seu computador e configura o `.env.local` cada vez que você faz:

```bash
npm start
```

### ✅ Vantagens

- ✅ **Sem configuração manual** - A IP é detectada automaticamente
- ✅ **Multi-computador** - Funciona em qualquer PC
- ✅ **Dispositivo físico** - Mobile/Emulador funciona automaticamente
- ✅ **Sem conflitos** - O arquivo é regenerado a cada início

## Como Usar

### 1️⃣ Primeira Vez (Setup)

```bash
npm install
npm start
```

O script executa automaticamente e configura tudo!

### 2️⃣ Em Outro Computador

Apenas:
```bash
npm start
```

A IP é detectada e configurada automaticamente. ✨

### 3️⃣ Comando Manual

Se quiser executar manualmente:

```bash
npm run setup-env
```

## 📱 Testando no Telemóvel

1. **PC e Mobile na mesma rede WiFi** ✓
2. **Backend rodando**: `npm run dev` (na pasta backend)
3. **Mobile rodando**: `npm start` (vai configurar automaticamente)
4. **Scanneia o QR code** que aparece no terminal

O mobile deve conectar corretamente agora!

## 🔍 O que o Script Faz

1. Detecta a IP local (192.168.x.x ou 10.x.x.x)
2. Cria/atualiza o `.env.local`
3. Mostra informações da conexão

```
✅ .env.local configurado automaticamente!
📱 Backend: http://192.168.1.9:8000/taskmanager_api
✅ Configuração para dispositivo físico:
   - IP: 192.168.1.9
   - Scanneia o QR code: exp://192.168.1.9:8081
```

## ⚠️ Troubleshooting

### "localhost não funciona no telemóvel"
- Isso é normal. `localhost` só funciona no PC
- O script detecta automaticamente a IP correta
- Certifique-se que PC e telemóvel estão na **mesma rede WiFi**

### "Conexão recusada"
1. Certifique-se que o **backend está rodando** (porta 8000)
2. Verifique se está na **mesma rede WiFi**
3. Teste: `ping 192.168.1.9` (substitua com sua IP)

### "Ainda dá erro de rede"
- Execute novamente: `npm start` (vai regenerar o .env.local)
- Verifique a IP no backend logs

## 📝 .env.local (gerado automaticamente)

```dotenv
EXPO_PUBLIC_BACKEND_HOST=192.168.1.9
EXPO_PUBLIC_BACKEND_PORT=8000
EXPO_PUBLIC_BACKEND_PROTOCOL=http
```

**Este arquivo é regenerado automaticamente. Não edite manualmente!**

Se precisar editar, modifique `setup-env.js` ou `.env.local.example`.
