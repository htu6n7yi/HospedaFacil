export interface Hotel {
  id: string;
  nome: string;
  cidade: string;
  quantidade_quartos: number;
  criado_em: string;
}

export interface HotelPayload {
  nome: string;
  cidade: string;
  quantidade_quartos: number;
  tipo_quarto_padrao: "simples" | "duplo" | "suite";
  preco_noite_padrao: number;
}