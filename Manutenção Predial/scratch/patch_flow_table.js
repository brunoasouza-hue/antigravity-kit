const fs = require('fs');
let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

// 1. Add data attributes to TR
code = code.replace(
    /<tr class="linha-tabela-os" data-status="<\?php echo \$os->getStatus\(\); \?>"/,
    `<tr class="linha-tabela-os" data-status="<?php echo $os->getStatus(); ?>" data-executor-id="<?php echo $os->getExecutorId(); ?>" data-solicitante-id="<?php echo $os->getSolicitanteId(); ?>"`
);

// 2. Inject current user variables into the JS patch section
code = code.replace(
    /const rows = document\.querySelectorAll\('\.linha-tabela-os'\);/,
    `const currentUserId = '<?php echo $_SESSION["usuario_id"]; ?>';\n                const currentUserRole = '<?php echo $usuarioNivel; ?>';\n                const rows = document.querySelectorAll('.linha-tabela-os');`
);

// 3. Update the visibility logic for the Action button in the JS patch
const oldVisibilityLogic = `                const btnAprovar = row.querySelector('.btn-aprovar-table');
                if (btnAprovar && status !== 'Pendente') {
                    btnAprovar.style.display = 'none';
                }`;

const newVisibilityLogic = `                const btnAprovar = row.querySelector('.btn-aprovar-table');
                if (btnAprovar) {
                    const executorId = row.getAttribute('data-executor-id');
                    const solicitanteId = row.getAttribute('data-solicitante-id');
                    
                    let canAct = false;
                    if (currentUserRole === 'Gestor' && status === 'Pendente') {
                        canAct = true;
                    } else if (currentUserRole === 'Executor' && status === 'Em Execução' && currentUserId == executorId) {
                        canAct = true;
                    } else if (currentUserRole === 'Solicitante' && status === 'Aguardando Validação' && currentUserId == solicitanteId) {
                        canAct = true;
                    }
                    
                    if (!canAct) {
                        btnAprovar.style.display = 'none';
                    } else {
                        // Change icon depending on action
                        if (currentUserRole === 'Executor') btnAprovar.innerHTML = '<i class="bi bi-hammer"></i>';
                        if (currentUserRole === 'Solicitante') btnAprovar.innerHTML = '<i class="bi bi-check-all"></i>';
                    }
                }`;

code = code.replace(oldVisibilityLogic, newVisibilityLogic);

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log('corretivas.php table logic patched!');
