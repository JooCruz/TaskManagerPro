# 🚀 TaskManager Pro

> 📱 Repositório: [github.com/JooCruz/TaskManagerPro](https://github.com/JooCruz/TaskManagerPro)

## O que é?

**TaskManager Pro** é uma aplicação mobile de gestão de tarefas para equipas empresariais. Permite que empresas organizem os seus colaboradores por departamentos e atribuam, acompanhem e comentem tarefas em tempo real.

## Para que serve?

- 👔 **Administradores** gerem empresas, departamentos e utilizadores
- 🗂️ **Managers** criam e atribuem tarefas à sua equipa
- ✅ **Colaboradores** visualizam, atualizam o progresso e comentam nas suas tarefas
- 🔔 Notificações automáticas para manter todos a par do que acontece

Desenvolvida com **React Native (Expo)** no frontend, **Node.js + TypeScript** no backend, e base de dados **Supabase (PostgreSQL)**.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- TypeScript
- Expo Router (navegação baseada em ficheiros)

### Backend
- [Node.js](https://nodejs.org/) + TypeScript
- [ts-node](https://typestrong.org/ts-node/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)

### Base de Dados
- [Supabase](https://supabase.com/) (PostgreSQL gerido na cloud)

---

## 📁 Estrutura do Projeto

```
TaskManagerPro-main/
│
├── setup.ps1                     # Script de setup Windows
├── setup.sh                      # Script de setup Linux/Mac
│
├── backend/                      # Servidor Node.js + TypeScript
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts       # Cliente Supabase
│   │   ├── controllers/          # Lógica dos endpoints
│   │   ├── routes/               # Rotas da API
│   │   ├── services/
│   │   ├── utils/
│   │   │   └── http.ts
│   │   ├── app.ts
│   │   └── server.ts             # Entrada do servidor
│   ├── .env                      # Variáveis de ambiente (não incluído no git)
│   ├── package.json
│   └── tsconfig.json
│
└── MobileTask/                   # App React Native / Expo
    ├── app/                      # Ecrãs da aplicação (Expo Router)
    │   ├── index.tsx
    │   └── (tabs)/
    │       ├── admin.tsx
    │       ├── createDepartamento.tsx
    │       ├── createEmpresa.tsx
    │       ├── explore.tsx
    │       ├── tasks.tsx
    │       ├── usersList.tsx
    │       └── SettingsPage.tsx
    ├── components/
    ├── config/
    │   └── environment.ts        # Configuração centralizada da API
    ├── hooks/
    ├── assets/
    ├── .env.local                # Variáveis de ambiente (não incluído no git)
    └── package.json
```

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/)
- [Expo Go](https://expo.dev/go) instalado no telemóvel
- Conta no [Supabase](https://supabase.com/)

---

### Para Começar (Qualquer PC)

```bash
# Backend
cd backend
npm install
npm run dev

Deverá ver a confirmação: Spendly backend running at http://localhost:8000
Se aparecer o erro code: 'EADDRINUSE' (Porta 8000 ocupada):
Execute o seguinte comando no terminal para fechar processos antigos do Node e volte a tentar o npm start:
taskkill /F /IM node.exe


# Mobile (em outro terminal)
cd MobileTask
npm install
npm run setup-env

Nota de Segurança: Se o script gerar o ficheiro com a palavra localhost, abra manualmente o ficheiro MobileTask/.env.local e mude o host para o IPv4 real do seu computador (pode ver o número digitando ipconfig no terminal):
EXPO_PUBLIC_BACKEND_HOST=192.168.1.XX  # Substitua pelo IP correto do seu PC
EXPO_PUBLIC_BACKEND_PORT=8000
EXPO_PUBLIC_BACKEND_PROTOCOL=http


npx expo start --clear


```


## 🔌 Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (padrão: `8000`) |
| `NODE_ENV` | Ambiente (`development` / `production`) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave pública do Supabase |

### Frontend (`MobileTask/.env.local`)

| Variável | Descrição |
|---|---|
| `EXPO_PUBLIC_BACKEND_HOST` | IP ou hostname do servidor backend |
| `EXPO_PUBLIC_BACKEND_PORT` | Porta do servidor (padrão: `8000`) |
| `EXPO_PUBLIC_BACKEND_PROTOCOL` | `http` ou `https` |


## 🔑 Credenciais de Teste

A aplicação tem os seguintes utilizadores pré-criados para testar:

| Nome | Email | Password | Role |
|---|---|---|---|
| Admin | admin@teste.com | 1234 | 🔴 Admin |
| Afonso | a@cruztech.com | 1234 | 🟡 Manager |
| Cruz | cruz@cruztech.com | 1234 | 🟡 Manager |
| João | joao@cruztech.com | 1234 | 🟢 User |
| Simão | simao@teste1.com | 1234 | 🟢 User |

> **Sugestão para testar:** usa o `admin@teste.com` para aceder a todas as funcionalidades.

---

## 📊 Funcionalidades

- 🔐 Autenticação de utilizadores (login/registo)
- ✅ Gestão de tarefas (criar, editar, eliminar, progresso)
- 👥 Gestão de equipas e departamentos
- 🏢 Gestão de empresas
- 🔔 Notificações
- 💬 Comentários em tarefas
- ⭐ Marcar tarefas como importantes
- 👤 Painel de administração

---

## 🐛 Resolução de Problemas

### ❌ "Supabase env variables not set"
- Confirma que `backend/.env` existe com `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- Confirma que `supabase.ts` tem `import 'dotenv/config'` no topo

### ❌ "Não foi possível ligar ao servidor" (na app)
- Não uses `localhost` — usa o IP da máquina (ex: `192.168.1.10`)
- Confirma que o telemóvel e o PC estão na mesma rede Wi-Fi
- Reinicia o Expo com `npx expo start --clear`

### ❌ Porta 8000 ocupada
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## 🔐 Segurança

Os ficheiros com credenciais **não devem ser incluídos no git**. Confirma o `.gitignore`:

```
.env
.env.local
```

---

## 👨‍💻 Autores

**Afonso Correia**  
**João Cruz**  
Projeto académico — 2026

---

*Última atualização: Junho de 2026*  
*Status: ✅ Em desenvolvimento*

