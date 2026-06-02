const fs = require('fs');
let serverJs = fs.readFileSync('start_test_server.js', 'utf8');

const regex = /if\s*\(checks\.length\s*<\s*ambsAtivos\.length\)\s*\{[\s\S]*?\}/;

if (regex.test(serverJs)) {
    serverJs = serverJs.replace(regex, `// Validação removida a pedido do usuário: permite finalizar inspeção sem inspecionar tudo.`);
    fs.writeFileSync('start_test_server.js', serverJs);
    console.log('Validação removida com sucesso!');
} else {
    console.log('Validação não encontrada.');
}
