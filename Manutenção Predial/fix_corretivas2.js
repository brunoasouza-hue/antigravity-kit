const fs = require('fs');
let content = fs.readFileSync('public/views/corretivas.php', 'utf8');

// 1. Fix JS quotes
content = content.replace(
    'const currentUserId = \\'<?php echo $_SESSION[\\'usuario_id\\']; ?>\\';\n            const currentUserRole = \\'<?php echo $_SESSION[\\'usuario_nivel\\']; ?>\\';',
    'const currentUserId = "<?php echo $_SESSION[\\'usuario_id\\']; ?>";\n            const currentUserRole = "<?php echo $_SESSION[\\'usuario_nivel\\']; ?>";'
);

// 2. Fix btnTramitar display logic
const oldModalLogic = `                        if (nivel === 'Gestor' && os.status === 'Pendente') {
                            selectExecutor.style.display = 'block';
                            btnTramitar.innerText = 'Atribuir a Executor';
                            btnTramitar.style.background = '#007bff';
                            btnTramitar.style.display = 'block';
                        } else if (nivel === 'Executor' && os.status === 'Em Execução') {
                            btnTramitar.innerText = 'Relatar e Concluir Serviço';
                            btnTramitar.style.background = '#28a745';
                            btnTramitar.style.display = 'block';
                        } else if (nivel === 'Solicitante' && os.status === 'Aguardando Validação') {
                            btnTramitar.innerText = 'Aprovar Serviço (Concluir)';
                            btnTramitar.style.background = '#17a2b8';
                            btnTramitar.style.display = 'block';
                        } else {`;

const newModalLogic = `                        if (nivel === 'Gestor' && os.status === 'Pendente') {
                            selectExecutor.style.display = 'block';
                            btnTramitar.innerText = 'Atribuir a Executor';
                            btnTramitar.style.background = '#007bff';
                            btnTramitar.style.display = 'block';
                        } else if (os.status === 'Em Execução' && "<?php echo $_SESSION['usuario_id']; ?>" == os.executor_atual_id) {
                            btnTramitar.innerText = 'Relatar e Concluir Serviço';
                            btnTramitar.style.background = '#28a745';
                            btnTramitar.style.display = 'block';
                        } else if (os.status === 'Aguardando Validação' && "<?php echo $_SESSION['usuario_id']; ?>" == os.solicitante_id) {
                            btnTramitar.innerText = 'Aprovar Serviço (Concluir)';
                            btnTramitar.style.background = '#17a2b8';
                            btnTramitar.style.display = 'block';
                        } else {`;

content = content.replace(oldModalLogic, newModalLogic);

// 3. Fix row table logic
const oldRowLogic = `                    let canAct = false;
                    if (currentUserRole === 'Gestor' && status === 'Pendente') {
                        canAct = true;
                    } else if (currentUserRole === 'Executor' && status.includes('Execu') && currentUserId == executorId) {
                        canAct = true;
                    } else if (currentUserRole === 'Solicitante' && status.includes('Valida') && currentUserId == solicitanteId) {
                        canAct = true;
                    }`;

const newRowLogic = `                    let canAct = false;
                    const role = currentUserRole.trim().toLowerCase();
                    const statusStr = status.toLowerCase();

                    if ((role === 'gestor' || role === 'administrador') && statusStr === 'pendente') {
                        canAct = true;
                    } else if (statusStr.includes('execu') && currentUserId == executorId) {
                        canAct = true;
                    } else if (statusStr.includes('valida') && currentUserId == solicitanteId) {
                        canAct = true;
                    }`;

content = content.replace(oldRowLogic, newRowLogic);

fs.writeFileSync('public/views/corretivas.php', content);
console.log('Fixed corretivas.php successfully!');
