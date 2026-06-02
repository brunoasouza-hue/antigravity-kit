const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

code = code.replace(
    /const status = postParams\.status \|\| 'Ativo';/,
    `const status = postParams.status || 'Ativo';
                    const familia = postParams.familia || 'Geral';`
);

code = code.replace(
    /db\.ambientes\[idx\]\.status = status;/,
    `db.ambientes[idx].status = status;
                    db.ambientes[idx].familia = familia;`
);

fs.writeFileSync('start_test_server.js', code);
console.log('Patched start_test_server.js');
