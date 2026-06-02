const fs = require('fs');
const dbPath = 'mock_database.json';

const rawData = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(rawData);

let modified = false;

// 1. Ensure `ambientes_vinculados` exists on all users
if (db.usuarios) {
    db.usuarios.forEach(u => {
        if (!u.ambientes_vinculados) {
            u.ambientes_vinculados = [];
            modified = true;
        }
    });
}

if (modified) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
    console.log('Database updated with ambientes_vinculados.');
} else {
    console.log('Database already has ambientes_vinculados.');
}
