const fs = require('fs');

// 1. Modificar preventivas.php
let php = fs.readFileSync('public/views/preventivas.php', 'utf8');

const jsRenderOld = `                        <button type="button" onclick="removerItemChecklist('\${item}', '\${familia}')" style="background: none; border: none; color: #fc2323; cursor: pointer;" title="Excluir"><i class="bi bi-trash-fill"></i></button>`;

const jsRenderNew = `                        <div style="display: flex; gap: 8px;">
                            <button type="button" onclick="editarItemChecklist('\${item}', '\${familia}')" style="background: none; border: none; color: #00c5ff; cursor: pointer; font-size: 1.1rem;" title="Editar"><i class="bi bi-pencil-square"></i></button>
                            <button type="button" onclick="removerItemChecklist('\${item}', '\${familia}')" style="background: none; border: none; color: #fc2323; cursor: pointer; font-size: 1.1rem;" title="Excluir"><i class="bi bi-trash-fill"></i></button>
                        </div>`;

if (php.includes(jsRenderOld)) {
    php = php.replace(jsRenderOld, jsRenderNew);
}

const jsFunctionsOld = `        function removerItemChecklist(nome, familia) {`;

const jsFunctionsNew = `        function editarItemChecklist(nomeAntigo, familia) {
            const novoNome = prompt(\`Editar item '\${nomeAntigo}':\`, nomeAntigo);
            if (novoNome === null || novoNome.trim() === '' || novoNome.trim() === nomeAntigo) return;
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'editar_item_checklist', ajax: '1', nome_antigo: nomeAntigo, nome_novo: novoNome.trim(), familia: familia })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (window.ITENS_CHECKLIST[familia]) {
                        const idx = window.ITENS_CHECKLIST[familia].indexOf(nomeAntigo);
                        if (idx !== -1) window.ITENS_CHECKLIST[familia][idx] = novoNome.trim();
                    }
                    renderizarItensGerenciamento();
                    showToast('Item atualizado!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }
        
        function removerItemChecklist(nome, familia) {`;

if (php.includes(jsFunctionsOld)) {
    php = php.replace(jsFunctionsOld, jsFunctionsNew);
}
fs.writeFileSync('public/views/preventivas.php', php);

// 2. Modificar start_test_server.js
let serverJs = fs.readFileSync('start_test_server.js', 'utf8');

const routeOld = `                if (acao === 'remover_item_checklist') {`;
const routeNew = `                if (acao === 'editar_item_checklist') {
                    if (session.usuario_nivel !== 'Gestor') return respondJson(false, 'Acesso Negado');
                    const familia = postParams.familia;
                    const nomeAntigo = postParams.nome_antigo;
                    const nomeNovo = postParams.nome_novo;
                    if (db.itens_checklist && db.itens_checklist[familia]) {
                        const idx = db.itens_checklist[familia].indexOf(nomeAntigo);
                        if (idx !== -1) {
                            db.itens_checklist[familia][idx] = nomeNovo;
                            saveDatabase(db);
                        }
                    }
                    return respondJson(true, 'Item editado com sucesso');
                }
                
                if (acao === 'remover_item_checklist') {`;

if (serverJs.includes(routeOld)) {
    serverJs = serverJs.replace(routeOld, routeNew);
}
fs.writeFileSync('start_test_server.js', serverJs);

console.log('Scripts atualizados com suporte a edição de itens.');
