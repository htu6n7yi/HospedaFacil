import pool from "../database/database.js";
import { randomUUID } from "crypto";

const hotelRepository = {
  async listar() {
    const { rows } = await pool.query(
      "SELECT * FROM hoteis ORDER BY criado_em DESC"
    );
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query(
      "SELECT * FROM hoteis WHERE id = $1",
      [id]
    );
    return rows[0] ?? null;
  },

  async criar({ nome, cidade, quantidade_quartos }) {
    const { rows } = await pool.query(
      "INSERT INTO hoteis (id, nome, cidade, quantidade_quartos) VALUES ($1, $2, $3, $4) RETURNING *",
      [randomUUID(), nome, cidade, quantidade_quartos ?? 0]
    );
    return rows[0];
  },

  async atualizar(id, { nome, cidade, quantidade_quartos }) {
    const { rows } = await pool.query(
      `UPDATE hoteis SET
        nome               = COALESCE($1, nome),
        cidade             = COALESCE($2, cidade),
        quantidade_quartos = COALESCE($3, quantidade_quartos)
       WHERE id = $4
       RETURNING *`,
      [nome, cidade, quantidade_quartos, id]
    );
    return rows[0] ?? null;
  },

  async deletar(id) {
    const { rowCount } = await pool.query(
      "DELETE FROM hoteis WHERE id = $1",
      [id]
    );
    return rowCount > 0;
  },
};

export default hotelRepository;