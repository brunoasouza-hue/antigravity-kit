import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';

export async function listUsers(req: AuthRequest, res: Response) {
  try {
    const users = await db.all(`
      SELECT id, nome, email, role, cargo, ativo, created_at 
      FROM users 
      ORDER BY id DESC
    `);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar lista de usuários.' });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  const { nome, email, senha, role, cargo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, E-mail e Senha são obrigatórios.' });
  }

  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    const hashedSenha = bcrypt.hashSync(senha, 10);
    const userRole = role === 'admin' ? 'admin' : 'brigadista';

    const result = await db.run(
      `INSERT INTO users (nome, email, senha, role, cargo) VALUES (?, ?, ?, ?, ?)`,
      [nome, email.toLowerCase().trim(), hashedSenha, userRole, cargo || 'Brigadista']
    );

    const newUser = await db.get(
      `SELECT id, nome, email, role, cargo, ativo, created_at FROM users WHERE id = ?`,
      [result.lastID]
    );

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user: newUser });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao cadastrar novo usuário.' });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { nome, role, cargo, ativo, senha } = req.body;

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    let query = 'UPDATE users SET nome = ?, role = ?, cargo = ?, ativo = ?';
    const params: any[] = [
      nome || user.nome,
      role || user.role,
      cargo !== undefined ? cargo : user.cargo,
      ativo !== undefined ? (ativo ? 1 : 0) : user.ativo
    ];

    if (senha && senha.trim() !== '') {
      query += ', senha = ?';
      params.push(bcrypt.hashSync(senha, 10));
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.run(query, params);

    const updatedUser = await db.get(
      'SELECT id, nome, email, role, cargo, ativo, created_at FROM users WHERE id = ?',
      [id]
    );

    return res.json({ message: 'Usuário atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar dados do usuário.' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  const { id } = req.params;

  if (req.user && req.user.id === Number(id)) {
    return res.status(400).json({ error: 'Não é possível excluir o seu próprio usuário conectado.' });
  }

  try {
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.json({ message: 'Usuário excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
}
