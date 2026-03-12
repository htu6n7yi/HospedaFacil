# HospedaFacil

Aplicação **fullstack** para gerenciamento de hospedagens, permitindo cadastro de **hotéis, hóspedes e reservas**, com autenticação de usuários.

---

## 🚀 Tecnologias

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- JWT (JSON Web Token)

### Banco de Dados

- PostgreSQL

### Infraestrutura

- Docker
- Docker Compose

---

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Token)** para autenticação de usuários.

Fluxo de autenticação:

1. O usuário realiza login na aplicação
2. O backend valida as credenciais
3. Um **token JWT** é gerado e retornado ao cliente
4. O frontend envia o token nas requisições autenticadas via header:

```
Authorization: Bearer <token>
```

5. O backend valida o token para permitir acesso às rotas protegidas

---

## 📚 Documentação

Documentação técnica do projeto:

- [Arquitetura do Sistema](docs/architecture.md)
- [Modelagem do Banco de Dados](docs/database.md)

---

## 📁 Estrutura do Projeto

```
HospedaFacil
│
├── backend
│   └── API Node.js com Express
│
├── frontend
│   └── Aplicação React
│
├── docs
│   ├── architecture.md
│   └── database.md
│
├── docker-compose.yml
│
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de rodar o projeto, instale:

- Node.js
- Docker

---

## 🐳 Subindo o banco de dados

Para iniciar o PostgreSQL com Docker:

```
docker compose up -d
```

Ver containers ativos:

```
docker ps
```

---

## 🔌 Configuração do Banco

Banco PostgreSQL:

```
Host: localhost
Port: 5432
User: postgres
Password: postgres
Database: hospedafacil
```

---

## ▶️ Rodando o Backend

```
cd backend
npm install
npm run dev
```

Servidor rodará em:

```
http://localhost:3000
```

---

## 💻 Rodando o Frontend

```
cd frontend
npm install
npm run dev
```

Aplicação disponível em:

```
http://localhost:5173
```

---

## 📌 Status do Projeto

Projeto em desenvolvimento.

### ✅ Implementado até o momento

- Estrutura de projeto fullstack
- Backend Node.js com Express
- Frontend React + Vite + TypeScript
- Banco PostgreSQL via Docker Compose
- Autenticação com JWT
- Rotas protegidas no backend
- Documentação de arquitetura
- Modelagem do banco de dados