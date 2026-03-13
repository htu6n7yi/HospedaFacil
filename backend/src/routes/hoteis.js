import { Router } from "express";
import hotelRepository from "../repositories/hotelRepository.js";
import pool from "../database/database.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Hotéis
 *   description: Gerenciamento de hotéis
 */

/**
 * @swagger
 * /hoteis:
 *   get:
 *     summary: Listar todos os hotéis
 *     tags: [Hotéis]
 *     responses:
 *       200:
 *         description: Lista de hotéis retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", async (req, res) => {
  try {
    const hoteis = await hotelRepository.listar();
    res.json(hoteis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar hotéis." });
  }
});

/**
 * @swagger
 * /hoteis/disponibilidade:
 *   get:
 *     summary: Verificar disponibilidade de quartos por período
 *     tags: [Hotéis]
 *     parameters:
 *       - in: query
 *         name: data_entrada
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-10"
 *         description: Data de entrada (YYYY-MM-DD)
 *       - in: query
 *         name: data_saida
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-15"
 *         description: Data de saída (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de hotéis com quantidade de quartos disponíveis no período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   cidade:
 *                     type: string
 *                   quartos_disponiveis:
 *                     type: integer
 *                   disponivel:
 *                     type: boolean
 *       400:
 *         description: data_entrada e data_saida são obrigatórios
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /hoteis/{id}:
 *   get:
 *     summary: Buscar hotel por ID
 *     tags: [Hotéis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do hotel
 *     responses:
 *       200:
 *         description: Dados do hotel
 *       404:
 *         description: Hotel não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /hoteis:
 *   post:
 *     summary: Cadastrar novo hotel
 *     tags: [Hotéis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, cidade]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Hotel Mar Azul
 *               cidade:
 *                 type: string
 *                 example: Fortaleza
 *               quantidade_quartos:
 *                 type: integer
 *                 example: 10
 *                 description: Se > 0, os campos abaixo são obrigatórios
 *               tipo_quarto_padrao:
 *                 type: string
 *                 enum: [simples, duplo, suite]
 *                 example: duplo
 *               preco_noite_padrao:
 *                 type: number
 *                 example: 250.00
 *     responses:
 *       201:
 *         description: Hotel criado com sucesso
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       500:
 *         description: Erro interno do servidor
 */
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
    const hotel = await hotelRepository.criar({ nome, cidade, quantidade_quartos, tipo_quarto_padrao, preco_noite_padrao });
    res.status(201).json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao cadastrar hotel." });
  }
});

/**
 * @swagger
 * /hoteis/{id}:
 *   put:
 *     summary: Atualizar dados de um hotel
 *     tags: [Hotéis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do hotel
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cidade:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hotel atualizado com sucesso
 *       404:
 *         description: Hotel não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /hoteis/{id}:
 *   delete:
 *     summary: Remover hotel
 *     tags: [Hotéis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do hotel
 *     responses:
 *       204:
 *         description: Hotel removido com sucesso
 *       404:
 *         description: Hotel não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
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