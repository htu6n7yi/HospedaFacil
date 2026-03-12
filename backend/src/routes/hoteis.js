import { Router } from "express";
import hotelRepository from "../repositories/hotelRepository.js";

const router = Router();

// GET /hoteis — lista todos
router.get("/", async (req, res) => {
  try {
    const hoteis = await hotelRepository.listar();
    res.json(hoteis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar hotéis." });
  }
});

// GET /hoteis/:id — busca por id
router.get("/:id", async (req, res) => {
  try {
    const hotel = await hotelRepository.buscarPorId(req.params.id);
    if (!hotel) {
      return res.status(404).json({ mensagem: "Hotel não encontrado." });
    }
    res.json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao buscar hotel." });
  }
});

// POST /hoteis — cadastra novo
router.post("/", async (req, res) => {
  try {
    const { nome, cidade, quantidade_quartos } = req.body;

    if (!nome || !cidade) {
      return res.status(400).json({ mensagem: "nome e cidade são obrigatórios." });
    }

    const hotel = await hotelRepository.criar({ nome, cidade, quantidade_quartos });
    res.status(201).json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao cadastrar hotel." });
  }
});

// PUT /hoteis/:id — atualiza
router.put("/:id", async (req, res) => {
  try {
    const hotel = await hotelRepository.atualizar(req.params.id, req.body);
    if (!hotel) {
      return res.status(404).json({ mensagem: "Hotel não encontrado." });
    }
    res.json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao atualizar hotel." });
  }
});

// DELETE /hoteis/:id — remove
router.delete("/:id", async (req, res) => {
  try {
    const deletado = await hotelRepository.deletar(req.params.id);
    if (!deletado) {
      return res.status(404).json({ mensagem: "Hotel não encontrado." });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao deletar hotel." });
  }
});

export default router;