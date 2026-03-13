export interface Reserva {
  id: string;
  hotel_id: string;
  quarto_id: string;
  hospede_id: string;
  data_entrada: string;
  data_saida: string;
  status: "pendente" | "confirmada" | "cancelada";
  criado_em: string;
  hospede_nome: string;
  hospede_email: string;
  hospede_tipo_documento: "cpf" | "passaporte";
  hospede_documento: string;
  hotel_nome: string;
  hotel_cidade: string;
  quarto_numero: string;
  quarto_tipo: "simples" | "duplo" | "suite";
  quarto_preco_noite: number;
}

export interface ReservaPayload {
  hospede_nome: string;
  hospede_email: string;
  hospede_tipo_documento: "cpf" | "passaporte";
  hospede_documento: string;
  hotel_id: string;
  quarto_id: string;
  data_entrada: string;
  data_saida: string;
}

export type StatusReserva = "pendente" | "confirmada" | "cancelada";

export interface Quarto {
  id: string;
  hotel_id: string;
  numero: string;
  tipo: "simples" | "duplo" | "suite";
  preco_noite: number;
}