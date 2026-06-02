const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const usuariosGenerator = `
    // ---------------- Gerador Direto da Tabela de Usuarios ----------------
    if (filePath.endsWith('usuarios.php')) {
        const tbodyStart = html.indexOf('<tbody');
        const tbodyEnd = html.indexOf('</tbody>', tbodyStart);
        if (tbodyStart !== -1 && tbodyEnd !== -1) {
            let rowsHtml = '';
            usuarios.forEach(u => {
                let badgesHtml = '';
                if (!u.ambientes_vinculados || u.ambientes_vinculados.length === 0) {
                    badgesHtml = '<span style="color: #aaa; font-style: italic; font-size: 13px;">Nenhum vínculo</span>';
                } else {
                    u.ambientes_vinculados.forEach(vId => {
                        const amb = ambientes.find(a => a.id === vId);
                        const ambNome = amb ? amb.nome_ambiente : 'Desconhecido (#' + vId + ')';
                        badgesHtml += '<span class="badge-ambiente">' + escapeHtml(ambNome) + '</span>';
                    });
                }
                
                rowsHtml += \`
                <tr style="border-bottom: 1px solid var(--corBorda);">
                    <td style="padding: 15px; color: var(--corTxt2);">#\${u.id}</td>
                    <td style="padding: 15px; font-weight: 600; color: var(--corTxt1);">\${escapeHtml(u.nome)}</td>
                    <td style="padding: 15px; color: var(--corTxt2);">\${escapeHtml(u.email)}</td>
                    <td style="padding: 15px; max-width: 250px;">\${badgesHtml}</td>
                    <td style="padding: 15px;">
                        <form action="../../src/Controllers/UsuarioController.php" method="POST" style="display:flex; gap:10px; align-items:center;">
                            <input type="hidden" name="acao" value="alterar_nivel">
                            <input type="hidden" name="id" value="\${u.id}">
                            <select name="nivel_acesso" style="padding: 8px; border-radius: 6px; border: 1px solid var(--corBorda); outline: none; background: #fff; width: 140px;">
                                <option value="Solicitante" \${u.nivel_acesso === 'Solicitante' ? 'selected' : ''}>Solicitante</option>
                                <option value="Executor" \${u.nivel_acesso === 'Executor' ? 'selected' : ''}>Executor</option>
                                <option value="Gestor" \${u.nivel_acesso === 'Gestor' ? 'selected' : ''}>Gestor</option>
                                <option value="Administrador" \${u.nivel_acesso === 'Administrador' ? 'selected' : ''}>Administrador</option>
                            </select>
                            <button type="submit" title="Atualizar Nível" style="background: var(--corDestaque); color: #fff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;"><i class="bi bi-save"></i> Atualizar</button>
                        </form>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <span class="badge" style="background: rgba(108,117,125,0.1); color: #6c757d; padding: 5px 10px; border-radius: 12px; font-size: 12px;"><i class="bi bi-shield-lock"></i> Cadastrado</span>
                    </td>
                </tr>
                \`;
            });
            html = html.substring(0, tbodyStart) + '<tbody>\\n' + rowsHtml + '\\n' + html.substring(tbodyEnd);
        }
        
        // Renderizar options do select de Novo Usuario
        const selectStart = html.indexOf('<select name="ambientes_vinculados[]');
        if (selectStart !== -1) {
            const selectEnd = html.indexOf('</select>', selectStart);
            let optionsHtml = '';
            activeAmbientes.forEach(amb => {
                optionsHtml += \`<option value="\${amb.id}">#\${amb.id} - \${escapeHtml(amb.nome_ambiente)}</option>\\n\`;
            });
            const innerStart = html.indexOf('>', selectStart) + 1;
            html = html.substring(0, innerStart) + '\\n' + optionsHtml + html.substring(selectEnd);
        }
    }
`;

// O mock server original tem `// "?"? Gerador Direto da Tabela de Ambientes ` mas os caracteres especiais podem quebrar
// Vou usar a condição `if (filePath.endsWith('ambientes.php')) {` como âncora
code = code.replace(
    "    if (filePath.endsWith('ambientes.php')) {",
    usuariosGenerator + "\n    if (filePath.endsWith('ambientes.php')) {"
);

fs.writeFileSync('start_test_server.js', code);
console.log('start_test_server.js patched');
