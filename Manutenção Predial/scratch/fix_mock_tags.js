const fs = require('fs');
const path = 'C:\\\\Users\\\\Instrutor\\\\OneDrive - SESISENAISP - Corporativo\\\\PESSOAL\\\\Documents\\\\ANTIGRAVITY\\\\Manutenção Predial\\\\public\\\\views\\\\corretivas.php';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix data-status
content = content.replace(
    /data-status="<\?php echo strtoupper\(htmlspecialchars\(\$os->getStatus\(\)\)\); \?>"/g,
    'data-status="<?php echo $os->getStatus(); ?>"'
);

// 2. Fix ambiente_nome_view
content = content.replace(
    /<\?php echo htmlspecialchars\(\$os->ambiente_nome_view \?\? 'Desconhecido'\); \?>/g,
    "<?php echo htmlspecialchars($os->getAmbienteNome() ?? 'Desconhecido'); ?>"
);

// 3. Fix solicitante_nome_view
content = content.replace(
    /<\?php echo htmlspecialchars\(\$os->solicitante_nome_view \?\? 'N\/A'\); \?>/g,
    "<?php echo htmlspecialchars($os->getSolicitanteNome() ?? 'N/A'); ?>"
);

// 4. Fix executor_nome_view
content = content.replace(
    /<\?php echo htmlspecialchars\(\$os->executor_nome_view \?\? 'Não Atribuído'\); \?>/g,
    "<?php echo htmlspecialchars($os->getExecutorNome()); ?>"
);

// 5. Fix Javascript function lost during replacement
if (!content.includes('function filtrarTabela()')) {
    const jsFunc = `        // Filtro visual rápido
        const inputPesquisa = document.getElementById('pesquisa');
        const selectStatus = document.getElementById('filtro-status');

        function filtrarTabela() {
            const termo = (inputPesquisa ? inputPesquisa.value.toLowerCase().trim() : '');
            const statusFiltro = (selectStatus ? selectStatus.value.toUpperCase() : '');
            const linhas = document.querySelectorAll('.linha-tabela-os');
            let visiveis = 0;

            linhas.forEach(linha => {
                const texto = linha.textContent.toLowerCase();
                const statusLinha = (linha.getAttribute('data-status') || '').toUpperCase();
                
                const matchTexto = (termo === '' || texto.includes(termo));
                const matchStatus = (statusFiltro === '' || statusLinha === statusFiltro);

                if (matchTexto && matchStatus) {
                    linha.style.display = '';
                    visiveis++;
                } else {
                    linha.style.display = 'none';
                }
            });

            // Lida com tabela vazia
            const tbody = document.getElementById('corpoTabelaOS');
            let linhaVazia = document.getElementById('linha-vazia');
            if (visiveis === 0) {
                if (!linhaVazia && tbody) {
                    const tr = document.createElement('tr');
                    tr.id = 'linha-vazia';
                    tr.innerHTML = \`<td colspan="7" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhum chamado corresponde aos filtros.</td>\`;
                    tbody.appendChild(tr);
                }
            } else {
                if (linhaVazia) {
                    linhaVazia.remove();
                }
            }
        }

        if(inputPesquisa) inputPesquisa.addEventListener('keyup', filtrarTabela);
        if(selectStatus) selectStatus.addEventListener('change', filtrarTabela);

        // Run initially
        filtrarTabela();
`;
    // Insert before closing script tag or at end of file
    if (content.includes('});\n    </script>')) {
        content = content.replace('});\n    </script>', jsFunc + '\n    });\n    </script>');
    } else {
        content = content.replace('</script>', jsFunc + '\n    </script>');
    }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed corretivas.php PHP tags for mock server parsing.');
