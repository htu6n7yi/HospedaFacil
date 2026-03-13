import pool from "../database/database.js";

const hospedeRepository = {
  async listarComReservas() {
    const { rows } = await pool.query(`
      SELECT
        h.id,
        h.nome,
        h.email,
        h.tipo_documento,
        h.documento,
        h.criado_em,
        json_agg(
          json_build_object(
            'reserva_id',   r.id,
            'hotel_nome',   ht.nome,
            'quarto_numero',q.numero,
            'data_entrada', r.data_entrada,
            'data_saida',   r.data_saida,
            'status',       r.status
          ) ORDER BY r.criado_em DESC
        ) FILTER (WHERE r.id IS NOT NULL) AS reservas
      FROM hospedes h
      LEFT JOIN reservas r  ON r.hospede_id = h.id
      LEFT JOIN hoteis   ht ON ht.id        = r.hotel_id
      LEFT JOIN quartos  q  ON q.id         = r.quarto_id
      GROUP BY h.id
      ORDER BY h.criado_em DESC
    `);
    return rows;
  },

  async buscarPorReserva(reserva_id) {
    const { rows } = await pool.query(`
      SELECT
        h.id,
        h.nome,
        h.email,
        h.tipo_documento,
        h.documento,
        h.criado_em,
        r.id AS reserva_id
      FROM hospedes h
      JOIN reservas r ON r.hospede_id = h.id
      WHERE r.id = $1
    `, [reserva_id]);
    return rows[0] ?? null;
  },
};

export default hospedeRepository;
