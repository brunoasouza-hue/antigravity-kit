const fs = require('fs');

// --- 1. Modify preventivas.php ---
let php = fs.readFileSync('public/views/preventivas.php', 'utf8');

// Insert Gerenciar Itens button
const btnInsertTarget = `<h2 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3);">Manutenção Preventiva (Mensal)</h2>
                <p style="color: var(--corTxt2); font-size: 13px; margin-top: 5px;">Acompanhe o ciclo de vistorias mensais e inspecione os ambientes.</p>
            </div>`;

if (!php.includes('Gerenciar Itens do Checklist')) {
    const btnHtml = btnInsertTarget + `
            <?php if ($usuarioNivel === 'Gestor'): ?>
            <div>
                <button onclick="abrirModalGerenciarItens()" style="background: var(--corDestaque); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="bi bi-list-check"></i> Gerenciar Itens
                </button>
            </div>
            <?php endif; ?>`;
    php = php.replace(btnInsertTarget, btnHtml);
}

// Replace the 6 hardcoded items in the form with a dynamic container
const hardcodedFormItemsRegex = /<!-- 6 ITENS OBRIGATÓRIOS DO CHECKLIST COM SELECTORES SVG VECTOR VERDES QUANDO "OK" -->[\s\S]*?<\/div>\s*<!-- Observações -->/;
const dynamicFormContainer = `<!-- CONTAINER DINÂMICO DE ITENS DO CHECKLIST -->
                <div id="container-itens-checklist-dinamico" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
                    <!-- Preenchido pelo JS -->
                </div>

                <!-- Observações -->`;

if (hardcodedFormItemsRegex.test(php)) {
    php = php.replace(hardcodedFormItemsRegex, dynamicFormContainer);
}

// Replace the hardcoded items in the details modal with a dynamic container
const hardcodedDetailsRegex = /<!-- Lista de Itens do Checklist -->\s*<div class="grid-detalhes-check">[\s\S]*?<\/div>\s*<!-- Observações -->/;
const dynamicDetailsContainer = `<!-- Lista de Itens do Checklist -->
                <div class="grid-detalhes-check" id="detalhes-itens-container">
                    <!-- Preenchido pelo JS -->
                </div>

                <!-- Observações -->`;

if (hardcodedDetailsRegex.test(php)) {
    php = php.replace(hardcodedDetailsRegex, dynamicDetailsContainer);
}

