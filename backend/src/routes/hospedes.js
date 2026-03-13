import { Router } from "express";
import hospedeRepository from "../repositories/hospedeRepository.js";

const router = Router();

// GET /hospedes — lista todos os hóspedes com suas reservas
router.get("/", async (req, res) => {
  try {
    const hospedes = await hospedeRepository.listarComReservas();
    res.json(hospedes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar hóspedes." });
  }
});

// GET /hospedes/reserva/:reserva_id — busca hóspede de uma reserva específica
router.get("/reserva/:reserva_id", async (req, res) => {
  try {
    const hospede = await hospedeRepository.buscarPorReserva(req.params.reserva_id);
    if (!hospede) {
      return res.status(404).json({ mensagem: "Hóspede não encontrado para esta reserva." });
    }
    res.json(hospede);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao buscar hóspede." });
  }
});

export default router;