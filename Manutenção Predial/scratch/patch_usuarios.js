const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const injection = `
    // INJEÇÃO ESPECÍFICA PARA A TELA DE USUÁRIOS
    if (filePath.endsWith('usuarios.php')) {
        const tbodyStart = html.indexOf('<tbody>');
        const tbodyEnd = html.indexOf('</tbody>', tbodyStart);
        if (tbodyStart !== -1 && tbodyEnd !== -1) {
            let rowsHtml = '';
            if (usuarios.length === 0) {
                rowsHtml = '<tr><td colspan="6" style="text-align:center;padding:20px;">Nenhum usuário.</td></tr>';
            } else {
                usuarios.forEach(u => {
                    let vinculosHtml = '';
                    if (!u.ambientes_vinculados || u.ambientes_vinculados.length === 0) {
                        vinculosHtml = '<span style="color: #aaa; font-style: italic; font-size: 13px;">Nenhum vínculo</span>';
                    } else {
                        u.ambientes_vinculados.forEach(vId => {
                            let ambNome = "Desconhecido (#" + vId + ")";
                            const amb = ambientes.find(a => a.id == vId);
                            if (amb) ambNome = amb.nome_ambiente;
                            vinculosHtml += '<span class="badge-ambiente">' + escapeHtml(ambNome) + '</span>';
                        });
                    }
                    
                    const vinculosArr = JSON.stringify(u.ambientes_vinculados || []);
                    const safeNome = (u.nome || '').replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
                    const safeNivel = (u.nivel_acesso || '').replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
                    
                    rowsHtml += \`
                    <tr style="border-bottom: 1px solid var(--corBorda);">
                        <td style="padding: 15px; color: var(--corTxt2);">#\${u.id}</td>
                        <td style="padding: 15px; font-weight: 600; color: var(--corTxt1);">\${escapeHtml(u.nome)}</td>
                        <td style="padding: 15px; color: var(--corTxt2);">\${escapeHtml(u.email)}</td>
                        <td style="padding: 15px; max-width: 250px;">
                            \${vinculosHtml}
                        </td>
                        <td style="padding: 15px;">
                            <span style="font-weight: 500;">\${escapeHtml(u.nivel_acesso)}</span>
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            <button onclick="abrirModalEditar(\${u.id}, '\${safeNome}', '\${safeNivel}', \${vinculosArr})" 
                                style="background: var(--corDestaque); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-size: 13px;">
                                <i class="bi bi-pencil-square"></i> Editar
                            </button>
                        </td>
                    </tr>
                    \`;
                });
            }
            html = html.slice(0, tbodyStart + 7) + rowsHtml + html.slice(tbodyEnd);
        }
    }

    // INJEÇÃO ESPECÍFICA PARA A TELA DE PREVENTIVAS`;

code = code.replace('// INJEÇÃO ESPECÍFICA PARA A TELA DE PREVENTIVAS', injection);

fs.writeFileSync('start_test_server.js', code);
console.log("Patched mock server successfully.");
