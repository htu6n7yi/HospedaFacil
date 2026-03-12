import api from "./api";
import type { Hotel, HotelPayload } from "@/types/hotel.types";

const hotelService = {
  async listar(): Promise<Hotel[]> {
    const { data } = await api.get<Hotel[]>("/hoteis");
    return data;
  },

  async buscarPorId(id: string): Promise<Hotel> {
    const { data } = await api.get<Hotel>(`/hoteis/${id}`);
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