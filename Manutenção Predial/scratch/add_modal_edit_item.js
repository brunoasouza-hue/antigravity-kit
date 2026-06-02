const fs = require('fs');
let php = fs.readFileSync('public/views/preventivas.php', 'utf8');

// 1. Injetar a Modal de Edição (antes do fechamento do body ou após o modal de gerenciar itens)
const novaModalHtml = `
    <!-- MODAL EDITAR ITEM CHECKLIST -->
    <div class="modal-fundo" id="modalEditarItemChecklist" style="display: none; z-index: 10001;">
        <div class="modal-box" style="width: 400px; padding: 25px;">
            <div class="modal-header" style="margin-bottom: 20px;">
                <h3>Editar Item</h3>
                <button type="button" onclick="fecharModal('modalEditarItemChecklist')"><i class="bi bi-x-lg"></i></button>
            </div>
            <form onsubmit="submeterEdicaoItemChecklist(event)">
                <input type="hidden" id="edit_item_familia">
                <input type="hidden" id="edit_item_nome_antigo">
                <div class="modal-input" style="margin-bottom: 20px;">
                    <label style="font-weight: bold; margin-bottom: 8px; display: block;">Nome do Item:</label>
                    <input type="text" id="edit_item_nome_novo" required style="width: 100%; padding: 12px; border: 1px solid var(--corBorda); border-radius: 8px; outline: none; background: var(--corFundo); color: var(--corTxt3);">
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" onclick="fecharModal('modalEditarItemChecklist')" style="background: var(--corFundo2); color: var(--corTxt2); border: 1px solid var(--corBorda); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">Cancelar</button>
                    <button type="submit" style="background: var(--corDestaque); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">Salvar <i class="bi bi-check-lg"></i></button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        function submeterEdicaoItemChecklist(e) {
            e.preventDefault();
            const familia = document.getElementById('edit_item_familia').value;
            const nomeAntigo = document.getElementById('edit_item_nome_antigo').value;
            const novoNome = document.getElementById('edit_item_nome_novo').value.trim();
            
            if (!novoNome || novoNome === nomeAntigo) {
                fecharModal('modalEditarItemChecklist');
                return;
            }
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'editar_item_checklist', ajax: '1', nome_antigo: nomeAntigo, nome_novo: novoNome, familia: familia })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (window.ITENS_CHECKLIST[familia]) {
                        const idx = window.ITENS_CHECKLIST[familia].indexOf(nomeAntigo);
                        if (idx !== -1) window.ITENS_CHECKLIST[familia][idx] = novoNome;
                    }
                    renderizarItensGerenciamento();
                    fecharModal('modalEditarItemChecklist');
                    showToast('Item atualizado com sucesso!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }
    </script>
`;

if (!php.includes('modalEditarItemChecklist')) {
    php = php.replace('</body>', novaModalHtml + '\n</body>');
}

// 2. Substituir a função `editarItemChecklist` atual que usa prompt()
const promptRegex = /function editarItemChecklist\(nomeAntigo, familia\) \{[\s\S]*?\}\s*function removerItemChecklist/s;

const novaEditJs = `function editarItemChecklist(nomeAntigo, familia) {
            document.getElementById('edit_item_familia').value = familia;
            document.getElementById('edit_item_nome_antigo').value = nomeAntigo;
            document.getElementById('edit_item_nome_novo').value = nomeAntigo;
            document.getElementById('modalEditarItemChecklist').style.display = 'flex';
            setTimeout(() => document.getElementById('edit_item_nome_novo').focus(), 100);
        }
        
        function removerItemChecklist`;

if (promptRegex.test(php)) {
    php = php.replace(promptRegex, novaEditJs);
}

fs.writeFileSync('public/views/preventivas.php', php);
console.log('Modal de edição adicionado.');