// Add modalGerenciarItens HTML at the end of body
if (!php.includes('modalGerenciarItens')) {
    const modalHtml = `
    <!-- MODAL GERENCIAR ITENS DO CHECKLIST -->
    <div class="modal-fundo" id="modalGerenciarItens" style="display: none;">
        <div class="modal-box">
            <div class="modal-header">
                <h3>Gerenciar Itens do Checklist</h3>
                <button type="button" onclick="fecharModal('modalGerenciarItens')"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-form" style="padding: 20px;">
                <p style="font-size: 13px; color: var(--corTxt2); margin-bottom: 20px;">Adicione ou remova itens que deverão ser inspecionados em todas as vistorias preventivas.</p>
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="novoItemNome" placeholder="Ex: Extintores" style="flex: 1; padding: 10px; border: 1px solid var(--corBorda); border-radius: 8px; outline: none;">
                    <button type="button" onclick="adicionarItemChecklist()" style="background: var(--corDestaque); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;"><i class="bi bi-plus-lg"></i> Adicionar</button>
                </div>
                <div id="lista-itens-checklist" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
                    <!-- Itens gerados dinamicamente pelo JS -->
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Lógica do Modal de Gerenciar Itens
        function abrirModalGerenciarItens() {
            renderizarItensGerenciamento();
            document.getElementById('modalGerenciarItens').style.display = 'flex';
        }
        
        function renderizarItensGerenciamento() {
            const container = document.getElementById('lista-itens-checklist');
            container.innerHTML = '';
            
            if (!window.ITENS_CHECKLIST || window.ITENS_CHECKLIST.length === 0) {
                container.innerHTML = '<p style="color: #666; font-size: 13px;">Nenhum item cadastrado.</p>';
                return;
            }
            
            window.ITENS_CHECKLIST.forEach((item, index) => {
                container.innerHTML += \`
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: var(--corFundo2); border: 1px solid var(--corBorda); border-radius: 8px;">
                        <span style="font-weight: bold; color: var(--corTxt3); font-size: 14px;">\${item}</span>
                        <button type="button" onclick="removerItemChecklist('\${item}')" style="background: none; border: none; color: #fc2323; cursor: pointer;" title="Excluir"><i class="bi bi-trash-fill"></i></button>
                    </div>
                \`;
            });
        }
        
        function adicionarItemChecklist() {
            const input = document.getElementById('novoItemNome');
            const nome = input.value.trim();
            if (!nome) return;
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'adicionar_item_checklist', ajax: '1', nome: nome })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.ITENS_CHECKLIST.push(nome);
                    input.value = '';
                    renderizarItensGerenciamento();
                    showToast('Item adicionado!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }
        
        function removerItemChecklist(nome) {
            if (!confirm(\`Tem certeza que deseja remover o item '\${nome}' do checklist padrão?\`)) return;
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'remover_item_checklist', ajax: '1', nome: nome })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.ITENS_CHECKLIST = window.ITENS_CHECKLIST.filter(i => i !== nome);
                    renderizarItensGerenciamento();
                    showToast('Item removido!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }
        
        // Substituir a abertura de modal antigo
        const abrirModalChecklistOld = abrirModalChecklist;
        abrirModalChecklist = function() {
            document.getElementById('form-checklist').reset();
            
            const container = document.getElementById('container-itens-checklist-dinamico');
            container.innerHTML = '';
            
            window.ITENS_CHECKLIST.forEach((item, index) => {
                const safeId = 'status_' + index;
                container.innerHTML += \`
                    <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                        <span style="font-weight: bold; color: var(--corTxt3); width: 120px;">\${item}:</span>
                        <div class="segmented-control-wrapper" data-field="\${safeId}">
                            <button type="button" class="seg-btn btn-ok" data-value="Ok" title="Ok"><i class="bi bi-check-lg" style="font-size: 1.3rem; font-weight: bold;"></i></button>
                            <button type="button" class="seg-btn btn-defeito" data-value="Defeito" title="Defeito"><i class="bi bi-x-lg" style="font-size: 1.3rem; font-weight: bold;"></i></button>
                            <button type="button" class="seg-btn btn-nsa active" data-value="Não se aplica" title="Não se aplica">N/A</button>
                        </div>
                        <input type="hidden" name="item_name_\${index}" value="\${item}">
                        <input type="hidden" name="item_status_\${index}" id="\${safeId}" value="Não se aplica">
                    </div>
                \`;
            });
            
            // Re-bind segmented controls for dynamic items
            container.querySelectorAll('.segmented-control-wrapper').forEach(wrapper => {
                const hiddenInput = document.getElementById(wrapper.getAttribute('data-field'));
                wrapper.querySelectorAll('.seg-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        wrapper.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        hiddenInput.value = btn.getAttribute('data-value');
                    });
                });
            });
            
            document.getElementById('observacoes_erro').style.display = 'none';
            document.getElementById('observacoes').style.borderColor = '';
            document.getElementById('modalNovoChecklist').style.display = 'flex';
        }
        
        // Atualizar visualizarDetalhes para campos dinâmicos
        function visualizarDetalhes(info) {
            document.getElementById('detalhe_ambiente').innerText = info.ambiente_nome || 'Desconhecido';
            document.getElementById('detalhe_responsavel').innerText = info.responsavel_nome || 'N/A';
            document.getElementById('detalhe_data').innerText = info.data_inspecao;

            const container = document.getElementById('detalhes-itens-container');
            container.innerHTML = '';
            
            if (info.itens_dinamicos) {
                for (const [nome, status] of Object.entries(info.itens_dinamicos)) {
                    let badgeClass = 'badge-nsa';
                    let iconClass = 'bi-slash-circle';
                    if (status === 'Ok') { badgeClass = 'badge-ok'; iconClass = 'bi-check-circle-fill'; } 
                    else if (status === 'Defeito') { badgeClass = 'badge-defeito'; iconClass = 'bi-exclamation-triangle-fill'; }
                    
                    container.innerHTML += \`
                        <div class="card-detalhe-item">
                            <span class="title">\${nome}:</span>
                            <div>
                                <span class="badge-status \${badgeClass}">
                                    <i class="bi \${iconClass}"></i> \${status}
                                </span>
                            </div>
                        </div>
                    \`;
                }
            }

            document.getElementById('detalhe_observacoes').innerText = info.observacoes || 'Nenhuma observação registrada.';
            document.getElementById('modalVerDetalhes').style.display = 'flex';
        }
    </script>
    `;
    php = php.replace('</body>', modalHtml + '\n</body>');
}

