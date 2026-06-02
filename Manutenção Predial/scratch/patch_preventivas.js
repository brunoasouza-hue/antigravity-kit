const fs = require('fs');
const file = 'public/views/preventivas.php';
let data = fs.readFileSync(file, 'utf8');

// 1. Add hidden input to form-checklist
const formHtml = `<input type="hidden" name="acao" value="cadastrar">`;
const newFormHtml = `<input type="hidden" name="acao" value="cadastrar">
                <input type="hidden" name="checklist_id" id="checklist_id" value="">`;
data = data.replace(formHtml, newFormHtml);

// 2. Add Editar button to modalVerDetalhes
const footerHtml = `<div class="modal-footer" style="margin-top: 20px;">
                    <button type="button" class="btn-confirmar-full btn" onclick="fecharModal('modalVerDetalhes')" style="background-color: var(--corBorda); color: var(--corTxt3);">
                        Fechar <i class="bi bi-x-circle-fill"></i>
                    </button>
                </div>`;
const newFooterHtml = `<div class="modal-footer" style="margin-top: 20px; display: flex; gap: 10px;">
                    <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Executor'): ?>
                    <button type="button" class="btn-confirmar-full btn" onclick="editarChecklistAtual()" style="background-color: var(--corDestaque); color: white;">
                        Editar Inspeção <i class="bi bi-pencil-square"></i>
                    </button>
                    <?php endif; ?>
                    <button type="button" class="btn-confirmar-full btn" onclick="fecharModal('modalVerDetalhes')" style="background-color: var(--corBorda); color: var(--corTxt3);">
                        Fechar <i class="bi bi-x-circle-fill"></i>
                    </button>
                </div>`;
data = data.replace(footerHtml, newFooterHtml);

// 3. Store info in visualizarDetalhes
const visDetHtml = `function visualizarDetalhes(info) {
            document.getElementById('detalhe_ambiente').innerText = info.ambiente_nome || 'Desconhecido';`;
const newVisDetHtml = `function visualizarDetalhes(info) {
            window.checklistAtual = info;
            document.getElementById('detalhe_ambiente').innerText = info.ambiente_nome || 'Desconhecido';`;
data = data.replace(visDetHtml, newVisDetHtml);

// 4. Update abrirModalChecklist to reset checklist_id and title
const abrirModHtml = `function abrirModalChecklist(ambientePreSelecionado = null) {
            document.getElementById('form-checklist').reset();`;
const newAbrirModHtml = `function abrirModalChecklist(ambientePreSelecionado = null) {
            document.getElementById('form-checklist').reset();
            document.getElementById('checklist_id').value = '';
            document.querySelector('#modalNovoChecklist .modal-header h3').innerText = 'Registrar Inspeção Preventiva';
            const btnSubmit = document.querySelector('#modalNovoChecklist button[type="submit"]');
            if (btnSubmit) btnSubmit.innerHTML = 'Salvar Inspeção <i class="bi bi-check-lg"></i>';`;
data = data.replace(abrirModHtml, newAbrirModHtml);

// 5. Add editarChecklistAtual function
const jsEndHtml = `        // Fecha modais pelo ID
        function fecharModal(id) {`;
const newJsEndHtml = `        // Abre o modal de edição com os dados atuais
        function editarChecklistAtual() {
            fecharModal('modalVerDetalhes');
            if (!window.checklistAtual) return;
            
            abrirModalChecklist(window.checklistAtual.ambiente_id);
            document.querySelector('#modalNovoChecklist .modal-header h3').innerText = 'Editar Inspeção Preventiva';
            const btnSubmit = document.querySelector('#modalNovoChecklist button[type="submit"]');
            if (btnSubmit) btnSubmit.innerHTML = 'Atualizar Inspeção <i class="bi bi-arrow-repeat"></i>';
            
            document.getElementById('checklist_id').value = window.checklistAtual.id;
            
            if (document.getElementById('data_inspecao')) {
                // Conversão simples se for YYYY-MM-DD
                let dateStr = window.checklistAtual.data_inspecao;
                if (dateStr && dateStr.includes('/')) {
                    dateStr = dateStr.split('/').reverse().join('-');
                }
                document.getElementById('data_inspecao').value = dateStr;
            }
            
            if (document.getElementById('observacoes')) {
                document.getElementById('observacoes').value = window.checklistAtual.observacoes || '';
            }
            
            // Set dynamic fields if they exist
            const fields = ['tomadas', 'forros', 'paredes', 'projetor', 'tela', 'lousa'];
            setTimeout(() => {
                fields.forEach((field, index) => {
                    const status = window.checklistAtual['status_' + field];
                    if (!status) return;
                    
                    const hiddenInp = document.getElementById('status_' + index);
                    if (hiddenInp) {
                        hiddenInp.value = status;
                        const wrapper = hiddenInp.parentElement;
                        wrapper.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
                        
                        let btnSel = wrapper.querySelector('.btn-nsa');
                        if (status === 'Ok' || status === 'OK') btnSel = wrapper.querySelector('.btn-ok');
                        else if (status === 'Defeito') btnSel = wrapper.querySelector('.btn-defeito');
                        
                        if (btnSel) btnSel.classList.add('active');
                    }
                });
            }, 50);
        }

        // Fecha modais pelo ID
        function fecharModal(id) {`;
data = data.replace(jsEndHtml, newJsEndHtml);

fs.writeFileSync(file, data);
console.log("preventivas.php patched successfully!");
