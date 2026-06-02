const fs = require('fs');

const path = require('path');
const serverPath = path.join(__dirname, '..', 'start_test_server.js');

let c = fs.readFileSync(serverPath, 'utf8');

const startStr = 'function compileVariables(html, context) {';
const endStr = 'function compilePhp(filePath, session, getParams = {}) {';

const startIndex = c.indexOf(startStr);
const endIndex = c.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    const before = c.substring(0, startIndex);
    const after = c.substring(endIndex);
    
    const newCompileVars = `function compileVariables(html, context) {
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
        { regex: /BASE_URL\\s*\\.\\s*['"](.*?)['"]/g, val: "'$1'" }
    ];
    
    echos.forEach(e => {
        html = html.replace(e.regex, e.val);
    });
    
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

    if (context.dadosStatus && context.dadosStatus !== 'null') {
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosStatus.*?JSON_UNESCAPED_UNICODE.*?\\)\\s*;?\\s*\\?>/gs,
            context.dadosStatus
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosTendencia.*?JSON_UNESCAPED_UNICODE.*?\\)\\s*;?\\s*\\?>/gs,
            context.dadosTendencia || 'null'
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosRanking.*?JSON_UNESCAPED_UNICODE.*?\\)\\s*;?\\s*\\?>/gs,
            context.dadosRanking || 'null'
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosFluxo.*?JSON_UNESCAPED_UNICODE.*?\\)\\s*;?\\s*\\?>/gs,
            context.dadosFluxo || 'null'
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+json_encode\\(\\s*\\$dadosCarga.*?JSON_UNESCAPED_UNICODE.*?\\)\\s*;?\\s*\\?>/gs,
            context.dadosCarga || 'null'
        );
        html = html.replace(
            /<\\?php\\s+echo\\s+array_sum\\(\\s*\\$dadosStatus\\['data'\\]\\s*\\)\\s*;?\\s*\\?>/gs,
            String((() => { try { return JSON.parse(context.dadosStatus).data.reduce((a,b) => a+b, 0); } catch(e) { return 0; } })())
        );
    }

    html = html.replace(/<\\?php\\s+echo\\s+.*?\\s*;?\\s*\\?>/g, '');
    html = html.replace(/<\\?=\\s*.*?\\s*\\?>/g, '');
    html = html.replace(/<\\?php.*?\\?>/gs, '');

    return html;
}

`;

    fs.writeFileSync(serverPath, before + newCompileVars + after);
    console.log("CompileVars fixed!");
} else {
    console.log("Could not find start/end.");
}
