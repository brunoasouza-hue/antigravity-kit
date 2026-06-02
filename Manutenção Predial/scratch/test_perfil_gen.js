const fs = require('fs');

function escapeHtml(text) {
    if (typeof text !== 'string') text = String(text || '');
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

let content = fs.readFileSync('public/views/perfil.php', 'utf8');

const context = {
    usuarioNome: 'Admin Mock',
    usuarioNivel: 'Gestor',
    usuarioEmail: 'gestor@senai.br',
    usuarioDataCriacao: new Date().toISOString(),
    erro: '',
    BASE_URL: ''
};

const echos = [
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$erro\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.erro) },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$usuarioModel->getNome\(\)\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.usuarioNome) },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$usuarioModel->getNivelAcesso\(\)\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.usuarioNivel) },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$usuarioModel->getEmail\(\)\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.usuarioEmail) },
        { regex: /<\?php\s+echo\s+date\(\s*['"]d\/m\/Y H:i['"]\s*,\s*strtotime\(\s*\$usuarioModel->getDataCriacao\(\)\s*\?\?\s*['"]now['"]\s*\)\s*\)\s*;?\s*\?>/g, val: 'Data Mock' },
        { regex: /<\?php\s+echo\s+BASE_URL\s*;?\s*\?>/g, val: '' },
        { regex: /BASE_URL\s*\.\s*['"](.*?)['"]/g, val: `'$1'` }
];

echos.forEach(e => {
    content = content.replace(e.regex, e.val);
});

content = content.replace(/<\?php\s+echo\s+.*?\s*;?\s*\?>/g, '');
content = content.replace(/<\?=\s*.*?\s*\?>/g, '');
content = content.replace(/<\?php.*?\?>/gs, '');

fs.writeFileSync('scratch/perfil_test.html', content);
console.log("Test generated");
