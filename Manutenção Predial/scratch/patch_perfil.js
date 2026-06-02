const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

// Step 1: Add usuarioDataCriacao to context
const contextRegex = /(const context = \{[\s\S]*?BASE_URL:\s*''\n\s*\};)/;
code = code.replace(contextRegex, (match, contextBlock) => {
    return `    const currentUser = usuarios.find(u => u.id === session.usuario_id) || {};\n` +
           contextBlock.replace(`BASE_URL: ''`, `BASE_URL: '',\n        usuarioDataCriacao: currentUser.data_criacao || new Date().toISOString()`);
});

// Step 2: Add regexes to compileVariables
const echosRegex = /(const echos = \[[\s\S]*?)(\{ regex: \/<\?php\\s\+echo\\s\+BASE_URL\\s\*;\\?\\s\*\\?>\/g, val: '' \},)/;

code = code.replace(echosRegex, (match, pre, post) => {
    return pre + 
        `{ regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$usuarioModel->getNome\\(\\)\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.usuarioNome) },\n        ` +
        `{ regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$usuarioModel->getNivelAcesso\\(\\)\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.usuarioNivel) },\n        ` +
        `{ regex: /<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$usuarioModel->getEmail\\(\\)\\s*\\)\\s*;?\\s*\\?>/g, val: escapeHtml(context.usuarioEmail) },\n        ` +
        `{ regex: /<\\?php\\s+echo\\s+date\\(\\s*['"]d\\/m\\/Y H:i['"]\\s*,\\s*strtotime\\(\\s*\\$usuarioModel->getDataCriacao\\(\\)\\s*\\?\\?\\s*['"]now['"]\\s*\\)\\s*\\)\\s*;?\\s*\\?>/g, val: formatDate(context.usuarioDataCriacao, true) },\n        ` +
        post;
});

fs.writeFileSync('start_test_server.js', code);
console.log("Patched start_test_server.js for perfil.php successfully.");
