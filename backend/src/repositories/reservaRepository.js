import pool from "../database/database.js";
import { randomUUID } from "crypto";

const reservaRepository = {
  async listar() {
    const { rows } = await pool.query(`
      SELECT
        r.*,
        h.nome         AS hospede_nome,
        h.email        AS hospede_email,
        ht.nome        AS hotel_nome,
        ht.cidade      AS hotel_cidade
      FROM reservas r
      JOIN hospedes h  ON h.id  = r.hospede_id
      JOIN hoteis   ht ON ht.id = r.hotel_id
      ORDER BY r.criado_em DESC
    `);
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query(`
      SELECT
        r.*,
        h.nome         AS hospede_nome,
        h.email        AS hospede_email,
        ht.nome        AS hotel_nome,
        ht.cidade      AS hotel_cidade
      FROM reservas r
      JOIN hospedes h  ON h.id  = r.hospede_id
      JOIN hoteis   ht ON ht.id = r.hotel_id
      WHERE r.id = $1
    `, [id]);
    return rows[0] ?? null;
  },

  async verificarDisponibilidade(hotel_id, data_entrada, data_saida, ignorarReservaId = null) {
    const { rows: [hotel] } = await pool.query(
      "SELECT quantidade_quartos FROM hoteis WHERE id = $1",
      [hotel_id]
    );

    if (!hotel) throw new Error("Hotel não encontrado.");
    if (hotel.quantidade_quartos === 0) throw new Error("Hotel não possui quartos cadastrados.");

    const params = [hotel_id, data_entrada, data_saida];
    let query = `
      SELECT COUNT(*) AS total
      FROM reservas
      WHERE hotel_id = $1
        AND status != 'cancelada'
        AND data_entrada < $3
        AND data_saida   > $2
    `;

    if (ignorarReservaId) {
      query += ` AND id != $4`;
      params.push(ignorarReservaId);
    }

    const { rows: [{ total }] } = await pool.query(query, params);

    if (parseInt(total) >= hotel.quantidade_quartos) {
      throw new Error("Hotel sem disponibilidade para o período solicitado.");
    }
  },

  async criar({ hospede_nome, hospede_email, hotel_id, data_entrada, data_saida }) {
    await this.verificarDisponibilidade(hotel_id, data_entrada, data_saida);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let hospede;
      const { rows: existing } = await client.query(
        "SELECT * FROM hospedes WHERE email = $1",
        [hospede_email]
      );

      if (existing.length > 0) {
        hospede = existing[0];
      } else {
        const { rows } = await client.query(
          "INSERT INTO hospedes (id, nome, email) VALUES ($1, $2, $3) RETURNING *",
          [randomUUID(), hospede_nome, hospede_email]
        );
        hospede = rows[0];
      }

      const { rows: [reserva] } = await client.query(`
        INSERT INTO reservas (id, hotel_id, hospede_id, data_entrada, data_saida, status)
        VALUES ($1, $2, $3, $4, $5, 'pendente')
        RETURNING *
      `, [randomUUID(), hotel_id, hospede.id, data_entrada, data_saida]);

      await client.query("COMMIT");

      return { ...reserva, hospede_nome: hospede.nome, hospede_email: hospede.email };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async atualizarStatus(id, status) {
    const { rows } = await pool.query(
      "UPDATE reservas SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    return rows[0] ?? null;
  },

  async atualizar(id, { hotel_id, data_entrada, data_saida, status }) {
    if (hotel_id && data_entrada && data_saida) {
      await this.verificarDisponibilidade(hotel_id, data_entrada, data_saida, id);
    }

    const { rows } = await pool.query(`
      UPDATE reservas SET
        hotel_id     = COALESCE($1, hotel_id),
        data_entrada = COALESCE($2, data_entrada),
        data_saida   = COALESCE($3, data_saida),
        status       = COALESCE($4, status)
      WHERE id = $5
      RETURNING *
    `, [hotel_id, data_entrada, data_saida, status, id]);

    return rows[0] ?? null;
  },

  async deletar(id) {
    const { rowCount } = await pool.query(
      "DELETE FROM reservas WHERE id = $1",
      [id]
    );
    return rowCount > 0;
  },
};

export default reservaRepository;
