const fs = require('fs');
const path = require('path');

const projectDir = 'c:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Manutenção Predial';
const schemaPath = path.join(projectDir, 'sql', 'schema.sql');
const serverPath = path.join(projectDir, 'start_test_server.js');
const dbPath = path.join(projectDir, 'mock_database.json');

console.log("Starting sync...");

// 1. Read and parse sql/schema.sql
if (!fs.existsSync(schemaPath)) {
    console.error("schema.sql not found at:", schemaPath);
    process.exit(1);
}
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Parse users
const users = [
    {
        id: 1,
        nome: "Carlos Souza (Solicitante)",
        email: "solicitante@senai.br",
        senha: "senai123",
        nivel_acesso: "Solicitante",
        data_criacao: new Date().toISOString()
    },
    {
        id: 2,
        nome: "Renata Mendes (Gestor)",
        email: "gestor@senai.br",
        senha: "senai123",
        nivel_acesso: "Gestor",
        data_criacao: new Date().toISOString()
    },
    {
        id: 3,
        nome: "Marcos Silva (Executor)",
        email: "executor@senai.br",
        senha: "senai123",
        nivel_acesso: "Executor",
        data_criacao: new Date().toISOString()
    }
];

// Regex to extract seeded users
const userRegex = /INSERT IGNORE INTO usuarios\s+\(nome,\s*email,\s*senha,\s*nivel_acesso\)\s*VALUES\s*\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\);/g;
let match;
let userId = 4;
while ((match = userRegex.exec(schemaContent)) !== null) {
    const nome = match[1];
    const email = match[2];
    const senha = "senai123"; // Plain text password for mock login
    const nivel_acesso = match[4];
    users.push({
        id: userId++,
        nome,
        email,
        senha,
        nivel_acesso,
        data_criacao: new Date().toISOString()
    });
}
console.log(`Parsed ${users.length} total users.`);

// Parse environments
const environments = [];
const envRegex = /INSERT INTO ambientes\s+\(id,\s*nome_ambiente\)\s*VALUES\s*\((\d+),\s*'([^']+)'\)/g;
while ((match = envRegex.exec(schemaContent)) !== null) {
    const id = parseInt(match[1]);
    const nome_ambiente = match[2];
    environments.push({
        id,
        nome_ambiente,
        status: "Ativo"
    });
}
console.log(`Parsed ${environments.length} total environments.`);

// 2. Read and update start_test_server.js
if (!fs.existsSync(serverPath)) {
    console.error("start_test_server.js not found at:", serverPath);
    process.exit(1);
}
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Global replacement of nome_bloco_sala and getNomeBlocoSala
serverContent = serverContent.replace(/nome_bloco_sala/g, 'nome_ambiente');
serverContent = serverContent.replace(/getNomeBlocoSala/g, 'getNomeAmbiente');

// Update initDatabase() seeds
// Find where the semente environments array starts
const ambStartIndex = serverContent.indexOf('ambientes: [');
if (ambStartIndex === -1) {
    console.error("Could not find environments seed block in start_test_server.js");
    process.exit(1);
}

// Let's replace the hardcoded usuarios array and environments array in initDatabase()
// We'll rewrite the whole initDatabase() function to make it robust.
// First, find the start and end of initDatabase()
const initDbStart = serverContent.indexOf('function initDatabase()');
const initDbEnd = serverContent.indexOf('function saveDatabase(');

if (initDbStart === -1 || initDbEnd === -1) {
    console.error("Could not locate initDatabase or saveDatabase functions in start_test_server.js");
    process.exit(1);
}