fs.writeFileSync('public/views/preventivas.php', php);
console.log('Modified preventivas.php successfully.');

// --- 2. Modify start_test_server.js ---
let js = fs.readFileSync('start_test_server.js', 'utf8');

// Inject ITENS_CHECKLIST into preventivas.php using the HTML builder in start_test_server.js
const htmlInjectionTarget = `        html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML);`;
if (!js.includes('window.ITENS_CHECKLIST =')) {
    js = js.replace(htmlInjectionTarget, `        html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML + \`\\n<script>window.ITENS_CHECKLIST = \${JSON.stringify(db.itens_checklist || [])};</script>\`);`);
}

// Modify the JSON object passed to visualizarDetalhes
const detailsJsonOld = `const detailsJson = JSON.stringify({
                    id: item.id,
                    ambiente_nome: item.ambiente_nome,
                    responsavel_nome: item.responsavel_nome,
                    data_inspecao: formatDate(item.data_inspecao),
                    status_tomadas: item.status_tomadas,
                    status_forros: item.status_forros,
                    status_paredes: item.status_paredes,
                    status_projetor: item.status_projetor,
                    status_tela: item.status_tela,
                    status_lousa: item.status_lousa,
                    observacoes: item.observacoes || ''
                });`;

const detailsJsonNew = `const detailsJson = JSON.stringify({
                    id: item.id,
                    ambiente_nome: item.ambiente_nome,
                    responsavel_nome: item.responsavel_nome,
                    data_inspecao: formatDate(item.data_inspecao),
                    itens_dinamicos: item.itens_dinamicos || {},
                    observacoes: item.observacoes || ''
                });`;
if (js.includes('status_tomadas: item.status_tomadas,')) {
    js = js.replace(detailsJsonOld, detailsJsonNew);
}

// Handle action 'adicionar_item_checklist' and 'remover_item_checklist' and 'salvar_checklist'
const routeTarget = `if (acao === 'iniciar_inspecao') {`;
if (!js.includes('acao === \'adicionar_item_checklist\'')) {
    const newRoutes = `
                if (acao === 'adicionar_item_checklist') {
                    if (session.usuario_nivel !== 'Gestor') return respondJson(false, 'Acesso Negado');
                    if (!db.itens_checklist) db.itens_checklist = [];
                    db.itens_checklist.push(postParams.nome);
                    saveDatabase(db);
                    return respondJson(true, 'Item adicionado com sucesso');
                }
                
                if (acao === 'remover_item_checklist') {
                    if (session.usuario_nivel !== 'Gestor') return respondJson(false, 'Acesso Negado');
                    if (!db.itens_checklist) db.itens_checklist = [];
                    db.itens_checklist = db.itens_checklist.filter(i => i !== postParams.nome);
                    saveDatabase(db);
                    return respondJson(true, 'Item removido com sucesso');
                }
                
                if (acao === 'salvar_checklist') {
                    const ativa = (db.inspecoes_mensais || []).find(i => i.status === 'Em Andamento');
                    if (!ativa) return respondJson(false, 'Nenhuma inspeção em andamento.');
                    
                    if (!db.checklists) db.checklists = [];
                    
                    // Parse dynamic items
                    let itens_dinamicos = {};
                    for (let i = 0; i < 50; i++) {
                        if (postParams['item_name_' + i]) {
                            itens_dinamicos[postParams['item_name_' + i]] = postParams['item_status_' + i] || 'Não se aplica';
                        }
                    }
                    
                    const novoChecklist = {
                        id: db.checklists.length > 0 ? Math.max(...db.checklists.map(c => c.id)) + 1 : 1,
                        inspecao_mensal_id: ativa.id,
                        ambiente_id: parseInt(postParams.ambiente_id),
                        responsavel_id: session.usuario_id,
                        data_inspecao: postParams.data_inspecao,
                        itens_dinamicos: itens_dinamicos,
                        observacoes: postParams.observacoes,
                        data_criacao: new Date().toISOString()
                    };
                    
                    db.checklists.push(novoChecklist);
                    saveDatabase(db);
                    return respondJson(true, 'Checklist salvo com sucesso!');
                }
                
                `;
    js = js.replace(routeTarget, newRoutes + routeTarget);
}

fs.writeFileSync('start_test_server.js', js);
console.log('Modified start_test_server.js successfully.');
