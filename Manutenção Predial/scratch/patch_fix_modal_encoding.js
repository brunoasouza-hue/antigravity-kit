const fs = require('fs');

let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

// Use regex to fix the check inside abrirModalAprovacao
const regexModalLogic = /if \(currentRole === 'Gestor' && os\.status === 'Pendente'\) \{\s*document\.getElementById\('aprov_buttons_container'\)\.style\.display='flex';\s*\} else if \(currentRole === 'Executor' && os\.status === '[^']+'\) \{\s*document\.getElementById\('aprov_concluir_container'\)\.style\.display='block';\s*\} else if \(currentRole === 'Solicitante' && os\.status === '[^']+'\) \{/g;

const newModalLogic = `if (currentRole === 'Gestor' && os.status === 'Pendente') {
                        document.getElementById('aprov_buttons_container').style.display='flex';
                    } else if (currentRole === 'Executor' && os.status.includes('Execu')) {
                        document.getElementById('aprov_concluir_container').style.display='block';
                    } else if (currentRole === 'Solicitante' && os.status.includes('Valida')) {`;

code = code.replace(regexModalLogic, newModalLogic);

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log('corretivas.php modal condition logic patched to bypass encoding issues!');
