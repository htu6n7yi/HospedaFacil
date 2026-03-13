import { Router } from "express";
import pool from "../database/database.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Métricas e estatísticas gerais do sistema
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obter métricas gerais do sistema
 *     tags: [Dashboard]
 *     description: >
 *       Retorna um conjunto completo de métricas em tempo real, incluindo
 *       totais de hotéis, quartos, hóspedes, reservas por status,
 *       taxa de ocupação, próximos check-ins/check-outs e últimas reservas cadastradas.
 *     responses:
 *       200:
 *         description: Dados do dashboard retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cards:
 *                   type: object
 *                   properties:
 *                     total_hoteis:
 *                       type: integer
 *                       example: 5
 *                     total_quartos:
 *                       type: integer
 *                       example: 80
 *                     quartos_disponiveis:
 *                       type: integer
 *                       example: 32
 *                     total_hospedes:
 *                       type: integer
 *                       example: 210
 *                     reservas_pendentes:
 *                       type: integer
 *                       example: 12
 *                     reservas_confirmadas:
 *                       type: integer
 *                       example: 45
 *                     reservas_canceladas:
 *                       type: integer
 *                       example: 8
 *                     reservas_hoje:
 *                       type: integer
 *                       example: 3
 *                     reservas_semana:
 *                       type: integer
 *                       example: 17
 *                     taxa_ocupacao:
 *                       type: integer
 *                       example: 60
 *                       description: Percentual de ocupação atual (0–100)
 *                 proximos_checkins:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       data_entrada:
 *                         type: string
 *                         format: date
 *                       hospede_nome:
 *                         type: string
 *                       hotel_nome:
 *                         type: string
 *                       quarto_numero:
 *                         type: string
 *                 proximos_checkouts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 ultimas_reservas:
 *                   type: array
 *                   items:
 *                     type: object
 *                 ocupacao_por_hotel:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *                       cidade:
 *                         type: string
 *                       total_quartos:
 *                         type: integer
 *                       ocupados:
 *                         type: integer
 *                       taxa:
 *                         type: integer
 *                         description: Percentual de ocupação do hotel (0–100)
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", async (req, res) => {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const em7dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [
      hoteis, quartos, hospedes, reservasPorStatus,
      reservasHoje, reservasSemana, proximosCheckins,
      proximosCheckouts, ultimasReservas, ocupacaoPorHotel,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM hoteis"),
      pool.query(`
        SELECT COUNT(*) AS total,
          COUNT(*) FILTER (
            WHERE id NOT IN (
              SELECT quarto_id FROM reservas
              WHERE status != 'cancelada' AND data_entrada <= $1 AND data_saida > $1
            )
          ) AS disponiveis
        FROM quartos
      `, [hoje]),
      pool.query("SELECT COUNT(*) AS total FROM hospedes"),
      pool.query("SELECT status, COUNT(*) AS total FROM reservas GROUP BY status"),
      pool.query("SELECT COUNT(*) AS total FROM reservas WHERE data_entrada = $1 AND status != 'cancelada'", [hoje]),
      pool.query("SELECT COUNT(*) AS total FROM reservas WHERE data_entrada BETWEEN $1 AND $2 AND status != 'cancelada'", [hoje, em7dias]),
      pool.query(`
        SELECT r.id, r.data_entrada, r.status,
          h.nome AS hospede_nome, ht.nome AS hotel_nome, q.numero AS quarto_numero
        FROM reservas r
        JOIN hospedes h ON h.id = r.hospede_id
        JOIN hoteis ht ON ht.id = r.hotel_id
        JOIN quartos q ON q.id = r.quarto_id
        WHERE r.data_entrada BETWEEN $1 AND $2 AND r.status != 'cancelada'
        ORDER BY r.data_entrada ASC LIMIT 5
      `, [hoje, em7dias]),
      pool.query(`
        SELECT r.id, r.data_saida, r.status,
          h.nome AS hospede_nome, ht.nome AS hotel_nome, q.numero AS quarto_numero
        FROM reservas r
        JOIN hospedes h ON h.id = r.hospede_id
        JOIN hoteis ht ON ht.id = r.hotel_id
        JOIN quartos q ON q.id = r.quarto_id
        WHERE r.data_saida BETWEEN $1 AND $2 AND r.status != 'cancelada'
        ORDER BY r.data_saida ASC LIMIT 5
      `, [hoje, em7dias]),
      pool.query(`
        SELECT r.id, r.data_entrada, r.data_saida, r.status, r.criado_em,
          h.nome AS hospede_nome, ht.nome AS hotel_nome, q.numero AS quarto_numero
        FROM reservas r
        JOIN hospedes h ON h.id = r.hospede_id
        JOIN hoteis ht ON ht.id = r.hotel_id
        JOIN quartos q ON q.id = r.quarto_id
        ORDER BY r.criado_em DESC LIMIT 5
      `),
      pool.query(`
        SELECT ht.id, ht.nome, ht.cidade,
          COUNT(q.id) AS total_quartos,
          COUNT(q.id) FILTER (
            WHERE q.id IN (
              SELECT quarto_id FROM reservas
              WHERE status != 'cancelada' AND data_entrada <= $1 AND data_saida > $1
            )
          ) AS ocupados
        FROM hoteis ht
        LEFT JOIN quartos q ON q.hotel_id = ht.id
        GROUP BY ht.id
        HAVING COUNT(q.id) > 0
        ORDER BY (COUNT(q.id) FILTER (
          WHERE q.id IN (
            SELECT quarto_id FROM reservas
            WHERE status != 'cancelada' AND data_entrada <= $1 AND data_saida > $1
          )
        )::float / NULLIF(COUNT(q.id), 0)) DESC
        LIMIT 5
      `, [hoje]),
    ]);

    const statusMap = { pendente: 0, confirmada: 0, cancelada: 0 };
    reservasPorStatus.rows.forEach((r) => { statusMap[r.status] = parseInt(r.total); });

    const totalQ = parseInt(quartos.rows[0].total);
    const dispQ  = parseInt(quartos.rows[0].disponiveis);
    const ocupados = totalQ - dispQ;
    const taxaOcupacao = totalQ > 0 ? Math.round((ocupados / totalQ) * 100) : 0;

    res.json({
      cards: {
        total_hoteis:         parseInt(hoteis.rows[0].total),
        total_quartos:        totalQ,
        quartos_disponiveis:  dispQ,
        total_hospedes:       parseInt(hospedes.rows[0].total),
        reservas_pendentes:   statusMap.pendente,
        reservas_confirmadas: statusMap.confirmada,
        reservas_canceladas:  statusMap.cancelada,
        reservas_hoje:        parseInt(reservasHoje.rows[0].total),
        reservas_semana:      parseInt(reservasSemana.rows[0].total),
        taxa_ocupacao:        taxaOcupacao,
      },
      proximos_checkins:  proximosCheckins.rows,
      proximos_checkouts: proximosCheckouts.rows,
      ultimas_reservas:   ultimasReservas.rows,
      ocupacao_por_hotel: ocupacaoPorHotel.rows.map((h) => ({
        ...h,
        total_quartos: parseInt(h.total_quartos),
        ocupados:      parseInt(h.ocupados),
        taxa: parseInt(h.total_quartos) > 0
          ? Math.round((parseInt(h.ocupados) / parseInt(h.total_quartos)) * 100)
          : 0,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao carregar dashboard." });
  }
});

export default router;