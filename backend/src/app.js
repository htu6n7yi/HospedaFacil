import express from "express";

const app = express();

app.use(express.json());

// rota de teste
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API funcionando"
  });
});

export default app;