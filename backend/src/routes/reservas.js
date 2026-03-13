import { Router } from "express";
import reservaRepository from "../repositories/reservaRepository.js";

const router = Router();

// GET /reservas
router.get("/", async (req, res) => {
  try {
    const reservas = await reservaRepository.listar();
    res.json(reservas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar reservas." });
  }
});

// GET /reservas/:id
router.get("/:id", async (req, res) => {
  try {
    const reserva = await reservaRepository.buscarPorId(req.params.id);
    if (!reserva) return res.status(404).json({ mensagem: "Reserva não encontrada." });
    res.json(reserva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao buscar reserva." });
  }
});

// POST /reservas
router.post("/", async (req, res) => {
  try {
    const {
      hospede_nome, hospede_email,
      hospede_tipo_documento, hospede_documento,
      hotel_id, quarto_id, data_entrada, data_saida,
    } = req.body;

    if (!hospede_nome || !hospede_email || !hospede_tipo_documento || !hospede_documento ||
        !hotel_id || !quarto_id || !data_entrada || !data_saida) {
      return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
    }

    if (new Date(data_saida) <= new Date(data_entrada)) {
      return res.status(400).json({ mensagem: "A data de saída deve ser posterior à data de entrada." });
    }

    const reserva = await reservaRepository.criar({
      hospede_nome, hospede_email,
      hospede_tipo_documento, hospede_documento,
      hotel_id, quarto_id, data_entrada, data_saida,
    });

    res.status(201).json(reserva);
  } catch (err) {
    console.error(err);
    if (err.message) return res.status(422).json({ mensagem: err.message });
    res.status(500).json({ mensagem: "Erro ao cadastrar reserva." });
  }
});

// PUT /reservas/:id
router.put("/:id", async (req, res) => {
  try {
    const { data_entrada, data_saida } = req.body;
    if (data_entrada && data_saida && new Date(data_saida) <= new Date(data_entrada)) {
      return res.status(400).json({ mensagem: "A data de saída deve ser posterior à data de entrada." });
    }
    const reserva = await reservaRepository.atualizar(req.params.id, req.body);
    if (!reserva) return res.status(404).json({ mensagem: "Reserva não encontrada." });
    res.json(reserva);
  } catch (err) {
    console.error(err);
    if (err.message) return res.status(422).json({ mensagem: err.message });
    res.status(500).json({ mensagem: "Erro ao atualizar reserva." });
  }
});

// PATCH /reservas/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const statusValidos = ["pendente", "confirmada", "cancelada"];
    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({ mensagem: `Status inválido. Use: ${statusValidos.join(", ")}.` });
    }
    const reserva = await reservaRepository.atualizarStatus(req.params.id, status);
    if (!reserva) return res.status(404).json({ mensagem: "Reserva não encontrada." });
    res.json(reserva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao atualizar status." });
  }
});

// DELETE /reservas/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletado = await reservaRepository.deletar(req.params.id);
    if (!deletado) return res.status(404).json({ mensagem: "Reserva não encontrada." });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao deletar reserva." });
  }
});

export default router;
