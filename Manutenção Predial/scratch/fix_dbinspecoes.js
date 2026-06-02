const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const oldCode = `    const checklists = db.checklists || [];
    const ordensServico = db.ordens_servico || [];
    const usuarios = db.usuarios || [];`;

const newCode = `    const checklists = db.checklists || [];
    const ordensServico = db.ordens_servico || [];
    const usuarios = db.usuarios || [];
    const dbInspecoes = db.inspecoes_mensais || [];`;

if (content.includes(oldCode) && !content.includes('const dbInspecoes = db.inspecoes_mensais || [];')) {
    content = content.replace(oldCode, newCode);
} else {
    // maybe it already has it?
    // remove the one inside the block just in case to avoid redefinition
}

// Ensure the local one is removed to avoid duplicate declaration
content = content.replace(/const dbInspecoes = db.inspecoes_mensais \|\| \[\];/g, '');
// Re-insert at the top
content = content.replace('const checklists = db.checklists || [];', 'const dbInspecoes = db.inspecoes_mensais || [];\n    const checklists = db.checklists || [];');

fs.writeFileSync('start_test_server.js', content);
console.log('Fixed dbInspecoes scoping!');
