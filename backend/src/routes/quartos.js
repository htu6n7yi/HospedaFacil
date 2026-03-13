import { Router } from "express";
import quartoRepository from "../repositories/quartoRepository.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Quartos
 *   description: Gerenciamento de quartos
 */

/**
 * @swagger
 * /quartos:
 *   get:
 *     summary: Listar quartos de um hotel
 *     tags: [Quartos]
 *     parameters:
 *       - in: query
 *         name: hotel_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do hotel
 *     responses:
 *       200:
 *         description: Lista de quartos do hotel
 *       400:
 *         description: hotel_id é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /quartos/disponiveis:
 *   get:
 *     summary: Listar quartos disponíveis de um hotel em um período
 *     tags: [Quartos]
 *     parameters:
 *       - in: query
 *         name: hotel_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do hotel
 *       - in: query
 *         name: data_entrada
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-10"
 *       - in: query
 *         name: data_saida
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-15"
 *     responses:
 *       200:
 *         description: Lista de quartos disponíveis no período
 *       400:
 *         description: hotel_id, data_entrada e data_saida são obrigatórios
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/disponiveis", async (req, res) => {
  try {
    const { hotel_id, data_entrada, data_saida } = req.query;
    if (!hotel_id || !data_entrada || !data_saida) {
      return res.status(400).json({ mensagem: "hotel_id, data_entrada e data_saida são obrigatórios." });
    }
    const quartos = await quartoRepository.listarDisponiveisPorHotel(hotel_id, data_entrada, data_saida);
    res.json(quartos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar quartos disponíveis." });
  }
});

/**
 * @swagger
 * /quartos/{id}:
 *   get:
 *     summary: Buscar quarto por ID
 *     tags: [Quartos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do quarto
 *     responses:
 *       200:
 *         description: Dados do quarto
 *       404:
 *         description: Quarto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /quartos:
 *   post:
 *     summary: Cadastrar novo quarto
 *     tags: [Quartos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hotel_id, numero, tipo, preco_noite]
 *             properties:
 *               hotel_id:
 *                 type: integer
 *                 example: 1
 *               numero:
 *                 type: string
 *                 example: "101"
 *               tipo:
 *                 type: string
 *                 enum: [simples, duplo, suite]
 *                 example: duplo
 *               preco_noite:
 *                 type: number
 *                 example: 250.00
 *     responses:
 *       201:
 *         description: Quarto criado com sucesso
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       409:
 *         description: Número de quarto já cadastrado neste hotel
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", async (req, res) => {
  try {
    const { hotel_id, numero, tipo, preco_noite } = req.body;
    if (!hotel_id || !numero || !tipo || preco_noite === undefined) {
      return res.status(400).json({ mensagem: "hotel_id, numero, tipo e preco_noite são obrigatórios." });
    }
    const tiposValidos = ["simples", "duplo", "suite"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ mensagem: `Tipo inválido. Use: ${tiposValidos.join(", ")}.` });
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

/**
 * @swagger
 * /quartos/{id}:
 *   put:
 *     summary: Atualizar dados de um quarto
 *     tags: [Quartos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do quarto
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [simples, duplo, suite]
 *               preco_noite:
 *                 type: number
 *     responses:
 *       200:
 *         description: Quarto atualizado com sucesso
 *       404:
 *         description: Quarto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /quartos/{id}:
 *   delete:
 *     summary: Remover quarto
 *     tags: [Quartos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do quarto
 *     responses:
 *       204:
 *         description: Quarto removido com sucesso
 *       404:
 *         description: Quarto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
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