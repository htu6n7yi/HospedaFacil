# HospedaFacil

Aplicação **fullstack** para gerenciamento de hospedagens, permitindo cadastro de **hotéis, quartos, hóspedes e reservas**, com autenticação de usuários.

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
│   │   │   ├── hotelRepository.js
│   │   │   ├── quartoRepository.js
│   │   │   ├── hospedeRepository.js
│   │   │   └── reservaRepository.js
│   │   ├── routes/           # Rotas da API
│   │   │   ├── auth.js
│   │   │   ├── hoteis.js
│   │   │   ├── quartos.js
│   │   │   ├── hospedes.js
│   │   │   └── reservas.js
│   │   └── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis (PrivateRoute, shadcn/ui)
│   │   ├── layouts/          # AppLayout com sidebar
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   ├── Hoteis/
│   │   │   ├── Hospedes/
│   │   │   └── Reservas/
│   │   ├── routes/           # Configuração de rotas
│   │   ├── services/         # Comunicação com a API
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── hotelService.ts
│   │   │   └── reservaService.ts
│   │   └── types/            # Tipos TypeScript
│   │       ├── hotel.types.ts
│   │       └── reserva.types.ts
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

## ▶️ Rodando o Projeto

Na raiz do projeto:

```bash
npm run dev
```

Isso sobe o **backend** e o **frontend** simultaneamente via `concurrently`.

Ou separadamente:

```bash
npm run dev:back   # http://localhost:3000
npm run dev:front  # http://localhost:5173
```

---

## 🔌 Rotas da API

### Autenticação

| Método | Rota        | Proteção | Descrição        |
| ------ | ----------- | -------- | ---------------- |
| POST   | /auth/login | Pública  | Login do usuário |
| GET    | /perfil     | JWT      | Valida token     |
| GET    | /health     | Pública  | Status da API    |

### Hotéis

| Método | Rota                    | Proteção | Descrição                           |
| ------ | ----------------------- | -------- | ----------------------------------- |
| GET    | /hoteis                 | JWT      | Listar hotéis                       |
| GET    | /hoteis/:id             | JWT      | Buscar hotel por ID                 |
| GET    | /hoteis/disponibilidade | JWT      | Hotéis disponíveis por período      |
| POST   | /hoteis                 | JWT      | Cadastrar hotel (cria quartos auto) |
| PUT    | /hoteis/:id             | JWT      | Atualizar hotel                     |
| DELETE | /hoteis/:id             | JWT      | Remover hotel                       |

### Quartos

| Método | Rota                 | Proteção | Descrição                       |
| ------ | -------------------- | -------- | ------------------------------- |
| GET    | /quartos             | JWT      | Listar quartos por hotel        |
| GET    | /quartos/disponiveis | JWT      | Quartos disponíveis por período |
| GET    | /quartos/:id         | JWT      | Buscar quarto por ID            |
| POST   | /quartos             | JWT      | Cadastrar quarto                |
| PUT    | /quartos/:id         | JWT      | Atualizar quarto                |
| DELETE | /quartos/:id         | JWT      | Remover quarto                  |

### Hóspedes

| Método | Rota                  | Proteção | Descrição           |
| ------ | --------------------- | -------- | ------------------- |
| GET    | /hospedes             | JWT      | Listar hóspedes     |
| GET    | /hospedes/reserva/:id | JWT      | Hóspede por reserva |

### Reservas

| Método | Rota                 | Proteção | Descrição             |
| ------ | -------------------- | -------- | --------------------- |
| GET    | /reservas            | JWT      | Listar reservas       |
| GET    | /reservas/:id        | JWT      | Buscar reserva por ID |
| POST   | /reservas            | JWT      | Cadastrar reserva     |
| PUT    | /reservas/:id        | JWT      | Atualizar reserva     |
| PATCH  | /reservas/:id/status | JWT      | Atualizar status      |
| DELETE | /reservas/:id        | JWT      | Remover reserva       |

---

## 💻 Páginas do Frontend

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
hoteis   (id UUID, nome, cidade, quantidade_quartos, criado_em)

quartos  (id UUID, hotel_id → hoteis, numero, tipo ENUM(simples,duplo,suite),
          preco_noite, criado_em)

hospedes (id UUID, nome, email UNIQUE, criado_em)

reservas (id UUID, hotel_id → hoteis, quarto_id → quartos,
          hospede_id → hospedes, data_entrada, data_saida,
          status ENUM(pendente,confirmada,cancelada), criado_em)
```

---

## 📌 Status do Projeto

Projeto em desenvolvimento.

### ✅ Implementado

- Estrutura fullstack com React + Node.js
- Autenticação JWT (login, token, logout)
- Rotas protegidas no backend e frontend
- Sidebar de navegação com shadcn/ui
- CRUD completo de hotéis com criação automática de quartos
- CRUD completo de quartos (número, tipo, preço por noite)
- CRUD completo de reservas com validação de disponibilidade
- Fluxo de reserva em 4 steps com cards de hotel e quarto
- Verificação de disponibilidade em tempo real por período
- Hóspede criado/reutilizado automaticamente pelo e-mail
- Controle de status de reserva (pendente, confirmada, cancelada)
- Listagem de hóspedes vinculada às reservas
- Notificações com Sonner
- Banco PostgreSQL via Docker
- `npm run dev` na raiz sobe front e back simultaneamente

### 🔜 Em desenvolvimento

- Dashboard com métricas
- Documentação Swagger
