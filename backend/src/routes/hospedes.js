import { Router } from "express";
import hospedeRepository from "../repositories/hospedeRepository.js";

const router = Router();

// GET /hospedes
router.get("/", async (req, res) => {
  try {
    const hospedes = await hospedeRepository.listarComReservas();
    res.json(hospedes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar hóspedes." });
  }
});

// GET /hospedes/reserva/:id
router.get("/reserva/:id", async (req, res) => {
  try {
    const hospede = await hospedeRepository.buscarPorReserva(req.params.id);
    if (!hospede) {
      return res.status(404).json({ mensagem: "Hóspede não encontrado para essa reserva." });
    }
    res.json(hospede);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao buscar hóspede." });
  }
});

export default router;
