# Arquitetura do Sistema

## Visão Geral

A aplicação **HospedaFácil** segue uma arquitetura **Fullstack Web**, composta por três camadas principais:

* **Frontend** → Interface do usuário
* **Backend** → API e lógica de negócio
* **Banco de Dados** → Persistência das informações

A comunicação entre as camadas ocorre através de **requisições HTTP REST** entre o frontend e o backend.

---

# Arquitetura Backend

O backend foi estruturado utilizando **Arquitetura em Camadas (Layered Architecture)**.

Esse padrão organiza o código separando responsabilidades em diferentes camadas, facilitando manutenção, escalabilidade e legibilidade do projeto.

As principais camadas são:

* Routes
* Controllers
* Services
* Repositories
* Database

---

# Fluxo da Aplicação

O fluxo de uma requisição segue a seguinte ordem:

Routes → Controllers → Services → Repositories → Database

1. O cliente (frontend) envia uma requisição HTTP.
2. A requisição é recebida pela camada de **Routes**.
3. A rota direciona a requisição para o **Controller** correspondente.
4. O **Controller** processa a entrada e chama a camada de **Services**.
5. A **Service** executa a lógica de negócio da aplicação.
6. A **Repository** realiza operações no banco de dados.
7. O resultado retorna ao cliente em formato **JSON**.

---

# Camadas da Aplicação

## Routes

Responsáveis por definir os **endpoints da API** e direcionar as requisições para os controllers apropriados.

Exemplos de endpoints:

GET /hoteis
POST /hospedes
POST /reservas
GET /reservas

---

## Controllers

Responsáveis por:

* Receber requisições HTTP
* Validar dados de entrada
* Acionar a camada de serviços
* Retornar respostas para o cliente

Os controllers atuam como intermediários entre as rotas e a lógica de negócio.

---

## Services

A camada de **Services** contém a lógica de negócio da aplicação.

Exemplos de responsabilidades:

* Criar reservas
* Validar disponibilidade de hotéis
* Regras de check-in e check-out

Essa separação permite que as regras de negócio não fiquem acopladas ao controller.

---

## Repositories

Responsáveis pela comunicação direta com o banco de dados.

Funções comuns:

* Inserir registros
* Buscar dados
* Atualizar informações
* Remover registros

Essa camada abstrai a lógica de persistência.

---

# Banco de Dados

O sistema utiliza **PostgreSQL** como banco de dados relacional.

A modelagem inclui três entidades principais:

* Hotéis
* Hóspedes
* Reservas

O relacionamento entre essas entidades está documentado no arquivo **database.md**.

---

# Infraestrutura

O banco de dados é executado utilizando **Docker Compose**, garantindo que o ambiente de desenvolvimento seja reproduzível.

O container inicia automaticamente um serviço PostgreSQL, permitindo que o backend se conecte ao banco sem necessidade de instalação manual.

---

# Estrutura do Projeto

Estrutura simplificada do backend:

```
backend
│
├── controllers
├── services
├── repositories
├── routes
├── models
├── config
└── app.js
```

---

# Benefícios da Arquitetura

A adoção da arquitetura em camadas proporciona:

* separação clara de responsabilidades
* maior organização do código
* facilidade de manutenção
* maior escalabilidade da aplicação
* facilidade para implementação de testes
