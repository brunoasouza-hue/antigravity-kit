const fs = require('fs');
let content = fs.readFileSync('public/views/corretivas.php', 'utf8');

const targetStr = `                        } else if (nivel === 'Executor' && os.status === 'Em Execução') {
                            btnTramitar.innerText = 'Relatar e Concluir Serviço';
                            btnTramitar.style.background = '#28a745';
                            btnTramitar.style.display = 'block';
                        } else if (nivel === 'Solicitante' && os.status === 'Aguardando Validação') {
                            btnTramitar.innerText = 'Aprovar Serviço (Concluir)';
                            btnTramitar.style.background = '#17a2b8';
                            btnTramitar.style.display = 'block';
                        } else {
                            document.getElementById('nova_observacao').disabled = true;
                            document.getElementById('nova_observacao').placeholder = 'Apenas leitura para este status.';
                            btnTramitar.style.background = '#17a2b8';
                            btnTramitar.style.display = 'block';
                        } else {
                            document.getElementById('nova_observacao').disabled = true;
                            document.getElementById('nova_observacao').placeholder = 'Apenas leitura para este status.';
                        }`;

const replacementStr = `                        } else {
                            document.getElementById('nova_observacao').disabled = true;
                            document.getElementById('nova_observacao').placeholder = 'Apenas leitura para este status.';
                        }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('public/views/corretivas.php', content);
console.log('Fixed syntax error by removing duplicate block');
