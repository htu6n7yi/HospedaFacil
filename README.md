# HospedaFacil

Aplicação **fullstack** para gerenciamento de hospedagens, permitindo cadastro de **hotéis, quartos, hóspedes e reservas**, com autenticação de usuários.

🌐 **Demo:** [https://hospeda-facil.vercel.app](https://hospeda-facil.vercel.app)
📦 **Repositório:** [https://github.com/htu6n7yi/HospedaFacil](https://github.com/htu6n7yi/HospedaFacil)

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
- swagger-jsdoc + swagger-ui-express
- cors
- dotenv

### Banco de Dados

- PostgreSQL 15

### Infraestrutura

- Docker + Docker Compose (local)
- Vercel (frontend)
- Render (backend + banco de dados)

---

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Token)** para autenticação de usuários.

**Credenciais de acesso (ambiente de desenvolvimento):**

```
Usuário: admin
Senha:   123456
```

Fluxo de autenticação:

1. O usuário realiza login na aplicação
2. O backend valida as credenciais
3. Um **token JWT** é gerado e retornado ao cliente (expira em **8h**)
4. O frontend armazena o token e o envia nas requisições via header:

```
Authorization: Bearer <token>
```

5. O backend valida o token para permitir acesso às rotas protegidas
6. Rotas protegidas no frontend redirecionam para o login caso o token seja inválido ou ausente

---

## 📚 Documentação da API

A documentação Swagger está disponível em:

- **Local:** `http://localhost:3000/docs`
- **Produção:** `<URL_DO_BACKEND>/docs`

Todos os endpoints estão documentados com parâmetros, request bodies, exemplos e códigos de resposta.

---

## 📁 Estrutura do Projeto

```
HospedaFacil/
│
├── backend/
│   ├── src/
│   │   ├── database/         # Conexão com PostgreSQL
│   │   ├── middlewares/      # Middleware JWT
│   │   ├── repositories/     # Queries do banco (padrão Repository)
│   │   │   ├── hotelRepository.js
│   │   │   ├── quartoRepository.js
│   │   │   ├── hospedeRepository.js
│   │   │   └── reservaRepository.js
│   │   ├── routes/           # Rotas da API (com JSDoc Swagger)
│   │   │   ├── auth.js
│   │   │   ├── hoteis.js
│   │   │   ├── quartos.js
│   │   │   ├── hospedes.js
│   │   │   ├── reservas.js
│   │   │   └── dashboard.js
│   │   ├── swagger.js        # Configuração do Swagger
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

## 🐳 Subindo o Ambiente Local

### 1. Clone o repositório

```bash
git clone https://github.com/htu6n7yi/HospedaFacil.git
cd HospedaFacil
```

### 2. Suba o banco de dados via Docker

```bash
docker compose up -d
```

Verifique se o container está rodando:

```bash
docker ps
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospedafacil
JWT_SECRET=sua_chave_secreta
PORT=3000
```

Crie o arquivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Inicialize o banco de dados

```bash
docker exec -i hospedafacil_postgres psql -U postgres -d hospedafacil < backend/schema.sql
```

### 6. Suba o projeto

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

## 🔌 Configuração do Banco

### Local (Docker)

```
Host:     localhost
Port:     5432
User:     postgres
Password: postgres
Database: hospedafacil
```

### Produção (Render)

A `DATABASE_URL` completa é configurada como variável de ambiente no painel do Render. Para rodar o schema em produção:

```bash
psql "SUA_DATABASE_URL" -f backend/schema.sql
```

---

## 🗄️ Modelagem do Banco

```sql
hoteis   (id UUID, nome, cidade, quantidade_quartos, criado_em)

quartos  (id UUID, hotel_id → hoteis, numero, tipo ENUM(simples,duplo,suite),
          preco_noite, criado_em)

hospedes (id UUID, nome, email UNIQUE, tipo_documento ENUM(cpf,passaporte),
          documento, criado_em)

reservas (id UUID, hotel_id → hoteis, quarto_id → quartos,
          hospede_id → hospedes, data_entrada, data_saida,
          status ENUM(pendente,confirmada,cancelada), criado_em)
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

### Dashboard

| Método | Rota       | Proteção | Descrição                                         |
| ------ | ---------- | -------- | ------------------------------------------------- |
| GET    | /dashboard | JWT      | Métricas gerais, ocupação, check-ins e check-outs |

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

## 🧠 Decisões Técnicas

**Padrão Repository:** toda lógica de acesso ao banco está isolada em repositórios por entidade, separando queries das rotas. Para alterar uma query basta mexer no repositório sem tocar no comportamento das rotas.

**Hóspede por e-mail:** ao criar uma reserva, o sistema busca um hóspede existente pelo e-mail antes de criar um novo. Isso evita duplicatas e mantém o histórico centralizado por hóspede.

**UUIDs como chave primária:** todas as tabelas usam `UUID` em vez de `SERIAL`. Isso evita colisões em cenários de múltiplas instâncias ou migração de dados, e é mais seguro para expor IDs em URLs públicas.

**Validação de disponibilidade no banco:** a verificação de quartos disponíveis é feita diretamente via SQL com subqueries, garantindo consistência mesmo com múltiplas requisições simultâneas, sem depender de lógica no servidor.

**Swagger via JSDoc:** a documentação é gerada automaticamente a partir de comentários nas rotas, mantendo docs e código sempre sincronizados sem arquivos separados.

**ENUMs no banco:** valores como `status` e `tipo_quarto` são controlados pelo PostgreSQL, evitando inconsistências causadas por strings soltas no código.

---

## ❓ Perguntas Finais

### 1️⃣ Investigação de Bug

**Cenário:** cliente reporta que uma reserva foi criada mas não aparece na listagem.

Minha abordagem seria investigar em camadas:

1. **Confirmar no banco** se a reserva realmente existe:
   ```sql
   SELECT * FROM reservas WHERE id = '<id_reportado>';
   ```
2. **Verificar o status** — a reserva pode estar com `cancelada` e o frontend pode estar filtrando por padrão sem avisar o usuário.
3. **Inspecionar a query de listagem** no `reservaRepository.js` para ver se há algum filtro implícito que exclua a reserva.
4. **Checar os logs do backend** no momento da criação para identificar algum erro silenciado que tenha interrompido a gravação.
5. **Testar o endpoint diretamente** via Swagger (`/docs`) ou curl para isolar se o problema está na API ou apenas no frontend.
6. **Verificar o token JWT** — se expirou entre a criação e a listagem, o frontend pode ter falhado silenciosamente na requisição de listagem.

Na maioria dos casos esse tipo de bug é causado por um filtro não intencional na query ou por um erro de estado no frontend após uma requisição bem-sucedida.

---

### 2️⃣ Manutenção de Sistema

As partes que estruturei pensando em facilidade de manutenção:

- **Padrão Repository:** para alterar uma query basta mexer em um único arquivo, sem risco de quebrar as rotas.
- **Rotas limpas:** as rotas fazem apenas validação de entrada e delegam para os repositórios, sem lógica de negócio misturada.
- **Swagger por JSDoc:** a documentação fica no mesmo arquivo da rota — quando a rota muda, o desenvolvedor atualiza o comentário no mesmo lugar.
- **ENUMs no banco:** valores controlados pelo PostgreSQL evitam inconsistências que seriam difíceis de rastrear.
- **Variáveis de ambiente:** nenhuma credencial de produção está hardcoded no código, facilitando trocar configurações sem alterar o sistema.

---

### 3️⃣ Escalabilidade

Se o sistema começasse a receber milhares de reservas por dia:

- **Índices no banco:** adicionar índices em `data_entrada`, `data_saida`, `status` e `hotel_id` para acelerar as queries de disponibilidade e dashboard, que são as mais pesadas.
- **Paginação server-side:** as listagens precisariam retornar dados paginados para não carregar milhares de registros por requisição.
- **Cache com Redis:** cachear resultados do dashboard e da listagem de hotéis, que mudam pouco mas são consultados com frequência.
- **Pool de conexões configurado:** ajustar os limites do `pg.Pool` para suportar mais conexões simultâneas sem sobrecarregar o banco.
- **Filas para operações assíncronas:** envio de e-mail de confirmação e outras operações secundárias processadas em background via Bull/BullMQ.
- **Rate limiting:** limitar requisições por IP para proteger os endpoints de abuso.
- **Réplica de leitura:** em escala muito alta, separar banco de leitura (replica) do de escrita para distribuir a carga entre as queries de dashboard e as escritas de reservas.

---

### 4️⃣ Aprendizado

Se tivesse mais tempo, gostaria de melhorar:

- **Testes automatizados:** implementar testes de integração nas rotas com Jest e Supertest, cobrindo principalmente os fluxos de criação de reserva e validação de disponibilidade.
- **Middleware global de erros:** criar um handler centralizado no Express para padronizar todas as respostas de erro da API em vez de tratar individualmente em cada rota.
- **Autenticação com usuários reais:** substituir as credenciais fixas por uma tabela `usuarios` no banco, com senhas hasheadas via bcrypt e suporte a múltiplos usuários com níveis de permissão.
- **Histórico de alterações:** registrar um log de mudanças de status de reservas para ter rastreabilidade de quem alterou o quê e quando.
- **Melhorias no Dashboard:** adicionar gráficos de ocupação por período e receita estimada com base nas reservas confirmadas.
- **IA integrada para gestão:** implementar um assistente de IA dentro do sistema capaz de responder perguntas sobre ocupação, sugerir precificação dinâmica com base na demanda, identificar padrões de cancelamento e gerar resumos automáticos do dashboard — reduzindo o tempo gasto em análise manual e tornando a tomada de decisão mais ágil para os gestores.

---

## 📌 Status do Projeto

### ✅ Implementado

- Estrutura fullstack com React + Node.js
- Autenticação JWT (login, token 8h, logout)
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
- Dashboard com métricas em tempo real (ocupação, check-ins, check-outs)
- Documentação Swagger em `/docs` com todos os endpoints documentados
- Notificações com Sonner
- Banco PostgreSQL via Docker (local) e Render (produção)
- Deploy do frontend na Vercel
- Deploy do backend e banco na Render
- `npm run dev` na raiz sobe front e back simultaneamente

### 🔜 Em desenvolvimento

- Testes automatizados
- Paginação nas listagens
- Middleware global de tratamento de erros
- Autenticação com usuários reais e bcrypt
