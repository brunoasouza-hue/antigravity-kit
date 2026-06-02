const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'start_test_server.js');
let lines = fs.readFileSync(serverPath, 'utf8').split('\n');

// Find compileVariables
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('function compileVariables(')) {
        startIdx = i;
        break;
    }
}

// Find compilePhp
let endIdx = -1;
for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].startsWith('function compilePhp(')) {
        endIdx = i;
        break;
    }
}

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find functions:", startIdx, endIdx);
    process.exit(1);
}

const compileVariablesFn = `function compileVariables(html, context) {
    const echos = [
        { regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$usuarioNome\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.usuarioNome) },
        { regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$usuarioNivel\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.usuarioNivel) },
        { regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$usuarioEmail\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.usuarioEmail) },
        { regex: /<\\?php\\s+echo\\s+\\$dataAtual\\s*;?\\s*\\?>/g, val: context.dataAtual },
        { regex: /<\\?php\\s+echo\\s+\\$totalAmbientes\\s*;?\\s*\\?>/g, val: context.totalAmbientes },
        { regex: /<\\?php\\s+echo\\s+\\$totalAtivos\\s*;?\\s*\\?>/g, val: context.totalAtivos },
        { regex: /<\\?php\\s+echo\\s+\\$totalInativos\\s*;?\\s*\\?>/g, val: context.totalInativos },
        { regex: /<\\?php\\s+echo\\s+\\$totalChecklists\\s*;?\\s*\\?>/g, val: context.totalChecklists },
        { regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$alertaSucesso\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.alertaSucesso) },
        { regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$alertaErro\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.alertaErro) },
        { regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$erro\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.erro) },
        { regex: /<\\?php\\s+echo\\s+BASE_URL\\s*;?\\s*\\?>/g, val: '' },
        { regex: /BASE_URL\\s*\\.\\s*['"](.*?)['"]/g, val: "'" + "$1" + "'" }
    ];
    
    echos.forEach(e => {
        html = html.replace(e.regex, e.val);
    });
    
    // Tratamento de variáveis estatísticas do Gestor (dashboard_analise.php)
    if (context.dashboard_analise) {
        const da = context.dashboard_analise;
        html = html.replace(/<\\?php\\s+echo\\s+\\$totalAbertas\\s*;?\\s*\\?>/g, da.totalAbertas);
        html = html.replace(/<\\?php\\s+echo\\s+\\$totalPendentes\\s*;?\\s*\\?>/g, da.totalPendentes);
        html = html.replace(/<\\?php\\s+echo\\s+\\$totalPreventivasMes\\s*;?\\s*\\?>/g, da.totalPreventivasMes);
        
        html = html.replace(/<\\?php\\s+echo\\s+json_encode\\(\\s*\\$labelsMeses\\s*\\)\\s*;?\\s*\\?>/g, JSON.stringify(da.labelsMeses));
        html = html.replace(/<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dataPreventivas\\s*\\)\\s*;?\\s*\\?>/g, JSON.stringify(da.dataPreventivas));
        html = html.replace(/<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dataCorretivas\\s*\\)\\s*;?\\s*\\?>/g, JSON.stringify(da.dataCorretivas));
        html = html.replace(/<\\?php\\s+echo\\s+\\$totalInterna\\s*;?\\s*\\?>/g, da.totalInterna);
        html = html.replace(/<\\?php\\s+echo\\s+\\$totalTerceirizada\\s*;?\\s*\\?>/g, da.totalTerceirizada);
        
        html = html.replace(/<\\?php\\s+echo\\s+json_encode\\(\\s*array_column\\(\\s*\\$rankingAmbientes\\s*,\\s*['"]nome['"]\\s*\\)\\s*\\)\\s*;?\\s*\\?>/g, JSON.stringify(da.rankingAmbientes.map(r => r.nome)));
        html = html.replace(/<\\?php\\s+echo\\s+json_encode\\(\\s*array_column\\(\\s*\\$rankingAmbientes\\s*,\\s*['"]total['"]\\s*\\)\\s*\\)\\s*;?\\s*\\?>/g, JSON.stringify(da.rankingAmbientes.map(r => r.total)));
    }

    // ── Dashboard Gerencial: substituições dos 5 gráficos Chart.js ────────────
    if (context.dadosStatus && context.dadosStatus !== 'null') {
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosStatus\\s*,\\s*JSON_UNESCAPED_UNICODE\\s*\\)\\s*;?\\s*\\?>/g,
            context.dadosStatus
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosTendencia\\s*,\\s*JSON_UNESCAPED_UNICODE\\s*\\)\\s*;?\\s*\\?>/g,
            context.dadosTendencia || 'null'
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosRanking\\s*,\\s*JSON_UNESCAPED_UNICODE\\s*\\)\\s*;?\\s*\\?>/g,
            context.dadosRanking || 'null'
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosFluxo\\s*,\\s*JSON_UNESCAPED_UNICODE\\s*\\)\\s*;?\\s*\\?>/g,
            context.dadosFluxo || 'null'
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosCarga\\s*,\\s*JSON_UNESCAPED_UNICODE\\s*\\)\\s*;?\\s*\\?>/g,
            context.dadosCarga || 'null'
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+array_sum\\(\\s*\\$dadosStatus\\['data'\\]\\s*\\)\\s*;?\\s*\\?>/g,
            String((() => { try { return JSON.parse(context.dadosStatus).data.reduce((a,b) => a+b, 0); } catch(e) { return 0; } })())
        );
    }

    // Limpa tags residuais do PHP
    html = html.replace(/<\\?php\\s+echo\\s+.*?\\s*;?\\s*\\?>/g, '');
    html = html.replace(/<\\?=\\s*.*?\\s*\\?>/g, '');
    html = html.replace(/<\\?php.*?\\?>/gs, '');

    return html;
}
`;

const before = lines.slice(0, startIdx);
const after = lines.slice(endIdx);
const newLines = [...before, compileVariablesFn, ...after];
fs.writeFileSync(serverPath, newLines.join('\n'));
console.log('✅ Repair complete!');

// Check syntax
const { execSync } = require('child_process');
execSync('node --check ' + serverPath);
console.log('Syntax OK');
