const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Manutenção Predial\\start_test_server.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('nome_bloco_sala')) {
        console.log(`Line ${idx+1}: ${line.trim()}`);
    }
});
