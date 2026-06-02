const fs = require('fs');
const path = 'C:\\\\Users\\\\Instrutor\\\\OneDrive - SESISENAISP - Corporativo\\\\PESSOAL\\\\Documents\\\\ANTIGRAVITY\\\\Manutenção Predial\\\\public\\\\views\\\\corretivas.php';
let content = fs.readFileSync(path, 'utf8');

// Strip single quotes in Javascript statusLinha
content = content.replace(
    /const statusLinha = \(linha\.getAttribute\('data-status'\) \|\| ''\)\.toUpperCase\(\);/g,
    "const statusLinha = (linha.getAttribute('data-status') || '').replace(/'/g, '').toUpperCase();"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed JS data-status filtering to handle mock server quotes.');
