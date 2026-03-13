import api from "./api";
import type { Reserva, ReservaPayload, StatusReserva, Quarto } from "@/types/reserva.types";

const reservaService = {
  async listar(): Promise<Reserva[]> {
    const { data } = await api.get<Reserva[]>("/reservas");
    return data;
  },

  async buscarPorId(id: string): Promise<Reserva> {
    const { data } = await api.get<Reserva>(`/reservas/${id}`);
    return data;
  },

  async criar(payload: ReservaPayload): Promise<Reserva> {
    const { data } = await api.post<Reserva>("/reservas", payload);
    return data;
  },

  async atualizarStatus(id: string, status: StatusReserva): Promise<Reserva> {
    const { data } = await api.patch<Reserva>(`/reservas/${id}/status`, { status });
    return data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/reservas/${id}`);
  },

  async listarQuartosDisponiveis(
    hotel_id: string,
    data_entrada: string,
    data_saida: string
  ): Promise<Quarto[]> {
    const { data } = await api.get<Quarto[]>("/quartos/disponiveis", {
      params: { hotel_id, data_entrada, data_saida },
    });
    return data;
  },
};

export default reservaService;