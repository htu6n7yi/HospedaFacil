import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const CREDENCIAIS = {
  usuario: "admin",
  senha: "123456",
};

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

router.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({
      erro: "Usuário e senha são obrigatórios",
    });
  }

  if (usuario !== CREDENCIAIS.usuario || senha !== CREDENCIAIS.senha) {
    return res.status(401).json({
      erro: "Credenciais inválidas",
    });
  }

  const token = jwt.sign(
    { usuario },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return res.status(200).json({
    mensagem: "Login realizado com sucesso",
    token,
    expiraEm: "8h",
  });
});

export default router;