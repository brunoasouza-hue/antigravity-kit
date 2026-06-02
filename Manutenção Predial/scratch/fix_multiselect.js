const fs = require('fs');

const path = 'public/views/usuarios.php';
let html = fs.readFileSync(path, 'utf8');

const target1 = `                <div style="margin-bottom: 25px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Ambientes Vinculados:</label>
                    <p style="font-size: 11px; color: #888; margin-top: 0; margin-bottom: 8px;">Pressione Ctrl (ou Cmd) para selecionar mǧltiplos ambientes.</p>
                    <select name="ambientes_vinculados[]" id="edit-ambientes" multiple style="width: 100%; height: 180px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; font-size: 13px;">
                        <?php foreach ($ambientesAtivos as $amb): ?>
                            <option value="<?php echo $amb->getId(); ?>">
                                #<?php echo $amb->getId(); ?> - <?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>`;

// Regex replacement because of encoding issues (mǧltiplos vs múltiplos)
html = html.replace(
    /<div style="margin-bottom: 25px;">\s*<label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Ambientes Vinculados:<\/label>[\s\S]*?<\/select>\s*<\/div>/,
    `<div style="margin-bottom: 25px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Ambientes Vinculados:</label>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <select id="select-add-ambiente" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; font-size: 13px;">
                            <option value="">-- Selecione um ambiente --</option>
                            <?php foreach ($ambientesAtivos as $amb): ?>
                                <option value="<?php echo $amb->getId(); ?>" data-nome="<?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>">
                                    #<?php echo $amb->getId(); ?> - <?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <button type="button" onclick="adicionarAmbiente()" style="background: var(--corDestaque); color: #fff; border: none; border-radius: 8px; padding: 0 15px; font-weight: bold; cursor: pointer; transition: 0.2s;"><i class="bi bi-plus-circle"></i> Adicionar</button>
                    </div>
                    
                    <div id="lista-ambientes-vinculados" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; border: 1px dashed #ccc; border-radius: 8px; min-height: 50px; background: #fafafa;">
                        <!-- Badges -->
                    </div>
                    
                    <div id="hidden-inputs-ambientes">
                        <!-- Inputs -->
                    </div>
                </div>`
);

const jsReplacement = `<script>
    let ambientesSelecionados = [];

    function atualizarListaAmbientes() {
        const divLista = document.getElementById('lista-ambientes-vinculados');
        const divInputs = document.getElementById('hidden-inputs-ambientes');
        
        divLista.innerHTML = '';
        divInputs.innerHTML = '';
        
        if (ambientesSelecionados.length === 0) {
            divLista.innerHTML = '<span style="color: #999; font-size: 13px; font-style: italic;">Nenhum ambiente selecionado.</span>';
            return;
        }
        
        ambientesSelecionados.forEach(amb => {
            const badge = document.createElement('div');
            badge.style.cssText = "background: #e1f5fe; color: #0277bd; border: 1px solid #81d4fa; padding: 5px 12px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 6px; font-weight: 500;";
            badge.innerHTML = \`
                #\${amb.id} - \${amb.nome}
                <i class="bi bi-x-circle-fill" style="cursor: pointer; color: #0288d1; margin-left: 5px;" onclick="removerAmbiente(\${amb.id})" title="Remover"></i>
            \`;
            divLista.appendChild(badge);
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'ambientes_vinculados[]';
            input.value = amb.id;
            divInputs.appendChild(input);
        });
    }

    function adicionarAmbiente() {
        const select = document.getElementById('select-add-ambiente');
        const selectedOption = select.options[select.selectedIndex];
        
        if (!selectedOption.value) return;
        
        const id = parseInt(selectedOption.value);
        const nome = selectedOption.getAttribute('data-nome');
        
        if (!ambientesSelecionados.find(a => a.id === id)) {
            ambientesSelecionados.push({ id, nome });
            atualizarListaAmbientes();
        }
        
        select.value = ""; 
    }

    function removerAmbiente(id) {
        ambientesSelecionados = ambientesSelecionados.filter(a => a.id !== id);
        atualizarListaAmbientes();
    }

    function abrirModalEditar(id, nome, nivel, vinculos) {
        document.getElementById('edit-user-id').value = id;
        document.getElementById('edit-user-name').innerText = "Usuário: " + nome;
        document.getElementById('edit-nivel-acesso').value = nivel;
        
        ambientesSelecionados = [];
        const selectBox = document.getElementById('select-add-ambiente');
        
        vinculos.forEach(vId => {
            for(let i = 0; i < selectBox.options.length; i++) {
                if (parseInt(selectBox.options[i].value) === vId) {
                    ambientesSelecionados.push({ 
                        id: vId, 
                        nome: selectBox.options[i].getAttribute('data-nome') 
                    });
                    break;
                }
            }
        });
        
        atualizarListaAmbientes();
        document.getElementById('modalEditarUsuario').style.display = 'flex';
    }
    </script>`;

html = html.replace(/<script>[\s\S]*?function abrirModalEditar[\s\S]*?<\/script>/, jsReplacement);

fs.writeFileSync(path, html);
console.log('Fixed Multi-Select UI in usuarios.php!');
