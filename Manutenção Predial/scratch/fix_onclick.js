const fs = require('fs');
let server = fs.readFileSync('start_test_server.js', 'utf8');

const targetStr = `onclick="openEditModal(\${u.id}, '\${escapeHtml(u.nome)}', '\${escapeHtml(u.email)}', '\${u.nivel_acesso}', [\${u.ambientes_vinculados ? u.ambientes_vinculados.join(',') : ''}])"`;
const replacementStr = `onclick="abrirModalEditar(\${u.id}, '\${escapeHtml(u.nome)}', '\${u.nivel_acesso}', [\${u.ambientes_vinculados ? u.ambientes_vinculados.join(',') : ''}])"`;

if(server.includes(targetStr)) {
    server = server.replace(targetStr, replacementStr);
    fs.writeFileSync('start_test_server.js', server);
    console.log('Fixed onclick to call abrirModalEditar!');
} else {
    console.log('Could not find targetStr!');
}
