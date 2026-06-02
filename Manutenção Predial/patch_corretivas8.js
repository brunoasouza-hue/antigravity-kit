const fs = require('fs');
let file = fs.readFileSync('public/views/corretivas.php', 'utf8');

const regexJSHTML = /function renderRowHtml\(data\) \{[\s\S]*?return \`[\s\S]*?\`;\r?\n\s*\}/;
const replJSHTML = `function renderRowHtml(data) {
            const execNome = data.executor_nome ? data.executor_nome : '<span style="color: #999; font-style: italic;">Não Atribuído</span>';

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
                    \${'<?php echo $usuarioNivel; ?>' === 'Gestor' ? \`
                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                        <button class="btn-visualizar" type="button" title="Visualizar Detalhes" onclick="visualizarOS(\${data.id})" style="background-color: #00C5FF; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-eye-fill"></i></button>
                        <button class="btn-aprovar" type="button" title="Aprovar/Finalizar" onclick="visualizarOS(\${data.id})" style="background-color: #00E676; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-check-lg"></i></button>
                        <button class="btn-excluir" type="button" title="Excluir/Cancelar" onclick="alert('Funcionalidade de cancelamento a ser implementada.');" style="background-color: #FF1744; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-trash-fill"></i></button>
                    </div>
                    \` : \`
                    <button class="btn-visualizar" type="button" title="Abrir O.S." onclick="visualizarOS(\${data.id})" style="background-color: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Abrir ➔</button>
                    \`}
                </td>
            \`;
        }`;

if (regexJSHTML.test(file)) {
    file = file.replace(regexJSHTML, replJSHTML);
    console.log('Replaced JS HTML');
} else {
    console.error('JS HTML NOT FOUND');
}

fs.writeFileSync('public/views/corretivas.php', file);
