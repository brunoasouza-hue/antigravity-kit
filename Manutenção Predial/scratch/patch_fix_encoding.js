const fs = require('fs');

let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

// Replace the exact string match with includes to bypass encoding corruption issues
const oldLogic = `                    if (currentUserRole === 'Gestor' && status === 'Pendente') {
                        canAct = true;
                    } else if (currentUserRole === 'Executor' && status === 'Em Execuǜo' && currentUserId == executorId) {
                        canAct = true;
                    } else if (currentUserRole === 'Solicitante' && status === 'Aguardando Validaǜo' && currentUserId == solicitanteId) {
                        canAct = true;
                    }`;

const newLogic = `                    if (currentUserRole === 'Gestor' && status === 'Pendente') {
                        canAct = true;
                    } else if (currentUserRole === 'Executor' && status.includes('Execu') && currentUserId == executorId) {
                        canAct = true;
                    } else if (currentUserRole === 'Solicitante' && status.includes('Valida') && currentUserId == solicitanteId) {
                        canAct = true;
                    }`;

// Since the file has corrupted characters, I will use a regex to match it more safely
const regexLogic = /if \(currentUserRole === 'Gestor' && status === 'Pendente'\) \{\s*canAct = true;\s*\} else if \(currentUserRole === 'Executor' && status === '[^']+' && currentUserId == executorId\) \{\s*canAct = true;\s*\} else if \(currentUserRole === 'Solicitante' && status === '[^']+' && currentUserId == solicitanteId\) \{\s*canAct = true;\s*\}/;

code = code.replace(regexLogic, newLogic);

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log('corretivas.php condition logic patched to bypass encoding issues!');
