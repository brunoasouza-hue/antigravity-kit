const fs = require('fs');
let content = fs.readFileSync('public/views/corretivas.php', 'utf8');

// 1. Fix JS quotes
content = content.replace(
    'const currentUserId = \\'<?php echo $_SESSION[\\'usuario_id\\']; ?>\\';\n            const currentUserRole = \\'<?php echo $_SESSION[\\'usuario_nivel\\']; ?>\\';',
    'const currentUserId = "<?php echo $_SESSION[\\'usuario_id\\']; ?>";\n            const currentUserRole = "<?php echo $_SESSION[\\'usuario_nivel\\']; ?>";'
);

// 2. Fix btnTramitar display logic
content = content.replace(
    'if (nivel === \\'Gestor\\' && os.status === \\'Pendente\\') {\n                            selectExecutor.style.display = \\'block\\';\n                            btnTramitar.innerText = \\'Atribuir a Executor\\';\n                            btnTramitar.style.background = \\'#007bff\\';\n                            btnTramitar.style.display = \\'block\\';\n                        } else if (nivel === \\'Executor\\' && os.status === \\'Em Execução\\') {',
    'if (nivel === \\'Gestor\\' && os.status === \\'Pendente\\') {\n                            selectExecutor.style.display = \\'block\\';\n                            btnTramitar.innerText = \\'Atribuir a Executor\\';\n                            btnTramitar.style.background = \\'#007bff\\';\n                            btnTramitar.style.display = \\'block\\';\n                        } else if (os.status === \\'Em Execução\\' && currentUserId == os.executor_atual_id) {'
);

content = content.replace(
    '} else if (nivel === \\'Solicitante\\' && os.status === \\'Aguardando Validação\\') {',
    '} else if (os.status === \\'Aguardando Validação\\' && currentUserId == os.solicitante_id) {'
);

// 3. Fix row table logic
content = content.replace(
    'let canAct = false;\n                    if (currentUserRole === \\'Gestor\\' && status === \\'Pendente\\') {\n                        canAct = true;\n                    } else if (currentUserRole === \\'Executor\\' && status.includes(\\'Execu\\') && currentUserId == executorId) {\n                        canAct = true;\n                    } else if (currentUserRole === \\'Solicitante\\' && status.includes(\\'Valida\\') && currentUserId == solicitanteId) {\n                        canAct = true;\n                    }',
    'let canAct = false;\n                    const role = currentUserRole.trim().toLowerCase();\n                    const statusStr = status.toLowerCase();\n\n                    if ((role === \\'gestor\\' || role === \\'administrador\\') && statusStr === \\'pendente\\') {\n                        canAct = true;\n                    } else if (statusStr.includes(\\'execu\\') && currentUserId == executorId) {\n                        canAct = true;\n                    } else if (statusStr.includes(\\'valida\\') && currentUserId == solicitanteId) {\n                        canAct = true;\n                    }'
);

fs.writeFileSync('public/views/corretivas.php', content);
console.log('Fixed corretivas.php');
