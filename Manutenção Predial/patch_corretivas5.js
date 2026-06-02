const fs = require('fs');
let file = fs.readFileSync('public/views/corretivas.php', 'utf8');

const regexPHPBlock = /<\?php foreach \(\$ordensServico as \$os\): \?>[\s\S]*?<\?php endforeach; \?>/;
const replPHPBlock = `<?php foreach ($ordensServico as $os): ?>
                                <?php $status = $os->getStatus(); ?>
                                <tr id="row-<?php echo $os->getId(); ?>" data-status="<?php echo htmlspecialchars($status); ?>" style="border-bottom: 1px solid #e0e0e0; background-color: #fff; transition: background-color 0.2s;" class="linha-tabela-os">
                                    
                                    <td style="padding: 15px; text-align: center; vertical-align: middle;">
                                        <div style="font-size: 16px; font-weight: bold; color: #111;">#<?php echo $os->getId(); ?></div>
                                        <div style="font-size: 12px; color: #666; margin-top: 4px;">📅 <?php echo date('d/m/Y H:i', strtotime($os->getDataAbertura() ?? '')); ?></div>
                                    </td>
                                    
                                    <td style="padding: 15px; vertical-align: middle;">
                                        <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="<?php echo htmlspecialchars($os->getDescricaoProblema()); ?>">
                                            <?php echo htmlspecialchars($os->getDescricaoProblema()); ?>
                                        </div>
                                        <div style="font-size: 12px; font-weight: bold; color: #C62828;">
                                            📍 <?php echo htmlspecialchars($os->getAmbienteNome() ?? 'N/D'); ?> 
                                            <span class="badge-tipo" style="font-size: 10px; padding: 2px 6px; margin-left: 4px;"><?php echo htmlspecialchars($os->getTipoExecucao()); ?></span>
                                        </div>
                                    </td>
                                    
                                    <td style="padding: 15px; vertical-align: middle; line-height: 1.4;">
                                        <div style="font-size: 13px; margin-bottom: 6px;">
                                            <span style="color: #888; font-size: 10px; text-transform: uppercase; font-weight: bold;">Solicitante</span><br>
                                            <span style="color: #222; font-weight: 500;" title="<?php echo htmlspecialchars($os->getSolicitanteNome() ?? 'N/D'); ?>"><?php echo htmlspecialchars($os->getSolicitanteNome() ?? 'N/D'); ?></span>
                                        </div>
                                        <div style="font-size: 13px;">
                                            <span style="color: #888; font-size: 10px; text-transform: uppercase; font-weight: bold;">Executor</span><br>
                                            <span style="color: #222; font-weight: 500;" title="<?php echo htmlspecialchars($os->getExecutorNome() ?? 'Não Atribuído'); ?>">
                                                <?php if (!empty($os->getExecutorNome())): ?>
                                                    <?php echo htmlspecialchars($os->getExecutorNome()); ?>
                                                <?php else: ?>
                                                    <span style="color: #999; font-style: italic;">Não Atribuído</span>
                                                <?php endif; ?>
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td style="padding: 15px; text-align: center; vertical-align: middle;">
                                        <?php if ($status === 'Pendente' && empty($os->getExecutorNome())): ?>
                                            <span style="background-color: #fffbeb; color: #b45309; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #fcd34d;">Pendente</span>
                                        <?php endif; ?>
                                        <?php if ($status === 'Em Execução' || ($status === 'Pendente' && !empty($os->getExecutorNome()))): ?>
                                            <span style="background-color: #eff6ff; color: #1d4ed8; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #bfdbfe;">Em Execução</span>
                                        <?php endif; ?>
                                        <?php if ($status === 'Aguardando Validação'): ?>
                                            <span style="background-color: #ecfeff; color: #0e7490; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #a5f3fc;">Aguardando Validação</span>
                                        <?php endif; ?>
                                        <?php if ($status === 'Concluída'): ?>
                                            <span style="background-color: #f0fdf4; color: #15803d; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #bbf7d0;">Concluída</span>
                                        <?php endif; ?>
                                    </td>
                                    
                                    <td style="padding: 15px; text-align: center; vertical-align: middle;" onclick="event.stopPropagation()">
                                        <?php if ($usuarioNivel === 'Gestor'): ?>
                                            <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                                                <button class="btn-visualizar" type="button" title="Visualizar Detalhes" onclick="visualizarOS(<?php echo $os->getId(); ?>)" style="background-color: #00C5FF; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-eye-fill"></i></button>
                                                <button class="btn-aprovar" type="button" title="Aprovar/Finalizar" onclick="visualizarOS(<?php echo $os->getId(); ?>)" style="background-color: #00E676; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-check-lg"></i></button>
                                                <button class="btn-excluir" type="button" title="Excluir/Cancelar" onclick="alert('Funcionalidade de cancelamento a ser implementada.');" style="background-color: #FF1744; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-trash-fill"></i></button>
                                            </div>
                                        <?php else: ?>
                                            <button class="btn-visualizar" type="button" title="Abrir O.S." onclick="visualizarOS(<?php echo $os->getId(); ?>)" style="background-color: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Abrir ➔</button>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>`;

