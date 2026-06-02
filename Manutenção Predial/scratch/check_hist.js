const fs = require('fs');
const db = JSON.parse(fs.readFileSync('mock_database.json', 'utf8'));

const historico = db.inspecoes_mensais ? db.inspecoes_mensais.filter(i => i.status === 'Finalizada').sort((a,b) => b.id - a.id) : [];

console.log("historico length:", historico.length);
if (historico.length > 0) {
    console.log("historico[0]:", historico[0]);
}
