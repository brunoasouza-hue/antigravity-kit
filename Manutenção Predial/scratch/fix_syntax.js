const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const regex = /\/\/ Valida[\s\S]*?\}\s*inspecao\.status = 'Finalizada';/;
const replacement = `// Validação removida a pedido do usuário: permite finalizar inspeção sem inspecionar tudo.

                    inspecao.status = 'Finalizada';`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('start_test_server.js', content);
    console.log('Fixed syntax error!');
} else {
    console.log('Regex not matched');
}
