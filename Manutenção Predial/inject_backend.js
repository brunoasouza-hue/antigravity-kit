const fs = require('fs');
let js = fs.readFileSync('start_test_server.js', 'utf8');

const tramitarCode = `
                } else if (acao === 'tramitar_os') {
                    const os_id = parseInt(postParams.os_id);
                    const nova_observacao = postParams.nova_observacao ? postParams.nova_observacao.trim() : '';
                    const executor_id = postParams.executor_id ? parseInt(postParams.executor_id) : null;
                    
                    const os = db.ordens_servico.find(o => o.id === os_id);
                    if (!os) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'OS não encontrada.' }));
                        return;
                    }

                    // Log the new observation in history if provided
                    if (nova_observacao) {
                        const stamp = "[" + new Date().toLocaleString('pt-BR') + "] - " + session.usuario_nome + ": " + nova_observacao;
                        if (os.relato_servico) {
                            os.relato_servico += "\\n" + stamp;
                        } else {
                            os.relato_servico = stamp;
                        }
                    }

                    // Transitions based on user level and current status
                    if (session.nivel === 'Gestor' && os.status === 'Pendente') {
                        if (!executor_id) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Selecione um executor!' }));
                            return;
                        }
                        os.executor_id = executor_id;
                        os.gestor_id = session.usuario_id;
                        os.status = 'Em Execução';
                        saveDatabase(db);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'OS encaminhada ao Executor com sucesso!' }));
                        return;

                    } else if (session.nivel === 'Executor' && os.status === 'Em Execução') {
                        os.status = 'Aguardando Validação';
                        saveDatabase(db);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Serviço relatado. Aguardando Validação do Solicitante.' }));
                        return;

                    } else if (session.nivel === 'Solicitante' && os.status === 'Aguardando Validação') {
                        os.status = 'Concluída';
                        os.data_fechamento = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        saveDatabase(db);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Serviço aprovado! OS Finalizada.' }));
                        return;
                    } else {
                        // Just saved observation
                        saveDatabase(db);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Observação registrada com sucesso!' }));
                        return;
                    }
`;

js = js.replace(/\} else if \(acao === 'finalizar_inspecao'\) \{/, tramitarCode + "                } else if (acao === 'finalizar_inspecao') {");

fs.writeFileSync('start_test_server.js', js);
console.log('Backend handler tramitar_os injetado!');
