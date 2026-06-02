const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const targetStr = `if (pathname.includes('/public/views/usuarios.php')) {
                const acao = postParams.acao;
                if (acao === 'alterar_nivel') {`;

const replacementStr = `if (pathname.includes('/public/views/usuarios.php') || pathname.includes('UsuarioController.php')) {
                const acao = postParams.acao;
                
                if (acao === 'criar') {
                    if (session.usuario_nivel !== 'Administrador') {
                        return respondJson(false, 'Acesso restrito a Administradores.', null, '/public/views/usuarios.php?erro=' + encodeURIComponent('Acesso negado.'));
                    }
                    
                    const nome = (postParams.nome || '').trim();
                    const email = (postParams.email || '').trim();
                    const nivel = postParams.nivel_acesso;
                    let ambs = postParams['ambientes_vinculados[]'];
                    
                    if (typeof ambs === 'string') ambs = [ambs];
                    if (!Array.isArray(ambs)) ambs = [];
                    ambs = ambs.map(a => parseInt(a)).filter(a => !isNaN(a));
                    
                    if (!nome || !email) {
                        return respondJson(false, 'Preencha os campos obrigatórios.', null, '/public/views/usuarios.php?erro=' + encodeURIComponent('Campos obrigatórios ausentes.'));
                    }
                    
                    if (db.usuarios.some(u => u.email === email)) {
                        return respondJson(false, 'E-mail já cadastrado.', null, '/public/views/usuarios.php?erro=' + encodeURIComponent('E-mail já cadastrado.'));
                    }
                    
                    const newId = db.usuarios.length > 0 ? Math.max(...db.usuarios.map(u => u.id)) + 1 : 1;
                    const newUser = {
                        id: newId,
                        nome: nome,
                        email: email,
                        senha: 'senai123',
                        nivel_acesso: nivel,
                        data_criacao: new Date().toISOString(),
                        ambientes_vinculados: ambs
                    };
                    
                    db.usuarios.push(newUser);
                    saveDatabase(db);
                    
                    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
                        return respondJson(true, 'Usuário cadastrado com sucesso!', newUser);
                    } else {
                        res.writeHead(302, { 'Location': '/public/views/usuarios.php?sucesso=' + encodeURIComponent('Usuário cadastrado com sucesso!') });
                        res.end();
                        return;
                    }
                }

                if (acao === 'alterar_nivel') {`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync('start_test_server.js', code);
    console.log("Patched successfully!");
} else {
    console.log("Could not find target string.");
}
