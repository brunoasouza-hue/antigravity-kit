const fs = require('fs');
const path = require('path');
const serverPath = path.join(__dirname, '..', 'start_test_server.js');

let c = fs.readFileSync(serverPath, 'utf8');

const targetStr = `                if (acao === 'salvar_checklist') {
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
                    db.checklists.push(newChecklist);`;

const newStr = `                if (acao === 'salvar_checklist') {
                    const inspecaoId = parseInt(postParams.inspecao_id);
                    const ambId = parseInt(postParams.ambiente_id);
                    const checklistId = postParams.checklist_id ? parseInt(postParams.checklist_id) : null;
                    const obs = (postParams.observacoes || '').trim();

                    if (!inspecaoId || !ambId) return respondJson(false, "Dados inválidos.");
                    
                    const inspecao = (db.inspecoes_mensais || []).find(i => i.id === inspecaoId && i.status === 'Em Andamento');
                    if (!inspecao) return respondJson(false, "Inspeção não encontrada ou já finalizada.");

                    const checks = db.checklists || [];
                    
                    if (checklistId) {
                        const existente = checks.find(c => c.id === checklistId);
                        if (!existente) return respondJson(false, "Checklist não encontrado para edição.");
                        
                        existente.status_tomadas = postParams.status_tomadas || 'Não se aplica';
                        existente.status_forros = postParams.status_forros || 'Não se aplica';
                        existente.status_paredes = postParams.status_paredes || 'Não se aplica';
                        existente.status_projetor = postParams.status_projetor || 'Não se aplica';
                        existente.status_tela = postParams.status_tela || 'Não se aplica';
                        existente.status_lousa = postParams.status_lousa || 'Não se aplica';
                        existente.observacoes = obs || null;
                        
                        saveDatabase(db);
                        return respondJson(true, "Checklist atualizado com sucesso!");
                    }
                    
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
                    db.checklists.push(newChecklist);`;

if (c.includes(targetStr)) {
    fs.writeFileSync(serverPath, c.replace(targetStr, newStr));
    console.log("Mock server salvar_checklist fixed!");
} else {
    console.log("Could not find target string.");
}
