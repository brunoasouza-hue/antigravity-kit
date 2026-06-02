const fs = require('fs');
let file = fs.readFileSync('public/views/corretivas.php', 'utf8');

// Read the file as lines
const lines = file.split('\n');

// Find the line that starts renderActionsHtml (line 652 area)
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function renderActionsHtml(id, status)')) {
        startIdx = i - 1; // Include the comment line above
        break;
    }
}

// Find the end: the closing of the old broken renderRowHtml (the garbage lines ending with the duplicate closing brace)
for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes('// MÉTODOS DE ABERTURA E CONTROLE DOS MODAIS VIA FETCH API') ||
        lines[i].includes('// M\u00c9TODOS DE ABERTURA E CONTROLE DOS MODAIS VIA FETCH API')) {
        endIdx = i - 2; // Go back to include the separator comment
        break;
    }
}

console.log('Start index:', startIdx, 'End index:', endIdx);
if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find start or end markers');
    process.exit(1);
}

// Show what we're about to replace (first and last few lines)
console.log('First lines to replace:');
for (let i = startIdx; i < Math.min(startIdx + 3, endIdx); i++) {
    console.log(`  [${i}]: ${lines[i].substring(0, 80)}`);
}
console.log('Last lines to replace:');
for (let i = Math.max(endIdx - 3, startIdx); i <= endIdx; i++) {
    console.log(`  [${i}]: ${lines[i].substring(0, 80)}`);
}

const replacement = `        // Constrói HTML das ações dinamicamente de acordo com o nível de acesso e status
        function renderActionsHtml(id, status) {
            return \`
                <button class="btn-visualizar" type="button" title="Visualizar/Tramitar" onclick="abrirModalTramitacao(\${id})" style="background-color: #00C5FF; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-eye-fill"></i></button>
                <button class="btn-aprovar" type="button" title="Aprovar/Finalizar" onclick="abrirModalTramitacao(\${id})" style="background-color: #00E676; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-check-lg"></i></button>
                <button class="btn-excluir" type="button" title="Excluir/Cancelar" onclick="alert('Funcionalidade de cancelamento a ser implementada.');" style="background-color: #FF1744; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-trash-fill"></i></button>
            \`;
        }

        // Nível do usuário injetado pelo PHP uma única vez
        const nivelUsuarioAtual = '<?php echo $usuarioNivel; ?>';

        // Re-renderiza de forma inteligente e reativa as linhas da tabela
        function renderRowHtml(data) {
            const execNome = data.executor_nome ? data.executor_nome : '<span style="color: #999; font-style: italic;">Não Atribuído</span>';

            // Monta a coluna de ações separadamente para evitar crases aninhadas
            let acoesHtml = '';
            if (nivelUsuarioAtual === 'Gestor') {
                acoesHtml = '<div style="display: flex; gap: 5px; justify-content: center; align-items: center;">'
                    + '<button class="btn-visualizar" type="button" title="Visualizar Detalhes" onclick="visualizarOS(' + data.id + ')" style="background-color: #00C5FF; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-eye-fill"></i></button>'
                    + '<button class="btn-aprovar" type="button" title="Aprovar/Finalizar" onclick="visualizarOS(' + data.id + ')" style="background-color: #00E676; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-check-lg"></i></button>'
                    + '<button class="btn-excluir" type="button" title="Excluir/Cancelar" onclick="alert(\\x27Funcionalidade de cancelamento a ser implementada.\\x27);" style="background-color: #FF1744; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-trash-fill"></i></button>'
                    + '</div>';
            } else {
                acoesHtml = '<button class="btn-visualizar" type="button" title="Abrir O.S." onclick="visualizarOS(' + data.id + ')" style="background-color: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Abrir ➔</button>';
            }

            return \`
                <td style="padding: 15px; text-align: center; vertical-align: middle;">
                    <div style="font-size: 16px; font-weight: bold; color: #111;">#\${data.id}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">📅 \${data.data_abertura}</div>
                </td>
                <td style="padding: 15px; vertical-align: middle;">
                    <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="\${data.descricao_problema}">\${data.descricao_problema}</div>
                    <div style="font-size: 12px; font-weight: bold; color: #C62828;">📍 \${data.ambiente_nome || 'N/D'} <span class="badge-tipo" style="font-size: 10px; padding: 2px 6px; margin-left: 4px;">\${data.tipo_execucao}</span></div>
                </td>
                <td style="padding: 15px; vertical-align: middle; line-height: 1.4;">
                    <div style="font-size: 13px; margin-bottom: 6px;">
                        <span style="color: #888; font-size: 10px; text-transform: uppercase; font-weight: bold;">SOLICITANTE</span><br>
                        <span style="color: #222; font-weight: 500;" title="\${data.solicitante_nome || 'N/D'}">\${data.solicitante_nome || 'N/D'}</span>
                    </div>
                    <div style="font-size: 13px;">
                        <span style="color: #888; font-size: 10px; text-transform: uppercase; font-weight: bold;">EXECUTOR</span><br>
                        <span style="color: #222; font-weight: 500;" title="\${data.executor_nome || 'Não Atribuído'}">\${execNome}</span>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center; vertical-align: middle;">
                    \${renderStatusBadge(data.status, data.executor_nome)}
                </td>
                <td style="padding: 15px; text-align: center; vertical-align: middle;" onclick="event.stopPropagation()">
                    \${acoesHtml}
                </td>
            \`;
        }`;

// Replace the lines
const newLines = [
    ...lines.slice(0, startIdx),
    replacement,
    ...lines.slice(endIdx + 1)
];

fs.writeFileSync('public/views/corretivas.php', newLines.join('\n'));
console.log('SUCCESS: Replaced lines', startIdx, 'to', endIdx);
