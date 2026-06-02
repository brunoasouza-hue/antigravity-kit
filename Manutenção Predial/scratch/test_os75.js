const fs = require('fs');
const db = JSON.parse(fs.readFileSync('mock_database.json', 'utf8'));
const os = db.ordens_servico.find(o => o.id === 75);
console.log(JSON.stringify(os, null, 2));
