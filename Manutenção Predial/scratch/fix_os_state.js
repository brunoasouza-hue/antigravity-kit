const fs = require('fs');

const DB_FILE = 'mock_database.json';
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Fix OS #75
const os75 = db.ordens_servico.find(o => o.id === 75);
if (os75 && !os75.executor_atual_id && os75.status === 'Em Execução') {
    // assign it to a valid executor, e.g. ID 3
    const executor = db.usuarios.find(u => u.nivel_acesso === 'Executor');
    if (executor) {
        os75.executor_atual_id = executor.id;
        console.log("Fixed OS #75 to executor ID " + executor.id);
    }
}

// Fix all OSes that are Em Execução without an executor
db.ordens_servico.forEach(o => {
    if (o.status === 'Em Execução' && !o.executor_atual_id) {
        const executor = db.usuarios.find(u => u.nivel_acesso === 'Executor');
        if (executor) {
            o.executor_atual_id = executor.id;
            console.log("Fixed OS #" + o.id + " to executor ID " + executor.id);
        }
    }
});

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 4), 'utf8');

// Now let's fix start_test_server.js to be safer about newExecId
let serverCode = fs.readFileSync('start_test_server.js', 'utf8');
serverCode = serverCode.replace(
    /const newExecId = parseInt\(postParams\.executor_atual_id\);/,
    `const newExecId = parseInt(postParams.executor_atual_id || postParams.novo_executor_id);`
);

fs.writeFileSync('start_test_server.js', serverCode, 'utf8');
console.log("Patched mock server to accept both param names.");
