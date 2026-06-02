const fs = require('fs');

const famData = {
    "Salas de Aulas": [20770034, 20770035, 20770036, 20770037, 20770038, 20770039, 20770055, 20770056, 20770057],
    "Laboratórios": [20770023, 20770024, 20770025, 20770026, 20770047, 20770048, 20770073, 20770095, 20770096, 20770101, 20770104],
    "Oficinas": [20770019, 20770020, 20770022, 20770027, 20770028, 20770029, 20770030, 20770031, 20770032, 20770033, 20770042, 20770043, 20770044, 20770045, 20770049, 20770050, 20770051, 20770052, 20770053, 20770054, 20770075, 20770100, 20770106],
    "Administrativos": [20770001, 20770002, 20770003, 20770004, 20770005, 20770006, 20770007, 20770008, 20770010, 20770012, 20770013, 20770014, 20770015, 20770018, 20770021, 20770040, 20770060, 20770063, 20770064, 20770071, 20770102, 20770103, 20770105],
    "Externos": [20770017, 20770058, 20770059, 20770061, 20770062, 20770065, 20770066, 20770074, 20770078, 20770079, 20770080, 20770081, 20770086]
};

// 1. UPDATE DB
let dbStr = fs.readFileSync('mock_database.json', 'utf8');
let db = JSON.parse(dbStr);

db.ambientes.forEach(amb => {
    let assigned = false;
    for (let fam in famData) {
        if (famData[fam].includes(amb.id)) {
            amb.familia = fam;
            assigned = true;
            break;
        }
    }
    if (!assigned) {
        amb.familia = "Geral"; // Fallback just in case
    }
});

db.itens_checklist = {
    "Salas de Aulas": ["Lousa", "Projetor", "Tomadas", "Carteiras", "Iluminação"],
    "Laboratórios": ["Bancadas", "Computadores", "Ar Condicionado", "Iluminação"],
    "Oficinas": ["Sinalização de Segurança", "EPIs Gerais", "Painéis Elétricos", "Máquinas"],
    "Administrativos": ["Móveis", "Ar Condicionado", "Iluminação", "Fechaduras"],
    "Externos": ["Jardinagem", "Iluminação Externa", "Limpeza", "Lixeiras"],
    "Geral": ["Tomadas", "Iluminação", "Paredes"]
};

db.checklists = []; // Reset old data
fs.writeFileSync('mock_database.json', JSON.stringify(db, null, 4));
console.log('mock_database.json updated with families.');

// 2. Modify start_test_server.js
let js = fs.readFileSync('start_test_server.js', 'utf8');

// Update backend endpoints
const oldEndpoints = `
                if (acao === 'adicionar_item_checklist') {
                    if (session.usuario_nivel !== 'Gestor') return respondJson(false, 'Acesso Negado');
                    if (!db.itens_checklist) db.itens_checklist = [];
                    db.itens_checklist.push(postParams.nome);
                    saveDatabase(db);
                    return respondJson(true, 'Item adicionado com sucesso');
                }
                
                if (acao === 'remover_item_checklist') {
                    if (session.usuario_nivel !== 'Gestor') return respondJson(false, 'Acesso Negado');
                    if (!db.itens_checklist) db.itens_checklist = [];
                    db.itens_checklist = db.itens_checklist.filter(i => i !== postParams.nome);
                    saveDatabase(db);
                    return respondJson(true, 'Item removido com sucesso');
                }`;

const newEndpoints = `
                if (acao === 'adicionar_item_checklist') {
                    if (session.usuario_nivel !== 'Gestor') return respondJson(false, 'Acesso Negado');
                    const familia = postParams.familia;
                    if (!db.itens_checklist) db.itens_checklist = {};
                    if (!db.itens_checklist[familia]) db.itens_checklist[familia] = [];
                    if (!db.itens_checklist[familia].includes(postParams.nome)) {
                        db.itens_checklist[familia].push(postParams.nome);
                    }
                    saveDatabase(db);
                    return respondJson(true, 'Item adicionado com sucesso');
                }
                
                if (acao === 'remover_item_checklist') {
                    if (session.usuario_nivel !== 'Gestor') return respondJson(false, 'Acesso Negado');
                    const familia = postParams.familia;
                    if (db.itens_checklist && db.itens_checklist[familia]) {
                        db.itens_checklist[familia] = db.itens_checklist[familia].filter(i => i !== postParams.nome);
                        saveDatabase(db);
                    }
                    return respondJson(true, 'Item removido com sucesso');
                }`;

if (js.includes('if (acao === \'adicionar_item_checklist\')')) {
    js = js.replace(oldEndpoints, newEndpoints);
}

// Inject window.AMBIENTES_FAMILIAS into HTML in the html builder
const scriptInjectionOld = `        html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML + \`\\n<script>window.ITENS_CHECKLIST = \${JSON.stringify(db.itens_checklist || [])};</script>\`);`;

const scriptInjectionNew = `        // Injeta objetos no HTML
        const mapaFamilias = {};
        (db.ambientes || []).forEach(a => {
            mapaFamilias[a.id] = a.familia || 'Geral';
        });
        html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML + \`\\n<script>
            window.ITENS_CHECKLIST = \${JSON.stringify(db.itens_checklist || {})};
            window.AMBIENTES_FAMILIAS = \${JSON.stringify(mapaFamilias)};
        </script>\`);`;

if (js.includes(scriptInjectionOld)) {
    js = js.replace(scriptInjectionOld, scriptInjectionNew);
} else {
    // maybe it was modified somehow? Just do a general replacement:
    const regexOldScript = /html = html\.replace\('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML \+ `\\n<script>window\.ITENS_CHECKLIST = \${JSON\.stringify\(db\.itens_checklist \|\| \[\]\)};<\/script>`\);/;
    if (regexOldScript.test(js)) {
        js = js.replace(regexOldScript, scriptInjectionNew);
    }
}

fs.writeFileSync('start_test_server.js', js);
console.log('start_test_server.js updated with families.');
