const fs = require('fs');

let php = fs.readFileSync('public/views/preventivas.php', 'utf8');

// 1. Update the Gerenciar Itens modal HTML
const oldModalHtml = `
            <div class="modal-form" style="padding: 20px;">
                <p style="font-size: 13px; color: var(--corTxt2); margin-bottom: 20px;">Adicione ou remova itens que deverão ser inspecionados em todas as vistorias preventivas.</p>
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="novoItemNome" placeholder="Ex: Extintores" style="flex: 1; padding: 10px; border: 1px solid var(--corBorda); border-radius: 8px; outline: none;">
                    <button type="button" onclick="adicionarItemChecklist()" style="background: var(--corDestaque); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;"><i class="bi bi-plus-lg"></i> Adicionar</button>
                </div>
                <div id="lista-itens-checklist" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
                    <!-- Itens gerados dinamicamente pelo JS -->
                </div>
            </div>`;

const newModalHtml = `
            <div class="modal-form" style="padding: 20px;">
                <p style="font-size: 13px; color: var(--corTxt2); margin-bottom: 20px;">Selecione a família de ambientes e defina os itens que deverão ser inspecionados.</p>
                
                <div style="margin-bottom: 20px;">
                    <label style="font-weight: bold; font-size: 14px; margin-bottom: 5px; display: block;">Família do Ambiente:</label>
                    <select id="seletorFamiliaGerenciar" onchange="renderizarItensGerenciamento()" style="width: 100%; padding: 10px; border: 1px solid var(--corBorda); border-radius: 8px; outline: none; background: #fff; font-size: 14px; color: var(--corTxt3);">
                        <option value="Salas de Aulas">📚 Salas de Aulas</option>
                        <option value="Laboratórios">🔬 Laboratórios</option>
                        <option value="Oficinas">⚙️ Oficinas</option>
                        <option value="Administrativos">🏢 Administrativos</option>
                        <option value="Externos">🌳 Externos</option>
                        <option value="Geral">📦 Geral (Sem família cadastrada)</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="novoItemNome" placeholder="Ex: Extintores" style="flex: 1; padding: 10px; border: 1px solid var(--corBorda); border-radius: 8px; outline: none;">
                    <button type="button" onclick="adicionarItemChecklist()" style="background: var(--corDestaque); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;"><i class="bi bi-plus-lg"></i> Adicionar</button>
                </div>
                <div id="lista-itens-checklist" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
                    <!-- Itens gerados dinamicamente pelo JS -->
                </div>
            </div>`;

if (php.includes(oldModalHtml)) {
    php = php.replace(oldModalHtml, newModalHtml);
} else {
    // maybe minor spacing differences, regex replace
    const modalRegex = /<div class="modal-form" style="padding: 20px;">[\s\S]*?<!-- Itens gerados dinamicamente pelo JS -->\s*<\/div>\s*<\/div>/;
    if (modalRegex.test(php)) {
        php = php.replace(modalRegex, newModalHtml);
    }
}

// 2. Update the JS logic for families
const oldJs = `
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
        }`;

const newJs = `
        function renderizarItensGerenciamento() {
            const container = document.getElementById('lista-itens-checklist');
            const familiaSelect = document.getElementById('seletorFamiliaGerenciar');
            const familia = familiaSelect ? familiaSelect.value : 'Geral';
            container.innerHTML = '';
            
            const itens = window.ITENS_CHECKLIST[familia] || [];
            
            if (itens.length === 0) {
                container.innerHTML = '<p style="color: #666; font-size: 13px;">Nenhum item cadastrado para esta família.</p>';
                return;
            }
            
            itens.forEach((item, index) => {
                container.innerHTML += \`
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: var(--corFundo2); border: 1px solid var(--corBorda); border-radius: 8px;">
                        <span style="font-weight: bold; color: var(--corTxt3); font-size: 14px;">\${item}</span>
                        <button type="button" onclick="removerItemChecklist('\${item}', '\${familia}')" style="background: none; border: none; color: #fc2323; cursor: pointer;" title="Excluir"><i class="bi bi-trash-fill"></i></button>
                    </div>
                \`;
            });
        }
        
        function adicionarItemChecklist() {
            const input = document.getElementById('novoItemNome');
            const nome = input.value.trim();
            const familiaSelect = document.getElementById('seletorFamiliaGerenciar');
            const familia = familiaSelect ? familiaSelect.value : 'Geral';
            
            if (!nome) return;
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'adicionar_item_checklist', ajax: '1', nome: nome, familia: familia })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (!window.ITENS_CHECKLIST[familia]) window.ITENS_CHECKLIST[familia] = [];
                    window.ITENS_CHECKLIST[familia].push(nome);
                    input.value = '';
                    renderizarItensGerenciamento();
                    showToast('Item adicionado na família ' + familia + '!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }
        
        function removerItemChecklist(nome, familia) {
            if (!confirm(\`Tem certeza que deseja remover o item '\${nome}' da família '\${familia}'?\`)) return;
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'remover_item_checklist', ajax: '1', nome: nome, familia: familia })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (window.ITENS_CHECKLIST[familia]) {
                        window.ITENS_CHECKLIST[familia] = window.ITENS_CHECKLIST[familia].filter(i => i !== nome);
                    }
                    renderizarItensGerenciamento();
                    showToast('Item removido!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }`;

if (php.includes('function renderizarItensGerenciamento() {')) {
    php = php.replace(oldJs, newJs);
}

// 3. Update the Modal Inspecionar logic
const oldModalChecklistJS = `
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
        }`;

const newModalChecklistJS = `
        // Detecta quando o usuário troca de ambiente no Select
        document.getElementById('ambiente_id').addEventListener('change', function(e) {
            const ambId = this.value;
            const familia = window.AMBIENTES_FAMILIAS[ambId] || 'Geral';
            renderizarFormularioInspecao(familia);
        });

        function renderizarFormularioInspecao(familia) {
            const container = document.getElementById('container-itens-checklist-dinamico');
            container.innerHTML = '';
            
            const itens = window.ITENS_CHECKLIST[familia] || window.ITENS_CHECKLIST['Geral'] || [];
            
            if (itens.length === 0) {
                container.innerHTML = '<p style="color: #666; font-size: 13px;">Nenhum item padrão para esta família. Inspeção opcional.</p>';
                return;
            }
            
            itens.forEach((item, index) => {
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
        }

        const abrirModalChecklistOld = abrirModalChecklist;
        abrirModalChecklist = function(ambientePreSelecionado = null) {
            document.getElementById('form-checklist').reset();
            
            const ambSelect = document.getElementById('ambiente_id');
            if (ambientePreSelecionado) {
                ambSelect.value = ambientePreSelecionado;
            } else {
                ambSelect.selectedIndex = 0; // Se não enviou preselecionado, reseta
            }
            
            // Renderiza itens baseados na familia do ambiente selecionado (ou vazio se não selecionou)
            const ambId = ambSelect.value;
            const familia = ambId ? (window.AMBIENTES_FAMILIAS[ambId] || 'Geral') : 'Geral';
            renderizarFormularioInspecao(familia);
            
            document.getElementById('observacoes_erro').style.display = 'none';
            document.getElementById('observacoes').style.borderColor = '';
            document.getElementById('modalNovoChecklist').style.display = 'flex';
        }`;

if (php.includes('const abrirModalChecklistOld = abrirModalChecklist;')) {
    php = php.replace(oldModalChecklistJS, newModalChecklistJS);
}

fs.writeFileSync('public/views/preventivas.php', php);
console.log('public/views/preventivas.php updated.');

