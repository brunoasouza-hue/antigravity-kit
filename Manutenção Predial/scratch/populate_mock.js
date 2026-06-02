const fs = require('fs');
const dbPath = 'mock_database.json';

const rawData = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(rawData);

let modified = false;

if (db.usuarios && db.ambientes) {
    const ambIds = db.ambientes.map(a => a.id);
    
    // Assign random ambientes_vinculados to mock users 4, 5, 6
    if (db.usuarios[3]) { db.usuarios[3].ambientes_vinculados = [ambIds[0]]; modified = true; }
    if (db.usuarios[4]) { db.usuarios[4].ambientes_vinculados = [ambIds[0], ambIds[1]]; modified = true; }
    if (db.usuarios[5]) { db.usuarios[5].ambientes_vinculados = [ambIds[2]]; modified = true; }
}

if (modified) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
    console.log('Mock database users populated with some ambientes_vinculados.');
}
