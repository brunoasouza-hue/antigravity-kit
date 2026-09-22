import { Response } from 'express';
import { db } from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';

export async function createVistoria(req: AuthRequest, res: Response) {
  const {
    equipamento_id,
    pressao_ok,
    lacre_ok,
    sinalizacao_ok,
    desobstruido_ok,
    validade_ok,
    observacoes,
    foto_url
  } = req.body;

  if (!equipamento_id) {
    return res.status(400).json({ error: 'ID do equipamento é obrigatório.' });
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  try {
    const equip = await db.get('SELECT * FROM equipamentos WHERE id = ?', [equipamento_id]);
    if (!equip) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }

    const isApproved = pressao_ok && lacre_ok && sinalizacao_ok && desobstruido_ok && validade_ok;
    const statusResult = isApproved ? 'APROVADO' : 'REPROVADO';

    const insertVistoria = await db.run(`
      INSERT INTO vistorias (
        equipamento_id, usuario_id, status_result, pressao_ok, lacre_ok,
        sinalizacao_ok, desobstruido_ok, validade_ok, observacoes, foto_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      equipamento_id,
      req.user.id,
      statusResult,
      pressao_ok ? 1 : 0,
      lacre_ok ? 1 : 0,
      sinalizacao_ok ? 1 : 0,
      desobstruido_ok ? 1 : 0,
      validade_ok ? 1 : 0,
      observacoes || '',
      foto_url || ''
    ]);

    const novoStatusGeral = isApproved ? 'APROVADO' : 'REPROVADO';
    await db.run(`
      UPDATE equipamentos SET
        pressao_status = ?,
        lacre_status = ?,
        sinalizacao_status = ?,
        desobstruido = ?,
        status_geral = ?
      WHERE id = ?
    `, [
      pressao_ok ? 'OK' : 'BAIXA',
      lacre_ok ? 'OK' : 'ROMPIDO',
      sinalizacao_ok ? 'OK' : 'DANIFICADA',
      desobstruido_ok ? 1 : 0,
      novoStatusGeral,
      equipamento_id
    ]);

    const vistoriaRegistrada = await db.get(`
      SELECT v.*, u.nome as inspetor_nome, e.codigo as equipamento_codigo, e.tipo as equipamento_tipo, e.setor as equipamento_setor
      FROM vistorias v
      JOIN users u ON v.usuario_id = u.id
      JOIN equipamentos e ON v.equipamento_id = e.id
      WHERE v.id = ?
    `, [insertVistoria.lastID]);

    return res.status(201).json({
      message: `Vistoria registrada com sucesso! Status: ${statusResult}`,
      vistoria: vistoriaRegistrada
    });
  } catch (error) {
    console.error('Erro ao registrar vistoria:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar vistoria.' });
  }
}

export async function listVistorias(req: AuthRequest, res: Response) {
  try {
    const { status, setor, data_inicio, data_fim } = req.query;

    let query = `
      SELECT v.*, u.nome as inspetor_nome, u.email as inspetor_email, 
             e.codigo as equipamento_codigo, e.tipo as equipamento_tipo, 
             e.subtipo as equipamento_subtipo, e.setor as equipamento_setor
      FROM vistorias v
      JOIN users u ON v.usuario_id = u.id
      JOIN equipamentos e ON v.equipamento_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'todos') {
      query += ' AND v.status_result = ?';
      params.push(status);
    }

    if (setor && setor !== 'todos') {
      query += ' AND e.setor = ?';
      params.push(setor);
    }

    if (data_inicio) {
      query += ' AND v.data_vistoria >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND v.data_vistoria <= ?';
      params.push(data_fim);
    }

    query += ' ORDER BY v.data_vistoria DESC LIMIT 100';

    const vistorias = await db.all(query, params);
    return res.json(vistorias);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar histórico de vistorias.' });
  }
}
