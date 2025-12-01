# Aviva Nações API

API Backend para o sistema Aviva Nações - Live, Chat e Automações.

## Tecnologias

- **NestJS** - Framework Node.js
- **Socket.io** - WebSocket para chat em tempo real
- **Supabase** - Banco de dados PostgreSQL
- **Swagger** - Documentação da API

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente:

```env
# Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_service_key

# Autenticação
ADMIN_PASSWORD=sua_senha_admin
API_KEY=sua_api_key_para_automacoes

# Swagger
SWAGGER_ENABLED=true
```

## Executando

```bash
# Desenvolvimento (com hot reload)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Documentação da API

Com o servidor rodando, acesse:

- **Swagger UI**: http://localhost:3001/docs

## Endpoints

### Live

| Método | Endpoint            | Descrição                  | Autenticação |
| ------ | ------------------- | -------------------------- | ------------ |
| GET    | `/api/live/config`  | Busca configuração da live | -            |
| GET    | `/api/live/status`  | Status atual da live       | -            |
| PATCH  | `/api/live/config`  | Atualiza configuração      | Admin        |
| POST   | `/api/live/iniciar` | Inicia a live              | API Key      |
| POST   | `/api/live/parar`   | Para a live                | API Key      |

### Chat

| Método | Endpoint                 | Descrição            | Autenticação |
| ------ | ------------------------ | -------------------- | ------------ |
| GET    | `/api/chat/mensagens`    | Últimas mensagens    | -            |
| GET    | `/api/chat/estatisticas` | Estatísticas do chat | -            |
| DELETE | `/api/chat/mensagem/:id` | Deleta mensagem      | Admin        |
| POST   | `/api/chat/limpar`       | Limpa todo o chat    | API Key      |

### Viewers

| Método | Endpoint                    | Descrição            | Autenticação |
| ------ | --------------------------- | -------------------- | ------------ |
| POST   | `/api/viewers/registrar`    | Registra viewer      | -            |
| POST   | `/api/viewers/heartbeat`    | Atualiza heartbeat   | -            |
| POST   | `/api/viewers/sair`         | Marca saída          | -            |
| GET    | `/api/viewers/contagem`     | Contagem de viewers  | -            |
| GET    | `/api/viewers/ativos`       | Lista viewers ativos | Admin        |
| GET    | `/api/viewers/todos`        | Lista todos viewers  | Admin        |
| GET    | `/api/viewers/estatisticas` | Estatísticas         | -            |
| DELETE | `/api/viewers/inativos`     | Remove inativos      | API Key      |

## WebSocket (Chat)

Conecte no namespace `/chat`:

```javascript
const socket = io('http://localhost:3001/chat');

// Entrar no chat
socket.emit('join', { sessionId, nome, email });

// Enviar mensagem
socket.emit('nova_mensagem', { mensagem: 'Olá!' });

// Escutar mensagens
socket.on('mensagem', (msg) => console.log(msg));
socket.on('mensagens_anteriores', (msgs) => console.log(msgs));
socket.on('users_online', (count) => console.log(count));
```

## Autenticação

### API Key (para automações)

Header: `x-api-key: sua_api_key`

Exemplo:

```bash
curl -X POST http://localhost:3001/api/live/iniciar \
  -H "x-api-key: sua_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url_stream": "...", "titulo": "Culto"}'
```

### Admin (para operações administrativas)

Header: `x-admin-password: sua_senha`

## Exemplos de Automação

### Iniciar live automaticamente

```bash
curl -X POST http://localhost:3001/api/live/iniciar \
  -H "x-api-key: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url_stream": "rtmp://seu-servidor/live/stream",
    "titulo": "Culto de Domingo",
    "descricao": "Transmissão ao vivo do culto"
  }'
```

### Parar live

```bash
curl -X POST http://localhost:3001/api/live/parar \
  -H "x-api-key: SUA_API_KEY"
```

### Limpar chat após live

```bash
curl -X POST http://localhost:3001/api/chat/limpar \
  -H "x-api-key: SUA_API_KEY"
```

## Estrutura do Projeto

```
src/
├── auth/                 # Autenticação e guards
│   ├── decorators/       # @RequireApiKey, @RequireAdmin
│   └── guards/           # ApiKeyGuard, AdminGuard
├── chat/                 # Módulo de chat
│   ├── chat.gateway.ts   # WebSocket handler
│   ├── chat.service.ts   # Lógica de negócio
│   └── chat.controller.ts # REST endpoints
├── live/                 # Módulo de live
│   ├── live.service.ts
│   └── live.controller.ts
├── viewers/              # Módulo de viewers
│   ├── viewers.service.ts
│   └── viewers.controller.ts
├── supabase/             # Cliente Supabase
│   └── supabase.service.ts
├── app.module.ts         # Módulo principal
└── main.ts               # Bootstrap
```

## Scripts SQL

Execute no Supabase para criar as tabelas necessárias:

- `supabase-schema-live-viewers.sql` - Tabela de viewers
- `supabase-schema-live-chat.sql` - Tabela de mensagens do chat

## License

MIT
