const fs = require('fs');
let server = fs.readFileSync('start_test_server.js', 'utf8');

const targetStr = `<form action="../../src/Controllers/UsuarioController.php" method="POST" style="display:flex; gap:10px; align-items:center;">
                            <input type="hidden" name="acao" value="alterar_nivel">
                            <input type="hidden" name="id" value="\${u.id}">
                            <select name="nivel_acesso" style="padding: 8px; border-radius: 6px; border: 1px solid var(--corBorda); outline: none; background: #fff; width: 140px;">
                                <option value="Solicitante" \${u.nivel_acesso === 'Solicitante' ? 'selected' : ''}>Solicitante</option>
                                <option value="Executor" \${u.nivel_acesso === 'Executor' ? 'selected' : ''}>Executor</option>
                                <option value="Gestor" \${u.nivel_acesso === 'Gestor' ? 'selected' : ''}>Gestor</option>
                                <option value="Administrador" \${u.nivel_acesso === 'Administrador' ? 'selected' : ''}>Administrador</option>
                            </select>
                            <button type="submit" title="Atualizar Nível" style="background: var(--corDestaque); color: #fff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;"><i class="bi bi-save"></i> Atualizar</button>
                        </form>`;

const replacementStr = `<button onclick="openEditModal(\${u.id}, '\${escapeHtml(u.nome)}', '\${escapeHtml(u.email)}', '\${u.nivel_acesso}', [\${u.ambientes_vinculados ? u.ambientes_vinculados.join(',') : ''}])" title="Editar Usuário" style="background: var(--corPrimaria); color: #fff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 5px;">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>`;

server = server.replace(targetStr, replacementStr);
fs.writeFileSync('start_test_server.js', server);
console.log('Fixed rowsHtml generation in start_test_server.js!');
