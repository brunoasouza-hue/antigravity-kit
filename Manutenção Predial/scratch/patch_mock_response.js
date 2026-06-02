const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

code = code.replace(/solicitante_name: sol.nome/g, "solicitante_nome: sol.nome");
code = code.replace(/gestor_name: gest.nome/g, "gestor_nome: gest.nome");
code = code.replace(/executor_name: exec.nome/g, "executor_nome: exec.nome");

fs.writeFileSync('start_test_server.js', code, 'utf8');
console.log("Patched start_test_server.js");
