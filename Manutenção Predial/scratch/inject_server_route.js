const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const targetStr = `                    inspecao.status = 'Finalizada';
                    inspecao.data_fim = new Date().toISOString().substring(0, 10);
                    saveDatabase(db);
                    return respondJson(true, "Inspeção Mensal finalizada com sucesso!");
                }`;

// Se não achar com acentos corretos, tenta com RegEx para ignorar acentos corrompidos
const findRegex = /inspecao\.status = 'Finalizada';[\s\S]*?saveDatabase\(db\);[\s\S]*?return respondJson\(true, ".*?finalizada com sucesso!"\);\s*}/;

const injectStr = `                    // Removed blocks restricting finish to test modal
                    inspecao.status = 'Finalizada';
                    inspecao.data_fim = new Date().toISOString().substring(0, 10);
                    saveDatabase(db);
                    return respondJson(true, "Inspeção Mensal finalizada com sucesso!");
                }

                if (acao === 'buscar_historico_detalhes') {
                    const inspecaoId = parseInt(postParams.inspecao_id);
                    const inspecao = (db.inspecoes_mensais || []).find(i => i.id === inspecaoId);
                    if (!inspecao) return respondJson(false, "Inspeção não encontrada.");

                    const checks = db.checklists.filter(c => c.inspecao_mensal_id === inspecaoId).map(c => {
                        const amb = db.ambientes.find(a => a.id === c.ambiente_id);
                        return {
                            ...c,
                            ambiente_nome: amb ? amb.nome_ambiente : 'Desconhecido'
                        };
                    });
                    
                    checks.sort((a,b) => a.ambiente_nome.localeCompare(b.ambiente_nome));

                    return respondJson(true, "Detalhes carregados com sucesso.", {
                        inspecao: {
                            id: inspecao.id,
                            data_inicio: formatDate(inspecao.data_inicio),
                            data_fim: inspecao.data_fim ? formatDate(inspecao.data_fim) : '-'
                        },
                        checklists: checks
                    });
                }`;

if (content.match(findRegex)) {
    content = content.replace(findRegex, injectStr);
    
    // Agora remove a validação de if(checks.length < ambsAtivos.length)
    const blockRegex = /if \(checks\.length < ambsAtivos\.length\) {[\s\S]*?return respondJson\(false, `.*?`\);\s*}/;
    if (content.match(blockRegex)) {
         content = content.replace(blockRegex, `/* if (checks.length < ambsAtivos.length) { return respondJson(false, "Restrição removida"); } */`);
    }

    fs.writeFileSync('start_test_server.js', content);
    console.log("Injected code successfully!");
} else {
    console.log("Target string not found!");
}
