const fs = require('fs');

const session = {
    usuario_nome: 'Admin Mock',
    usuario_nivel: 'Gestor',
    usuario_id: 1
};

const dbContext = {
    ambientes: [],
    currentChecklists: [],
    currentOS: [ { id: 1, getStatus: () => 'Pendente', getSolicitanteNome: () => 'Joao', getAmbienteNome: () => 'Sala 1', getDescricaoProblema: () => 'Luz', getTipoExecucao: () => 'Interna', getExecutorNome: () => 'Pedro', getDataAbertura: () => '2026-06-01' } ],
    executores: [],
    rankingAmbientes: [],
    pesquisa: ''
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
    
    try {
        const fn = new Function('session', 'localContext', `return (${js});`);
        return !!fn(session, localContext);
    } catch(e) {
        return false;
    }
}

function compileLoops(html, session, dbContext) {
    const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
    
    return html.replace(foreachRegex, (match, collectionExpr, itemVar, body) => {
        const collectionName = collectionExpr.trim();
        let items = dbContext.currentOS;
        if (collectionName !== 'ordensServico') return '';
        
        let rendered = '';
        items.forEach((item, idx) => {
            rendered += 'ROW_MOCK_RENDERED\n';
        });
        return rendered;
    });
}

function compileConditionals(html, session, localContext = {}) {
    const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
    html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? ifBody : elseBody;
    });
    const ifRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
    html = html.replace(ifRegex, (match, condStr, body) => {
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? body : '';
    });
    return html;
}

let html = fs.readFileSync('public/views/corretivas.php', 'utf8');
const doctypeIndex = html.toLowerCase().indexOf('<!doctype');
html = doctypeIndex !== -1 ? html.slice(doctypeIndex) : html;

html = compileLoops(html, session, dbContext);
html = compileConditionals(html, session);

fs.writeFileSync('output.html', html);
console.log('Done rendering!');
