import { Response } from 'express';
import { db } from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const totalEquipamentosRow = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM equipamentos');
    const totalEquipamentos = totalEquipamentosRow ? totalEquipamentosRow.count : 0;

    const totalAprovadosRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM equipamentos WHERE status_geral = 'APROVADO'");
    const totalAprovados = totalAprovadosRow ? totalAprovadosRow.count : 0;

    const totalAlertaRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM equipamentos WHERE status_geral = 'ALERTA'");
    const totalAlerta = totalAlertaRow ? totalAlertaRow.count : 0;

    const totalReprovadosRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM equipamentos WHERE status_geral = 'REPROVADO'");
    const totalReprovados = totalReprovadosRow ? totalReprovadosRow.count : 0;

    const hojeStr = new Date().toISOString().split('T')[0];
    const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const vencidosRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM equipamentos WHERE validade_carga IS NOT NULL AND validade_carga < ?", [hojeStr]);
    const vencidos = vencidosRow ? vencidosRow.count : 0;

    const vencendo30DiasRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM equipamentos WHERE validade_carga IS NOT NULL AND validade_carga >= ? AND validade_carga <= ?", [hojeStr, em30Dias]);
    const vencendo30Dias = vencendo30DiasRow ? vencendo30DiasRow.count : 0;

    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().split('T')[0];

    const vistoriasMesRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM vistorias WHERE data_vistoria >= ?", [inicioMesStr]);
    const vistoriasMes = vistoriasMesRow ? vistoriasMesRow.count : 0;

    const porTipo = await db.all(`
      SELECT tipo, COUNT(*) as quantidade,
             SUM(CASE WHEN status_geral = 'APROVADO' THEN 1 ELSE 0 END) as aprovados,
             SUM(CASE WHEN status_geral != 'APROVADO' THEN 1 ELSE 0 END) as pendentes
      FROM equipamentos
      GROUP BY tipo
    `);

    const porSetor = await db.all(`
      SELECT setor, COUNT(*) as quantidade,
             SUM(CASE WHEN status_geral = 'APROVADO' THEN 1 ELSE 0 END) as aprovados
      FROM equipamentos
      GROUP BY setor
    `);

    const ultimasVistorias = await db.all(`
      SELECT v.*, u.nome as inspetor_nome, e.codigo as equipamento_codigo, e.tipo as equipamento_tipo
      FROM vistorias v
      JOIN users u ON v.usuario_id = u.id
      JOIN equipamentos e ON v.equipamento_id = e.id
      ORDER BY v.data_vistoria DESC
      LIMIT 5
    `);

    return res.json({
      totalEquipamentos,
      totalAprovados,
      totalAlerta,
      totalReprovados,
      vencidos,
      vencendo30Dias,
      vistoriasMes,
      taxaConformidade: totalEquipamentos > 0 ? Math.round((totalAprovados / totalEquipamentos) * 100) : 100,
      porTipo,
      porSetor,
      ultimasVistorias
    });
  } catch (error) {
    console.error('Erro ao calcular dashboard stats:', error);
    return res.status(500).json({ error: 'Erro ao carregar estatísticas do dashboard.' });
  }
}
