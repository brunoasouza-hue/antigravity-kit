const fs = require('fs');

const db = JSON.parse(fs.readFileSync('mock_database.json', 'utf8'));
const session = { usuario_nivel: 'Gestor', usuario_nome: 'Gestor Teste', usuario_id: 1 };
const localContext = { 
    status: '', pesquisa: '', erro: '', 
    historicoInspecoes: db.inspecoes_mensais.filter(i => i.status === 'Finalizada').sort((a,b) => b.id - a.id)
};

let html = `
                          <?php if (empty($historicoInspecoes)): ?>
                              <tr id="linha-vazia">
                                  <td colspan="4" style="padding: 30px; text-align: center; color: 
var(--corTxt2);">Nenhum ciclo finalizado no histórico.</td>
                              </tr>
                          <?php else: ?>
                              <?php foreach ($historicoInspecoes as $h): ?>
                                  <tr style="border-bottom: 1px solid var(--corBorda); transition: 0.2s;">
                                      <td style="padding: 15px; font-weight: bold; color: var(--corTxt2);">#<?php echo 
$h['id']; ?></td>
                                      <td style="padding: 15px; font-size: 14px; color: var(--corTxt3);"><?php echo 
date('d/m/Y', strtotime($h['data_inicio'])); ?></td>
                                      <td style="padding: 15px; font-size: 14px; color: var(--corTxt3);"><?php echo 
$h['data_fim'] ? date('d/m/Y', strtotime($h['data_fim'])) : '-'; ?></td>
                                      <td style="padding: 15px; text-align: center;">
                                          <span class="badge" style="background: rgba(40,167,69,0.1); color: #28a745; 
padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold;"><i class="bi bi-check2-circle"></i> 
Finalizada</span>
                                      </td>
                                  </tr>
                              <?php endforeach; ?>
                          <?php endif; ?>
`;

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
        .replace(/\$historicoInspecoes/g, 'localContext.historicoInspecoes')
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

function compileConditionals(html, session, localContext = {}) {
    // Resolve if/else/endif
    const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>([\s\S]*?)<\?php\s+else\s*:\s*\?>([\s\S]*?)<\?php\s+endif\s*;\s*\?>/gs;
    html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
        if (ifBody.includes('<?php if') || elseBody.includes('<?php if')) return match;
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? ifBody : elseBody;
    });

    // Resolve if/endif
    const ifRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>([\s\S]*?)<\?php\s+endif\s*;\s*\?>/gs;
    html = html.replace(ifRegex, (match, condStr, body) => {
        if (body.includes('<?php if')) return match;
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? body : '';
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
            
            getterMatches.forEach(m => {
                itemHtml = itemHtml.replace(m.regex, m.val);
            });
            
            rendered += itemHtml;
        });
        return rendered;
    });
}

html = compileLoops(html, session, localContext);
html = compileConditionals(html, session, localContext);

console.log("RESULT HTML:", html);
