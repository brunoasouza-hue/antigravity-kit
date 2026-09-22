import { Response } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { db } from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';

export async function exportPDF(req: AuthRequest, res: Response) {
  try {
    const equipamentos = await db.all('SELECT * FROM equipamentos ORDER BY codigo ASC');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-inspecao-brigada.pdf');

    doc.pipe(res);

    doc.fillColor('#DC2626').fontSize(20).text('BRIGADA DE EMERGÊNCIA - SENAI', { align: 'center' });
    doc.fillColor('#1F2937').fontSize(14).text('Relatório de Inspeção e Inventário de Equipamentos', { align: 'center' });
    doc.fontSize(10).fillColor('#6B7280').text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fillColor('#111827').fontSize(12).text(`Total de Equipamentos Inspecionados: ${equipamentos.length}`);
    doc.moveDown(0.5);

    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    equipamentos.forEach((item, index) => {
      if (doc.y > 720) {
        doc.addPage();
      }

      const statusColor = item.status_geral === 'APROVADO' ? '#10B981' : item.status_geral === 'ALERTA' ? '#F59E0B' : '#EF4444';

      doc.fillColor('#111827').fontSize(11).text(`${index + 1}. [${item.codigo}] ${item.tipo.toUpperCase()} - ${item.subtipo || ''}`, { continued: false });
      doc.fontSize(9).fillColor('#4B5563').text(`   Setor: ${item.setor} | Local: ${item.localizacao_detalhada}`);
      doc.text(`   Carga Validade: ${item.validade_carga ? new Date(item.validade_carga).toLocaleDateString('pt-BR') : 'N/A'} | Pressão: ${item.pressao_status} | Lacre: ${item.lacre_status}`);
      
      doc.fillColor(statusColor).fontSize(10).text(`   STATUS: ${item.status_geral}`);
      doc.moveDown(0.8);
    });

    doc.end();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório em PDF.' });
  }
}

export async function exportExcel(req: AuthRequest, res: Response) {
  try {
    const templatePath = `C:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Inspeção_brigada\\Planilha\\Relatorio_Inspecao_2026-09-22.xlsx`;

    const workbook = new ExcelJS.Workbook();

    if (fs.existsSync(templatePath)) {
      // Usar a planilha oficial como modelo idêntico
      await workbook.xlsx.readFile(templatePath);

      // Buscar histórico mais recente de vistorias
      const vistorias = await db.all(`
        SELECT v.*, u.nome as inspetor_nome, e.codigo as equipamento_codigo
        FROM vistorias v
        JOIN users u ON v.usuario_id = u.id
        JOIN equipamentos e ON v.equipamento_id = e.id
        ORDER BY v.data_vistoria DESC
      `);

      const vistoriaMap: Record<string, any> = {};
      vistorias.forEach(v => {
        if (!vistoriaMap[v.equipamento_codigo]) {
          vistoriaMap[v.equipamento_codigo] = v;
        }
      });

      const dataHojeStr = new Date().toLocaleDateString('pt-BR');

      // Preencher cada aba mantendo a formatação, cabeçalho e layout originais
      for (const sheet of workbook.worksheets) {
        // Atualizar Data no cabeçalho da planilha se houver
        const cellData = sheet.getCell('G2');
        if (cellData) {
          cellData.value = `DATA: ${dataHojeStr}`;
        }

        sheet.eachRow((row, rowNumber) => {
          if (rowNumber <= 4) return; // Pular cabeçalhos

          const codigoCell = row.getCell(2);
          if (!codigoCell || !codigoCell.value) return;

          const codigo = String(codigoCell.value).trim();
          const vistoria = vistoriaMap[codigo];

          if (vistoria) {
            const statusStr = vistoria.status_result === 'APROVADO' ? 'OK' : 'NOK';
            const inspetorNome = vistoria.inspetor_nome || 'Bruno Souza';
            const obsStr = vistoria.observacoes || 'Vistoria Concluída';

            const lastColIndex = row.cellCount;
            // Preencher status e responsável
            for (let c = 4; c <= lastColIndex; c++) {
              const cell = row.getCell(c);
              if (c === lastColIndex - 1) {
                cell.value = inspetorNome;
              } else if (c === lastColIndex) {
                cell.value = obsStr;
              } else {
                cell.value = statusStr;
              }
            }
          }
        });
      }
    } else {
      // Fallback básico se o arquivo de modelo não for localizado
      const sheet = workbook.addWorksheet('Inventário');
      const equipamentos = await db.all('SELECT * FROM equipamentos ORDER BY codigo ASC');
      sheet.addRow(['Código', 'Tipo', 'Setor', 'Status']);
      equipamentos.forEach(e => sheet.addRow([e.codigo, e.tipo, e.setor, e.status_geral]));
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Relatorio_Inspecao_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao gerar Excel idêntico:', error);
    return res.status(500).json({ error: 'Erro ao exportar planilha Excel.' });
  }
}

export async function generateQRCodeDataURL(req: AuthRequest, res: Response) {
  const { code } = req.params;
  try {
    const qrDataUrl = await QRCode.toDataURL(code, { width: 300, margin: 2 });
    return res.json({ code, qrDataUrl });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao gerar QR Code.' });
  }
}
