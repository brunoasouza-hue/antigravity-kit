const fs = require('fs');
let lines = fs.readFileSync('start_test_server.js', 'utf8').split('\\n');

let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('html = html.substring(0, tbodyStart) + \\'<tbody>\\\\n                { regex:')) {
        startIdx = i;
        break;
    }
}

if (startIdx !== -1) {
    // Restore the usuarios table logic
    lines[startIdx] = "            html = html.substring(0, tbodyStart) + '<tbody>\\n' + rowsHtml + '\\n' + html.substring(tbodyEnd);";
    lines[startIdx+1] = "        }";
    lines[startIdx+2] = "        // Renderizar options do select de Novo Usuario";
    lines[startIdx+3] = "        const selectStart = html.indexOf('<select name=\"ambientes_vinculados[]');";
    lines[startIdx+4] = "        if (selectStart !== -1) {";
    lines[startIdx+5] = "            const selectEnd = html.indexOf('</select>', selectStart);";
    lines[startIdx+6] = "            let optionsHtml = '';";
    lines[startIdx+7] = "            activeAmbientes.forEach(amb => {";
    lines[startIdx+8] = "                optionsHtml += `<option value=\"\${amb.id}\">#\${amb.id} - \${escapeHtml(amb.nome_ambiente)}</option>\\n`;";
    lines[startIdx+9] = "            });";
    lines[startIdx+10] = "            const innerStart = html.indexOf('>', selectStart) + 1;";
    lines[startIdx+11] = "            html = html.substring(0, innerStart) + '\\n' + optionsHtml + html.substring(selectEnd);";
    lines[startIdx+12] = "        }";
}

// Now replace the ACTUALLY wrong RegExp lines in compileLoops
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('new RegExp(`<\\\\?php\\\\s+echo\\\\s+\\\\$h\\\\[\\'id\\'\\]\\\\s*;?\\\\s*\\\\?>`, \\'g\\')')) {
        lines[i] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['id'\\]\\\\s*;?\\\\s*\\\\?>/g, val: item.id },`;
    }
    if (lines[i].includes('new RegExp(`<\\\\?php\\\\s+echo\\\\s+date\\\\(\\\\s*[\\'"]d/m/Y[\\'"]\\\\s*,\\\\s*strtotime\\\\(\\\\s*\\\\$h\\\\[\\'data_inicio\\'\\]\\\\s*\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>`, \\'g\\')')) {
        lines[i] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+date\\(\\s*['"]d\\/m\\/Y['"]\\s*,\\s*strtotime\\(\\s*\\$h\\['data_inicio'\\]\\s*\\)\\s*\\)\\s*;?\\s*\\\\?>/g, val: formatDate(item.data_inicio) },`;
    }
    if (lines[i].includes('new RegExp(`<\\\\?php\\\\s+echo\\\\s+\\\\$h\\\\[\\'data_fim\\'\\]\\\\s*\\\\?\\\\s*date\\\\(\\\\s*[\\'"]d/m/Y[\\'"]\\\\s*,\\\\s*strtotime\\\\(\\\\s*\\\\$h\\\\[\\'data_fim\\'\\]\\\\s*\\\\)\\\\s*\\\\)\\\\s*:\\\\s*[\\'"]-[\\'"]\\\\s*;?\\\\s*\\\\?>`, \\'g\\')')) {
        lines[i] = `                { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$h\\['data_fim'\\]\\s*\\?\\s*date\\(\\s*['"]d\\/m\\/Y['"]\\s*,\\s*strtotime\\(\\s*\\$h\\['data_fim'\\]\\s*\\)\\s*\\)\\s*:\\s*['"]-['"]\\s*;?\\s*\\\\?>/g, val: item.data_fim ? formatDate(item.data_fim) : '-' },`;
    }
}

fs.writeFileSync('start_test_server.js', lines.join('\\n'));
console.log('Restored broken lines and fixed RegExp!');
