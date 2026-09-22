import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { JWT_SECRET, AuthRequest } from '../middleware/authMiddleware';

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail.' });
    }

    if (!user.ativo) {
      return res.status(403).json({ error: 'Usuário desativado pelo Administrador.' });
    }

    const matchSenha = bcrypt.compareSync(senha, user.senha);
    if (!matchSenha) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique sua senha.' });
    }

    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      cargo: user.cargo
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: payload
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  return res.json({ user: req.user });
}
