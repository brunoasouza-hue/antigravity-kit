/**
 * SENAI Manutenção Predial - Servidor de Execução e Banco de Dados Mock
 * Desenvolvido em Node.js puro, sem dependências externas.
 * 
 * Este servidor emula o ecossistema PHP + Apache + MySQL, servindo páginas dinâmicas,
 * compilando diretrizes do PHP no HTML e manipulando o estado do banco de dados localmente.
 * 
 * Porta padrão de execução: 8000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 8000;
const DB_FILE = path.join(__dirname, 'mock_database.json');

// Armazena sessões ativas mapeadas por ID de sessão
const SESSIONS = {};

// =========================================================================
// 1. INICIALIZAÇÃO E SEEDING DO BANCO DE DADOS MOCK (MOCK DATABASE)
// =========================================================================
function initDatabase() {
    if (fs.existsSync(DB_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } catch (e) {
            console.error("Erro ao ler banco de dados mock, reiniciando dados de semente.", e);
        }
    }

    const db = {
        usuarios: [
        {
                "id": 1,
                "nome": "Carlos Souza (Solicitante)",
                "email": "solicitante@senai.br",
                "senha": "senai123",
                "nivel_acesso": "Solicitante",
                "data_criacao": "2026-05-22T17:29:51.068Z"
        },
        {
                "id": 2,
                "nome": "Renata Mendes (Gestor)",
                "email": "gestor@senai.br",
                "senha": "senai123",
                "nivel_acesso": "Gestor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 3,
                "nome": "Marcos Silva (Executor)",
                "email": "executor@senai.br",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 4,
                "nome": "Victor Izaias Arantes",
                "email": "victor.arantes@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 5,
                "nome": "Silvio Ronei Marchetti",
                "email": "silvio.marchetti@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 6,
                "nome": "Natalia Gomes dos Santos",
                "email": "natalia.santos@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 7,
                "nome": "Cesar Ferraiolo Batista",
                "email": "cesar.batista@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 8,
                "nome": "Luciana Flores",
                "email": "luciana.flores@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 9,
                "nome": "Bruna Regina Bianchini Roveda",
                "email": "bruna.roveda@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 10,
                "nome": "Antônio Carlos Morettin",
                "email": "antonio.morettin@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 11,
                "nome": "Claudemir Aparecido Flores",
                "email": "claudemir.flores@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 12,
                "nome": "Adriana Cristina de Jesus Rosa",
                "email": "adriana.rosa@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 13,
                "nome": "Geovane Roberto da Silva",
                "email": "geovane.silva@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 14,
                "nome": "Flavio Alves da Silva",
                "email": "flavio.silva@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 15,
                "nome": "Marcelo Vinicius Oliveira Dionisio",
                "email": "marcelo.dionisio@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 16,
                "nome": "Alexandre Felix de Araujo",
                "email": "alexandre.araujo@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 17,
                "nome": "Wellington Gonçalves Norberto",
                "email": "wellington.norberto@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 18,
                "nome": "Sergio Eduardo Brunessi",
                "email": "sergio.brunessi@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 19,
                "nome": "Bruno Alves de Souza",
                "email": "bruno.souza@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 20,
                "nome": "Cleiton Cezar Monteiro",
                "email": "cleiton.monteiro@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 21,
                "nome": "Angelica Affonso Bassan",
                "email": "angelica.bassan@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 22,
                "nome": "Gustavo Antonio Marchiori",
                "email": "gustavo.marchiori@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 23,
                "nome": "Marcio Donizete Gasparoto",
                "email": "marcio.gasparoto@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 24,
                "nome": "Everton Luiz Cerantula",
                "email": "everton.cerantula@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 25,
                "nome": "Diego Soares de Oliveira",
                "email": "diego.oliveira@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 26,
                "nome": "Almir Lotito Lima",
                "email": "almir.lima@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 27,
                "nome": "Marcio Garcia",
                "email": "marcio.garcia@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 28,
                "nome": "Rafael Marangoni Paixão",
                "email": "rafael.paixao@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 29,
                "nome": "Equipe Itinerante",
                "email": "equipe.itinerante@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 30,
                "nome": "Roberto de Souza Ribeiro Moraes Junior",
                "email": "roberto.junior@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 31,
                "nome": "Renan Junior de Almeida Silva",
                "email": "renan.silva@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 32,
                "nome": "Rafael Forti Scalfi",
                "email": "rafael.scalfi@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        },
        {
                "id": 33,
                "nome": "Rogerio Monteiro da Silva",
                "email": "rogerio.silva@escola.com",
                "senha": "senai123",
                "nivel_acesso": "Executor",
                "data_criacao": "2026-05-22T17:29:51.075Z"
        }
],
        ambientes: [
        {
                "id": 20770001,
                "nome_ambiente": "RECPÇÃO",
                "status": "Ativo"
        },
        {
                "id": 20770002,
                "nome_ambiente": "COORDPEDAG",
                "status": "Ativo"
        },
        {
                "id": 20770003,
                "nome_ambiente": "COORDRELAIND",
                "status": "Ativo"
        },
        {
                "id": 20770004,
                "nome_ambiente": "SECRETARIA",
                "status": "Ativo"
        },
        {
                "id": 20770005,
                "nome_ambiente": "SERVIDORPABX",
                "status": "Ativo"
        },
        {
                "id": 20770006,
                "nome_ambiente": "ARQUIVOPOST",
                "status": "Ativo"
        },
        {
                "id": 20770007,
                "nome_ambiente": "REUNIAO",
                "status": "Ativo"
        },
        {
                "id": 20770008,
                "nome_ambiente": "DIRETORIA",
                "status": "Ativo"
        },
        {
                "id": 20770010,
                "nome_ambiente": "BIBLIOTECA",
                "status": "Ativo"
        },
        {
                "id": 20770012,
                "nome_ambiente": "ALMOXARIFADO",
                "status": "Ativo"
        },
        {
                "id": 20770013,
                "nome_ambiente": "DOCENTES",
                "status": "Ativo"
        },
        {
                "id": 20770014,
                "nome_ambiente": "AAPM",
                "status": "Ativo"
        },
        {
                "id": 20770015,
                "nome_ambiente": "ANUALVIDA",
                "status": "Ativo"
        },
        {
                "id": 20770017,
                "nome_ambiente": "REFEITORIO",
                "status": "Ativo"
        },
        {
                "id": 20770018,
                "nome_ambiente": "ALMOXMECANIC",
                "status": "Ativo"
        },
        {
                "id": 20770019,
                "nome_ambiente": "DEPMECANICA",
                "status": "Ativo"
        },
        {
                "id": 20770020,
                "nome_ambiente": "DEPSOLDAGEM",
                "status": "Ativo"
        },
        {
                "id": 20770021,
                "nome_ambiente": "ORIENPRATPRO",
                "status": "Ativo"
        },
        {
                "id": 20770022,
                "nome_ambiente": "CASEOCMECAN",
                "status": "Ativo"
        },
        {
                "id": 20770023,
                "nome_ambiente": "LABHIDRAPNEU",
                "status": "Ativo"
        },
        {
                "id": 20770024,
                "nome_ambiente": "LABMETROLOG",
                "status": "Ativo"
        },
        {
                "id": 20770025,
                "nome_ambiente": "LABINFORMAT",
                "status": "Ativo"
        },
        {
                "id": 20770026,
                "nome_ambiente": "LABCAMCNCMEC",
                "status": "Ativo"
        },
        {
                "id": 20770027,
                "nome_ambiente": "ESMERILHAMEN",
                "status": "Ativo"
        },
        {
                "id": 20770028,
                "nome_ambiente": "OFSOLDAGEM",
                "status": "Ativo"
        },
        {
                "id": 20770029,
                "nome_ambiente": "TRATTERMICO",
                "status": "Ativo"
        },
        {
                "id": 20770030,
                "nome_ambiente": "OFMECEICPES",
                "status": "Ativo"
        },
        {
                "id": 20770031,
                "nome_ambiente": "OFTORNEARIA",
                "status": "Ativo"
        },
        {
                "id": 20770032,
                "nome_ambiente": "OFFRESAAJUST",
                "status": "Ativo"
        },
        {
                "id": 20770033,
                "nome_ambiente": "OFMAQCNCMEC",
                "status": "Ativo"
        },
        {
                "id": 20770034,
                "nome_ambiente": "SALATECMEC",
                "status": "Ativo"
        },
        {
                "id": 20770035,
                "nome_ambiente": "SALAAULA",
                "status": "Ativo"
        },
        {
                "id": 20770036,
                "nome_ambiente": "SALAAULA",
                "status": "Ativo"
        },
        {
                "id": 20770037,
                "nome_ambiente": "SALAAULA",
                "status": "Ativo"
        },
        {
                "id": 20770038,
                "nome_ambiente": "SALAAULA",
                "status": "Ativo"
        },
        {
                "id": 20770039,
                "nome_ambiente": "SALADESENHO",
                "status": "Ativo"
        },
        {
                "id": 20770040,
                "nome_ambiente": "COORDTECNICA",
                "status": "Ativo"
        },
        {
                "id": 20770042,
                "nome_ambiente": "CASEOCMARCEN",
                "status": "Ativo"
        },
        {
                "id": 20770043,
                "nome_ambiente": "DEPMOVACAB",
                "status": "Ativo"
        },
        {
                "id": 20770044,
                "nome_ambiente": "DEPFERRAMARC",
                "status": "Ativo"
        },
        {
                "id": 20770045,
                "nome_ambiente": "DEPTINTAS",
                "status": "Ativo"
        },
        {
                "id": 20770047,
                "nome_ambiente": "LABELETROLP",
                "status": "Ativo"
        },
        {
                "id": 20770048,
                "nome_ambiente": "LABCOMAQELET",
                "status": "Ativo"
        },
        {
                "id": 20770049,
                "nome_ambiente": "CABPINTURA",
                "status": "Ativo"
        },
        {
                "id": 20770050,
                "nome_ambiente": "OFMAQCNCMAD",
                "status": "Ativo"
        },
        {
                "id": 20770051,
                "nome_ambiente": "OFMAQCONVMAD",
                "status": "Ativo"
        },
        {
                "id": 20770052,
                "nome_ambiente": "OFINSTALELET",
                "status": "Ativo"
        },
        {
                "id": 20770053,
                "nome_ambiente": "OFTAPECARIA",
                "status": "Ativo"
        },
        {
                "id": 20770054,
                "nome_ambiente": "OFCOSTURAIND",
                "status": "Ativo"
        },
        {
                "id": 20770055,
                "nome_ambiente": "SALAAULA",
                "status": "Ativo"
        },
        {
                "id": 20770056,
                "nome_ambiente": "SALATECCOST",
                "status": "Ativo"
        },
        {
                "id": 20770057,
                "nome_ambiente": "SALATECMAD",
                "status": "Ativo"
        },
        {
                "id": 20770058,
                "nome_ambiente": "AUDITFOYER",
                "status": "Ativo"
        },
        {
                "id": 20770059,
                "nome_ambiente": "BXABREMPILH",
                "status": "Ativo"
        },
        {
                "id": 20770060,
                "nome_ambiente": "ALMOXFERR",
                "status": "Ativo"
        },
        {
                "id": 20770061,
                "nome_ambiente": "ABREMPILHA",
                "status": "Ativo"
        },
        {
                "id": 20770062,
                "nome_ambiente": "DEP JARDINAG",
                "status": "Ativo"
        },
        {
                "id": 20770063,
                "nome_ambiente": "DEPLIMPEZAG",
                "status": "Ativo"
        },
        {
                "id": 20770064,
                "nome_ambiente": "ZELADORIA",
                "status": "Ativo"
        },
        {
                "id": 20770065,
                "nome_ambiente": "ABRCOMPRESS",
                "status": "Ativo"
        },
        {
                "id": 20770066,
                "nome_ambiente": "PORTARIA",
                "status": "Ativo"
        },
        {
                "id": 20770071,
                "nome_ambiente": "ALMOXMADEIRA",
                "status": "Ativo"
        },
        {
                "id": 20770072,
                "nome_ambiente": "ALMOXQUIMICO",
                "status": "Ativo"
        },
        {
                "id": 20770073,
                "nome_ambiente": "INFORMATICA",
                "status": "Ativo"
        },
        {
                "id": 20770074,
                "nome_ambiente": "PATIO",
                "status": "Ativo"
        },
        {
                "id": 20770075,
                "nome_ambiente": "COSTURA",
                "status": "Ativo"
        },
        {
                "id": 20770078,
                "nome_ambiente": "SANITARIOFEM",
                "status": "Ativo"
        },
        {
                "id": 20770079,
                "nome_ambiente": "SANITARIOMAS",
                "status": "Ativo"
        },
        {
                "id": 20770080,
                "nome_ambiente": "SANITARIOFEM",
                "status": "Ativo"
        },
        {
                "id": 20770081,
                "nome_ambiente": "SANITARIOMAS",
                "status": "Ativo"
        },
        {
                "id": 20770086,
                "nome_ambiente": "COZINHA",
                "status": "Ativo"
        },
        {
                "id": 20770095,
                "nome_ambiente": "PANIFICACAO",
                "status": "Ativo"
        },
        {
                "id": 20770096,
                "nome_ambiente": "LABTI",
                "status": "Ativo"
        },
        {
                "id": 20770099,
                "nome_ambiente": "ITINERANTE",
                "status": "Ativo"
        },
        {
                "id": 20770100,
                "nome_ambiente": "REFRIGERAÇÃO",
                "status": "Ativo"
        },
        {
                "id": 20770101,
                "nome_ambiente": "CADCAMTI",
                "status": "Ativo"
        },
        {
                "id": 20770102,
                "nome_ambiente": "ARQUIVOPERM",
                "status": "Ativo"
        },
        {
                "id": 20770103,
                "nome_ambiente": "SLIMPRESSOES",
                "status": "Ativo"
        },
        {
                "id": 20770104,
                "nome_ambiente": "LABTIB",
                "status": "Ativo"
        },
        {
                "id": 20770105,
                "nome_ambiente": "SESIFERNAND",
                "status": "Ativo"
        },
        {
                "id": 20770106,
                "nome_ambiente": "CONSTCIVIL",
                "status": "Ativo"
        }
],
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
                executor_atual_id: 3, // Marcos Silva
                ambiente_id: ambId,
                descricao_problema: `Problema no circuito elétrico do ambiente ${db.ambientes[ambIdx].nome_ambiente}.`,
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

function saveDatabase(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 4), 'utf8');
}

// =========================================================================
// 2. FUNÇÕES AUXILIARES DE SUPORTE E SEGURANÇA
// =========================================================================
function escapeHtml(text) {
    if (typeof text !== 'string') text = String(text || '');
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeHtmlAttr(text) {
    return escapeHtml(text).replace(/'/g, '&#39;');
}

function formatDate(dateStr, includeTime = false) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    if (includeTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    return `${day}/${month}/${year}`;
}

// Verifica se os campos contêm a palavra proibida "VAZIO" (case-insensitive)
function containsVazio(data) {
    if (!data) return false;
    if (typeof data === 'string') {
        return data.trim().toUpperCase() === 'VAZIO';
    }
    if (typeof data === 'object') {
        for (const key in data) {
            if (containsVazio(data[key])) return true;
        }
    }
    return false;
}

// =========================================================================
// 3. COMPILADOR E MOTOR DE RENDERIZAÇÃO PHP-TO-HTML
// =========================================================================
function evaluatePhpCondition(condStr, session, localContext = {}) {
    // Transforma variáveis do PHP para escopos do JS correspondentes
    let js = condStr
        .replace(/\$usuarioNivel/g, 'session.usuario_nivel')
        .replace(/\$usuarioNome/g, 'session.usuario_nome')
        .replace(/\$usuarioId/g, 'session.usuario_id')
        .replace(/\$status/g, 'localContext.status')
        .replace(/\$pesquisa/g, 'localContext.pesquisa')
        .replace(/\$alertaSucesso/g, 'session.alerta_sucesso')
        .replace(/\$alertaErro/g, 'session.alerta_erro')
        .replace(/\$erro/g, 'localContext.erro')
        .replace(/\$ordensServico/g, 'localContext.currentOS')
        .replace(/\$ambientesAtivos/g, '(localContext.ambientes ? localContext.ambientes.filter(a => a.status === "Ativo") : [])')
        .replace(/\$executores/g, 'localContext.executores')
        .replace(/empty\((.*?)\)/g, '( !$1 || (Array.isArray($1) && $1.length === 0) )')
        .replace(/!empty\((.*?)\)/g, '( $1 && (!Array.isArray($1) || $1.length > 0) )')
        .replace(/isset\((.*?)\)/g, '( typeof $1 !== "undefined" && $1 !== null )')
        .replace(/\$os->getExecutorNome\(\)/g, '(localContext.item && localContext.item.executor_nome && localContext.item.executor_nome !== "Não Atribuído")');
    
    try {
        const fn = new Function('session', 'localContext', `return (${js});`);
        return !!fn(session, localContext);
    } catch(e) {
        // Fallback silencioso em caso de parse complexo
        return false;
    }
}

function parseAndEvaluateInnermost(blockHtml, session, localContext) {
    const ifMatch = blockHtml.match(/^<\?php\s+if\s*\(((?:(?!<\?php|<\?>).)*?)\)\s*:\s*\?>([\s\S]*?)(?=<\?php\s+elseif|<\?php\s+else|<\?php\s+endif)/);
    if (!ifMatch) return '';

    const firstCond = ifMatch[1];
    const firstBody = ifMatch[2];

    if (evaluatePhpCondition(firstCond, session, localContext)) {
        return firstBody;
    }

    const elseifRegex = /<\?php\s+elseif\s*\(((?:(?!<\?php|<\?>).)*?)\)\s*:\s*\?>([\s\S]*?)(?=<\?php\s+elseif|<\?php\s+else|<\?php\s+endif)/g;
    let match;
    while ((match = elseifRegex.exec(blockHtml)) !== null) {
        const cond = match[1];
        const body = match[2];
        if (evaluatePhpCondition(cond, session, localContext)) {
            return body;
        }
    }

    const elseMatch = blockHtml.match(/<\?php\s+else\s*:\s*\?>([\s\S]*?)<\?php\s+endif/);
    if (elseMatch) {
        return elseMatch[1];
    }

    return '';
}

function compileConditionals(html, session, localContext = {}) {
    const innermostBlockRegex = /<\?php\s+if\s*\(((?:(?!<\?php|<\?>).)*?)\)\s*:\s*\?>((?:(?!<\?php\s+if).)*?)<\?php\s+endif\s*;\s*\?>/gs;

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 15) {
        changed = false;
        html = html.replace(innermostBlockRegex, (match) => {
            changed = true;
            return parseAndEvaluateInnermost(match, session, localContext);
        });
        iterations++;
    }
    return html;
}

function compileLoops(html, session, dbContext) {
    const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
    
    return html.replace(foreachRegex, (match, collectionExpr, itemVar, body) => {
        const collectionName = collectionExpr.trim();
        let items = [];
        if (collectionName === 'ambientes') items = dbContext.ambientes || [];
        else if (collectionName === 'ambientesPag') items = dbContext.ambientes || [];
        else if (collectionName === 'ambientesAtivos') items = (dbContext.ambientes || []).filter(a => a.status === 'Ativo');
        else if (collectionName === 'checklists') items = dbContext.currentChecklists || [];
        else if (collectionName === 'ambsFaltantes') items = (dbContext.inspecaoAtiva && dbContext.inspecaoAtiva.faltantes) || [];
        else if (collectionName === 'ambsVerificados') items = (dbContext.inspecaoAtiva && dbContext.inspecaoAtiva.verificados) || [];
        else if (collectionName === 'historicoInspecoes') items = dbContext.historicoInspecoes || [];
        else if (collectionName === 'executores') items = dbContext.executores || [];
        else if (collectionName === 'ordensServico') items = dbContext.currentOS || [];
        else if (collectionName === 'rankingAmbientes') items = dbContext.rankingAmbientes || [];
        
        if (!items || items.length === 0) return '';
        
        let rendered = '';
        items.forEach((item, idx) => {
            let itemHtml = body;
            let localContext = { idx, item, pesquisa: dbContext.pesquisa };
            
            // Substituições simples de getters e propriedades do item na tabela
            const getterMatches = [
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\\$${itemVar}->getId\\(\\)\\s*;?\\s*\\?>`, 'g'), val: item.id },
                { regex: new RegExp(`<?=\\s*\\\$${itemVar}->getId\\(\\)\\s*\\?>`, 'g'), val: item.id },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\\$${itemVar}->getNomeAmbiente\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.nome_ambiente || '') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+addslashes\\(\\s*\\\$${itemVar}->getNomeAmbiente\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: (item.nome_ambiente || '').replace(/'/g, "\\'") },
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\\$${itemVar}->getStatus\\(\\)\\s*;?\\s*\\?>`, 'g'), val: item.status },
                
                // Checklist
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\\$${itemVar}->getAmbienteNome\\(\\)\\s*(?:\\?\\?\\s*['\"].*?['\"]\\s*)?\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.ambiente_nome || 'Desconhecido') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\\$${itemVar}->getResponsavelNome\\(\\)\\s*(?:\\?\\?\\s*['\"].*?['\"]\\s*)?\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.responsavel_nome || 'N/A') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+date\\(\\s*['\"]d/m/Y['\"]\\s*,\\s*strtotime\\(\\s*\\\$${itemVar}->getDataInspecao\\(\\)\\s*\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: formatDate(item.data_inspecao) },
                
                // OS
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\\$${itemVar}->getExecutorId\\(\\)\\s*;?\\s*\\?>`, 'g'), val: item.executor_atual_id || '' },
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\\$${itemVar}->getSolicitanteId\\(\\)\\s*;?\\s*\\?>`, 'g'), val: item.solicitante_id || '' },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\\$${itemVar}->getSolicitanteNome\\(\\)\\s*(?:\\?\\?\\s*['\"].*?['\"]\\s*)?\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.solicitante_nome || '') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\\$${itemVar}->getExecutorNome\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.executor_nome || 'Não Atribuído') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\\$${itemVar}->getGestorNome\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.gestor_nome || 'Pendente') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+date\\(\\s*['"]d/m/Y H:i['"]\\s*,\\s*strtotime\\(\\s*\\\$${itemVar}->getDataAbertura\\(\\)\\s*(?:\\?\\?\\s*['"].*?['"]\\s*)?\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: formatDate(item.data_abertura, true) },
                { regex: new RegExp(`<\\?php\\s+echo\\s+date\\(\\s*['"]d/m/Y H:i['"]\\s*,\\s*strtotime\\(\\s*\\\$${itemVar}->getDataFechamento\\(\\)\\s*(?:\\?\\?\\s*['"].*?['"]\\s*)?\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: formatDate(item.data_fechamento, true) },
                { regex: new RegExp(`<\\?php\\s+echo\\s+(?:htmlspecialchars\\(\\s*)?\\\$${itemVar}->getDescricaoProblema\\(\\)\\s*(?:\\))?\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.descricao_problema || '') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+(?:htmlspecialchars\\(\\s*)?\\\$${itemVar}->getTipoExecucao\\(\\)\\s*(?:\\))?\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.tipo_execucao || '') },
                
                // Ranking
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\\$idx\\s*\\+\\s*1\\s*;?\\s*\\?>`, 'g'), val: idx + 1 },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\\$item\\['nome'\\]\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.nome || '') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\\$item\\['total'\\]\\s*;?\\s*\\?>`, 'g'), val: item.total || 0 },
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\\$percentual\\s*;?\\s*\\?>`, 'g'), val: (item.total / dbContext.maxOS * 100) || 0 }
            ];
            
            getterMatches.forEach(m => {
                itemHtml = itemHtml.replace(m.regex, m.val);
            });
            
            itemHtml = itemHtml.replace(new RegExp(`\\$${itemVar}->getStatus\\(\\)`, 'g'), `'${item.status}'`);
            itemHtml = itemHtml.replace(new RegExp(`\\$${itemVar}->getId\\(\\)`, 'g'), item.id);
            itemHtml = itemHtml.replace(new RegExp(`\\$${itemVar}->getExecutorId\\(\\)`, 'g'), item.executor_atual_id || 'null');
            itemHtml = itemHtml.replace(new RegExp(`\\$${itemVar}->getSolicitanteId\\(\\)`, 'g'), item.solicitante_id || 'null');
            
            itemHtml = itemHtml.replace(new RegExp(`<\\?php\\s+echo\\s+\\$${itemVar}->getId\\(\\)\\s*;?\\s*\\?>`, 'g'), item.id);
            itemHtml = itemHtml.replace(new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getNomeAmbiente\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), escapeHtml(item.nome_ambiente || ''));
            itemHtml = itemHtml.replace(new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getNome\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), escapeHtml(item.nome || ''));
            
            
            if (collectionName === 'ordensServico') {
                const detailsJson = JSON.stringify({
                    id: item.id,
                    ambiente: item.ambiente_nome,
                    data_abertura: formatDate(item.data_abertura, true),
                    status: item.status,
                    descricao: item.descricao_problema,
                    relato_servico: item.relato_servico
                }).replace(/'/g, "\\'");
                
                itemHtml = itemHtml.replace(/onclick="abrirModalValidacao\(<\?php echo \$os->getId\(\); \?>\)"/g, `onclick='abrirModalTramitacao(${detailsJson})'`);
                itemHtml = itemHtml.replace(/onclick="abrirModalDespacho\(<\?php echo \$os->getId\(\); \?>\)"/g, `onclick='abrirModalTramitacao(${detailsJson})'`);
                itemHtml = itemHtml.replace(/onclick="abrirModalFinalizacao\(<\?php echo \$os->getId\(\); \?>\)"/g, `onclick='abrirModalTramitacao(${detailsJson})'`);
                itemHtml = itemHtml.replace(/visualizarOS\(<\?php echo \$os->getId\(\); \?>\)/g, `abrirModalTramitacao(${detailsJson})`);

                // Fix the TR onclicks
                itemHtml = itemHtml.replace(/\$onClick = 'onclick="abrirModalDespacho\(' \. \$os->getId\(\) \. '\)"';/g, `$onClick = "onclick='abrirModalTramitacao(${detailsJson})'";`);
                itemHtml = itemHtml.replace(/\$onClick = 'onclick="abrirModalFinalizacao\(' \. \$os->getId\(\) \. '\)"';/g, `$onClick = "onclick='abrirModalTramitacao(${detailsJson})'";`);

                // Resolve the $displayStatus PHP block: strip the procedural PHP and replace the echo
                const execNome = item.executor_nome || '';
                const executorValido = (execNome && execNome !== 'Não Atribuído');
                const displayStatus = (item.status === 'Pendente' && executorValido) ? 'Em Execução' : (item.status || 'Pendente');

                // Color map matching the PHP switch
                const colorMap = {
                    'Pendente':               { bg: '#fef08a', txt: '#854d0e', brd: '#fde047' },
                    'Em Execução':            { bg: '#e0f2fe', txt: '#075985', brd: '#bae6fd' },
                    'Aguardando Validação':   { bg: '#ffedd5', txt: '#9a3412', brd: '#fed7aa' },
                    'Concluída':              { bg: '#dcfce7', txt: '#166534', brd: '#bbf7d0' }
                };
                const cores = colorMap[displayStatus] || { bg: '#f3e8ff', txt: '#6b21a8', brd: '#e9d5ff' };

                // Strip the entire procedural PHP block (<?php ... $displayStatus ... switch ... ?>)
                itemHtml = itemHtml.replace(/<\?php\s*\n[\s\S]*?\$displayStatus[\s\S]*?\?>/g, '');
                // Replace color variable echos
                itemHtml = itemHtml.replace(/<\?php\s+echo\s+\$corFundo\s*;\s*\?>/g, cores.bg);
                itemHtml = itemHtml.replace(/<\?php\s+echo\s+\$corTexto\s*;\s*\?>/g, cores.txt);
                itemHtml = itemHtml.replace(/<\?php\s+echo\s+\$corBorda\s*;\s*\?>/g, cores.brd);
                // Replace the display status echo
                itemHtml = itemHtml.replace(/<\?php\s+echo\s+htmlspecialchars\(\s*\$displayStatus\s*\)\s*;?\s*\?>/g, escapeHtml(displayStatus));
            }

            // Tratamento especial para detalhes em preventivas.php (conversão de objeto para JSON)
            if (collectionName === 'checklists') {
                const detailsJson = JSON.stringify({
                    id: item.id,
                    ambiente_nome: item.ambiente_nome,
                    responsavel_nome: item.responsavel_nome,
                    data_inspecao: formatDate(item.data_inspecao),
                    status_tomadas: item.status_tomadas,
                    status_forros: item.status_forros,
                    status_paredes: item.status_paredes,
                    status_projetor: item.status_projetor,
                    status_tela: item.status_tela,
                    status_lousa: item.status_lousa,
                    observacoes: item.observacoes || ''
                });
                itemHtml = itemHtml.replace(new RegExp(`onclick="visualizarDetalhes\\(.*?\\)"`, 's'), `onclick="visualizarDetalhes(${escapeHtmlAttr(detailsJson)})"`);
            }
            
            // Compila blocos condicionais dentro do item do loop
            for (let i = 0; i < 3; i++) {
                itemHtml = compileConditionals(itemHtml, session, { ...localContext, status: item.status, item: item });
            }
            
            rendered += itemHtml;
        });
        
        return rendered;
    });
}

function compileVariables(html, context) {
    if (context.executores) {
        const rawExecutoresRegex = /<\?php\s+if\s*\(empty\(\$executores\)\)[\s\S]*?json_encode\([\s\S]*?\?>/gs;
        const jsonStr = JSON.stringify(context.executores.map(e => ({ id: e.id, nome: e.nome }))).replace(/'/g, "\\'");
        html = html.replace(rawExecutoresRegex, jsonStr);
    }

    const echos = [
        { regex: /<\?=\s*isset\(\$_SESSION\['usuario_id'\]\).*?:\s*['\"]?null['\"]?\s*\?>/g, val: context.usuarioId || '1' },
        { regex: /<\?php\s+echo\s+\$_SESSION\['usuario_id'\]\s*\?\?\s*['\"]?null['\"]?\s*;?\s*\?>/g, val: context.usuarioId || '1' },
        { regex: /<\?php\s+echo\s+\$_SESSION\['usuario_nivel'\]\s*\?\?\s*['\"].*?['\"]\s*;?\s*\?>/g, val: context.usuarioNivel || 'Gestor' },
        { regex: /<\?php\s+echo\s+\$usuarioNivel\s*;?\s*\?>/g, val: context.usuarioNivel || 'Gestor' },
        { regex: /<\?=\s*\$_SESSION\['usuario_nivel'\]\s*\?\?\s*['\"].*?['\"]\s*\?>/g, val: context.usuarioNivel || 'Gestor' },
        { regex: /<\?php\s+echo\s+\$_SESSION\['usuario_id'\]\s*;?\s*\?>/g, val: context.usuarioId || '1' },
        { regex: /<\?php\s+echo\s+\$_SESSION\['usuario_nivel'\]\s*;?\s*\?>/g, val: context.usuarioNivel || 'Gestor' },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$usuarioNome\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.usuarioNome) },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$usuarioNivel\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.usuarioNivel) },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$usuarioEmail\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.usuarioEmail) },
        { regex: /<\?php\s+echo\s+\$dataAtual\s*;?\s*\?>/g, val: context.dataAtual },
        { regex: /<\?php\s+echo\s+\$totalAmbientes\s*;?\s*\?>/g, val: context.totalAmbientes },
        { regex: /<\?php\s+echo\s+\$totalAtivos\s*;?\s*\?>/g, val: context.totalAtivos },
        { regex: /<\?php\s+echo\s+\$totalInativos\s*;?\s*\?>/g, val: context.totalInativos },
        { regex: /<\?php\s+echo\s+\$totalChecklists\s*;?\s*\?>/g, val: context.totalChecklists },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$alertaSucesso\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.alertaSucesso) },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$alertaErro\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.alertaErro) },
        { regex: /<\?php\s+echo\s+htmlspecialchars\(\s*\$erro\s*\)\s*;?\s*\?>/g, val: escapeHtml(context.erro) },
        { regex: /<\?php\s+echo\s+BASE_URL\s*;?\s*\?>/g, val: '' },
        { regex: /BASE_URL\s*\.\s*['\"](.*?)['\"]/g, val: `'$1'` }
    ];
    
    echos.forEach(e => {
        html = html.replace(e.regex, e.val);
    });
    
    // Tratamento de variáveis estatísticas do Gestor (dashboard_analise.php)
    if (context.dashboard_analise) {
        const da = context.dashboard_analise;
        html = html.replace(/<\?php\s+echo\s+\$totalAbertas\s*;?\s*\?>/g, da.totalAbertas);
        html = html.replace(/<\?php\s+echo\s+\$totalPendentes\s*;?\s*\?>/g, da.totalPendentes);
        html = html.replace(/<\?php\s+echo\s+\$totalPreventivasMes\s*;?\s*\?>/g, da.totalPreventivasMes);
        
        html = html.replace(/<\?php\s+echo\s+json_encode\(\s*\$labelsMeses\s*\)\s*;?\s*\?>/g, JSON.stringify(da.labelsMeses));
        html = html.replace(/<\?php\s+echo\s+json_encode\(\s*\$dataPreventivas\s*\)\s*;?\s*\?>/g, JSON.stringify(da.dataPreventivas));
        html = html.replace(/<\?php\s+echo\s+json_encode\(\s*\$dataCorretivas\s*\)\s*;?\s*\?>/g, JSON.stringify(da.dataCorretivas));
        html = html.replace(/<\?php\s+echo\s+\$totalInterna\s*;?\s*\?>/g, da.totalInterna);
        html = html.replace(/<\?php\s+echo\s+\$totalTerceirizada\s*;?\s*\?>/g, da.totalTerceirizada);
        
        html = html.replace(/<\?php\s+echo\s+json_encode\(\s*array_column\(\s*\$rankingAmbientes\s*,\s*['\"]nome['\"]\s*\)\s*\)\s*;?\s*\?>/g, JSON.stringify(da.rankingAmbientes.map(r => r.nome)));
        html = html.replace(/<\?php\s+echo\s+json_encode\(\s*array_column\(\s*\$rankingAmbientes\s*,\s*['\"]total['\"]\s*\)\s*\)\s*;?\s*\?>/g, JSON.stringify(da.rankingAmbientes.map(r => r.total)));
    }

    // Limpa tags residuais do PHP
    html = html.replace(/<\?php\s+echo\s+.*?\s*;?\s*\?>/g, '');
    html = html.replace(/<\?=\s*.*?\s*\?>/g, '');
    html = html.replace(/<\?php.*?\?>/gs, '');

    return html;
}

function compilePhp(filePath, session, getParams = {}) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove tags de inicialização PHP até a marcação inicial do HTML para isolar o design
    const doctypeIndex = content.toLowerCase().indexOf('<!doctype');
    let html = doctypeIndex !== -1 ? content.slice(doctypeIndex) : content;

    const db = initDatabase();
    const ambientes = db.ambientes || [];
    const activeAmbientes = ambientes.filter(a => a.status === 'Ativo');
    const checklists = db.checklists || [];
    const ordensServico = db.ordens_servico || [];
    const usuarios = db.usuarios || [];
    const executores = usuarios.filter(u => u.nivel_acesso === 'Executor');

    const totalAmbientes = ambientes.length;
    const totalAtivos = activeAmbientes.length;
    const totalInativos = totalAmbientes - totalAtivos;
    const totalChecklists = checklists.length;

    const now = new Date();
    const dataAtual = now.toLocaleDateString('pt-BR');

    // Filtros de pesquisa em ambientes
    let filteredAmbientes = [...ambientes];
    const pesquisa = (getParams.search || '').trim();
    if (pesquisa) {
        filteredAmbientes = filteredAmbientes.filter(a => a.nome_ambiente.toLowerCase().includes(pesquisa.toLowerCase()));
    }
    // Ordena os ambientes por ID em ordem crescente
    filteredAmbientes.sort((a, b) => a.id - b.id);

    const context = {
        usuarioNome: session.usuario_nome || 'Usuário',
        usuarioNivel: session.usuario_nivel || 'Solicitante',
        usuarioEmail: session.usuario_email || '',
        usuarioId: session.usuario_id || 0,
        totalAmbientes,
        totalAtivos,
        totalInativos,
        totalChecklists,
        dataAtual,
        alertaSucesso: session.alerta_sucesso || '',
        alertaErro: session.alerta_erro || '',
        erro: session.erro || '',
        BASE_URL: ''
    };

    // Limpa alertas após o consumo de render
    session.alerta_sucesso = '';
    session.alerta_erro = '';
    session.erro = '';

    // Hidratação e preparação de dados específicos por view
    let currentChecklists = [];
    let currentOS = [];
    let rankingAmbientes = [];
    let maxOS = 1;
    let dashboard_analise = null;

    if (filePath.endsWith('preventivas.php')) {
        const dbInspecoes = db.inspecoes_mensais || [];
        const inspecaoAtiva = dbInspecoes.find(i => i.status === 'Em Andamento');
        
        let ctxInspecao = null;
        if (inspecaoAtiva) {
            const checks = checklists.filter(c => c.inspecao_mensal_id === inspecaoAtiva.id);
            const checkIds = checks.map(c => c.ambiente_id);
            const ambsAtivos = ambientes.filter(a => a.status === 'Ativo');
            
            ctxInspecao = {
                ...inspecaoAtiva,
                progresso: checkIds.length,
                total: ambsAtivos.length,
                faltantes: ambsAtivos.filter(a => !checkIds.includes(a.id)),
                verificados: ambsAtivos.filter(a => checkIds.includes(a.id)).map(a => {
                    return { ...a, checklist: checks.find(c => c.ambiente_id === a.id) }
                })
            };
        }
        
        const historico = dbInspecoes.filter(i => i.status === 'Finalizada').sort((a,b) => b.id - a.id);
        
        // Armazenar no contexto global para injeção via regex (substituiremos a injeção na renderização)
        context.inspecaoAtiva = ctxInspecao;
        context.historicoInspecoes = historico;
    }

    if (filePath.endsWith('corretivas.php')) {
        currentOS = ordensServico.map(os => {
            const amb = ambientes.find(a => a.id === os.ambiente_id) || {};
            const sol = usuarios.find(u => u.id === os.solicitante_id) || {};
            const gest = usuarios.find(u => u.id === os.gestor_id) || {};
            const exec = usuarios.find(u => u.id === os.executor_atual_id) || {};
            return {
                ...os,
                ambiente_nome: amb.nome_ambiente || 'Desconhecido',
                solicitante_nome: sol.nome || 'Desconhecido',
                gestor_nome: gest.nome || 'Pendente',
                executor_nome: exec.nome || 'Não Atribuído'
            };
        });

        if (session.usuario_nivel === 'Solicitante') {
            currentOS = currentOS.filter(os => os.solicitante_id === session.usuario_id);
        } else if (session.usuario_nivel === 'Executor') {
            currentOS = currentOS.filter(os => os.executor_atual_id === session.usuario_id || os.solicitante_id === session.usuario_id);
        }
        currentOS.sort((a, b) => b.id - a.id);
    }

    if (filePath.endsWith('dashboard_analise.php')) {
        // Métricas rápidas superior
        const totalAbertas = ordensServico.filter(os => ["Pendente", "Em Execução", "Aguardando Validação"].includes(os.status)).length;
        const totalPendentes = ordensServico.filter(os => os.status === "Pendente").length;
        
        const curMonth = now.getMonth() + 1;
        const curYear = now.getFullYear();
        const totalPreventivasMes = checklists.filter(c => {
            const d = new Date(c.data_inspecao);
            return (d.getMonth() + 1) === curMonth && d.getFullYear() === curYear;
        }).length;

        // Histórico dos últimos 6 meses
        const mesesNomesPt = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const labelsMeses = [];
        const dataPreventivas = [];
        const dataCorretivas = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            labelsMeses.push(`${mesesNomesPt[d.getMonth()]}/${String(d.getFullYear()).substring(2)}`);
            
            const prevsCount = checklists.filter(c => c.data_inspecao.startsWith(ym)).length;
            const corrsCount = ordensServico.filter(os => os.data_abertura.startsWith(ym)).length;
            
            dataPreventivas.push(prevsCount);
            dataCorretivas.push(corrsCount);
        }

        const totalInterna = ordensServico.filter(os => os.tipo_execucao === "Interna").length;
        const totalTerceirizada = ordensServico.filter(os => os.tipo_execucao === "Terceirizada").length;

        // Ranking de Ambientes Críticos
        const counts = {};
        ordensServico.forEach(os => {
            counts[os.ambiente_id] = (counts[os.ambiente_id] || 0) + 1;
        });

        rankingAmbientes = Object.keys(counts).map(aid => {
            const amb = ambientes.find(a => a.id == aid) || {};
            return {
                nome: amb.nome_ambiente || `Ambiente #${aid}`,
                total: counts[aid]
            };
        });
        
        rankingAmbientes.sort((a, b) => b.total - a.total);
        rankingAmbientes = rankingAmbientes.slice(0, 5);
        
        maxOS = rankingAmbientes.length > 0 ? Math.max(...rankingAmbientes.map(r => r.total)) : 1;

        dashboard_analise = {
            totalAbertas,
            totalPendentes,
            totalPreventivasMes,
            labelsMeses,
            dataPreventivas,
            dataCorretivas,
            totalInterna,
            totalTerceirizada,
            rankingAmbientes
        };
    }

    const dbContext = {
        ambientes: filteredAmbientes,
        currentChecklists,
        currentOS,
        executores,
        rankingAmbientes,
        maxOS,
        pesquisa,
        dashboard_analise
    };

    // Compilação em cascata (Loops -> Condicionais em múltiplas rodadas para resolver aninhamento -> Variáveis)
    html = compileLoops(html, session, dbContext);
    html = compileConditionals(html, session, dbContext);
    html = compileVariables(html, { ...context, dashboard_analise, executores: dbContext.executores });

    // ── Gerador Direto da Tabela de Ambientes ──────────────────────────────
    if (filePath.endsWith('ambientes.php')) {
        const POR_PAG     = 20;
        const pageParam   = parseInt(getParams.page) || 1;
        const totalItems  = filteredAmbientes.length;
        const totalPags   = Math.max(1, Math.ceil(totalItems / POR_PAG));
        const paginaAtual = Math.max(1, Math.min(totalPags, pageParam));
        const pageItems   = filteredAmbientes.slice((paginaAtual - 1) * POR_PAG, paginaAtual * POR_PAG);
        const BTN_STYLE   = 'width:36px;height:36px;border:none;border-radius:6px;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;';

        // ── 1. Tbody ─────────────────────────────────────────────────
        const tbodyStart = html.indexOf('<tbody id="tabela-ambientes"');
        const tbodyEnd   = html.indexOf('</tbody>', tbodyStart);
        if (tbodyStart !== -1 && tbodyEnd !== -1) {
            let rowsHtml = '';
            if (pageItems.length === 0) {
                rowsHtml = `<tr id="linha-vazia" style="display:table-row;"><td colspan="4" style="display:table-cell;padding:40px;text-align:center;color:#888;font-size:.95rem;">Nenhum ambiente cadastrado.</td></tr>`;
            } else {
                pageItems.forEach(amb => {
                    const isAtivo    = amb.status === 'Ativo';
                    const badge      = isAtivo
                        ? `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(40,167,69,.12);color:#28a745;border:1px solid #28a745;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-check2"></i> Ativo</span>`
                        : `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(108,117,125,.12);color:#6c757d;border:1px solid #6c757d;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-slash-circle"></i> Inativo</span>`;
                    const safeName   = escapeHtml(amb.nome_ambiente || '');
                    const safeNameJs = (amb.nome_ambiente || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    const tog        = isAtivo ? 'inativar' : 'ativar';
                    const tip        = isAtivo ? 'Inativar' : 'Ativar';
                    rowsHtml += `
                        <tr id="row-${amb.id}" style="display:table-row;border-bottom:1px solid #e8edf3;transition:background .15s;">
                            <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">${amb.id}</td>
                            <td style="display:table-cell;padding:13px 20px;text-align:left;vertical-align:middle;font-weight:700;text-transform:uppercase;">${safeName}</td>
                            <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">${badge}</td>
                            <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">
                                <div style="display:inline-flex;gap:5px;align-items:center;">
                                    <button type="button" style="${BTN_STYLE}background:#00c5ff;" title="Editar" onclick="abrirModalEdicao(${amb.id},'${safeNameJs}','${amb.status}')"><i class="bi bi-pencil-square"></i></button>
                                    <button type="button" style="${BTN_STYLE}background:#ff2323;" title="Excluir" onclick="abrirModalExclusao(${amb.id},'${safeNameJs}')"><i class="bi bi-trash"></i></button>
                                    <a href="corretivas.php?ambiente_id=${amb.id}" style="${BTN_STYLE}background:#6f42c1;text-decoration:none;" title="Ordem de Serviço"><i class="bi bi-tools"></i></a>
                                </div>
                            </td>
                        </tr>`;
                });
            }
            // Garante o atributo style na tag tbody também
            const tbodyOpenEnd = html.indexOf('>', tbodyStart) + 1;
            html = html.slice(0, tbodyStart)
                + `<tbody id="tabela-ambientes" style="display:table-row-group;">${rowsHtml}</tbody>`
                + html.slice(tbodyEnd + '</tbody>'.length);
        }

        // ── 2. Totalizador e Paginação ───────────────────────────────────────────
        html = html.replace(
            /\(<span id="totalVisiveis">\d+<\/span>\) de \d+ ambientes/,
            `(<span id="totalVisiveis">${pageItems.length}</span>) de ${totalItems} ambientes`
        );
        html = html.replace(
            /<small id="contadorAmbientes"[^>]*>\(\d+ registros\)<\/small>/,
            `<small id="contadorAmbientes" style="font-size:.75rem;font-weight:500;color:var(--corTxt2);margin-left:6px;">(${totalItems} registros)</small>`
        );

        let pagHTML = '';
        if (totalPags > 1) {
            const qs = pesquisa ? `&search=${encodeURIComponent(pesquisa)}` : '';
            pagHTML += '<div style="display:flex;gap:5px;">';
            if (paginaAtual > 1) {
                pagHTML += `<a href="?page=${paginaAtual - 1}${qs}" style="padding:6px 12px;border:1px solid var(--corBordas);border-radius:4px;color:var(--corTxt3);text-decoration:none;">&laquo; Ant</a>`;
            }
            pagHTML += `<span style="padding:6px 12px;background:var(--corBase);color:#fff;border-radius:4px;">${paginaAtual} de ${totalPags}</span>`;
            if (paginaAtual < totalPags) {
                pagHTML += `<a href="?page=${paginaAtual + 1}${qs}" style="padding:6px 12px;border:1px solid var(--corBordas);border-radius:4px;color:var(--corTxt3);text-decoration:none;">Próx &raquo;</a>`;
            }
            pagHTML += '</div>';
        }
        html = html.replace('<!-- INJETAR_PAGINACAO -->', pagHTML);

        require('fs').writeFileSync('debug_ambientes_final.html', html);
    }
    // ──────────────────────────────────────────────────────────────────────

    // INJEÇÃO ESPECÍFICA PARA A TELA DE PREVENTIVAS
    if (filePath.endsWith('preventivas.php')) {
        let prevHTML = '';
        const inspecao = context.inspecaoAtiva;
        if (!inspecao) {
            prevHTML = `
                <div style="background:var(--corFundo);padding:30px;border-radius:12px;text-align:center;border:1px solid var(--corBordas);margin-bottom:30px;">
                    <i class="bi bi-calendar-check" style="font-size:3rem;color:var(--corBase);margin-bottom:15px;display:block;"></i>
                    <h3 style="color:var(--corTxt3);margin-bottom:10px;">Nenhuma Inspeção Mensal em Andamento</h3>
                    <p style="color:var(--corTxt2);margin-bottom:20px;">Inicie um novo ciclo de inspeção para vistoriar todos os ambientes deste mês.</p>
                    <button onclick="iniciarInspecaoMensal()" style="background:#fc2323;color:#fff;border:none;border-radius:8px;padding:12px 25px;font-weight:bold;cursor:pointer;font-size:1rem;transition:0.2s;">
                        <i class="bi bi-play-circle"></i> Iniciar Inspeção Mensal
                    </button>
                </div>
            `;
        } else {
            const percent = (inspecao.progresso / inspecao.total * 100) || 0;
            const btnFinalizar = inspecao.progresso === inspecao.total 
                ? `<button id="btnFinalizarMensal" onclick="finalizarInspecao(${inspecao.id})" style="background:#28a745;color:#fff;border:none;border-radius:8px;padding:12px 25px;font-weight:bold;cursor:pointer;transition:0.2s;"><i class="bi bi-check-circle"></i> Finalizar Inspeção Mensal</button>`
                : `<button id="btnFinalizarMensal" disabled style="background:#ccc;color:#fff;border:none;border-radius:8px;padding:12px 25px;font-weight:bold;cursor:not-allowed;"><i class="bi bi-lock"></i> Finalizar Inspeção Mensal</button>`;
            
            // Unir todos os ambientes para a tabela
            const todosAmbs = [...inspecao.faltantes.map(a => ({...a, verificado: false})), ...inspecao.verificados.map(a => ({...a, verificado: true}))];
            todosAmbs.sort((a,b) => a.nome_ambiente.localeCompare(b.nome_ambiente));

            prevHTML = `
                <div style="background:var(--corFundo);padding:20px;border-radius:12px;border:1px solid var(--corBordas);margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">
                    <div>
                        <h3 style="color:var(--corTxt3);margin-bottom:5px;">Progresso da Inspeção Atual</h3>
                        <p style="color:var(--corTxt2);font-size:14px;">Iniciada em ${formatDate(inspecao.data_inicio)}</p>
                    </div>
                    <div style="flex-grow:1;max-width:400px;min-width:200px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px;color:var(--corTxt2);font-weight:bold;">
                            <span>${inspecao.progresso}/${inspecao.total} Ambientes</span>
                            <span>${Math.round(percent)}%</span>
                        </div>
                        <div style="width:100%;background:var(--corBordas);height:10px;border-radius:5px;overflow:hidden;">
                            <div style="width:${percent}%;background:#00c5ff;height:100%;transition:width 0.5s;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="tabela-bg2" style="margin-bottom:30px;">
                    <div class="tabela-wrapper" style="overflow-x: auto; background: var(--corFundo); border-radius: 12px; border: 1px solid var(--corBorda);">
                        <table class="tabela-main" style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid var(--corBorda); background: rgba(0,0,0,0.02);">
                                    <th style="padding: 15px;">Ambiente</th>
                                    <th style="padding: 15px; text-align: center;">Status</th>
                                    <th style="padding: 15px; text-align: right;">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${todosAmbs.map(a => `
                                    <tr style="border-bottom: 1px solid var(--corBorda);">
                                        <td style="padding: 15px; font-weight: 500; color: var(--corTxt3);">${escapeHtml(a.nome_ambiente)}</td>
                                        <td style="padding: 15px; text-align: center;">
                                            ${a.verificado 
                                                ? `<span style="background:rgba(40,167,69,0.1); color:#28a745; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold;"><i class="bi bi-check-circle-fill"></i> Inspecionado</span>`
                                                : `<span style="background:rgba(108,117,125,0.1); color:#6c757d; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold;">Pendente</span>`
                                            }
                                        </td>
                                        <td style="padding: 15px; text-align: right;">
                                            ${a.verificado
                                                ? `<button disabled style="background:#e9ecef; color:#adb5bd; border:none; border-radius:6px; padding:8px 12px; font-weight:bold; cursor:not-allowed;"><i class="bi bi-clipboard-check"></i> Inspecionar</button>`
                                                : `<button onclick="abrirModalChecklistRapido(${inspecao.id}, ${a.id}, '${escapeHtml(a.nome_ambiente).replace(/'/g, "\\'")}')" style="background:#00c5ff;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-weight:bold;"><i class="bi bi-clipboard-check"></i> Inspecionar</button>`
                                            }
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div style="padding:20px; border-top:1px solid var(--corBorda); display:flex; justify-content:flex-end; background:rgba(0,0,0,0.01);">
                            ${btnFinalizar}
                        </div>
                    </div>
                </div>
            `;
        }
        html = html.replace('<!-- INJETAR_INSPECAO_ATIVA -->', prevHTML);
    }

    return html;
}

// =========================================================================

// 4. CRIAÇÃO E CONFIGURAÇÃO DO SERVIDOR HTTP NODE.JS
// =========================================================================
const server = http.createServer((req, res) => {
    // Processamento de Cookies de Sessão
    const cookies = querystring.parse(req.headers.cookie, '; ');
    let sessionId = cookies.MOCK_SESSION_ID || cookies[' MOCK_SESSION_ID'];
    
    if (!sessionId || !SESSIONS[sessionId]) {
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        // Auto-login como Gestor para facilitar testes locais e evitar perda de sessão após reiniciar o servidor
        SESSIONS[sessionId] = {
            usuario_id: 1,
            usuario_nome: 'Admin Mock',
            usuario_email: 'gestor@senai.br',
            usuario_nivel: 'Gestor',
            alerta_sucesso: '',
            alerta_erro: '',
            erro: ''
        };
    }
    
    const session = SESSIONS[sessionId];
    const setSessionCookie = `MOCK_SESSION_ID=${sessionId}; Path=/; HttpOnly`;

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

    // Intercepta bootstrap-icons.min.css e redireciona para a CDN oficial (resolve 404 e carrega fontes .woff/.woff2 de forma nativa e rápida)
    if (pathname.includes('bootstrap-icons.min.css')) {
        res.writeHead(302, { 'Location': 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css' });
        res.end();
        return;
    }

    // Intercepta requisições de favicon.ico ausentes e silencia com um 200 vazio
    if (pathname.endsWith('favicon.ico')) {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end();
        return;
    }

    // 1. Roteamento de Recursos Estáticos (Style, JS, Imagens, Fontes)
    if (pathname.includes('/assets/')) {
        let relativePath = pathname.substring(pathname.indexOf('/assets/'));
        // Corrige discrepâncias onde scripts.js busca por '/assets/imgs/' (plural) mas a pasta física é '/assets/img/' (singular)
        relativePath = relativePath.replace('/assets/imgs/', '/assets/img/');
        
        const filePath = path.join(__dirname, 'public', relativePath);
        
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'text/plain';
            if (ext === '.css') contentType = 'text/css';
            else if (ext === '.js') contentType = 'application/javascript';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.ico') contentType = 'image/x-icon';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.woff' || ext === '.woff2') contentType = 'font/woff2';

            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000'
            });
            fs.createReadStream(filePath).pipe(res);
            return;
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Recurso estático não localizado.');
            return;
        }
    }

    // Auxiliar utilitário de resposta JSON
    function respondJson(success, message, data = null) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Set-Cookie': setSessionCookie
        });
        res.end(JSON.stringify({ success, message, data }));
    }

    // Auxiliar utilitário de Redirecionamento (302)
    function redirect(url) {
        res.writeHead(302, {
            'Location': url,
            'Set-Cookie': setSessionCookie
        });
        res.end();
    }

    // 2. Roteamento de Logout global
    if (queryParams.logout) {
        session.usuario_id = null;
        session.usuario_nome = '';
        session.usuario_email = '';
        session.usuario_nivel = '';
        redirect('/public/index.php');
        return;
    }

    // 3. Processamento de Requisições POST (Envio de Formulários e Chamados Fetch)
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const postParams = querystring.parse(body);
            const isAjax = postParams.ajax === '1' || req.headers['x-requested-with'] === 'XMLHttpRequest';

            // Bloqueio literal contra a palavra "VAZIO" (case-insensitive) em qualquer parâmetro
            if (containsVazio(postParams)) {
                return respondJson(false, "Erro: O preenchimento de campos textuais não pode ser a palavra 'VAZIO'.");
            }

            const db = initDatabase();

            // AÇÃO: Acesso / Login
            if (pathname === '/' || pathname === '/public' || pathname === '/public/' || pathname === '/public/index.php') {
                const email = (postParams.email || '').trim();
                const senha = (postParams.senha || '').trim();
                
                const user = db.usuarios.find(u => u.email === email && u.senha === senha);
                if (user) {
                    session.usuario_id = user.id;
                    session.usuario_nome = user.nome;
                    session.usuario_email = user.email;
                    session.usuario_nivel = user.nivel_acesso;
                    redirect('/public/views/home.php');
                } else {
                    session.erro = "E-mail ou senha incorretos.";
                    redirect('/public/index.php');
                }
                return;
            }

            // Bloqueia acessos sem sessão ativa para rotas internas
            if (!session.usuario_id) {
                return respondJson(false, "Sessão expirada ou não autenticada.");
            }

            // VIEW: Perfil - Alteração de Senha
            if (pathname.includes('/public/views/perfil.php')) {
                const acao = postParams.acao;
                if (acao === 'alterar_senha') {
                    const atual = postParams.senha_atual || '';
                    const nova = postParams.nova_senha || '';
                    const confirmacao = postParams.confirmar_senha || '';

                    const userIndex = db.usuarios.findIndex(u => u.id === session.usuario_id);
                    if (userIndex === -1) {
                        return respondJson(false, "Usuário não localizado.");
                    }

                    if (db.usuarios[userIndex].senha !== atual) {
                        return respondJson(false, "A senha atual está incorreta.");
                    }

                    if (nova.length < 6) {
                        return respondJson(false, "A nova senha deve possuir no mínimo 6 caracteres.");
                    }

                    if (nova !== confirmacao) {
                        return respondJson(false, "A confirmação de senha não coincide.");
                    }

                    db.usuarios[userIndex].senha = nova;
                    saveDatabase(db);
                    return respondJson(true, "Senha alterada com sucesso!");
                }
            }

            // VIEW: Ambientes - Gestão CRUD
            if (pathname.includes('/public/views/ambientes.php')) {
                if (session.usuario_nivel !== 'Gestor') {
                    return respondJson(false, "Acesso restrito apenas para Gestores.");
                }

                const acao = postParams.acao;
                
                if (acao === 'cadastrar') {
                    const id = parseInt(postParams.id);
                    const nome = (postParams.nome_ambiente || '').trim();
                    const status = postParams.status || 'Ativo';

                    if (isNaN(id) || id <= 0) return respondJson(false, "Código (ID) é obrigatório e deve ser um número inteiro positivo.");
                    if (!nome) return respondJson(false, "Nome do ambiente é obrigatório.");
                    
                    if (db.ambientes.some(a => a.id === id)) {
                        return respondJson(false, `Erro: Já existe um ambiente cadastrado com o código ${id}.`);
                    }
                    if (db.ambientes.some(a => a.nome_ambiente.toLowerCase() === nome.toLowerCase())) {
                        return respondJson(false, `Erro: Já existe um ambiente cadastrado com o nome '${nome}'.`);
                    }

                    const newAmb = {
                        id: id,
                        nome_ambiente: nome,
                        status: status
                    };

                    db.ambientes.push(newAmb);
                    saveDatabase(db);
                    return respondJson(true, `Ambiente '${nome}' cadastrado com sucesso!`, newAmb);
                }

                if (acao === 'editar') {
                    const id = parseInt(postParams.id);
                    const nome = (postParams.nome_ambiente || '').trim();
                    const status = postParams.status || 'Ativo';

                    const idx = db.ambientes.findIndex(a => a.id === id);
                    if (idx === -1) return respondJson(false, "Ambiente não localizado.");

                    if (db.ambientes.some(a => a.id !== id && a.nome_ambiente.toLowerCase() === nome.toLowerCase())) {
                        return respondJson(false, `Erro: Já existe outro ambiente cadastrado com o nome '${nome}'.`);
                    }

                    db.ambientes[idx].nome_ambiente = nome;
                    db.ambientes[idx].status = status;
                    saveDatabase(db);
                    return respondJson(true, "Ambiente atualizado com sucesso!", db.ambientes[idx]);
                }

                if (acao === 'ativar' || acao === 'inativar') {
                    const id = parseInt(postParams.id);
                    const newStatus = acao === 'ativar' ? 'Ativo' : 'Inativo';

                    const idx = db.ambientes.findIndex(a => a.id === id);
                    if (idx === -1) return respondJson(false, "Ambiente não localizado.");

                    db.ambientes[idx].status = newStatus;
                    saveDatabase(db);
                    return respondJson(true, `Ambiente '${db.ambientes[idx].nome_ambiente}' ${acao === 'ativar' ? 'ativado' : 'inativado'} com sucesso!`, db.ambientes[idx]);
                }

                if (acao === 'excluir') {
                    const id = parseInt(postParams.id);
                    const idx = db.ambientes.findIndex(a => a.id === id);
                    if (idx === -1) return respondJson(false, "Ambiente não localizado.");

                    const nome = db.ambientes[idx].nome_ambiente;
                    // Exclusão física CASCADE: Deleta ambiente, OSs e checklists associados
                    db.ambientes.splice(idx, 1);
                    db.checklists = db.checklists.filter(c => c.ambiente_id !== id);
                    db.ordens_servico = db.ordens_servico.filter(o => o.ambiente_id !== id);
                    
                    saveDatabase(db);
                    return respondJson(true, `Ambiente '${nome}' e todo seu histórico excluídos permanentemente!`, { id });
                }
            }

            // VIEW: Preventivas (Checklist Mensal Global)
            if (pathname.includes('/public/views/preventivas.php')) {
                const acao = postParams.acao;

                if (acao === 'iniciar_inspecao') {
                    if (session.usuario_nivel === 'Solicitante') return respondJson(false, "Acesso negado.");
                    const ativa = (db.inspecoes_mensais || []).find(i => i.status === 'Em Andamento');
                    if (ativa) return respondJson(false, "Já existe uma inspeção em andamento.");
                    
                    if (!db.inspecoes_mensais) db.inspecoes_mensais = [];
                    const nova = {
                        id: db.inspecoes_mensais.length > 0 ? Math.max(...db.inspecoes_mensais.map(i=>i.id)) + 1 : 1,
                        data_inicio: new Date().toISOString().substring(0, 10),
                        data_fim: null,
                        status: 'Em Andamento',
                        responsavel_id: session.usuario_id
                    };
                    db.inspecoes_mensais.push(nova);
                    saveDatabase(db);
                    return respondJson(true, "Inspeção Mensal iniciada com sucesso!");
                }

                if (acao === 'salvar_checklist') {
                    const inspecaoId = parseInt(postParams.inspecao_id);
                    const ambId = parseInt(postParams.ambiente_id);
                    const obs = (postParams.observacoes || '').trim();

                    if (!inspecaoId || !ambId) return respondJson(false, "Dados inválidos.");
                    
                    const inspecao = (db.inspecoes_mensais || []).find(i => i.id === inspecaoId && i.status === 'Em Andamento');
                    if (!inspecao) return respondJson(false, "Inspeção não encontrada ou já finalizada.");

                    const checks = db.checklists || [];
                    const existente = checks.find(c => c.inspecao_mensal_id === inspecaoId && c.ambiente_id === ambId);
                    if (existente) return respondJson(false, "Este ambiente já foi inspecionado nesta rodada.");

                    const newChecklist = {
                        id: checks.length > 0 ? Math.max(...checks.map(c => c.id)) + 1 : 1,
                        inspecao_mensal_id: inspecaoId,
                        ambiente_id: ambId,
                        responsavel_id: session.usuario_id,
                        data_inspecao: new Date().toISOString().substring(0, 10),
                        status_tomadas: postParams.status_tomadas || 'Não se aplica',
                        status_forros: postParams.status_forros || 'Não se aplica',
                        status_paredes: postParams.status_paredes || 'Não se aplica',
                        status_projetor: postParams.status_projetor || 'Não se aplica',
                        status_tela: postParams.status_tela || 'Não se aplica',
                        status_lousa: postParams.status_lousa || 'Não se aplica',
                        observacoes: obs || null,
                        data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    };
                    db.checklists.push(newChecklist);
                    
                    // AUTOMAÇÃO DE OS CORRETIVA
                    const defeitos = [];
                    if (newChecklist.status_tomadas === 'Defeito') defeitos.push('Tomadas');
                    if (newChecklist.status_forros === 'Defeito') defeitos.push('Forros');
                    if (newChecklist.status_paredes === 'Defeito') defeitos.push('Paredes');
                    if (newChecklist.status_projetor === 'Defeito') defeitos.push('Projetor');
                    if (newChecklist.status_tela === 'Defeito') defeitos.push('Tela');
                    if (newChecklist.status_lousa === 'Defeito') defeitos.push('Lousa');

                    let osAutomaticaMsg = '';
                    if (defeitos.length > 0) {
                        const newOS = {
                            id: db.ordens_servico.length > 0 ? Math.max(...db.ordens_servico.map(o => o.id)) + 1 : 1,
                            ambiente_id: ambId,
                            solicitante_id: session.usuario_id,
                            descricao_problema: `[AUTOMAÇÃO PREVENTIVA] Defeitos detectados na inspeção mensal: ${defeitos.join(', ')}. Observações do checklist: ${obs || 'Nenhuma'}`,
                            data_abertura: newChecklist.data_criacao,
                            status: 'Pendente',
                            prioridade: 'Alta',
                            gestor_id: null,
                            executor_atual_id: null,
                            relato_servico: null,
                            data_conclusao: null
                        };
                        db.ordens_servico.push(newOS);
                        osAutomaticaMsg = ` Uma OS Corretiva (Alta Prioridade) foi aberta automaticamente devido aos defeitos detectados.`;
                    }

                    saveDatabase(db);
                    return respondJson(true, "Checklist salvo com sucesso!" + osAutomaticaMsg);
                }

                if (acao === 'finalizar_inspecao') {
                    const inspecaoId = parseInt(postParams.inspecao_id);
                    const inspecao = (db.inspecoes_mensais || []).find(i => i.id === inspecaoId && i.status === 'Em Andamento');
                    if (!inspecao) return respondJson(false, "Inspeção não encontrada.");

                    const checks = db.checklists.filter(c => c.inspecao_mensal_id === inspecaoId);
                    const ambsAtivos = db.ambientes.filter(a => a.status === 'Ativo');
                    
                    if (checks.length < ambsAtivos.length) {
                        return respondJson(false, `Não é possível finalizar. Faltam inspecionar ${ambsAtivos.length - checks.length} ambiente(s).`);
                    }

                    inspecao.status = 'Finalizada';
                    inspecao.data_fim = new Date().toISOString().substring(0, 10);
                    saveDatabase(db);
                    return respondJson(true, "Inspeção Mensal finalizada com sucesso!");
                }

                if (acao === 'excluir') {
                    if (session.usuario_nivel !== 'Gestor') {
                        return respondJson(false, "Acesso negado: Apenas gestores podem excluir registros de preventivas.");
                    }

                    const id = parseInt(postParams.id);
                    const idx = db.checklists.findIndex(c => c.id === id);
                    if (idx === -1) return respondJson(false, "Registro não localizado.");

                    db.checklists.splice(idx, 1);
                    saveDatabase(db);
                    return respondJson(true, `Registro de inspeção preventiva #${id} removido com sucesso!`, { id });
                }
            }

            // VIEW: Usuários - Gestão (Novo)
            if (pathname.includes('/public/views/usuarios.php')) {
                const acao = postParams.acao;
                if (acao === 'alterar_nivel') {
                    if (session.usuario_nivel !== 'Administrador') return respondJson(false, 'Acesso restrito a Administradores.');
                    const id = parseInt(postParams.id);
                    const nv = postParams.nivel_acesso;
                    const idx = db.usuarios.findIndex(u => u.id === id);
                    if (idx !== -1) {
                        db.usuarios[idx].nivel_acesso = nv;
                        saveDatabase(db);
                        return respondJson(true, 'Nível atualizado!', db.usuarios[idx]);
                    }
                    return respondJson(false, 'Usuário não encontrado.');
                }
            }


            // VIEW: Corretivas (Ordens de Serviço) - Fluxo de Ações
            if (pathname.includes('/public/views/corretivas.php')) {
                const acao = postParams.acao;

                if (acao === 'abrir') {
                    const ambId = parseInt(postParams.ambiente_id);
                    const desc = (postParams.descricao_problema || '').trim();
                    const prioridade = postParams.prioridade || 'Baixa';

                    if (!ambId) return respondJson(false, "Selecione um ambiente válido.");
                    if (!desc) return respondJson(false, "Descrição do problema é obrigatória.");

                    const newOS = {
                        id: db.ordens_servico.length > 0 ? Math.max(...db.ordens_servico.map(o => o.id)) + 1 : 1,
                        solicitante_id: session.usuario_id,
                        gestor_id: null, // Pode ser preenchido futuramente
                        executor_atual_id: null,
                        ambiente_id: ambId,
                        prioridade: prioridade,
                        descricao_problema: desc,
                        tipo_execucao: "Interna",
                        status: "Pendente",
                        data_abertura: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        data_fechamento: null
                    };

                    db.ordens_servico.push(newOS);

                    // Histórico de Inicialização
                    const historico = {
                        id: db.os_historico_tramites.length > 0 ? Math.max(...db.os_historico_tramites.map(h => h.id)) + 1 : 1,
                        os_id: newOS.id,
                        origem_usuario_id: session.usuario_id,
                        destino_usuario_id: null,
                        status_etapa: "Abertura Oficial",
                        observacao_etapa: `O.S. registrada. Prioridade definida como: ${prioridade}`,
                        data_tramite: newOS.data_abertura
                    };
                    db.os_historico_tramites.push(historico);

                    saveDatabase(db);

                    const amb = db.ambientes.find(a => a.id === ambId) || {};
                    return respondJson(true, "Ordem de serviço aberta com sucesso!", {
                        id: newOS.id,
                        ambiente_nome: amb.nome_ambiente || 'Desconhecido',
                        solicitante_nome: session.usuario_nome,
                        descricao_problema: newOS.descricao_problema,
                        status: newOS.status,
                        tipo_execucao: newOS.tipo_execucao,
                        data_abertura: formatDate(newOS.data_abertura, true)
                    });
                }

                if (acao === 'despachar') {
                    if (session.usuario_nivel !== 'Gestor') {
                        return respondJson(false, "Acesso negado: Apenas gestores podem despachar.");
                    }

                    const id = parseInt(postParams.id);
                    const execId = parseInt(postParams.executor_atual_id);
                    const tipo = postParams.tipo_execucao || 'Interna';

                    const idx = db.ordens_servico.findIndex(o => o.id === id);
                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");

                    if (db.ordens_servico[idx].status !== 'Pendente') {
                        return respondJson(false, "Esta OS já foi despachada ou concluída.");
                    }

                    db.ordens_servico[idx].executor_atual_id = execId;
                    db.ordens_servico[idx].gestor_id = session.usuario_id;
                    db.ordens_servico[idx].tipo_execucao = tipo;
                    db.ordens_servico[idx].status = 'Aguardando Aceite';
                    
                    saveDatabase(db);

                    const exec = db.usuarios.find(u => u.id === execId) || {};
                    return respondJson(true, "Ordem de serviço despachada com sucesso!", {
                        id: id,
                        executor_nome: exec.nome || 'Designado',
                        gestor_nome: session.usuario_nome,
                        status: 'Aguardando Aceite',
                        tipo_execucao: tipo
                    });
                }

                if (acao === 'finalizar') {
                    if (session.usuario_nivel !== 'Executor') {
                        return respondJson(false, "Acesso negado: Apenas executores podem preencher relato de término.");
                    }

                    const id = parseInt(postParams.id);
                    const relato = (postParams.relato_conclusao || '').trim();

                    const idx = db.ordens_servico.findIndex(o => o.id === id);
                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");

                    if (db.ordens_servico[idx].executor_atual_id !== session.usuario_id) {
                        return respondJson(false, "Você não é o executor atribuído para esta chamada.");
                    }

                    if (db.ordens_servico[idx].status !== 'Em Execução') {
                        return respondJson(false, "Status incorreto para conclusão.");
                    }

                    const dataStr = formatDate(new Date().toISOString(), true);
                    db.ordens_servico[idx].descricao_problema += `\n\n[Conclusão do Executor em ${dataStr}]: ${relato}`;
                    db.ordens_servico[idx].status = 'Aguardando Validação';

                    saveDatabase(db);
                    return respondJson(true, "Término de serviço registrado! Enviado para validação do solicitante.", {
                        id: id,
                        descricao_problema: db.ordens_servico[idx].descricao_problema,
                        status: 'Aguardando Validação'
                    });
                }

                if (acao === 'tramitar_os') {
                    const id = parseInt(postParams.os_id);
                    const obs = (postParams.nova_observacao || '').trim();
                    const newExecId = parseInt(postParams.executor_atual_id);
                    const idx = db.ordens_servico.findIndex(o => o.id === id);

                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");
                    if (!obs) return respondJson(false, "A observação é obrigatória para tramitar a O.S.");

                    // Cria o histórico
                    const historico = {
                        id: db.os_historico_tramites.length > 0 ? Math.max(...db.os_historico_tramites.map(h => h.id)) + 1 : 1,
                        os_id: id,
                        origem_usuario_id: session.usuario_id,
                        destino_usuario_id: newExecId || null,
                        status_etapa: db.ordens_servico[idx].status,
                        observacao_etapa: obs,
                        data_tramite: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    };
                    db.os_historico_tramites.push(historico);

                    // Atualiza status e executor com base no Nível
                    if (session.usuario_nivel === 'Gestor' && db.ordens_servico[idx].status === 'Pendente') {
                        if (newExecId) {
                            db.ordens_servico[idx].executor_atual_id = newExecId;
                        }
                        db.ordens_servico[idx].status = 'Em Execução';
                        historico.status_etapa = 'Encaminhado para Execução';
                    } else if (session.usuario_nivel === 'Executor' && db.ordens_servico[idx].status === 'Em Execução') {
                        db.ordens_servico[idx].status = 'Aguardando Validação';
                        historico.status_etapa = 'Execução Concluída';
                    } else if (session.usuario_nivel === 'Solicitante' && db.ordens_servico[idx].status === 'Aguardando Validação') {
                        db.ordens_servico[idx].status = 'Concluída';
                        db.ordens_servico[idx].data_fechamento = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        historico.status_etapa = 'Validação Concluída';
                    }

                    saveDatabase(db);
                    return respondJson(true, "Ordem de Serviço atualizada e tramitada com sucesso!");
                }

                if (acao === 'validar') {
                    const id = parseInt(postParams.id);
                    const decisao = postParams.decisao; // 'aprovar' ou 'recusar'
                    const obs = (postParams.observacoes_validacao || '').trim();

                    const idx = db.ordens_servico.findIndex(o => o.id === id);
                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");

                    if (db.ordens_servico[idx].status !== 'Aguardando Validação') {
                        return respondJson(false, "Esta chamada não está pendente de validação.");
                    }

                    const dataStr = formatDate(new Date().toISOString(), true);

                    if (decisao === 'aprovar') {
                        db.ordens_servico[idx].status = 'Concluída';
                        db.ordens_servico[idx].data_fechamento = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        if (obs) {
                            db.ordens_servico[idx].descricao_problema += `\n\n[Aprovado pelo Solicitante em ${dataStr}]: ${obs}`;
                        } else {
                            db.ordens_servico[idx].descricao_problema += `\n\n[Aprovado pelo Solicitante em ${dataStr}]`;
                        }
                    } else {
                        // Recusado: Retorna a execução com logs
                        db.ordens_servico[idx].status = 'Em Execução';
                        db.ordens_servico[idx].descricao_problema += `\n\n[Recusado pelo Solicitante em ${dataStr}]: ${obs}`;
                    }

                    saveDatabase(db);
                    const msg = decisao === 'aprovar' ? "Ordem de serviço concluída e aprovada com sucesso!" : "Serviço recusado! Retornado ao executor em execução.";
                    
                    return respondJson(true, msg, {
                        id: id,
                        descricao_problema: db.ordens_servico[idx].descricao_problema,
                        status: db.ordens_servico[idx].status,
                        data_fechamento: db.ordens_servico[idx].data_fechamento ? formatDate(db.ordens_servico[idx].data_fechamento, true) : null
                    });
                }

                if (acao === 'aceitar_os') {
                    const id = parseInt(postParams.id);
                    const idx = db.ordens_servico.findIndex(o => o.id === id);
                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");
                    if (db.ordens_servico[idx].status !== 'Aguardando Aceite') {
                        return respondJson(false, "Esta chamada não está aguardando aceite.");
                    }
                    if (db.ordens_servico[idx].executor_atual_id !== session.usuario_id) {
                        return respondJson(false, "Acesso negado: Você não é o executor designado.");
                    }
                    db.ordens_servico[idx].status = 'Em Execução';
                    saveDatabase(db);
                    const exec = db.usuarios.find(u => u.id === session.usuario_id) || {};
                    return respondJson(true, "Ordem de serviço aceita! Iniciando execução.", {
                        id: id,
                        status: 'Em Execução',
                        executor_nome: exec.nome
                    });
                }

                if (acao === 'finalizar_reparo') {
                    const id = parseInt(postParams.id);
                    const relato = (postParams.relato_conclusao || '').trim();
                    if (!relato) return respondJson(false, "O relato técnico de conclusão é obrigatório.");
                    if (relato.toUpperCase() === 'VAZIO') return respondJson(false, "Erro: Relato não pode ser 'VAZIO'.");

                    const idx = db.ordens_servico.findIndex(o => o.id === id);
                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");
                    if (db.ordens_servico[idx].executor_atual_id !== session.usuario_id) {
                        return respondJson(false, "Acesso negado: Você não é o executor designado.");
                    }
                    if (db.ordens_servico[idx].status !== 'Em Execução') {
                        return respondJson(false, "Esta chamada não está em execução.");
                    }

                    const dataStr = formatDate(new Date().toISOString(), true);
                    db.ordens_servico[idx].descricao_problema += `\\n\\n[Conclusão do Executor em ${dataStr}]: ${relato}`;
                    db.ordens_servico[idx].status = 'Aguardando Validação';

                    saveDatabase(db);
                    return respondJson(true, "Término de serviço registrado! Enviado para validação.", {
                        id: id,
                        status: 'Aguardando Validação'
                    });
                }

                if (acao === 'validar_conclusao') {
                    const id = parseInt(postParams.id);
                    const obs = (postParams.observacoes_validacao || '').trim();
                    if (obs.toUpperCase() === 'VAZIO') return respondJson(false, "Erro: Observações não podem ser 'VAZIO'.");

                    const idx = db.ordens_servico.findIndex(o => o.id === id);
                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");
                    if (db.ordens_servico[idx].solicitante_id !== session.usuario_id && session.usuario_nivel !== 'Gestor') {
                        return respondJson(false, "Acesso negado: Apenas o solicitante original ou gestores podem validar.");
                    }
                    if (db.ordens_servico[idx].status !== 'Aguardando Validação') {
                        return respondJson(false, "Esta chamada não está aguardando validação.");
                    }

                    const dataStr = formatDate(new Date().toISOString(), true);
                    db.ordens_servico[idx].status = 'Concluída';
                    db.ordens_servico[idx].data_fechamento = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    if (obs) {
                        db.ordens_servico[idx].descricao_problema += `\\n\\n[Aprovado pelo Solicitante em ${dataStr}]: ${obs}`;
                    } else {
                        db.ordens_servico[idx].descricao_problema += `\\n\\n[Aprovado pelo Solicitante em ${dataStr}]`;
                    }

                    saveDatabase(db);
                    return respondJson(true, "Ordem de serviço aprovada e concluída com sucesso!", {
                        id: id,
                        status: 'Concluída',
                        data_fechamento: formatDate(db.ordens_servico[idx].data_fechamento, true)
                    });
                }

                if (acao === 'recusar_servico') {
                    const id = parseInt(postParams.id);
                    const obs = (postParams.observacoes_validacao || '').trim();
                    if (!obs) return respondJson(false, "O motivo da recusa é obrigatório.");
                    if (obs.toUpperCase() === 'VAZIO') return respondJson(false, "Erro: Observações não podem ser 'VAZIO'.");

                    const idx = db.ordens_servico.findIndex(o => o.id === id);
                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");
                    if (db.ordens_servico[idx].solicitante_id !== session.usuario_id && session.usuario_nivel !== 'Gestor') {
                        return respondJson(false, "Acesso negado: Apenas o solicitante original ou gestores podem validar.");
                    }
                    if (db.ordens_servico[idx].status !== 'Aguardando Validação') {
                        return respondJson(false, "Esta chamada não está aguardando validação.");
                    }

                    const dataStr = formatDate(new Date().toISOString(), true);
                    db.ordens_servico[idx].status = 'Em Execução';
                    db.ordens_servico[idx].descricao_problema += `\\n\\n[Recusado pelo Solicitante em ${dataStr}]: ${obs}`;

                    saveDatabase(db);
                    return respondJson(true, "Serviço recusado! Retornado ao executor em execução.", {
                        id: id,
                        status: 'Em Execução'
                    });
                }
            }

            // Ação desconhecida ou inválida
            return respondJson(false, "Operação inválida ou rota incorreta.");
        });
        return;
    }

    // 4. Processamento de Requisições GET (Navegação de Telas e Consultas AJAX)
    
    // ENDPOINT API: Captura de histórico de OS (GET)
    if (pathname.includes('/public/api/os_historico.php')) {
        const id = parseInt(queryParams.os_id);
        const db = initDatabase();
        const os = db.ordens_servico.find(o => o.id === id);
        if (!os) return respondJson(false, 'O.S. não localizada.');

        const userSol = db.usuarios.find(u => u.id === os.solicitante_id)?.nome || 'N/D';
        const userExec = db.usuarios.find(u => u.id === os.executor_atual_id)?.nome || 'N/D';

        const historicoRaw = db.os_historico_tramites ? db.os_historico_tramites.filter(h => h.os_id === id) : [];
        const historico = historicoRaw.map(h => ({
            ...h,
            origem_nome: db.usuarios.find(u => u.id === h.origem_usuario_id)?.nome || 'Sistema',
            destino_nome: db.usuarios.find(u => u.id === h.destino_usuario_id)?.nome || 'Nenhum',
            data_formatada: h.data_tramite
        }));

        return res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({
            success: true,
            os: {
                id: os.id,
                ambiente: db.ambientes.find(a => a.id === os.ambiente_id)?.nome_ambiente || 'N/D',
                solicitante: userSol,
                solicitante_id: os.solicitante_id,
                executor_atual: userExec,
                executor_atual_id: os.executor_atual_id,
                status: os.status,
                descricao: os.descricao_problema,
                data_abertura: os.data_abertura
            },
            historico: historico
        }));
    }
    
    // AJAX: Buscar detalhes de uma OS específica
    if (pathname === '/public/views/corretivas.php' && queryParams.acao === 'buscar') {
        const id = parseInt(queryParams.id);
        const db = initDatabase();
        const os = db.ordens_servico.find(o => o.id === id);
        
        if (!os) return respondJson(false, "Ordem de serviço não localizada.");

        const amb = db.ambientes.find(a => a.id === os.ambiente_id) || {};
        const sol = db.usuarios.find(u => u.id === os.solicitante_id) || {};
        const gest = db.usuarios.find(u => u.id === os.gestor_id) || {};
        const exec = db.usuarios.find(u => u.id === os.executor_atual_id) || {};

        return respondJson(true, "Dados carregados com sucesso!", {
            id: os.id,
            solicitante_id: os.solicitante_id,
            executor_id: os.executor_atual_id,
            executor_atual_id: os.executor_atual_id,
            solicitante_nome: sol.nome || 'Desconhecido',
            gestor_nome: gest.nome || 'Pendente',
            executor_nome: exec.nome || 'Não Atribuído',
            ambiente_nome: amb.nome_ambiente || 'Desconhecido',
            descricao_problema: os.descricao_problema,
            tipo_execucao: os.tipo_execucao,
            status: os.status,
            data_abertura: formatDate(os.data_abertura, true),
            data_fechamento: os.data_fechamento ? formatDate(os.data_fechamento, true) : ''
        });
    }

    // Roteador padrão de visualização de Telas (.php)
    let phpViewFile = '';
    
    if (pathname === '/' || pathname === '/public' || pathname === '/public/' || pathname === '/public/index.php') {
        phpViewFile = path.join(__dirname, 'public', 'index.php');
    } else if (pathname.includes('/public/views/')) {
        const viewName = pathname.substring(pathname.lastIndexOf('/') + 1);
        phpViewFile = path.join(__dirname, 'public', 'views', viewName);
    }

    if (phpViewFile && fs.existsSync(phpViewFile)) {
        // Bloqueia rotas internas caso não esteja logado
        if (pathname.includes('/public/views/') && !session.usuario_id) {
            redirect('/public/index.php');
            return;
        }

        // Restringe a tela de análise apenas para perfil "Gestor"
        if (pathname.includes('dashboard_analise.php') && session.usuario_nivel !== 'Gestor') {
            session.alerta_erro = "Acesso negado: Seu perfil não possui permissão para acessar esta área.";
            redirect('/public/views/home.php');
            return;
        }

        // Compila o PHP e envia resposta HTML pura
        try {
            const compiledHtml = compilePhp(phpViewFile, session, queryParams);
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Set-Cookie': setSessionCookie
            });
            res.end(compiledHtml);
        } catch (e) {
            console.error("Erro de Compilação da View:", phpViewFile, e);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h2>Erro Interno de Compilação do Servidor Mock</h2><p>${e.message}</p><pre>${e.stack}</pre>`);
        }
        return;
    }

    // Rota padrão não mapeada
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Página não encontrada no Servidor Mock do SENAI.');
});

// Inicializa a escuta na porta configurada
server.listen(PORT, () => {
    console.log(`\n==================================================================`);
    console.log(`🚀 SERVIDOR DE TESTES MOCK DO SENAI INICIADO COM SUCESSO!`);
    console.log(`🔗 URL local para testes: http://localhost:${PORT}`);
    console.log(`==================================================================\n`);
    console.log(`Credenciais de Acesso de Semente (Seed):`);
    console.log(`👤 Gestor:      gestor@senai.br      | Senha: senai123`);
    console.log(`👤 Executor:    executor@senai.br    | Senha: senai123`);
    console.log(`👤 Solicitante: solicitante@senai.br | Senha: senai123\n`);
    console.log(`Regra 'VAZIO' ativa nas validações do servidor.`);
    console.log(`Estado do banco persistido reativamente em: mock_database.json\n`);
    console.log(`Pressione Ctrl+C para encerrar o servidor...\n`);
});
