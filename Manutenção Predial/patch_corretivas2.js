const fs = require('fs');
let file = fs.readFileSync('public/views/corretivas.php', 'utf8');

const regex1 = /<thead style="position: sticky; top: 0; z-index: 10; background: #B91C1C; color: #fff;">[\s\S]*?<\/tbody>/;

const repl1 = `<thead style="position: sticky; top: 0; z-index: 10; background: #B91C1C; color: #fff;">
                        <tr>
                            <th style="padding: 15px; width: 12%; white-space: nowrap;">Ordem</th>
                            <th style="padding: 15px; width: 30%;">Local e Problema</th>
                            <th style="padding: 15px; width: 20%; white-space: nowrap;">Envolvidos</th>
                            <th style="padding: 15px; width: 15%; text-align: center; white-space: nowrap;">Status</th>
                            <th style="padding: 15px; width: 10%; text-align: center; white-space: nowrap;">Ação</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-os-body">
                            <?php foreach ($ordensServico as $os): ?>
                                <?php $status = $os->getStatus(); ?>
                                <tr id="row-<?php echo $os->getId(); ?>" data-status="<?php echo htmlspecialchars($status); ?>" style="border-bottom: 1px solid var(--corBorda); transition: 0.2s;" class="linha-tabela-os">
                                    
                                    <td style="padding: 15px; white-space: nowrap;">
                                        <div style="font-weight: 800; color: var(--corTxt2); font-size: 1.1em;">#<?php echo $os->getId(); ?></div>
                                        <div style="font-size: 12px; color: var(--corTxt3); margin-top: 4px;">
                                            <i class="bi bi-calendar-event"></i> <?php echo date('d/m/Y H:i', strtotime($os->getDataAbertura() ?? '')); ?>
                                        </div>
                                    </td>
                                    
                                    <td style="padding: 15px;">
                                        <div style="font-weight: bold; color: var(--corDestaque); font-size: 1.05em; display: flex; align-items: center; gap: 8px;">
                                            <?php echo htmlspecialchars($os->getAmbienteNome() ?? 'N/D'); ?>
                                            <span class="badge-tipo" style="font-size: 10px; padding: 2px 8px;"><?php echo htmlspecialchars($os->getTipoExecucao()); ?></span>
                                        </div>
                                        <div style="font-size: 14px; color: var(--corTxt3); margin-top: 6px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="<?php echo htmlspecialchars($os->getDescricaoProblema()); ?>">
                                            <?php echo htmlspecialchars($os->getDescricaoProblema()); ?>
                                        </div>
                                    </td>
                                    
                                    <td style="padding: 15px; font-size: 13px; color: var(--corTxt2); white-space: nowrap;">
                                        <div style="margin-bottom: 4px;">
                                            <span style="color: var(--corTxt3); font-size: 11px; text-transform: uppercase;">Solicitante:</span><br>
                                            <span style="font-weight: bold; color: #B91C1C;" title="<?php echo htmlspecialchars($os->getSolicitanteNome() ?? 'N/D'); ?>"><?php echo htmlspecialchars($os->getSolicitanteNome() ?? 'N/D'); ?></span>
                                        </div>
                                        <div>
                                            <span style="color: var(--corTxt3); font-size: 11px; text-transform: uppercase;">Executor:</span><br>
                                            <span style="font-weight: 500;" title="<?php echo htmlspecialchars($os->getExecutorNome() ?? 'Não Atribuído'); ?>">
                                                <?php if ($os->getExecutorNome()): ?>
                                                    <?php echo htmlspecialchars($os->getExecutorNome()); ?>
                                                <?php else: ?>
                                                    <span style="color: #999; font-style: italic;">Não Atribuído</span>
                                                <?php endif; ?>
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td style="padding: 15px; text-align: center; white-space: nowrap;">
                                        <?php if ($status === 'Pendente'): ?>
                                            <span style="background-color: rgba(255, 193, 7, 0.12); color: #ffc107; border: 1px solid #ffc107; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block;">Pendente</span>
                                        <?php elseif ($status === 'Em Execução'): ?>
                                            <span style="background-color: rgba(0, 123, 255, 0.12); color: #007bff; border: 1px solid #007bff; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block;">Em Execução</span>
                                        <?php elseif ($status === 'Aguardando Validação'): ?>
                                            <span style="background-color: rgba(23, 162, 184, 0.12); color: #17a2b8; border: 1px solid #17a2b8; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block;">Aguardando Validação</span>
                                        <?php elseif ($status === 'Concluída'): ?>
                                            <span style="background-color: rgba(40, 167, 69, 0.12); color: #28a745; border: 1px solid #28a745; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block;">Concluída</span>
                                        <?php endif; ?>
                                    </td>
                                    
                                    <td style="padding: 15px; text-align: center; white-space: nowrap;">
                                        <button class="btn-visualizar" type="button" title="Abrir O.S." onclick="visualizarOS(<?php echo $os->getId(); ?>)" style="background-color: #f1f3f5; border: 1px solid #dee2e6; color: var(--corTxt2); padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.2s;">
                                            Abrir <i class="bi bi-arrow-right-short" style="vertical-align: middle; font-size: 1.2em;"></i>
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                    </tbody>`;

