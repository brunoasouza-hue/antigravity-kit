const fs = require('fs');

// --- 1. ATUALIZAR usuarios.php ---
let usu = fs.readFileSync('public/views/usuarios.php', 'utf8');

// The block to replace in the table:
const tableBlockStart = usu.indexOf('<td style="padding: 15px;">\n                            <form action="../../src/Controllers/UsuarioController.php"');
const tableBlockEnd = usu.indexOf('</form>\n                        </td>\n                        <td style="padding: 15px; text-align: center;">\n                            <span class="badge"');

if (tableBlockStart > -1 && tableBlockEnd > -1) {
    const oldBlock = usu.substring(tableBlockStart, tableBlockEnd + 147); // include up to </form></td>
    
    // Nível de Acesso becomes just text
    // Ações becomes an edit button
    const newBlock = `<td style="padding: 15px;">
                            <span style="font-weight: 500;"><?php echo htmlspecialchars($u->getNivelAcesso()); ?></span>
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            <?php $vinculosArr = $u->getAmbientesVinculados(); ?>
                            <button onclick="abrirModalEditar(<?php echo $u->getId(); ?>, '<?php echo addslashes($u->getNome()); ?>', '<?php echo addslashes($u->getNivelAcesso()); ?>', [<?php echo implode(',', $vinculosArr ?: []); ?>])" 
                                style="background: var(--corDestaque); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-size: 13px;">
                                <i class="bi bi-pencil-square"></i> Editar
                            </button>
                        </td>`;
    
    usu = usu.replace(oldBlock, newBlock);
} else {
    console.log('Could not find the table form block!');
}

// Ensure the edit modal exists
if (!usu.includes('modalEditarUsuario')) {
    const modalHtml = `
    <!-- Modal Editar Usuario -->
    <div class="modal-novo-usuario" id="modalEditarUsuario">
        <div class="modal-box">
            <button type="button" onclick="document.getElementById('modalEditarUsuario').style.display='none'" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;"><i class="bi bi-x-lg"></i></button>
            <h2 style="margin: 0 0 20px 0; color: var(--corBase); font-size: 22px;">Editar Usuário</h2>
            <p id="edit-user-name" style="font-size: 15px; color: #333; margin-bottom: 20px; font-weight: bold;"></p>
            
            <form action="../../src/Controllers/UsuarioController.php" method="POST">
                <input type="hidden" name="acao" value="editar_usuario">
                <input type="hidden" name="id" id="edit-user-id" value="">
                
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Nível de Acesso:</label>
                    <select name="nivel_acesso" id="edit-nivel-acesso" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff;">
                        <?php foreach ($nivelOpcoes as $op): ?>
                            <option value="<?php echo $op; ?>"><?php echo $op; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Ambientes Vinculados:</label>
                    <p style="font-size: 11px; color: #888; margin-top: 0; margin-bottom: 8px;">Pressione Ctrl (ou Cmd) para selecionar múltiplos ambientes.</p>
                    <select name="ambientes_vinculados[]" id="edit-ambientes" multiple style="width: 100%; height: 180px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; font-size: 13px;">
                        <?php foreach ($ambientesAtivos as $amb): ?>
                            <option value="<?php echo $amb->getId(); ?>">
                                #<?php echo $amb->getId(); ?> - <?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <button type="submit" style="width: 100%; background: #00bfa5; color: white; border: none; padding: 14px; border-radius: 25px; font-weight: bold; font-size: 15px; cursor: pointer;"><i class="bi bi-check2-circle"></i> SALVAR ALTERAÇÕES</button>
            </form>
        </div>
    </div>
    
    <script>
    function abrirModalEditar(id, nome, nivel, vinculos) {
        document.getElementById('edit-user-id').value = id;
        document.getElementById('edit-user-name').innerText = "Usuário: " + nome;
        document.getElementById('edit-nivel-acesso').value = nivel;
        
        const sel = document.getElementById('edit-ambientes');
        for (let i = 0; i < sel.options.length; i++) {
            sel.options[i].selected = vinculos.includes(parseInt(sel.options[i].value));
        }
        
        document.getElementById('modalEditarUsuario').style.display = 'flex';
    }
    </script>
`;
    // Insert before closing body
    usu = usu.replace('<script src="../assets/js/scripts.js" defer></script>', modalHtml + '\n    <script src="../assets/js/scripts.js" defer></script>');
}

fs.writeFileSync('public/views/usuarios.php', usu);


// --- 2. ATUALIZAR start_test_server.js ---
let server = fs.readFileSync('start_test_server.js', 'utf8');

// Replace the mock table generation in start_test_server.js to use the new button format
const tableMockStart = server.indexOf('<td style="padding: 15px;">\n                            <form action="../../src/Controllers/UsuarioController.php"');
const tableMockEnd = server.indexOf('</form>\n                        </td>\n                        <td style="padding: 15px; text-align: center;">\n                            <span class="badge"');

