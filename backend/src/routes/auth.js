import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const CREDENCIAIS = {
  usuario: "admin",
  senha: "123456",
};

const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e geração de token JWT
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuário e obter token JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario, senha]
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: admin
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiraEm:
 *                   type: string
 *                   example: 8h
 *       400:
 *         description: Usuário e senha são obrigatórios
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ erro: "Usuário e senha são obrigatórios" });
  }

  if (usuario !== CREDENCIAIS.usuario || senha !== CREDENCIAIS.senha) {
    return res.status(401).json({ erro: "Credenciais inválidas" });
  }

  const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: "8h" });

  return res.status(200).json({
    mensagem: "Login realizado com sucesso",
    token,
    expiraEm: "8h",
  });
});

export default router;