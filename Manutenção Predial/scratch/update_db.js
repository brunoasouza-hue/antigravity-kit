const fs = require('fs');
let dbStr = fs.readFileSync('mock_database.json', 'utf8');
let db = JSON.parse(dbStr);

// Add the dynamic checklist items
if (!db.itens_checklist) {
    db.itens_checklist = ["Tomadas", "Forros", "Paredes", "Projetor", "Tela", "Lousa"];
}

// Clear the old checklists to avoid schema crash since we are moving from static to dynamic
db.checklists = [];

fs.writeFileSync('mock_database.json', JSON.stringify(db, null, 4));
console.log('Database updated with dynamic checklist items.');