if (tableMockStart > -1 && tableMockEnd > -1) {
    const oldMockBlock = server.substring(tableMockStart, tableMockEnd + 147);
    const newMockBlock = `<td style="padding: 15px;">
                            <span style="font-weight: 500;">\${escapeHtml(u.nivel_acesso)}</span>
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            <button onclick="abrirModalEditar(\${u.id}, '\${escapeHtml(u.nome).replace(/'/g, "\\\\'")}', '\${escapeHtml(u.nivel_acesso)}', [\${(u.ambientes_vinculados || []).join(',')}])" 
                                style="background: var(--corDestaque); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-size: 13px;">
                                <i class="bi bi-pencil-square"></i> Editar
                            </button>
                        </td>`;
    server = server.replace(oldMockBlock, newMockBlock);
}

// Add 'editar_usuario' handler
if (!server.includes("acao === 'editar_usuario'")) {
    const editHandler = `
            // Ação: Editar Usuário (Nível e Ambientes)
            if (acao === 'editar_usuario') {
                const uid = parseInt(postParams.id);
                const nivel = postParams.nivel_acesso;
                
                let ambSelecionados = [];
                if (postParams['ambientes_vinculados[]']) {
                    ambSelecionados = Array.isArray(postParams['ambientes_vinculados[]']) 
                        ? postParams['ambientes_vinculados[]'].map(Number)
                        : [Number(postParams['ambientes_vinculados[]'])];
                }

                const userIndex = db.usuarios.findIndex(u => u.id === uid);
                if (userIndex !== -1) {
                    db.usuarios[userIndex].nivel_acesso = nivel;
                    db.usuarios[userIndex].ambientes_vinculados = ambSelecionados;
                    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 4));
                    return respondRedirect('/public/views/usuarios.php', { success: "Usuário atualizado com sucesso!" });
                } else {
                    return respondRedirect('/public/views/usuarios.php', { error: "Usuário não encontrado." });
                }
            }
`;
    // Insert after 'criar' user
    const insertPos = server.indexOf("if (acao === 'alterar_nivel') {");
    if (insertPos > -1) {
        server = server.slice(0, insertPos) + editHandler + server.slice(insertPos);
    }
}

// And also add the Modal to the mock string replacement in `start_test_server.js` if necessary.
// But wait, start_test_server.js doesn't replace the modal, it just leaves the HTML intact! 
// Let's make sure the edit modal is included in the mock output
if (!server.includes('id="modalEditarUsuario"')) {
    // We just need to make sure the server's regex for PHP removal didn't kill the script tag
    // Actually, `start_test_server.js` completely replaces the file contents for `usuarios.php` because of the `usuariosGenerator` I wrote earlier.
    // Yes, the `patch_test_server.js` overwrites EVERYTHING up to `</body>`. 
    // I need to update the `usuariosGenerator` inside `start_test_server.js`!
    
    // I will append the modal to the html generated in `usuariosGenerator`.
    const closeBody = server.lastIndexOf('</body>\n</html>`;');
    if (closeBody > -1) {
        const mockModal = `
    <!-- Modal Editar Usuario -->
    <div class="modal-novo-usuario" id="modalEditarUsuario">
        <div class="modal-box">
            <button type="button" onclick="document.getElementById('modalEditarUsuario').style.display='none'" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;"><i class="bi bi-x-lg"></i></button>
            <h2 style="margin: 0 0 20px 0; color: var(--corBase); font-size: 22px;">Editar Usuário</h2>
            <p id="edit-user-name" style="font-size: 15px; color: #333; margin-bottom: 20px; font-weight: bold;"></p>
            
            <form action="../../src/Controllers/UsuarioController.php" method="POST">
                <input type="hidden" name="acao" value="editar_usuario">
                <input type="hidden" name="id" id="edit-user-id" value="">
                
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Nível de Acesso:</label>
                    <select name="nivel_acesso" id="edit-nivel-acesso" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff;">
                        \${nivelOpcoes.map(op => \`<option value="\${op}">\${op}</option>\`).join('')}
                    </select>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Ambientes Vinculados:</label>
                    <p style="font-size: 11px; color: #888; margin-top: 0; margin-bottom: 8px;">Pressione Ctrl (ou Cmd) para selecionar múltiplos ambientes.</p>
                    <select name="ambientes_vinculados[]" id="edit-ambientes" multiple style="width: 100%; height: 180px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; font-size: 13px;">
                        \${activeAmbientes.map(amb => \`<option value="\${amb.id}">#\${amb.id} - \${escapeHtml(amb.nome_ambiente)}</option>\`).join('')}
                    </select>
                </div>
                
                <button type="submit" style="width: 100%; background: #00bfa5; color: white; border: none; padding: 14px; border-radius: 25px; font-weight: bold; font-size: 15px; cursor: pointer;"><i class="bi bi-check2-circle"></i> SALVAR ALTERAÇÕES</button>
            </form>
        </div>
    </div>
    <script>
    function abrirModalEditar(id, nome, nivel, vinculos) {
        document.getElementById('edit-user-id').value = id;
        document.getElementById('edit-user-name').innerText = "Usuário: " + nome;
        document.getElementById('edit-nivel-acesso').value = nivel;
        
        const sel = document.getElementById('edit-ambientes');
        for (let i = 0; i < sel.options.length; i++) {
            sel.options[i].selected = vinculos.includes(parseInt(sel.options[i].value));
        }
        
        document.getElementById('modalEditarUsuario').style.display = 'flex';
    }
    </script>
`;
        server = server.slice(0, closeBody) + mockModal + server.slice(closeBody);
    }
}

fs.writeFileSync('start_test_server.js', server);
console.log('Update Complete!');
