import api from "./api";
import type { Hospede } from "@/types/hospede.types";

const hospedeService = {
  async listar(): Promise<Hospede[]> {
    const { data } = await api.get<Hospede[]>("/hospedes");
    return data;
  },

  async buscarPorReserva(reserva_id: string): Promise<Hospede> {
    const { data } = await api.get<Hospede>(`/hospedes/reserva/${reserva_id}`);
    return data;
  },
};

export default hospedeService;