// Let's construct the new initDatabase function string
const newInitDatabase = `function initDatabase() {
    if (fs.existsSync(DB_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } catch (e) {
            console.error("Erro ao ler banco de dados mock, reiniciando dados de semente.", e);
        }
    }

    const db = {
        usuarios: ${JSON.stringify(users, null, 8)},
        ambientes: ${JSON.stringify(environments, null, 8)},
        checklists: [],
        ordens_servico: []
    };

    // Geração de histórico estatístico para os últimos 6 meses (garante Chart.js perfeito)
    const now = new Date();
    const checklistCounts = [11, 14, 7, 10, 12, 8];
    const osCounts = [7, 11, 8, 6, 9, 5];
    
    let checklistId = 1;
    let osId = 1;
    
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 15);
        const dateStr = targetDate.toISOString().split('T')[0];
        
        // Seed Checklists
        const numChecklists = checklistCounts[5 - i];
        for (let c = 0; c < numChecklists; c++) {
            const ambIdx = c % db.ambientes.length;
            const ambId = db.ambientes[ambIdx].id;
            db.checklists.push({
                id: checklistId++,
                ambiente_id: ambId,
                responsavel_id: 3, // Marcos Silva
                data_inspecao: dateStr,
                status_tomadas: c % 3 === 0 ? "Defeito" : "Ok",
                status_forros: c % 4 === 0 ? "Defeito" : "Ok",
                status_paredes: "Ok",
                status_projetor: c % 5 === 0 ? "Defeito" : "Ok",
                status_tela: "Ok",
                status_lousa: "Ok",
                observacoes: c % 3 === 0 ? "Necessita reparos identificados na inspeção." : null,
                data_criacao: dateStr + " 10:00:00"
            });
        }
        
        // Seed OS
        const numOS = osCounts[5 - i];
        for (let o = 0; o < numOS; o++) {
            const ambIdx = o % db.ambientes.length;
            const ambId = db.ambientes[ambIdx].id;
            const status = o % 4 === 0 ? "Pendente" : (o % 4 === 1 ? "Em Execução" : (o % 4 === 2 ? "Aguardando Validação" : "Concluída"));
            let dataFechamento = null;
            if (status === "Concluída") {
                const fechamentoDate = new Date(targetDate);
                fechamentoDate.setDate(fechamentoDate.getDate() + 2);
                dataFechamento = fechamentoDate.toISOString().split('T')[0] + " 17:00:00";
            }
            
            db.ordens_servico.push({
                id: osId++,
                solicitante_id: 1, // Carlos Souza
                gestor_id: 2, // Renata Mendes
                executor_id: 3, // Marcos Silva
                ambiente_id: ambId,
                descricao_problema: \`Problema no circuito elétrico do ambiente \${db.ambientes[ambIdx].nome_ambiente}.\`,
                tipo_execucao: o % 3 === 0 ? "Terceirizada" : "Interna",
                status: status,
                data_abertura: dateStr + " 09:00:00",
                data_fechamento: dataFechamento
            });
        }
    }

    saveDatabase(db);
    return db;
}

`;

// Let's replace initDatabase in start_test_server.js
const updatedServerContent = serverContent.substring(0, initDbStart) + newInitDatabase + serverContent.substring(initDbEnd);

// Let's adjust POST cadastrar to handle manual numeric ID
let modifiedServerContent = updatedServerContent;

// We need to replace the acao === 'cadastrar' logic inside the server content
const cadastrarStart = modifiedServerContent.indexOf("if (acao === 'cadastrar') {");
const cadastrarEnd = modifiedServerContent.indexOf("if (acao === 'editar') {");

if (cadastrarStart === -1 || cadastrarEnd === -1) {
    console.error("Could not find acao === 'cadastrar' or acao === 'editar' blocks in server file");
    process.exit(1);
}