const regexJSBadge = /function renderStatusBadge\(status, executorNome = null\) \{[\s\S]*?return '';\n\s*\}/;
const replJSBadge = `function renderStatusBadge(status, executorNome = null) {
            if (status === 'Pendente' && executorNome) {
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
            return '';
        }`;

const regexJSHTML = /function renderRowHtml\(data\) \{[\s\S]*?return \`[\s\S]*?\`;\n\s*\}/;
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
                        <span style="color: #888; font-size: 10px; text-transform: uppercase; font-weight: bold;">Solicitante</span><br>
                        <span style="color: #222; font-weight: 500;" title="\${data.solicitante_nome || 'N/D'}">\${data.solicitante_nome || 'N/D'}</span>
                    </div>
                    <div style="font-size: 13px;">
                        <span style="color: #888; font-size: 10px; text-transform: uppercase; font-weight: bold;">Executor</span><br>
                        <span style="color: #222; font-weight: 500;" title="\${data.executor_nome || 'Não Atribuído'}">\${execNome}</span>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center; vertical-align: middle;">
                    \${renderStatusBadge(data.status, data.executor_nome)}
                </td>
                <td style="padding: 15px; text-align: center; vertical-align: middle;" onclick="event.stopPropagation()">
                    \${'<?php echo $usuarioNivel; ?>' === 'Gestor' ? \\\`
                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                        <button class="btn-visualizar" type="button" title="Visualizar Detalhes" onclick="visualizarOS(\${data.id})" style="background-color: #00C5FF; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-eye-fill"></i></button>
                        <button class="btn-aprovar" type="button" title="Aprovar/Finalizar" onclick="visualizarOS(\${data.id})" style="background-color: #00E676; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-check-lg"></i></button>
                        <button class="btn-excluir" type="button" title="Excluir/Cancelar" onclick="alert('Funcionalidade de cancelamento a ser implementada.');" style="background-color: #FF1744; border: none; color: white; padding: 6px; border-radius: 6px; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><i class="bi bi-trash-fill"></i></button>
                    </div>
                    \\\` : \\\`
                    <button class="btn-visualizar" type="button" title="Abrir O.S." onclick="visualizarOS(\${data.id})" style="background-color: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Abrir ➔</button>
                    \\\`}
                </td>
            \`;
        }`;

if (regexPHPBlock.test(file)) {
    file = file.replace(regexPHPBlock, replPHPBlock);
    console.log('Replaced PHP Block');
} else {
    console.error('PHP Block NOT FOUND');
}

if (regexJSBadge.test(file)) {
    file = file.replace(regexJSBadge, replJSBadge);
    console.log('Replaced JS Badge');
} else {
    console.error('JS Badge NOT FOUND');
}

if (regexJSHTML.test(file)) {
    file = file.replace(regexJSHTML, replJSHTML);
    console.log('Replaced JS HTML');
} else {
    console.error('JS HTML NOT FOUND');
}

fs.writeFileSync('public/views/corretivas.php', file);
