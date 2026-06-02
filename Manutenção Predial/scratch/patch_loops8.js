const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const blockStart = "const getterMatches = [";
const blockEnd = "            ];";
const startIdx = code.indexOf(blockStart);
const endIdx = code.indexOf(blockEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newBlock = `const getterMatches = [
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: item.id },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getExecutorId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: item.executor_atual_id || '' },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getSolicitanteId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: item.solicitante_id || '' },
                { regex: new RegExp(\`<?=\\\\s*\\\\$\\\${itemVar}->getId\\\\(\\\\)\\\\s*\\\\?>\`, 'g'), val: item.id },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$\\\${itemVar}->getNomeAmbiente\\\\(\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: escapeHtml(item.nome_ambiente || '') },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+addslashes\\\\(\\\\s*\\\\$\\\${itemVar}->getNomeAmbiente\\\\(\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: (item.nome_ambiente || '').replace(/'/g, "\\\\'") },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getStatus\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: item.status },
                
                // Checklist
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$\\\${itemVar}->getAmbienteNome\\\\(\\\\)\\\\s*(?:\\\\?\\\\?\\\\s*['\\\\"].*?['\\\\"]\\\\s*)?\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: escapeHtml(item.ambiente_nome || 'Desconhecido') },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$\\\${itemVar}->getResponsavelNome\\\\(\\\\)\\\\s*(?:\\\\?\\\\?\\\\s*['\\\\"].*?['\\\\"]\\\\s*)?\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: escapeHtml(item.responsavel_nome || 'N/A') },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+date\\\\(\\\\s*['\\\\"]d/m/Y['\\\\"]\\\\s*,\\\\s*strtotime\\\\(\\\\s*\\\\$\\\${itemVar}->getDataInspecao\\\\(\\\\)\\\\s*\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: formatDate(item.data_inspecao) },
                
                // OS
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$\\\${itemVar}->getSolicitanteNome\\\\(\\\\)\\\\s*(?:\\\\?\\\\?\\\\s*['\\\\"].*?['\\\\"]\\\\s*)?\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: escapeHtml(item.solicitante_nome || '') },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$\\\${itemVar}->getExecutorNome\\\\(\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: escapeHtml(item.executor_nome || 'Não Atribuído') },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$\\\${itemVar}->getGestorNome\\\\(\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: escapeHtml(item.gestor_nome || 'Pendente') },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+date\\\\(\\\\s*['\\\\"]d/m/Y H:i['\\\\"]\\\\s*,\\\\s*strtotime\\\\(\\\\s*\\\\$\\\${itemVar}->getDataAbertura\\\\(\\\\)\\\\s*\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: formatDate(item.data_abertura, true) },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+date\\\\(\\\\s*['\\\\"]d/m/Y H:i['\\\\"]\\\\s*,\\\\s*strtotime\\\\(\\\\s*\\\\$\\\${itemVar}->getDataFechamento\\\\(\\\\)\\\\s*\\\\)\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: formatDate(item.data_fechamento, true) },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getDescricaoProblema\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: escapeHtml(item.descricao_problema || '') },
                
                // Ranking
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\\\$idx\\\\s*\\\\+\\\\\\$1\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: idx + 1 },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\\\$item\\\\['nome'\\\\]\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: escapeHtml(item.nome || '') },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\\\$item\\\\['total'\\\\]\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: item.total || 0 },
                { regex: new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\\\$percentual\\\\s*;?\\\\s*\\\\?>\`, 'g'), val: (item.total / dbContext.maxOS * 100) || 0 }
            ];`;

    code = code.substring(0, startIdx) + newBlock + code.substring(endIdx + blockEnd.length);
    fs.writeFileSync('start_test_server.js', code, 'utf8');
    console.log("Restored SUPER PERFECT getterMatches block.");
} else {
    console.log("Could not find getterMatches block.");
}
