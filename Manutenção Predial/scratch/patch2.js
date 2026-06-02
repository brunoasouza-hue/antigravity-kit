const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

// Remove the wrongly placed const familia
code = code.replace(
    /const status = postParams\.status \|\| 'Ativo';\r?\n\s*const familia = postParams\.familia \|\| 'Geral';/,
    "const status = postParams.status || 'Ativo';"
);

// Now find the acao === 'editar' block and put const familia there
const editRegex = /(if \(acao === 'editar'\) \{[\s\S]*?const status = postParams\.status \|\| 'Ativo';)/;
code = code.replace(editRegex, `$1\n                    const familia = postParams.familia || 'Geral';`);

fs.writeFileSync('start_test_server.js', code);
console.log('Fixed patch.');
