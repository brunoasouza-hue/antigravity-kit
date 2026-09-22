const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const excelPath = `C:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Inspeção_brigada\\Planilha\\Relatorio_Inspecao_2026-09-22.xlsx`;

async function inspect() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  console.log("Worksheet names:", workbook.worksheets.map(w => w.name));

  for (const sheet of workbook.worksheets) {
    console.log(`\n=== SHEET: ${sheet.name} (RowCount: ${sheet.rowCount}) ===`);
    const rows = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      rows.push({ rowNumber, values: row.values });
    });

    console.log("First 15 rows:");
    rows.slice(0, 15).forEach(r => {
      console.log(`Row ${r.rowNumber}:`, JSON.stringify(r.values));
    });
  }
}

inspect().catch(err => console.error("Error inspecting:", err));
