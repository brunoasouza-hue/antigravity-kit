const fs = require('fs');
let file = fs.readFileSync('public/views/corretivas.php', 'utf8');

const regexJSBadge = /function renderStatusBadge\(status, executorNome = null\) \{[\s\S]*?return '';\r?\n\s*\}/;
const replJSBadge = `function renderStatusBadge(status, executorNome = null) {
            if (status === 'Pendente' && executorNome) {
                status = 'Em Execução';
            }
            if (status === 'Em Andamento') {
                status = 'Em Execução';
            }
            
            if (status === 'Pendente') {
                return \`<span style="background-color: #fffbeb; color: #b45309; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #fcd34d;">Pendente</span>\`;
            } else if (status === 'Em Execução') {
                return \`<span style="background-color: #eff6ff; color: #1d4ed8; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #bfdbfe;">Em Execução</span>\`;
            } else if (status === 'Aguardando Validação') {
                return \`<span style="background-color: #ecfeff; color: #0e7490; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #a5f3fc;">Aguardando Validação</span>\`;
            } else if (status === 'Concluída') {
                return \`<span style="background-color: #f0fdf4; color: #15803d; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #bbf7d0;">Concluída</span>\`;
            }
            
            // Fallback for unknown status so the column doesn't collapse
            return \`<span style="background-color: #f1f5f9; color: #334155; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #e2e8f0;">\${status || 'DESCONHECIDO'}</span>\`;
        }`;

if (regexJSBadge.test(file)) {
    file = file.replace(regexJSBadge, replJSBadge);
    console.log('Replaced JS Badge');
} else {
    console.error('JS Badge NOT FOUND');
}

fs.writeFileSync('public/views/corretivas.php', file);
