import { Router } from "express";
import hospedeRepository from "../repositories/hospedeRepository.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Hóspedes
 *   description: Gerenciamento de hóspedes
 */

/**
 * @swagger
 * /hospedes:
 *   get:
 *     summary: Listar todos os hóspedes com suas reservas
 *     tags: [Hóspedes]
 *     responses:
 *       200:
 *         description: Lista de hóspedes com reservas vinculadas
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
 *                   email:
 *                     type: string
 *                   tipo_documento:
 *                     type: string
 *                   documento:
 *                     type: string
 *                   reservas:
 *                     type: array
 *                     items:
 *                       type: object
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", async (req, res) => {
  try {
    const hospedes = await hospedeRepository.listarComReservas();
    res.json(hospedes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao listar hóspedes." });
  }
});

/**
 * @swagger
 * /hospedes/reserva/{id}:
 *   get:
 *     summary: Buscar hóspede pelo ID de uma reserva
 *     tags: [Hóspedes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     responses:
 *       200:
 *         description: Dados do hóspede vinculado à reserva
 *       404:
 *         description: Hóspede não encontrado para essa reserva
 *       500:
 *         description: Erro interno do servidor
 */
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