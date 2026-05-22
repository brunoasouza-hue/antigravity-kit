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

    // Criando dados de semente (Seeding) de alta fidelidade baseados em sql/schema.sql
    const db = {
        usuarios: [
            {
                id: 1,
                nome: "Carlos Souza (Solicitante)",
                email: "solicitante@senai.br",
                senha: "senai123", // plaintext comparada localmente
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
        ],
        ambientes: [
            { id: 1, nome_bloco_sala: "Bloco A - Lab Informática 1", status: "Ativo" },
            { id: 2, nome_bloco_sala: "Bloco A - Lab Redes", status: "Ativo" },
            { id: 3, nome_bloco_sala: "Bloco B - Oficina Mecânica", status: "Ativo" },
            { id: 4, nome_bloco_sala: "Bloco B - Sala Eletroeletrônica", status: "Ativo" },
            { id: 5, nome_bloco_sala: "Bloco C - Auditório Principal", status: "Ativo" },
            { id: 6, nome_bloco_sala: "Bloco C - Sala de Reuniões", status: "Ativo" }
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
            const ambId = (c % 6) + 1;
            db.checklists.push({
                id: checklistId++,
                ambiente_id: ambId,
                responsavel_id: 3, // Marcos Silva (Executor)
                data_inspecao: dateStr,
                status_tomadas: c % 3 === 0 ? "Defeito" : "Ok",
                status_forros: "Ok",
                status_paredes: "Ok",
                status_projetor: c % 4 === 0 ? "Defeito" : "Ok",
                status_tela: "Ok",
                status_lousa: "Ok",
                observacoes: c % 3 === 0 ? "Tomada com avaria física constatada." : null,
                data_criacao: dateStr + " 10:00:00"
            });
        }
        
        // Seed OS Corretivas
        const numOS = osCounts[5 - i];
        for (let o = 0; o < numOS; o++) {
            const ambId = (o % 6) + 1;
            const isCurrentMonth = (i === 0);
            let status = "Concluída";
            let dataFechamento = dateStr + " 16:30:00";
            
            if (isCurrentMonth) {
                if (o === 0) { status = "Pendente"; dataFechamento = null; }
                else if (o === 1) { status = "Pendente"; dataFechamento = null; }
                else if (o === 2) { status = "Em Execução"; dataFechamento = null; }
                else if (o === 3) { status = "Aguardando Validação"; dataFechamento = null; }
                else { status = "Concluída"; }
            }
            
            db.ordens_servico.push({
                id: osId++,
                solicitante_id: 1, // Carlos Souza
                gestor_id: 2, // Renata Mendes
                executor_id: 3, // Marcos Silva
                ambiente_id: ambId,
                descricao_problema: `Problema no circuito elétrico do ambiente #${ambId}.`,
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
        .replace(/empty\((.*?)\)/g, '( !$1 || (Array.isArray($1) && $1.length === 0) )')
        .replace(/!empty\((.*?)\)/g, '( $1 && (!Array.isArray($1) || $1.length > 0) )')
        .replace(/isset\((.*?)\)/g, '( typeof $1 !== "undefined" && $1 !== null )');
    
    try {
        const fn = new Function('session', 'localContext', `return (${js});`);
        return !!fn(session, localContext);
    } catch(e) {
        // Fallback silencioso em caso de parse complexo
        return false;
    }
}

function compileConditionals(html, session, localContext = {}) {
    // Resolve if/else/endif
    const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
    html = html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? ifBody : elseBody;
    });

    // Resolve if/endif
    const ifRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
    html = html.replace(ifRegex, (match, condStr, body) => {
        const isTrue = evaluatePhpCondition(condStr, session, localContext);
        return isTrue ? body : '';
    });

    return html;
}

function compileLoops(html, session, dbContext) {
    const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;\s*\?>/gs;
    
    return html.replace(foreachRegex, (match, collectionExpr, itemVar, body) => {
        const collectionName = collectionExpr.trim();
        let items = [];
        if (collectionName === 'ambientes') items = dbContext.ambientes || [];
        else if (collectionName === 'ambientesAtivos') items = (dbContext.ambientes || []).filter(a => a.status === 'Ativo');
        else if (collectionName === 'checklists') items = dbContext.currentChecklists || [];
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
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\$${itemVar}->getId\\(\\)\\s*;?\\s*\\?>`, 'g'), val: item.id },
                { regex: new RegExp(`<?=\\s*\\$${itemVar}->getId\\(\\)\\s*\\?>`, 'g'), val: item.id },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getNomeBlocoSala\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.nome_bloco_sala || '') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+addslashes\\(\\s*\\$${itemVar}->getNomeBlocoSala\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: (item.nome_bloco_sala || '').replace(/'/g, "\\'") },
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\$${itemVar}->getStatus\\(\\)\\s*;?\\s*\\?>`, 'g'), val: item.status },
                
                // Checklist
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getAmbienteNome\\(\\)\\s*(?:\\?\\?\\s*['\"].*?['\"]\\s*)?\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.ambiente_nome || 'Desconhecido') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getResponsavelNome\\(\\)\\s*(?:\\?\\?\\s*['\"].*?['\"]\\s*)?\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.responsavel_nome || 'N/A') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+date\\(\\s*['\"]d/m/Y['\"]\\s*,\\s*strtotime\\(\\s*\\$${itemVar}->getDataInspecao\\(\\)\\s*\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: formatDate(item.data_inspecao) },
                
                // OS
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getSolicitanteNome\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.solicitante_nome || '') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getExecutorNome\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.executor_nome || 'Não Atribuído') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getGestorNome\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.gestor_nome || 'Pendente') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+date\\(\\s*['\"]d/m/Y H:i['\"]\\s*,\\s*strtotime\\(\\s*\\$${itemVar}->getDataAbertura\\(\\)\\s*\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: formatDate(item.data_abertura, true) },
                { regex: new RegExp(`<\\?php\\s+echo\\s+date\\(\\s*['\"]d/m/Y H:i['\"]\\s*,\\s*strtotime\\(\\s*\\$${itemVar}->getDataFechamento\\(\\)\\s*\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: formatDate(item.data_fechamento, true) },
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\$${itemVar}->getDescricaoProblema\\(\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.descricao_problema || '') },
                
                // Ranking
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\$idx\\s*\\+\\s*1\\s*;?\\s*\\?>`, 'g'), val: idx + 1 },
                { regex: new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$item\\['nome'\\]\\s*\\)\\s*;?\\s*\\?>`, 'g'), val: escapeHtml(item.nome || '') },
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\$item\\['total'\\]\\s*;?\\s*\\?>`, 'g'), val: item.total || 0 },
                { regex: new RegExp(`<\\?php\\s+echo\\s+\\$percentual\\s*;?\\s*\\?>`, 'g'), val: (item.total / dbContext.maxOS * 100) || 0 }
            ];
            
            getterMatches.forEach(m => {
                itemHtml = itemHtml.replace(m.regex, m.val);
            });
            
            itemHtml = itemHtml.replace(new RegExp(`\\$${itemVar}->getStatus\\(\\)`, 'g'), `'${item.status}'`);
            itemHtml = itemHtml.replace(new RegExp(`\\$${itemVar}->getId\\(\\)`, 'g'), item.id);
            itemHtml = itemHtml.replace(new RegExp(`\\$${itemVar}->getExecutorId\\(\\)`, 'g'), item.executor_id || 'null');
            itemHtml = itemHtml.replace(new RegExp(`\\$${itemVar}->getSolicitanteId\\(\\)`, 'g'), item.solicitante_id || 'null');
            
            itemHtml = itemHtml.replace(new RegExp(`<\\?php\\s+echo\\s+\\$${itemVar}->getId\\(\\)\\s*;?\\s*\\?>`, 'g'), item.id);
            itemHtml = itemHtml.replace(new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getNomeBlocoSala\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), escapeHtml(item.nome_bloco_sala || ''));
            itemHtml = itemHtml.replace(new RegExp(`<\\?php\\s+echo\\s+htmlspecialchars\\(\\s*\\$${itemVar}->getNome\\(\\)\\s*\\)\\s*;?\\s*\\?>`, 'g'), escapeHtml(item.nome || ''));
            
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
                itemHtml = compileConditionals(itemHtml, session, { ...localContext, status: item.status });
            }
            
            rendered += itemHtml;
        });
        
        return rendered;
    });
}

