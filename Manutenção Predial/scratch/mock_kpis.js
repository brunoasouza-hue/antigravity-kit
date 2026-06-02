const fs = require('fs');
const file = 'start_test_server.js';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const newLines = `        // 6. KPIs Rápidos Dinâmicos
        const osPendentesList = ordensServico.filter(os => os.status !== 'Concluída' && os.status !== 'FINALIZADO' && os.status !== 'Recusada');
        
        // Ambientes com Falhas
        const ambAfetadosSet = new Set();
        osPendentesList.forEach(os => {
            if (os.ambiente_id) ambAfetadosSet.add(os.ambiente_id);
        });
        const ambientesAfetados = ambAfetadosSet.size;

        // O.S. Concluidas Mes
        let concluidasMes = 0;
        ordensServico.forEach(os => {
            if ((os.status === 'Concluída' || os.status === 'FINALIZADO') && os.data_abertura && os.data_abertura.startsWith(curMes)) {
                concluidasMes++;
            }
        });

        // Preventivas no mes
        let prevMes = 0;
        checklists.forEach(c => {
            if (c.data_inspecao && c.data_inspecao.startsWith(curMes)) {
                prevMes++;
            }
        });

        // OS pendentes totais
        const osPendentes = osPendentesList.length;

        context.ambientes_afetados = ambientesAfetados;
        context.os_concluidas_mes = concluidasMes;
        context.preventivas_mes = prevMes;
        context.os_pendentes = osPendentes;`;

// I will insert it right before context.dadosStatus = dadosStatus; in start_test_server.js

const targetStr = "        context.dadosStatus = dadosStatus;";
let targetIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(targetStr)) {
        targetIndex = i;
        break;
    }
}

if (targetIndex !== -1) {
    lines.splice(targetIndex, 0, newLines);
    fs.writeFileSync(file, lines.join('\n'));
    console.log("Mock server context variables injected!");
} else {
    console.log("Target not found");
}

// Now we need to update the replace block
let compileVarsIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("html = html.replace(/<\\?=\\s*.*?\\s*\\?>/g, '');")) {
        compileVarsIndex = i;
        break;
    }
}

if (compileVarsIndex !== -1) {
    const replaceLines = `
    if (context.ambientes_afetados !== undefined) {
        html = html.replace(/<\\?=\\s*\\$ambientes_afetados\\s*\\?>/g, context.ambientes_afetados);
        html = html.replace(/<\\?=\\s*\\$os_concluidas_mes\\s*\\?>/g, context.os_concluidas_mes);
        html = html.replace(/<\\?=\\s*\\$preventivas_mes\\s*\\?>/g, context.preventivas_mes);
        html = html.replace(/<\\?=\\s*\\$os_pendentes\\s*\\?>/g, context.os_pendentes);
    }
    `;
    lines.splice(compileVarsIndex, 0, replaceLines);
    fs.writeFileSync(file, lines.join('\n'));
    console.log("Mock server replacements added!");
}
