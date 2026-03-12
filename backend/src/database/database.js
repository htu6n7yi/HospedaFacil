import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("🐘 Conectado ao PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Erro na conexão com o banco:", err);
});

export default pool;