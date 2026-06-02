const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const regex = /const btnFinalizar = inspecao\.progresso === inspecao\.total[\s\S]*?: `<button id="btnFinalizarMensal" disabled style="background:#ccc;color:#fff;border:none;border-radius:8px;padding:12px 25px;font-weight:bold;cursor:not-allowed;"><i class="bi bi-lock"><\/i> Finalizar Inspe[\\s\\S]*?o Mensal<\/button>`;/;

const replacement = `const btnFinalizar = \`<button id="btnFinalizarMensal" onclick="finalizarInspecao(\${inspecao.id})" style="background:#28a745;color:#fff;border:none;border-radius:8px;padding:12px 25px;font-weight:bold;cursor:pointer;transition:0.2s;"><i class="bi bi-check-circle"></i> Finalizar Inspeção Mensal</button>\`;`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('start_test_server.js', content);
    console.log('Button logic replaced successfully!');
} else {
    // try fallback simpler replace
    const lines = content.split('\n');
    let replaced = false;
    for(let i=0; i<lines.length; i++){
        if (lines[i].includes('const btnFinalizar = inspecao.progresso === inspecao.total')) {
            lines[i] = replacement;
            lines[i+1] = '';
            lines[i+2] = '';
            replaced = true;
            break;
        }
    }
    if (replaced) {
        fs.writeFileSync('start_test_server.js', lines.join('\n'));
        console.log('Button logic replaced via lines array!');
    } else {
        console.log('Button logic NOT found!');
    }
}
