# Modelagem de Dados

A aplicação utiliza **PostgreSQL** como banco de dados relacional para gerenciar hotéis, quartos, hóspedes e reservas.

---

## Entidades

### Hotéis

| Campo              | Tipo      | Descrição                           |
| ------------------ | --------- | ----------------------------------- |
| id                 | UUID      | Identificador único do hotel (PK)   |
| nome               | VARCHAR   | Nome do hotel                       |
| cidade             | VARCHAR   | Cidade onde o hotel está localizado |
| quantidade_quartos | INTEGER   | Total de quartos do hotel           |
| criado_em          | TIMESTAMP | Data de criação do registro         |

---

### Quartos

| Campo       | Tipo                        | Descrição                              |
| ----------- | --------------------------- | -------------------------------------- |
| id          | UUID                        | Identificador único do quarto (PK)     |
| hotel_id    | UUID                        | Identificador do hotel (FK → hoteis)   |
| numero      | VARCHAR                     | Número do quarto                       |
| tipo        | ENUM(simples, duplo, suite) | Tipo do quarto                         |
| preco_noite | NUMERIC                     | Preço por noite                        |
| criado_em   | TIMESTAMP                   | Data de criação do registro            |

---

### Hóspedes

| Campo          | Tipo                      | Descrição                            |
| -------------- | ------------------------- | ------------------------------------ |
| id             | UUID                      | Identificador único do hóspede (PK)  |
| nome           | VARCHAR                   | Nome do hóspede                      |
| email          | VARCHAR                   | Email do hóspede (único)             |
| tipo_documento | ENUM(cpf, passaporte)     | Tipo do documento de identificação   |
| documento      | VARCHAR                   | Número do documento                  |
| criado_em      | TIMESTAMP                 | Data de criação do registro          |

---

### Reservas

| Campo        | Tipo                                  | Descrição                                    |
| ------------ | ------------------------------------- | -------------------------------------------- |
| id           | UUID                                  | Identificador único da reserva (PK)          |
| hotel_id     | UUID                                  | Identificador do hotel (FK → hoteis)         |
| quarto_id    | UUID                                  | Identificador do quarto (FK → quartos)       |
| hospede_id   | UUID                                  | Identificador do hóspede (FK → hospedes)     |
| data_entrada | DATE                                  | Data de check-in                             |
| data_saida   | DATE                                  | Data de check-out                            |
| status       | ENUM(pendente, confirmada, cancelada) | Status atual da reserva                      |
| criado_em    | TIMESTAMP                             | Data de criação da reserva                   |

---

## Relacionamentos

- Um **Hotel** pode ter **vários quartos**
- Um **Hotel** pode ter **várias reservas**
- Um **Quarto** pertence a **um hotel**
- Um **Quarto** pode ter **várias reservas**
- Um **Hóspede** pode ter **várias reservas**
- Cada **Reserva** pertence a **um hotel**, **um quarto** e **um hóspede**
```
Hotéis (1) ────< Quartos
Hotéis (1) ────< Reservas >──── (1) Hóspedes
Quartos (1) ───< Reservas
```

---

## Infraestrutura

O banco de dados é executado em um container **Docker** utilizando **Docker Compose**, garantindo um ambiente consistente e facilmente reproduzível para desenvolvimento local.

Em produção, o banco está hospedado no **Render (PostgreSQL 15)**, com a connection string configurada via variável de ambiente `DATABASE_URL`.
