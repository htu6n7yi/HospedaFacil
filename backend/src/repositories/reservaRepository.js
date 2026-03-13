import pool from "../database/database.js";
import { randomUUID } from "crypto";

const reservaRepository = {
  async listar() {
    const { rows } = await pool.query(`
      SELECT
        r.*,
        h.nome          AS hospede_nome,
        h.email         AS hospede_email,
        h.tipo_documento AS hospede_tipo_documento,
        h.documento     AS hospede_documento,
        ht.nome         AS hotel_nome,
        ht.cidade       AS hotel_cidade,
        q.numero        AS quarto_numero,
        q.tipo          AS quarto_tipo,
        q.preco_noite   AS quarto_preco_noite
      FROM reservas r
      JOIN hospedes h  ON h.id  = r.hospede_id
      JOIN hoteis   ht ON ht.id = r.hotel_id
      JOIN quartos  q  ON q.id  = r.quarto_id
      ORDER BY r.criado_em DESC
    `);
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query(`
      SELECT
        r.*,
        h.nome          AS hospede_nome,
        h.email         AS hospede_email,
        h.tipo_documento AS hospede_tipo_documento,
        h.documento     AS hospede_documento,
        ht.nome         AS hotel_nome,
        ht.cidade       AS hotel_cidade,
        q.numero        AS quarto_numero,
        q.tipo          AS quarto_tipo,
        q.preco_noite   AS quarto_preco_noite
      FROM reservas r
      JOIN hospedes h  ON h.id  = r.hospede_id
      JOIN hoteis   ht ON ht.id = r.hotel_id
      JOIN quartos  q  ON q.id  = r.quarto_id
      WHERE r.id = $1
    `, [id]);
    return rows[0] ?? null;
  },

  async criar({ hospede_nome, hospede_email, hospede_tipo_documento, hospede_documento, hotel_id, quarto_id, data_entrada, data_saida }) {
    // Verifica conflito de quarto no período
    const { rows: conflito } = await pool.query(`
      SELECT id FROM reservas
      WHERE quarto_id    = $1
        AND status      != 'cancelada'
        AND data_entrada < $3
        AND data_saida   > $2
    `, [quarto_id, data_entrada, data_saida]);

    if (conflito.length > 0) {
      throw new Error("Quarto indisponível para o período solicitado.");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Cria ou reutiliza hóspede pelo email
      let hospede;
      const { rows: existing } = await client.query(
        "SELECT * FROM hospedes WHERE email = $1",
        [hospede_email]
      );

      if (existing.length > 0) {
        // Atualiza documento se mudou
        const { rows: updated } = await client.query(
          `UPDATE hospedes SET
            nome           = $1,
            tipo_documento = $2,
            documento      = $3
           WHERE email = $4 RETURNING *`,
          [hospede_nome, hospede_tipo_documento, hospede_documento, hospede_email]
        );
        hospede = updated[0];
      } else {
        const { rows } = await client.query(
          `INSERT INTO hospedes (id, nome, email, tipo_documento, documento)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [randomUUID(), hospede_nome, hospede_email, hospede_tipo_documento, hospede_documento]
        );
        hospede = rows[0];
      }

      const { rows: [reserva] } = await client.query(`
        INSERT INTO reservas (id, hotel_id, quarto_id, hospede_id, data_entrada, data_saida, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pendente')
        RETURNING *
      `, [randomUUID(), hotel_id, quarto_id, hospede.id, data_entrada, data_saida]);

      await client.query("COMMIT");

      return {
        ...reserva,
        hospede_nome: hospede.nome,
        hospede_email: hospede.email,
        hospede_tipo_documento: hospede.tipo_documento,
        hospede_documento: hospede.documento,
      };
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

  async atualizar(id, { hotel_id, quarto_id, data_entrada, data_saida, status }) {
    const { rows } = await pool.query(`
      UPDATE reservas SET
        hotel_id     = COALESCE($1, hotel_id),
        quarto_id    = COALESCE($2, quarto_id),
        data_entrada = COALESCE($3, data_entrada),
        data_saida   = COALESCE($4, data_saida),
        status       = COALESCE($5, status)
      WHERE id = $6 RETURNING *
    `, [hotel_id, quarto_id, data_entrada, data_saida, status, id]);
    return rows[0] ?? null;
  },

  async deletar(id) {
    const { rowCount } = await pool.query(
      "DELETE FROM reservas WHERE id = $1", [id]
    );
    return rowCount > 0;
  },
};

export default reservaRepository;