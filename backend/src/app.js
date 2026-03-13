import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express(); // ← precisa vir primeiro

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // ← agora funciona

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API funcionando" });
});

export default app;