const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const regexCriar = /if\s*\(\s*acao\s*===\s*'criar'\s*\)\s*\{\s*if\s*\(\s*session\.usuario_nivel\s*!==\s*'Administrador'\s*&&\s*session\.usuario_nivel\s*!==\s*'Gestor'\s*\)\s*\{[\s\S]*?const\s*email\s*=\s*\(postParams\.email\s*\|\|\s*''\)\.trim\(\);\s*const\s*nivel\s*=\s*postParams\.nivel_acesso;\s*let\s*ambs\s*=\s*postParams\['ambientes_vinculados\[\]'\];/g;

const replacementCriar = `if (acao === 'criar') {
                    if (session.usuario_nivel !== 'Administrador' && session.usuario_nivel !== 'Gestor') {
                        return respondJson(false, 'Acesso restrito a Administradores e Gestores.', null, '/public/views/usuarios.php?erro=' + encodeURIComponent('Acesso negado.'));
                    }
                    
                    const nome = (postParams.nome || '').trim();
                    const email = (postParams.email || '').trim();
                    const nivel = postParams.nivel_acesso;
                    let ambs = postParams['ambientes_vinculados[]'];
                    
                    if (nivel === 'Administrador' && session.usuario_nivel !== 'Administrador') {
                        return respondJson(false, 'Apenas Administradores podem criar novos Administradores.', null, '/public/views/usuarios.php?erro=' + encodeURIComponent('Permissão insuficiente.'));
                    }`;

const regexAlterar = /if\s*\(\s*acao\s*===\s*'alterar_nivel'\s*\)\s*\{\s*if\s*\(\s*session\.usuario_nivel\s*!==\s*'Administrador'\s*\)\s*return\s*respondJson\(\s*false\s*,\s*'Acesso restrito a Administradores\.'\s*\);\s*const\s*id\s*=\s*parseInt\(postParams\.id\);\s*const\s*nv\s*=\s*postParams\.nivel_acesso;\s*const\s*idx\s*=\s*db\.usuarios\.findIndex\(u\s*=>\s*u\.id\s*===\s*id\);\s*if\s*\(\s*idx\s*!==\s*-1\s*\)\s*\{\s*db\.usuarios\[idx\]\.nivel_acesso\s*=\s*nv;\s*saveDatabase\(db\);\s*return\s*respondJson\(\s*true\s*,\s*'Nível atualizado!'\s*,\s*db\.usuarios\[idx\]\);\s*\}\s*return\s*respondJson\(\s*false\s*,\s*'Usuário não encontrado\.'\s*\);\s*\}/g;

const replacementAlterar = `if (acao === 'alterar_nivel' || acao === 'editar_usuario') {
                    if (session.usuario_nivel !== 'Administrador' && session.usuario_nivel !== 'Gestor') {
                        return respondJson(false, 'Acesso restrito.');
                    }
                    
                    const id = parseInt(postParams.id);
                    const nv = postParams.nivel_acesso;
                    const idx = db.usuarios.findIndex(u => u.id === id);
                    
                    if (idx !== -1) {
                        const targetUser = db.usuarios[idx];
                        
                        // Gestor restriction rules
                        if (session.usuario_nivel === 'Gestor') {
                            if (targetUser.nivel_acesso === 'Administrador') {
                                return respondJson(false, 'Você não tem permissão para alterar dados de um Administrador.');
                            }
                            if (nv === 'Administrador') {
                                return respondJson(false, 'Apenas Administradores podem promover usuários a Administrador.');
                            }
                            if (targetUser.id === session.usuario_id && nv !== 'Gestor') {
                                return respondJson(false, 'Você não pode rebaixar seu próprio nível de acesso.');
                            }
                        }
                        
                        db.usuarios[idx].nivel_acesso = nv;
                        if (postParams.nome) db.usuarios[idx].nome = postParams.nome.trim();
                        saveDatabase(db);
                        return respondJson(true, 'Dados atualizados!', db.usuarios[idx]);
                    }
                    return respondJson(false, 'Usuário não encontrado.');
                }`;

if (code.match(regexCriar)) {
    code = code.replace(regexCriar, replacementCriar);
} else {
    console.log("Failed to match regexCriar");
}

if (code.match(regexAlterar)) {
    code = code.replace(regexAlterar, replacementAlterar);
} else {
    console.log("Failed to match regexAlterar");
}

fs.writeFileSync('start_test_server.js', code);
console.log("Done");