const regex2 = /function renderRowHtml\(data\) \{[\s\S]*?\n\s*\}/;

const repl2 = `function renderRowHtml(data) {
            const execNome = data.executor_nome ? data.executor_nome : '<span style="color: #999; font-style: italic;">Não Atribuído</span>';

            return \`
                <td style="padding: 15px; white-space: nowrap;">
                    <div style="font-weight: 800; color: var(--corTxt2); font-size: 1.1em;">#\${data.id}</div>
                    <div style="font-size: 12px; color: var(--corTxt3); margin-top: 4px;">
                        <i class="bi bi-calendar-event"></i> \${data.data_abertura}
                    </div>
                </td>
                
                <td style="padding: 15px;">
                    <div style="font-weight: bold; color: var(--corDestaque); font-size: 1.05em; display: flex; align-items: center; gap: 8px;">
                        \${data.ambiente_nome || 'N/D'}
                        <span class="badge-tipo" style="font-size: 10px; padding: 2px 8px;">\${data.tipo_execucao}</span>
                    </div>
                    <div style="font-size: 14px; color: var(--corTxt3); margin-top: 6px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="\${data.descricao_problema}">
                        \${data.descricao_problema}
                    </div>
                </td>
                
                <td style="padding: 15px; font-size: 13px; color: var(--corTxt2); white-space: nowrap;">
                    <div style="margin-bottom: 4px;">
                        <span style="color: var(--corTxt3); font-size: 11px; text-transform: uppercase;">Solicitante:</span><br>
                        <span style="font-weight: bold; color: #B91C1C;" title="\${data.solicitante_nome || 'N/D'}">\${data.solicitante_nome || 'N/D'}</span>
                    </div>
                    <div>
                        <span style="color: var(--corTxt3); font-size: 11px; text-transform: uppercase;">Executor:</span><br>
                        <span style="font-weight: 500;" title="\${data.executor_nome || 'Não Atribuído'}">
                            \${execNome}
                        </span>
                    </div>
                </td>
                
                <td style="padding: 15px; text-align: center; white-space: nowrap;">
                    \${renderStatusBadge(data.status)}
                </td>
                
                <td style="padding: 15px; text-align: center; white-space: nowrap;">
                    <button class="btn-visualizar" type="button" title="Abrir O.S." onclick="visualizarOS(\${data.id})" style="background-color: #f1f3f5; border: 1px solid #dee2e6; color: var(--corTxt2); padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.2s;">
                        Abrir <i class="bi bi-arrow-right-short" style="vertical-align: middle; font-size: 1.2em;"></i>
                    </button>
                </td>
            \`;
        }`;

if (regex1.test(file)) {
    file = file.replace(regex1, repl1);
    console.log('Replaced regex1');
} else {
    console.error('Regex 1 NOT FOUND');
}

if (regex2.test(file)) {
    file = file.replace(regex2, repl2);
    console.log('Replaced regex2');
} else {
    console.error('Regex 2 NOT FOUND');
}

fs.writeFileSync('public/views/corretivas.php', file);
