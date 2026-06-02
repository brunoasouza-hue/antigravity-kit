const fs = require('fs');
let file = fs.readFileSync('public/views/corretivas.php', 'utf8');

const regexStatusPHP = /<\?php if \(\$status === 'Pendente'\): \?>[\s\S]*?<\?php endif; \?>/;
const replStatusPHP = `<?php if ($status === 'Pendente' && empty($os->getExecutorNome())): ?>
                                            <span style="background-color: rgba(255, 193, 7, 0.12); color: #ffc107; border: 1px solid #ffc107; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block;">Pendente</span>
                                        <?php endif; ?>
                                        <?php if ($status === 'Em Execução' || ($status === 'Pendente' && !empty($os->getExecutorNome()))): ?>
                                            <span style="background-color: rgba(0, 123, 255, 0.12); color: #007bff; border: 1px solid #007bff; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block;">Em Execução</span>
                                        <?php endif; ?>
                                        <?php if ($status === 'Aguardando Validação'): ?>
                                            <span style="background-color: rgba(23, 162, 184, 0.12); color: #17a2b8; border: 1px solid #17a2b8; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block;">Aguardando Validação</span>
                                        <?php endif; ?>
                                        <?php if ($status === 'Concluída'): ?>
                                            <span style="background-color: rgba(40, 167, 69, 0.12); color: #28a745; border: 1px solid #28a745; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block;">Concluída</span>
                                        <?php endif; ?>`;

const regexStatusJS = /function renderStatusBadge\(status\) \{/;
const replStatusJS = `function renderStatusBadge(status, executorNome = null) {
            if (status === 'Pendente' && executorNome) {
                status = 'Em Execução';
            }`;

const regexCallJS = /\$\{renderStatusBadge\(data\.status\)\}/;
const replCallJS = `\${renderStatusBadge(data.status, data.executor_nome)}`;


if (regexStatusPHP.test(file)) {
    file = file.replace(regexStatusPHP, replStatusPHP);
    console.log('Replaced Status PHP');
} else {
    console.error('Status PHP NOT FOUND');
}

if (regexStatusJS.test(file)) {
    file = file.replace(regexStatusJS, replStatusJS);
    console.log('Replaced Status JS');
} else {
    console.error('Status JS NOT FOUND');
}

if (regexCallJS.test(file)) {
    file = file.replace(regexCallJS, replCallJS);
    console.log('Replaced Call JS');
} else {
    console.error('Call JS NOT FOUND');
}

fs.writeFileSync('public/views/corretivas.php', file);
