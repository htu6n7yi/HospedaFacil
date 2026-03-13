import api from "./api";
import type { Hotel, HotelPayload } from "@/types/hotel.types";

export interface HotelDisponibilidade extends Hotel {
  quartos_disponiveis: number;
  disponivel: boolean;
}

const hotelService = {
  async listar(): Promise<Hotel[]> {
    const { data } = await api.get<Hotel[]>("/hoteis");
    return data;
  },

  async buscarPorId(id: string): Promise<Hotel> {
    const { data } = await api.get<Hotel>(`/hoteis/${id}`);
    return data;
  },

  async verificarDisponibilidade(
    data_entrada: string,
    data_saida: string
  ): Promise<HotelDisponibilidade[]> {
    const { data } = await api.get<HotelDisponibilidade[]>("/hoteis/disponibilidade", {
      params: { data_entrada, data_saida },
    });
    return data;
  },

  async criar(payload: HotelPayload): Promise<Hotel> {
    const { data } = await api.post<Hotel>("/hoteis", payload);
    return data;
  },

  async atualizar(id: string, payload: HotelPayload): Promise<Hotel> {
    const { data } = await api.put<Hotel>(`/hoteis/${id}`, payload);
    return data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/hoteis/${id}`);
  },
};

export default hotelService;