const newCadastrarBlock = `if (acao === 'cadastrar') {
                    const id = parseInt(postParams.id);
                    const nome = (postParams.nome_ambiente || '').trim();
                    const status = postParams.status || 'Ativo';

                    if (isNaN(id) || id <= 0) return respondJson(false, "Código (ID) é obrigatório e deve ser um número inteiro positivo.");
                    if (!nome) return respondJson(false, "Nome do ambiente é obrigatório.");
                    
                    if (db.ambientes.some(a => a.id === id)) {
                        return respondJson(false, \`Erro: Já existe um ambiente cadastrado com o código \${id}.\`);
                    }
                    if (db.ambientes.some(a => a.nome_ambiente.toLowerCase() === nome.toLowerCase())) {
                        return respondJson(false, \`Erro: Já existe um ambiente cadastrado com o nome '\${nome}'.\`);
                    }

                    const newAmb = {
                        id: id,
                        nome_ambiente: nome,
                        status: status
                    };

                    db.ambientes.push(newAmb);
                    saveDatabase(db);
                    return respondJson(true, \`Ambiente '\${nome}' cadastrado com sucesso!\`, newAmb);
                }

                `;

modifiedServerContent = modifiedServerContent.substring(0, cadastrarStart) + newCadastrarBlock + modifiedServerContent.substring(cadastrarEnd);

// Write modified server back to file
fs.writeFileSync(serverPath, modifiedServerContent, 'utf8');
console.log("Successfully updated start_test_server.js!");

// 3. Populate mock_database.json with new seeds
const mockDb = {
    usuarios: users,
    ambientes: environments,
    checklists: [],
    ordens_servico: []
};

// Generate some sample historical checklists/OS data for high fidelity mock database
const now = new Date();
const checklistCounts = [11, 14, 7, 10, 12, 8];
const osCounts = [7, 11, 8, 6, 9, 5];

let checklistId = 1;
let osId = 1;

for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Seed Checklists
    const numChecklists = checklistCounts[5 - i];
    for (let c = 0; c < numChecklists; c++) {
        const ambIdx = c % mockDb.ambientes.length;
        const ambId = mockDb.ambientes[ambIdx].id;
        mockDb.checklists.push({
            id: checklistId++,
            ambiente_id: ambId,
            responsavel_id: 3, // Marcos Silva
            data_inspecao: dateStr,
            status_tomadas: c % 3 === 0 ? "Defeito" : "Ok",
            status_forros: c % 4 === 0 ? "Defeito" : "Ok",
            status_paredes: "Ok",
            status_projetor: c % 5 === 0 ? "Defeito" : "Ok",
            status_tela: "Ok",
            status_lousa: "Ok",
            observacoes: c % 3 === 0 ? "Tomada com avaria física constatada." : null,
            data_criacao: dateStr + " 10:00:00"
        });
    }
    
    // Seed OS
    const numOS = osCounts[5 - i];
    for (let o = 0; o < numOS; o++) {
        const ambIdx = o % mockDb.ambientes.length;
        const ambId = mockDb.ambientes[ambIdx].id;
        const status = o % 4 === 0 ? "Pendente" : (o % 4 === 1 ? "Em Execução" : (o % 4 === 2 ? "Aguardando Validação" : "Concluída"));
        let dataFechamento = null;
        if (status === "Concluída") {
            const fechamentoDate = new Date(targetDate);
            fechamentoDate.setDate(fechamentoDate.getDate() + 2);
            dataFechamento = fechamentoDate.toISOString().split('T')[0] + " 17:00:00";
        }
        
        mockDb.ordens_servico.push({
            id: osId++,
            solicitante_id: 1, // Carlos Souza
            gestor_id: 2, // Renata Mendes
            executor_id: 3, // Marcos Silva
            ambiente_id: ambId,
            descricao_problema: `Problema no circuito elétrico do ambiente ${mockDb.ambientes[ambIdx].nome_ambiente}.`,
            tipo_execucao: o % 3 === 0 ? "Terceirizada" : "Interna",
            status: status,
            data_abertura: dateStr + " 09:00:00",
            data_fechamento: dataFechamento
        });
    }
}

fs.writeFileSync(dbPath, JSON.stringify(mockDb, null, 4), 'utf8');
console.log("Successfully wrote updated mock_database.json!");

console.log("Sync finished successfully.");
