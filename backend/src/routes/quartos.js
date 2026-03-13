import { Router } from "express";
import quartoRepository from "../repositories/quartoRepository.js";

const router = Router();

// GET /quartos?hotel_id=...
router.get("/", async (req, res) => {
  try {
    const { hotel_id } = req.query;
    if (!hotel_id) {
      return res.status(400).json({ mensagem: "hotel_id é obrigatório." });
    }
    const quartos = await quartoRepository.listarPorHotel(hotel_id);
    res.json(quartos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar quartos." });
  }
});

// GET /quartos/disponiveis?hotel_id=...&data_entrada=...&data_saida=...
router.get("/disponiveis", async (req, res) => {
  try {
    const { hotel_id, data_entrada, data_saida } = req.query;

    if (!hotel_id || !data_entrada || !data_saida) {
      return res.status(400).json({
        mensagem: "hotel_id, data_entrada e data_saida são obrigatórios.",
      });
    }

    const quartos = await quartoRepository.listarDisponiveisPorHotel(
      hotel_id,
      data_entrada,
      data_saida
    );
    res.json(quartos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar quartos disponíveis." });
  }
});

// GET /quartos/:id
router.get("/:id", async (req, res) => {
  try {
    const quarto = await quartoRepository.buscarPorId(req.params.id);
    if (!quarto) {
      return res.status(404).json({ mensagem: "Quarto não encontrado." });
    }
    res.json(quarto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao buscar quarto." });
  }
});

// POST /quartos
router.post("/", async (req, res) => {
  try {
    const { hotel_id, numero, tipo, preco_noite } = req.body;

    if (!hotel_id || !numero || !tipo || preco_noite === undefined) {
      return res.status(400).json({
        mensagem: "hotel_id, numero, tipo e preco_noite são obrigatórios.",
      });
    }

    const tiposValidos = ["simples", "duplo", "suite"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        mensagem: `Tipo inválido. Use: ${tiposValidos.join(", ")}.`,
      });
    }

    const quarto = await quartoRepository.criar({ hotel_id, numero, tipo, preco_noite });
    res.status(201).json(quarto);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ mensagem: "Número de quarto já cadastrado neste hotel." });
    }
    res.status(500).json({ mensagem: "Erro ao cadastrar quarto." });
  }
});

// PUT /quartos/:id
router.put("/:id", async (req, res) => {
  try {
    const quarto = await quartoRepository.atualizar(req.params.id, req.body);
    if (!quarto) {
      return res.status(404).json({ mensagem: "Quarto não encontrado." });
    }
    res.json(quarto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao atualizar quarto." });
  }
});

// DELETE /quartos/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletado = await quartoRepository.deletar(req.params.id);
    if (!deletado) {
      return res.status(404).json({ mensagem: "Quarto não encontrado." });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao deletar quarto." });
  }
});

export default router;