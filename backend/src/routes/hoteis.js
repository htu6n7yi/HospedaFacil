import { Router } from "express";
import hotelRepository from "../repositories/hotelRepository.js";
import pool from "../database/database.js";

const router = Router();

// GET /hoteis
router.get("/", async (req, res) => {
  try {
    const hoteis = await hotelRepository.listar();
    res.json(hoteis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar hotéis." });
  }
});

// GET /hoteis/disponibilidade?data_entrada=...&data_saida=...
router.get("/disponibilidade", async (req, res) => {
  try {
    const { data_entrada, data_saida } = req.query;

    if (!data_entrada || !data_saida) {
      return res.status(400).json({ mensagem: "data_entrada e data_saida são obrigatórios." });
    }

    const { rows } = await pool.query(`
      SELECT
        h.*,
        COUNT(q.id) FILTER (
          WHERE q.id NOT IN (
            SELECT r.quarto_id FROM reservas r
            WHERE r.hotel_id    = h.id
              AND r.status     != 'cancelada'
              AND r.data_entrada < $2
              AND r.data_saida   > $1
          )
        ) AS quartos_disponiveis
      FROM hoteis h
      LEFT JOIN quartos q ON q.hotel_id = h.id
      GROUP BY h.id
      ORDER BY h.nome
    `, [data_entrada, data_saida]);

    const resultado = rows.map((h) => ({
      ...h,
      quartos_disponiveis: parseInt(h.quartos_disponiveis) || 0,
      disponivel: (parseInt(h.quartos_disponiveis) || 0) > 0,
    }));

    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao verificar disponibilidade." });
  }
});

// GET /hoteis/:id
router.get("/:id", async (req, res) => {
  try {
    const hotel = await hotelRepository.buscarPorId(req.params.id);
    if (!hotel) return res.status(404).json({ mensagem: "Hotel não encontrado." });
    res.json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao buscar hotel." });
  }
});

// POST /hoteis
router.post("/", async (req, res) => {
  try {
    const { nome, cidade, quantidade_quartos, tipo_quarto_padrao, preco_noite_padrao } = req.body;

    if (!nome || !cidade) {
      return res.status(400).json({ mensagem: "nome e cidade são obrigatórios." });
    }

    if (quantidade_quartos && quantidade_quartos > 0) {
      if (!tipo_quarto_padrao) {
        return res.status(400).json({ mensagem: "tipo_quarto_padrao é obrigatório quando quantidade_quartos > 0." });
      }
      const tiposValidos = ["simples", "duplo", "suite"];
      if (!tiposValidos.includes(tipo_quarto_padrao)) {
        return res.status(400).json({ mensagem: `Tipo inválido. Use: ${tiposValidos.join(", ")}.` });
      }
      if (preco_noite_padrao === undefined || preco_noite_padrao === null) {
        return res.status(400).json({ mensagem: "preco_noite_padrao é obrigatório quando quantidade_quartos > 0." });
      }
    }

    const hotel = await hotelRepository.criar({
      nome, cidade, quantidade_quartos, tipo_quarto_padrao, preco_noite_padrao,
    });

    res.status(201).json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao cadastrar hotel." });
  }
});

// PUT /hoteis/:id
router.put("/:id", async (req, res) => {
  try {
    const hotel = await hotelRepository.atualizar(req.params.id, req.body);
    if (!hotel) return res.status(404).json({ mensagem: "Hotel não encontrado." });
    res.json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao atualizar hotel." });
  }
});

// DELETE /hoteis/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletado = await hotelRepository.deletar(req.params.id);
    if (!deletado) return res.status(404).json({ mensagem: "Hotel não encontrado." });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao deletar hotel." });
  }
});

export default router;