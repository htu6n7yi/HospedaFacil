import express from "express";

const app = express();

app.use(express.json());

app.get("/",(req, res) => {
  res.json({
  message: "Api Rodando"
  });
} )

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;