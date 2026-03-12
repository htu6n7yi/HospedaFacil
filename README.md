# HospedaFacil

Aplicação **fullstack** para gerenciamento de hospedagens, permitindo cadastro de **hotéis, hóspedes e reservas**, com autenticação de usuários.

---

## 🚀 Tecnologias

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS v3
- shadcn/ui (preset Nova)
- React Router DOM
- Axios
- Sonner (notificações)
- Lucide React (ícones)

### Backend

- Node.js + Express
- JWT (JSON Web Token)
- pg (node-postgres)
- cors
- dotenv

### Banco de Dados

- PostgreSQL 15

### Infraestrutura

- Docker + Docker Compose

---

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Token)** para autenticação de usuários.

Fluxo de autenticação:

1. O usuário realiza login na aplicação
2. O backend valida as credenciais
3. Um **token JWT** é gerado e retornado ao cliente
4. O frontend armazena o token e o envia nas requisições via header:

```
Authorization: Bearer <token>
```

5. O backend valida o token para permitir acesso às rotas protegidas
6. Rotas protegidas no frontend redirecionam para o login caso o token seja inválido ou ausente

---

## 📚 Documentação

- [Arquitetura do Sistema](docs/architecture.md)
- [Modelagem do Banco de Dados](docs/database.md)

---

## 📁 Estrutura do Projeto

```
HospedaFacil/
│
├── backend/
│   ├── src/
│   │   ├── database/         # Conexão com PostgreSQL
│   │   ├── middlewares/      # Middleware JWT
│   │   ├── repositories/     # Queries do banco
│   │   ├── routes/           # Rotas da API
│   │   └── server.js         # Entry point
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis (PrivateRoute, shadcn/ui)
│   │   ├── layouts/          # AppLayout com sidebar
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── routes/           # Configuração de rotas
│   │   ├── services/         # Comunicação com a API
│   │   └── types/            # Tipos TypeScript
│   └── .env
│
├── docs/
│   ├── architecture.md
│   └── database.md
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Pré-requisitos

- Node.js 18+
- Docker + Docker Compose

---

## 🐳 Subindo o banco de dados

```bash
docker compose up -d
```

Verificar containers:

```bash
docker ps
```

---

## 🔌 Configuração do Banco

```
Host:     localhost
Port:     5432
User:     postgres
Password: postgres
Database: hospedafacil
```

Variável de ambiente no backend (`.env`):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospedafacil
JWT_SECRET=sua_chave_secreta
PORT=3000
```

---

## ▶️ Rodando o Backend

```bash
cd backend
npm install
npm run dev
```

Servidor disponível em: `http://localhost:3000`

### Rotas disponíveis

| Método | Rota        | Proteção | Descrição           |
| ------ | ----------- | -------- | ------------------- |
| GET    | /health     | Pública  | Status da API       |
| POST   | /auth/login | Pública  | Login do usuário    |
| GET    | /hoteis     | JWT      | Listar hotéis       |
| GET    | /hoteis/:id | JWT      | Buscar hotel por ID |
| POST   | /hoteis     | JWT      | Cadastrar hotel     |
| PUT    | /hoteis/:id | JWT      | Atualizar hotel     |
| DELETE | /hoteis/:id | JWT      | Remover hotel       |

---

## 💻 Rodando o Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação disponível em: `http://localhost:5173`

### Páginas disponíveis

| Rota       | Proteção | Descrição                     |
| ---------- | -------- | ----------------------------- |
| /          | Pública  | Tela de login                 |
| /dashboard | JWT      | Painel de controle            |
| /hoteis    | JWT      | Listagem e gestão de hotéis   |
| /hospedes  | JWT      | Listagem e gestão de hóspedes |
| /reservas  | JWT      | Listagem e gestão de reservas |

---

## 🗄️ Modelagem do Banco

```sql
hoteis       (id, nome, cidade, quantidade_quartos, criado_em)
hospedes     (id, nome, email, criado_em)
reservas     (id, hotel_id, hospede_id, data_entrada, data_saida, criado_em)
```

---

## 📌 Status do Projeto

Projeto em desenvolvimento.

### ✅ Implementado

- Estrutura fullstack com React + Node.js
- Autenticação JWT (login, token, logout)
- Rotas protegidas no backend e frontend
- Sidebar de navegação com shadcn/ui
- CRUD completo de hotéis (backend + frontend)
- Listagem com busca em tempo real
- Notificações com Sonner
- Banco PostgreSQL via Docker

### 🔜 Em desenvolvimento

- CRUD de hóspedes
- CRUD de reservas
- Dashboard com métricas
- Documentação Swagger
