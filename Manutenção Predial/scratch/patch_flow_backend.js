const fs = require('fs');

let code = fs.readFileSync('start_test_server.js', 'utf8');

const newAction = `
                if (acao === 'reprovar_validacao_os') {
                    const id = parseInt(postParams.os_id);
                    const obs = (postParams.nova_observacao || '').trim();
                    const idx = db.ordens_servico.findIndex(o => o.id === id);

                    if (idx === -1) return respondJson(false, "Ordem de serviço não localizada.");
                    if (!obs) return respondJson(false, "A observação é obrigatória para reprovar a O.S.");
                    if (session.usuario_nivel !== 'Solicitante' && session.usuario_nivel !== 'Gestor') {
                        return respondJson(false, "Apenas o solicitante ou gestor podem reprovar a validação.");
                    }

                    if (db.ordens_servico[idx].status !== 'Aguardando Validação') {
                        return respondJson(false, "A O.S. não está aguardando validação.");
                    }

                    // Cria o histórico
                    const historico = {
                        id: db.os_historico_tramites.length > 0 ? Math.max(...db.os_historico_tramites.map(h => h.id)) + 1 : 1,
                        os_id: id,
                        origem_usuario_id: session.usuario_id,
                        destino_usuario_id: db.ordens_servico[idx].executor_atual_id,
                        status_etapa: 'Serviço Reprovado - Retorno Execução',
                        observacao_etapa: obs,
                        data_tramite: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    };
                    db.os_historico_tramites.push(historico);

                    // Retorna status para Em Execução
                    db.ordens_servico[idx].status = 'Em Execução';
                    
                    saveDatabase(db);
                    return respondJson(true, "Serviço reprovado e retornado ao executor.");
                }

                if (acao === 'tramitar_os') {`;

code = code.replace(/if \(acao === 'tramitar_os'\) \{/, newAction);

fs.writeFileSync('start_test_server.js', code, 'utf8');
console.log('start_test_server.js reprovar_validacao_os logic patched!');
