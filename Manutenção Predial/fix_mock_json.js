const fs = require('fs');
let js = fs.readFileSync('start_test_server.js', 'utf8');

const corretivasJson = `
            if (collectionName === 'ordensServico') {
                const detailsJson = JSON.stringify({
                    id: item.id,
                    ambiente: item.ambiente_nome,
                    data_abertura: formatDate(item.data_abertura, true),
                    status: item.status,
                    descricao: item.descricao_problema,
                    relato_servico: item.relato_servico
                }).replace(/'/g, "\\\\'");
                
                itemHtml = itemHtml.replace(/onclick="abrirModalValidacao\\(<\\?php echo \\$os->getId\\(\\); \\?>\\)"/g, \`onclick='abrirModalTramitacao(\${detailsJson})'\`);
                itemHtml = itemHtml.replace(/onclick="abrirModalDespacho\\(<\\?php echo \\$os->getId\\(\\); \\?>\\)"/g, \`onclick='abrirModalTramitacao(\${detailsJson})'\`);
                itemHtml = itemHtml.replace(/onclick="abrirModalFinalizacao\\(<\\?php echo \\$os->getId\\(\\); \\?>\\)"/g, \`onclick='abrirModalTramitacao(\${detailsJson})'\`);
                itemHtml = itemHtml.replace(/visualizarOS\\(<\\?php echo \\$os->getId\\(\\); \\?>\\)/g, \`abrirModalTramitacao(\${detailsJson})\`);

                // Fix the TR onclicks
                itemHtml = itemHtml.replace(/\\$onClick = 'onclick="abrirModalDespacho\\(' \\. \\$os->getId\\(\\) \\. '\\)"';/g, \`$onClick = "onclick='abrirModalTramitacao(\${detailsJson})'";\`);
                itemHtml = itemHtml.replace(/\\$onClick = 'onclick="abrirModalFinalizacao\\(' \\. \\$os->getId\\(\\) \\. '\\)"';/g, \`$onClick = "onclick='abrirModalTramitacao(\${detailsJson})'";\`);
            }
`;

js = js.replace(/\/\/ Tratamento especial para detalhes em preventivas\.php/, corretivasJson + "\n            // Tratamento especial para detalhes em preventivas.php");

fs.writeFileSync('start_test_server.js', js);
console.log('Server js updated with JSON builder for corretivas');
