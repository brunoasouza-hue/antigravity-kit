const fs = require('fs');

const session = { usuario_nome: 'Admin Mock', usuario_nivel: 'Gestor', usuario_id: 1 };
const dbContext = {
    ambientes: [], currentChecklists: [], executores: [], rankingAmbientes: [], pesquisa: '',
    currentOS: [ { id: 1, getStatus: () => 'Pendente', getSolicitanteNome: () => 'Joao', getAmbienteNome: () => 'Sala 1', getDescricaoProblema: () => 'Luz', getTipoExecucao: () => 'Interna', getExecutorNome: () => 'Pedro', getDataAbertura: () => '2026-06-01' } ]
};

function evaluatePhpCondition(condStr, session, localContext = {}) {
    let js = condStr
        .replace(/\$usuarioNivel/g, 'session.usuario_nivel')
        .replace(/\$usuarioNome/g, 'session.usuario_nome')
        .replace(/\$usuarioId/g, 'session.usuario_id')
        .replace(/\$status/g, 'localContext.status')
        .replace(/\$pesquisa/g, 'localContext.pesquisa')
        .replace(/\$alertaSucesso/g, 'session.alerta_sucesso')
        .replace(/\$alertaErro/g, 'session.alerta_erro')
        .replace(/\$erro/g, 'localContext.erro')
        .replace(/empty\((.*?)\)/g, '( !$1 || (Array.isArray($1) && $1.length === 0) )')
        .replace(/!empty\((.*?)\)/g, '( $1 && (!Array.isArray($1) || $1.length > 0) )')
        .replace(/isset\((.*?)\)/g, '( typeof $1 !== "undefined" && $1 !== null )');
    try { const fn = new Function('session', 'localContext', `return (${js});`); return !!fn(session, localContext); } catch(e) { return false; }
}

let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

// 1. Loops
const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
html = html.replace(foreachRegex, (match, collectionExpr, itemVar, body) => {
    if (collectionExpr.trim() === 'ordensServico') return 'ROW_MOCK_RENDERED';
    return '';
});

// 2. Conditionals
const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
    const isTrue = evaluatePhpCondition(condStr, session, {});
    return isTrue ? ifBody : elseBody;
});

const ifRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
html = html.replace(ifRegex, (match, condStr, body) => {
    const isTrue = evaluatePhpCondition(condStr, session, {});
    return isTrue ? body : '';
});

console.log("Has ROW_MOCK:", html.includes("ROW_MOCK_RENDERED"));
fs.writeFileSync('output2.html', html);
