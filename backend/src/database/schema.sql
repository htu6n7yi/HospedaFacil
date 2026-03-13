CREATE TABLE IF NOT EXISTS hoteis (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    quantidade_quartos INTEGER DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospedes (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE tipo_quarto AS ENUM ('simples', 'duplo', 'suite');

CREATE TABLE IF NOT EXISTS quartos (
    id UUID PRIMARY KEY,
    hotel_id UUID REFERENCES hoteis(id) ON DELETE CASCADE,
    numero VARCHAR(10) NOT NULL,
    tipo tipo_quarto NOT NULL DEFAULT 'simples',
    preco_noite NUMERIC(10, 2) NOT NULL DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (hotel_id, numero)
);

CREATE TYPE status_reserva AS ENUM ('pendente', 'confirmada', 'cancelada');

CREATE TABLE IF NOT EXISTS reservas (
    id UUID PRIMARY KEY,
    hotel_id UUID REFERENCES hoteis(id),
    quarto_id UUID REFERENCES quartos(id),
    hospede_id UUID REFERENCES hospedes(id),
    data_entrada DATE NOT NULL,
    data_saida DATE NOT NULL,
    status status_reserva NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);