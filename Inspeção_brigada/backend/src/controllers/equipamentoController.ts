import { Response } from 'express';
import { db } from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';

export async function listEquipamentos(req: AuthRequest, res: Response) {
  try {
    const { tipo, setor, status, busca } = req.query;

    let query = 'SELECT * FROM equipamentos WHERE 1=1';
    const params: any[] = [];

    if (tipo && tipo !== 'todos') {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    if (setor && setor !== 'todos') {
      query += ' AND setor = ?';
      params.push(setor);
    }

    if (status && status !== 'todos') {
      query += ' AND status_geral = ?';
      params.push(status);
    }

    if (busca && String(busca).trim() !== '') {
      query += ' AND (codigo LIKE ? OR subtipo LIKE ? OR localizacao_detalhada LIKE ?)';
      const term = `%${String(busca).trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY codigo ASC';

    const equipamentos = await db.all(query, params);
    return res.json(equipamentos);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar equipamentos.' });
  }
}

export async function getEquipamentoByCodigo(req: AuthRequest, res: Response) {
  const { codigo } = req.params;
  try {
    const equip = await db.get('SELECT * FROM equipamentos WHERE codigo = ?', [codigo.toUpperCase().trim()]);
    if (!equip) {
      return res.status(404).json({ error: 'Equipamento não encontrado pelo código informado.' });
    }

    const vistorias = await db.all(`
      SELECT v.*, u.nome as inspetor_nome
      FROM vistorias v
      JOIN users u ON v.usuario_id = u.id
      WHERE v.equipamento_id = ?
      ORDER BY v.data_vistoria DESC
      LIMIT 10
    `, [equip.id]);

    return res.json({ ...equip, vistorias });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar detalhes do equipamento.' });
  }
}

export async function createEquipamento(req: AuthRequest, res: Response) {
  const {
    codigo,
    tipo,
    subtipo,
    capacidade,
    setor,
    localizacao_detalhada,
    validade_carga,
    validade_teste_hidro,
    pressao_status,
    lacre_status,
    sinalizacao_status,
    desobstruido
  } = req.body;

  if (!codigo || !tipo || !setor) {
    return res.status(400).json({ error: 'Código, Tipo e Setor são obrigatórios.' });
  }

  try {
    const existing = await db.get('SELECT id FROM equipamentos WHERE codigo = ?', [codigo.toUpperCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Já existe um equipamento cadastrado com este Código.' });
    }

    let status_geral = 'APROVADO';
    if (pressao_status === 'BAIXA' || pressao_status === 'ALTA' || lacre_status !== 'OK' || sinalizacao_status !== 'OK' || !desobstruido) {
      status_geral = 'ALERTA';
    }

    const result = await db.run(`
      INSERT INTO equipamentos (
        codigo, tipo, subtipo, capacidade, setor, localizacao_detalhada,
        validade_carga, validade_teste_hidro, pressao_status, lacre_status,
        sinalizacao_status, desobstruido, status_geral, qr_code_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo.toUpperCase().trim(),
      tipo,
      subtipo || '',
      capacidade || '',
      setor,
      localizacao_detalhada || '',
      validade_carga || null,
      validade_teste_hidro || null,
      pressao_status || 'OK',
      lacre_status || 'OK',
      sinalizacao_status || 'OK',
      desobstruido !== undefined ? (desobstruido ? 1 : 0) : 1,
      status_geral,
      codigo.toUpperCase().trim()
    ]);

    const newEquip = await db.get('SELECT * FROM equipamentos WHERE id = ?', [result.lastID]);
    return res.status(201).json({ message: 'Equipamento cadastrado com sucesso!', equipamento: newEquip });
  } catch (error) {
    console.error('Erro ao cadastrar equipamento:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar equipamento.' });
  }
}

export async function updateEquipamento(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = req.body;

  try {
    const equip = await db.get('SELECT * FROM equipamentos WHERE id = ?', [id]);
    if (!equip) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }

    const pressao = data.pressao_status || equip.pressao_status;
    const lacre = data.lacre_status || equip.lacre_status;
    const sinalizacao = data.sinalizacao_status || equip.sinalizacao_status;
    const desobstruido = data.desobstruido !== undefined ? (data.desobstruido ? 1 : 0) : equip.desobstruido;

    let status_geral = 'APROVADO';
    if (pressao === 'BAIXA' || pressao === 'ALTA' || lacre !== 'OK' || sinalizacao !== 'OK' || desobstruido === 0) {
      status_geral = 'ALERTA';
    }

    await db.run(`
      UPDATE equipamentos SET
        tipo = ?, subtipo = ?, capacidade = ?, setor = ?, localizacao_detalhada = ?,
        validade_carga = ?, validade_teste_hidro = ?, pressao_status = ?, lacre_status = ?,
        sinalizacao_status = ?, desobstruido = ?, status_geral = ?
      WHERE id = ?
    `, [
      data.tipo || equip.tipo,
      data.subtipo !== undefined ? data.subtipo : equip.subtipo,
      data.capacidade !== undefined ? data.capacidade : equip.capacidade,
      data.setor || equip.setor,
      data.localizacao_detalhada !== undefined ? data.localizacao_detalhada : equip.localizacao_detalhada,
      data.validade_carga !== undefined ? data.validade_carga : equip.validade_carga,
      data.validade_teste_hidro !== undefined ? data.validade_teste_hidro : equip.validade_teste_hidro,
      pressao,
      lacre,
      sinalizacao,
      desobstruido,
      status_geral,
      id
    ]);

    const updated = await db.get('SELECT * FROM equipamentos WHERE id = ?', [id]);
    return res.json({ message: 'Equipamento atualizado com sucesso!', equipamento: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar equipamento.' });
  }
}

export async function deleteEquipamento(req: AuthRequest, res: Response) {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM equipamentos WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }
    return res.json({ message: 'Equipamento excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir equipamento.' });
  }
}
