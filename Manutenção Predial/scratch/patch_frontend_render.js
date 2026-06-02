const fs = require('fs');

let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

// Restore lines 383-388 to a clean state that matches start_test_server.js
const oldLinesPattern = /<td style="padding: 15px; text-align: center; color: #444;"><\?php echo htmlspecialchars\(\$os->getExecutorNome\(\) \?\? 'Aprovação da Gestão'\); \?><\/td>[\s\S]*?<\/tr>/;

const newLines = `
                        <td style="padding: 15px; text-align: center; color: #444;"><?php echo htmlspecialchars($os->getExecutorNome()); ?></td>
                        <td style="padding: 15px; text-align: center;"><span class="status-badge-container" data-status="<?php echo $os->getStatus(); ?>"></span></td>
                        <td style="padding: 15px; text-align: center;">
                            <button title="Visualizar" onclick="visualizarOS(<?php echo $os->getId(); ?>)" style="background-color: #00b0ff; border: none; color: white; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; margin-right: 5px;">👁️</button>
                            <button title="Aprovar/Tramitar" onclick="abrirModalAprovacao(<?php echo $os->getId(); ?>)" class="btn-aprovar-table" style="background-color: #00e676; border: none; color: white; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; margin-right: 5px;">✓</button>
                            <button title="Excluir" style="background-color: #ff1744; border: none; color: white; width: 34px; height: 34px; border-radius: 6px; cursor: pointer;">🗑️</button>
                        </td>
                    </tr>
`.trim();

code = code.replace(oldLinesPattern, newLines);

// Also check if line 383 was the one without ?? 'Aprovação da Gestão'
const alternateOldLinesPattern = /<td style="padding: 15px; text-align: center; color: #444;"><\?php echo \$os->getExecutorNome\(\); \?><\/td>[\s\S]*?<\/tr>/;
code = code.replace(alternateOldLinesPattern, newLines);

// Inject script at the bottom to render badges and hide buttons
const scriptToInject = `
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            // Renderiza badges
            document.querySelectorAll('.status-badge-container').forEach(el => {
                const st = el.getAttribute('data-status');
                if(typeof renderStatusBadge === 'function') {
                    el.innerHTML = renderStatusBadge(st);
                }
            });
            // Esconde botões de aprovação
            document.querySelectorAll('.linha-tabela-os').forEach(row => {
                const status = row.getAttribute('data-status');
                const btnAprovar = row.querySelector('.btn-aprovar-table');
                if (btnAprovar && status !== 'Pendente') {
                    btnAprovar.style.display = 'none';
                }
            });
        });
    </script>
`;

if (!code.includes("Renderiza badges")) {
    code = code.replace(/<\/body>/, `${scriptToInject}\n</body>`);
}

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log("Patched corretivas.php for robust client-side rendering.");
