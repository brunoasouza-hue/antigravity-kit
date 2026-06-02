const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

// Fix the corrupted block
code = code.replace(
    /        else if \(collectionName === 'ambsVerificados'\) items = \(dbContext\.inspecaoAtiva && dbContext\.inspecaoAtiva\.verificados\) \|\| \[\];\r?\n\s*\/\/ Substituições simples de getters e propriedades do item na tabela/g,
    `        else if (collectionName === 'ambsVerificados') items = (dbContext.inspecaoAtiva && dbContext.inspecaoAtiva.verificados) || [];`
);

fs.writeFileSync('start_test_server.js', code, 'utf8');
console.log("Cleaned up duplicated comment.");
