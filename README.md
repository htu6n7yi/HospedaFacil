# HospedaFacil

Aplicação fullstack para gerenciamento de hospedagens.

## 🚀 Tecnologias

### Frontend

* React
* TypeScript
* Vite

### Backend

* Node.js
* Express

### Banco de Dados

* PostgreSQL

### Infraestrutura

* Docker
* Docker Compose

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
├── docker-compose.yml
│
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de rodar o projeto, instale:

* Node.js
* Docker

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

### Estrutura inicial criada:

* Backend Node + Express
* Frontend React + Vite + TypeScript
* Banco PostgreSQL com Docker Compose
* Estrutura de projeto fullstack
