const ExcelJS = require('exceljs');
const fs = require('fs');

const excelPath = `C:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Inspeção_brigada\\Planilha\\Relatorio_Inspecao_2026-09-22.xlsx`;

async function extractAll() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const allEquipamentos = [];

  for (const sheet of workbook.worksheets) {
    const sheetName = sheet.name;
    console.log(`Extracting from sheet: ${sheetName}...`);

    let tipoClass = 'extintor';
    let subtipo = 'Água Pressurizada';

    if (sheetName.includes('ÁGUA')) {
      tipoClass = 'extintor';
      subtipo = 'Água Pressurizada';
    } else if (sheetName.includes('PQS')) {
      tipoClass = 'extintor';
      subtipo = 'Pó Químico Seco (PQS)';
    } else if (sheetName.includes('CO2')) {
      tipoClass = 'extintor';
      subtipo = 'Dióxido de Carbono (CO2)';
    } else if (sheetName.includes('HIDRANTES')) {
      tipoClass = 'hidrante';
      subtipo = 'Abrigo de Hidrante';
    } else if (sheetName.includes('ROTAS DE FUGA')) {
      tipoClass = 'saida_emergencia';
      subtipo = 'Rota de Fuga';
    } else if (sheetName.includes('PORTAS CORTA FOGO')) {
      tipoClass = 'saida_emergencia';
      subtipo = 'Porta Corta Fogo';
    } else if (sheetName.includes('PONTOS DE ENCONTRO')) {
      tipoClass = 'ponto_encontro';
      subtipo = 'Ponto de Encontro';
    }

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 4) return; // Skip headers

      const rowVals = row.values;
      if (!rowVals || rowVals.length < 4) return;

      const tipoCode = rowVals[1] ? String(rowVals[1]).trim() : '';
      const codigo = rowVals[2] ? String(rowVals[2]).trim() : '';
      const localizacao = rowVals[3] ? String(rowVals[3]).trim() : '';

      if (!codigo || codigo.toLowerCase().includes('número') || codigo === 'null') return;

      allEquipamentos.push({
        codigo,
        tipo: tipoClass,
        subtipo,
        capacidade: tipoClass === 'extintor' ? (subtipo.includes('CO2') ? '6kg' : subtipo.includes('PQS') ? '4kg' : '10L') : 'N/A',
        setor: localizacao,
        localizacao_detalhada: localizacao,
        validade_carga: '2027-12-31',
        validade_teste_hidro: '2028-12-31',
        pressao_status: 'OK',
        lacre_status: 'OK',
        sinalizacao_status: 'OK',
        desobstruido: 1,
        status_geral: 'APROVADO',
        qr_code_data: codigo
      });
    });
  }

  console.log(`Total items extracted: ${allEquipamentos.length}`);
  fs.writeFileSync('all_seed_items.json', JSON.stringify(allEquipamentos, null, 2));
}

extractAll().catch(err => console.error(err));
