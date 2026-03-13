export interface HospedeReserva {
  reserva_id: string;
  hotel_nome: string;
  quarto_numero: string;
  data_entrada: string;
  data_saida: string;
  status: "pendente" | "confirmada" | "cancelada";
}

export interface Hospede {
  id: string;
  nome: string;
  email: string;
  tipo_documento: "cpf" | "passaporte";
  documento: string;
  criado_em: string;
  reservas: HospedeReserva[] | null;
}
