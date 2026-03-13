import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import hoteisRoutes from "./routes/hoteis.js";
import hospedesRoutes from "./routes/hospedes.js";
import reservasRoutes from "./routes/reservas.js";
import quartosRoutes from "./routes/quartos.js";
import { autenticar } from "./middlewares/autenticar.js";

const app = express();

app.use(cors());
app.use(express.json());

// ─── Rotas públicas ───────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API HospedaFacil funcionando" });
});

app.use("/auth", authRoutes);

// ─── Rotas protegidas (exigem JWT válido) ─────────
app.use("/hoteis",   autenticar, hoteisRoutes);
app.use("/hospedes", autenticar, hospedesRoutes);
app.use("/reservas", autenticar, reservasRoutes);
app.use("/quartos",  autenticar, quartosRoutes);

// ─── Rota de teste protegida ──────────────────────
app.get("/perfil", autenticar, (req, res) => {
  res.json({
    mensagem: "Token válido!",
    usuario: req.usuario.usuario,
    tokenExpiraEm: new Date(req.usuario.exp * 1000).toLocaleString("pt-BR"),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🏨 HospedaFacil rodando na porta ${PORT}`);
});

export default app;