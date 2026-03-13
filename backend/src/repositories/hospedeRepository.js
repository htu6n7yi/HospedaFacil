import pool from "../database/database.js";

const hospedeRepository = {
  // Lista hóspede de uma reserva específica
  async buscarPorReserva(reserva_id) {
    const { rows } = await pool.query(
      `SELECT h.*
       FROM hospedes h
       JOIN reservas r ON r.hospede_id = h.id
       WHERE r.id = $1`,
      [reserva_id]
    );
    return rows[0] ?? null;
  },

  // Lista todos os hóspedes com suas reservas
  async listarComReservas() {
    const { rows } = await pool.query(`
      SELECT
        h.id,
        h.nome,
        h.email,
        h.criado_em,
        r.id           AS reserva_id,
        r.data_entrada,
        r.data_saida,
        r.status       AS reserva_status,
        ht.nome        AS hotel_nome,
        ht.cidade      AS hotel_cidade
      FROM hospedes h
      JOIN reservas r  ON r.hospede_id = h.id
      JOIN hoteis   ht ON ht.id = r.hotel_id
      ORDER BY h.criado_em DESC
    `);
    return rows;
  },
};

export default hospedeRepository;