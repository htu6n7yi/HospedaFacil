import { Router } from "express";
import reservaRepository from "../repositories/reservaRepository.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Gerenciamento de reservas
 */

/**
 * @swagger
 * /reservas:
 *   get:
 *     summary: Listar todas as reservas
 *     tags: [Reservas]
 *     responses:
 *       200:
 *         description: Lista de reservas retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", async (req, res) => {
  try {
    const reservas = await reservaRepository.listar();
    res.json(reservas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar reservas." });
  }
});

/**
 * @swagger
 * /reservas/{id}:
 *   get:
 *     summary: Buscar reserva por ID
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     responses:
 *       200:
 *         description: Dados da reserva
 *       404:
 *         description: Reserva não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Criar nova reserva
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hospede_nome
 *               - hospede_email
 *               - hospede_tipo_documento
 *               - hospede_documento
 *               - hotel_id
 *               - quarto_id
 *               - data_entrada
 *               - data_saida
 *             properties:
 *               hospede_nome:
 *                 type: string
 *                 example: Maria Oliveira
 *               hospede_email:
 *                 type: string
 *                 example: maria@email.com
 *               hospede_tipo_documento:
 *                 type: string
 *                 example: CPF
 *               hospede_documento:
 *                 type: string
 *                 example: "123.456.789-00"
 *               hotel_id:
 *                 type: integer
 *                 example: 1
 *               quarto_id:
 *                 type: integer
 *                 example: 5
 *               data_entrada:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-10"
 *               data_saida:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-15"
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Campos obrigatórios ausentes ou data_saida anterior à data_entrada
 *       422:
 *         description: Quarto indisponível no período ou regra de negócio violada
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /reservas/{id}:
 *   put:
 *     summary: Atualizar dados de uma reserva
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_entrada:
 *                 type: string
 *                 format: date
 *               data_saida:
 *                 type: string
 *                 format: date
 *               quarto_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Reserva atualizada com sucesso
 *       400:
 *         description: data_saida anterior à data_entrada
 *       404:
 *         description: Reserva não encontrada
 *       422:
 *         description: Regra de negócio violada
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /reservas/{id}/status:
 *   patch:
 *     summary: Atualizar status de uma reserva
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, confirmada, cancelada]
 *                 example: confirmada
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Reserva não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Deletar reserva
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     responses:
 *       204:
 *         description: Reserva deletada com sucesso
 *       404:
 *         description: Reserva não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
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