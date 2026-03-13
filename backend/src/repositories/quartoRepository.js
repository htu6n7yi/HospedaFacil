import pool from "../database/database.js";
import { randomUUID } from "crypto";

const quartoRepository = {
  async listarPorHotel(hotel_id) {
    const { rows } = await pool.query(
      `SELECT * FROM quartos WHERE hotel_id = $1 ORDER BY numero ASC`,
      [hotel_id]
    );
    return rows;
  },

  async listarDisponiveisPorHotel(hotel_id, data_entrada, data_saida) {
    const { rows } = await pool.query(`
      SELECT q.*
      FROM quartos q
      WHERE q.hotel_id = $1
        AND q.id NOT IN (
          SELECT r.quarto_id FROM reservas r
          WHERE r.hotel_id   = $1
            AND r.status    != 'cancelada'
            AND r.data_entrada < $3
            AND r.data_saida   > $2
        )
      ORDER BY q.numero ASC
    `, [hotel_id, data_entrada, data_saida]);
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query(
      "SELECT * FROM quartos WHERE id = $1",
      [id]
    );
    return rows[0] ?? null;
  },

  async criar({ hotel_id, numero, tipo, preco_noite }) {
    const { rows } = await pool.query(
      `INSERT INTO quartos (id, hotel_id, numero, tipo, preco_noite)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [randomUUID(), hotel_id, numero, tipo, preco_noite]
    );
    return rows[0];
  },

  async atualizar(id, { numero, tipo, preco_noite }) {
    const { rows } = await pool.query(
      `UPDATE quartos SET
        numero      = COALESCE($1, numero),
        tipo        = COALESCE($2, tipo),
        preco_noite = COALESCE($3, preco_noite)
       WHERE id = $4 RETURNING *`,
      [numero, tipo, preco_noite, id]
    );
    return rows[0] ?? null;
  },

  async deletar(id) {
    const { rowCount } = await pool.query(
      "DELETE FROM quartos WHERE id = $1",
      [id]
    );
    return rowCount > 0;
  },
};

export default quartoRepository;