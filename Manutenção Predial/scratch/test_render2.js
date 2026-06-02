const fs = require('fs');

const db = JSON.parse(fs.readFileSync('mock_database.json', 'utf8'));
const session = { usuario_nivel: 'Gestor', usuario_nome: 'Gestor Teste', usuario_id: 1 };
const historico = db.inspecoes_mensais.filter(i => i.status === 'Finalizada').sort((a,b) => b.id - a.id);
const localContext = { 
    status: '', pesquisa: '', erro: '', 
    historicoInspecoes: historico
};

let html = fs.readFileSync('public/views/preventivas.php', 'utf8');

function evaluatePhpCondition(condStr, session, localContext = {}) {
    let js = condStr
        .replace(/\$usuarioNivel/g, 'session.usuario_nivel')
        .replace(/\$historicoInspecoes/g, 'localContext.historicoInspecoes')
        .replace(/empty\((.*?)\)/g, '( !$1 || (Array.isArray($1) && $1.length === 0) )');
    
    try {
        const fn = new Function('session', 'localContext', `return (${js});`);
        return !!fn(session, localContext);
    } catch(e) { return false; }
}

function compileConditionals(html, session, localContext = {}) {
    const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>([\s\S]*?)<\?php\s+else\s*:\s*\?>([\s\S]*?)<\?php\s+endif\s*;\s*\?>/gs;
    html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
        if (ifBody.includes('<?php if') || elseBody.includes('<?php if')) return match;
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? ifBody : elseBody;
    });
    return html;
}

function compileLoops(html, session, dbContext) {
    const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>([\s\S]*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
    return html.replace(foreachRegex, (match, collectionExpr, itemVar, body) => {
        const collectionName = collectionExpr.trim();
        let items = [];
        if (collectionName === 'historicoInspecoes') items = dbContext.historicoInspecoes || [];
        
        if (!items || items.length === 0) return '';
        
        let rendered = '';
        items.forEach((item, idx) => {
            let itemHtml = body;
            const getterMatches = [
                { regex: /<\?php\s+echo\s+\$h\['id'\]\s*;?\s*\?>/g, val: item.id },
                { regex: /<\?php\s+echo\s+date\(\s*['"]d\/m\/Y['"]\s*,\s*strtotime\(\s*\$h\['data_inicio'\]\s*\)\s*\)\s*;?\s*\?>/g, val: item.data_inicio },
                { regex: /<\?php\s+echo\s+\$h\['data_fim'\]\s*\?\s*date\(\s*['"]d\/m\/Y['"]\s*,\s*strtotime\(\s*\$h\['data_fim'\]\s*\)\s*\)\s*:\s*['"]-['"]\s*;?\s*\?>/g, val: item.data_fim }
            ];
            getterMatches.forEach(m => { itemHtml = itemHtml.replace(m.regex, m.val); });
            rendered += itemHtml;
        });
        return rendered;
    });
}

html = compileLoops(html, session, localContext);
for(let i=0; i<3; i++) html = compileConditionals(html, session, localContext);

const tbodyStart = html.indexOf('<tbody id="tabela-historico">');
if (tbodyStart !== -1) {
    console.log(html.substring(tbodyStart, html.indexOf('</tbody>', tbodyStart) + 8));
} else {
    console.log("Not found.");
}