function compileVariables(html, context) {
    const echos = [
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
        filteredAmbientes = filteredAmbientes.filter(a => a.nome_bloco_sala.toLowerCase().includes(pesquisa.toLowerCase()));
    }

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
        currentChecklists = checklists.map(c => {
            const amb = ambientes.find(a => a.id === c.ambiente_id) || {};
            const resp = usuarios.find(u => u.id === c.responsavel_id) || {};
            return {
                ...c,
                ambiente_nome: amb.nome_bloco_sala || 'Desconhecido',
                responsavel_nome: resp.nome || 'N/A'
            };
        });
        currentChecklists.sort((a, b) => b.id - a.id);
    }

    if (filePath.endsWith('corretivas.php')) {
        currentOS = ordensServico.map(os => {
            const amb = ambientes.find(a => a.id === os.ambiente_id) || {};
            const sol = usuarios.find(u => u.id === os.solicitante_id) || {};
            const gest = usuarios.find(u => u.id === os.gestor_id) || {};
            const exec = usuarios.find(u => u.id === os.executor_id) || {};
            return {
                ...os,
                ambiente_nome: amb.nome_bloco_sala || 'Desconhecido',
                solicitante_nome: sol.nome || 'Desconhecido',
                gestor_nome: gest.nome || 'Pendente',
                executor_nome: exec.nome || 'Não Atribuído'
            };
        });

        if (session.usuario_nivel === 'Solicitante') {
            currentOS = currentOS.filter(os => os.solicitante_id === session.usuario_id);
        } else if (session.usuario_nivel === 'Executor') {
            currentOS = currentOS.filter(os => os.executor_id === session.usuario_id);
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
                nome: amb.nome_bloco_sala || `Ambiente #${aid}`,
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
    for (let i = 0; i < 3; i++) {
        html = compileConditionals(html, session);
    }
    html = compileVariables(html, { ...context, dashboard_analise });

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
        SESSIONS[sessionId] = {
            usuario_id: null,
            usuario_nome: '',
            usuario_email: '',
            usuario_nivel: '',
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
                    const nome = (postParams.nome_bloco_sala || '').trim();
                    const status = postParams.status || 'Ativo';

                    if (!nome) return respondJson(false, "Nome do ambiente é obrigatório.");
                    
                    if (db.ambientes.some(a => a.nome_bloco_sala.toLowerCase() === nome.toLowerCase())) {
                        return respondJson(false, `Erro: Já existe um ambiente cadastrado com o nome '${nome}'.`);
                    }

                    const newAmb = {
                        id: db.ambientes.length > 0 ? Math.max(...db.ambientes.map(a => a.id)) + 1 : 1,
                        nome_bloco_sala: nome,
                        status: status
                    };

                    db.ambientes.push(newAmb);
                    saveDatabase(db);
                    return respondJson(true, `Ambiente '${nome}' cadastrado com sucesso!`, newAmb);
                }

                if (acao === 'editar') {
                    const id = parseInt(postParams.id);
                    const nome = (postParams.nome_bloco_sala || '').trim();
                    const status = postParams.status || 'Ativo';

                    const idx = db.ambientes.findIndex(a => a.id === id);
                    if (idx === -1) return respondJson(false, "Ambiente não localizado.");

                    if (db.ambientes.some(a => a.id !== id && a.nome_bloco_sala.toLowerCase() === nome.toLowerCase())) {
                        return respondJson(false, `Erro: Já existe outro ambiente cadastrado com o nome '${nome}'.`);
                    }

                    db.ambientes[idx].nome_bloco_sala = nome;
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
                    return respondJson(true, `Ambiente '${db.ambientes[idx].nome_bloco_sala}' ${acao === 'ativar' ? 'ativado' : 'inativado'} com sucesso!`, db.ambientes[idx]);
                }

                if (acao === 'excluir') {
                    const id = parseInt(postParams.id);
                    const idx = db.ambientes.findIndex(a => a.id === id);
                    if (idx === -1) return respondJson(false, "Ambiente não localizado.");

                    const nome = db.ambientes[idx].nome_bloco_sala;
                    // Exclusão física CASCADE: Deleta ambiente, OSs e checklists associados
                    db.ambientes.splice(idx, 1);
                    db.checklists = db.checklists.filter(c => c.ambiente_id !== id);
                    db.ordens_servico = db.ordens_servico.filter(o => o.ambiente_id !== id);
                    
                    saveDatabase(db);
                    return respondJson(true, `Ambiente '${nome}' e todo seu histórico excluídos permanentemente!`, { id });
                }
            }

            // VIEW: Preventivas (Checklist) - Lançamento e Exclusão
            if (pathname.includes('/public/views/preventivas.php')) {
                const acao = postParams.acao;

                if (acao === 'cadastrar') {
                    const ambId = parseInt(postParams.ambiente_id);
                    const date = postParams.data_inspecao || '';
                    const obs = (postParams.observacoes || '').trim();

                    if (!ambId) return respondJson(false, "Selecione um ambiente válido.");
                    if (!date) return respondJson(false, "A data de inspeção é obrigatória.");

                    const newChecklist = {
                        id: db.checklists.length > 0 ? Math.max(...db.checklists.map(c => c.id)) + 1 : 1,
                        ambiente_id: ambId,
                        responsavel_id: session.usuario_id,
                        data_inspecao: date,
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
                    saveDatabase(db);

                    const amb = db.ambientes.find(a => a.id === ambId) || {};
                    return respondJson(true, "Inspeção preventiva registrada com sucesso!", {
                        id: newChecklist.id,
                        ambiente_nome: amb.nome_bloco_sala || 'Desconhecido',
                        responsavel_nome: session.usuario_nome,
                        data_inspecao: newChecklist.data_inspecao,
                        status_tomadas: newChecklist.status_tomadas,
                        status_forros: newChecklist.status_forros,
                        status_paredes: newChecklist.status_paredes,
                        status_projetor: newChecklist.status_projetor,
                        status_tela: newChecklist.status_tela,
                        status_lousa: newChecklist.status_lousa,
                        observacoes: newChecklist.observacoes
                    });
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

            // VIEW: Corretivas (Ordens de Serviço) - Fluxo de Ações
            if (pathname.includes('/public/views/corretivas.php')) {
                const acao = postParams.acao;

                if (acao === 'abrir') {
                    const ambId = parseInt(postParams.ambiente_id);
                    const desc = (postParams.descricao_problema || '').trim();

                    if (!ambId) return respondJson(false, "Selecione um ambiente válido.");
                    if (!desc) return respondJson(false, "Descrição do problema é obrigatória.");

                    const newOS = {
                        id: db.ordens_servico.length > 0 ? Math.max(...db.ordens_servico.map(o => o.id)) + 1 : 1,
                        solicitante_id: session.usuario_id,
                        gestor_id: null,
                        executor_id: null,
                        ambiente_id: ambId,
                        descricao_problema: desc,
                        tipo_execucao: "Interna",
                        status: "Pendente",
                        data_abertura: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        data_fechamento: null
                    };

                    db.ordens_servico.push(newOS);
                    saveDatabase(db);

                    const amb = db.ambientes.find(a => a.id === ambId) || {};
                    return respondJson(true, "Ordem de serviço aberta com sucesso!", {
                        id: newOS.id,
                        ambiente_nome: amb.nome_bloco_sala || 'Desconhecido',
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
                    const execId = parseInt(postParams.executor_id);
                    const tipo = postParams.tipo_execucao || 'Interna';

                    const idx = db.ordens_servico.findIndex(o => o.id === id);
                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");

                    if (db.ordens_servico[idx].status !== 'Pendente') {
                        return respondJson(false, "Esta OS já foi despachada ou concluída.");
                    }

                    db.ordens_servico[idx].executor_id = execId;
                    db.ordens_servico[idx].gestor_id = session.usuario_id;
                    db.ordens_servico[idx].tipo_execucao = tipo;
                    db.ordens_servico[idx].status = 'Em Execução';
                    
                    saveDatabase(db);

                    const exec = db.usuarios.find(u => u.id === execId) || {};
                    return respondJson(true, "Ordem de serviço despachada com sucesso!", {
                        id: id,
                        executor_nome: exec.nome || 'Designado',
                        gestor_nome: session.usuario_nome,
                        status: 'Em Execução',
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

                    if (db.ordens_servico[idx].executor_id !== session.usuario_id) {
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
            }

            // Ação desconhecida ou inválida
            return respondJson(false, "Operação inválida ou rota incorreta.");
        });
        return;
    }

    // 4. Processamento de Requisições GET (Navegação de Telas e Consultas AJAX)
    
    // AJAX: Buscar detalhes de uma OS específica
    if (pathname === '/public/views/corretivas.php' && queryParams.acao === 'buscar') {
        const id = parseInt(queryParams.id);
        const db = initDatabase();
        const os = db.ordens_servico.find(o => o.id === id);
        
        if (!os) return respondJson(false, "Ordem de serviço não localizada.");

        const amb = db.ambientes.find(a => a.id === os.ambiente_id) || {};
        const sol = db.usuarios.find(u => u.id === os.solicitante_id) || {};
        const gest = db.usuarios.find(u => u.id === os.gestor_id) || {};
        const exec = db.usuarios.find(u => u.id === os.executor_id) || {};

        return respondJson(true, "Dados carregados com sucesso!", {
            id: os.id,
            solicitante_name: sol.nome || 'Desconhecido',
            gestor_name: gest.nome || 'Pendente',
            executor_name: exec.nome || 'Não Atribuído',
            ambiente_nome: amb.nome_bloco_sala || 'Desconhecido',
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
