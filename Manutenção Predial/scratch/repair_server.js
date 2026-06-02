/**
 * Repair start_test_server.js - replace broken corretivas.php block (lines 1139-1207)
 * with the correct code, then restore compile + ambientes blocks in sequence.
 */
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'start_test_server.js');
const lines = fs.readFileSync(serverPath, 'utf8').split('\n');

// Lines are 1-indexed. We'll replace lines 1139 through 1207 (inclusive).
const START_LINE = 1139; // "    if (filePath.endsWith('corretivas.php')) {"
const END_LINE   = 1207; // "    // ─────────────────..."

const replacement = [
    "    if (filePath.endsWith('corretivas.php')) {",
    "        currentOS = ordensServico.map(os => {",
    "            const amb  = ambientes.find(a => a.id === os.ambiente_id)   || {};",
    "            const sol  = usuarios.find(u => u.id === os.solicitante_id)  || {};",
    "            const gest = usuarios.find(u => u.id === os.gestor_id)       || {};",
    "            const exec = usuarios.find(u => u.id === os.executor_atual_id) || {};",
    "            return {",
    "                ...os,",
    "                ambiente_nome:    amb.nome_ambiente || 'Desconhecido',",
    "                solicitante_nome: sol.nome          || 'Desconhecido',",
    "                gestor_nome:      gest.nome         || 'Pendente',",
    "                executor_nome:    exec.nome         || 'Não Atribuído'",
    "            };",
    "        });",
    "",
    "        if (session.usuario_nivel === 'Solicitante') {",
    "            currentOS = currentOS.filter(os => os.solicitante_id === session.usuario_id);",
    "        } else if (session.usuario_nivel === 'Executor') {",
    "            currentOS = currentOS.filter(os =>",
    "                os.executor_atual_id === session.usuario_id ||",
    "                os.solicitante_id    === session.usuario_id",
    "            );",
    "        }",
    "        currentOS.sort((a, b) => b.id - a.id);",
    "    }",
    "",
    "    const dbContext = {",
    "        ambientes: filteredAmbientes,",
    "        currentChecklists,",
    "        currentOS,",
    "        executores,",
    "        rankingAmbientes,",
    "        maxOS,",
    "        pesquisa,",
    "        dashboard_analise,",
    "        historicoInspecoes: historico",
    "    };",
    "",
    "    // Compilação em cascata (Loops -> Condicionais -> Variáveis)",
    "    html = compileLoops(html, session, dbContext);",
    "    for (let i = 0; i < 3; i++) {",
    "        html = compileConditionals(html, session, { historicoInspecoes: dbContext.historicoInspecoes });",
    "    }",
    "    html = compileVariables(html, {",
    "        ...context,",
    "        dashboard_analise,",
    "        dadosStatus:    context.dadosStatus    || 'null',",
    "        dadosTendencia: context.dadosTendencia || 'null',",
    "        dadosRanking:   context.dadosRanking   || 'null',",
    "        dadosFluxo:     context.dadosFluxo     || 'null',",
    "        dadosCarga:     context.dadosCarga     || 'null',",
    "        totalOS:        context.totalOS        || 0,",
    "    });",
    "",
    "    // ── Gerador Direto da Tabela de Ambientes ──────────────────────────────",
    "    if (filePath.endsWith('ambientes.php')) {",
    "        const POR_PAG     = 20;",
    "        const pageParam   = parseInt(getParams.page) || 1;",
    "        const totalItems  = filteredAmbientes.length;",
    "        const totalPags   = Math.max(1, Math.ceil(totalItems / POR_PAG));",
    "        const paginaAtual = Math.max(1, Math.min(totalPags, pageParam));",
    "        const pageItems   = filteredAmbientes.slice((paginaAtual - 1) * POR_PAG, paginaAtual * POR_PAG);",
    "        const BTN_STYLE   = 'width:36px;height:36px;border:none;border-radius:6px;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;';",
    "",
    "        // ── 1. Tbody ─────────────────────────────────────────────────",
    "        const tbodyStart = html.indexOf('<tbody id=\"tabela-ambientes\"');",
    "        const tbodyEnd   = html.indexOf('</tbody>', tbodyStart);",
    "        if (tbodyStart !== -1 && tbodyEnd !== -1) {",
    "            let rowsHtml = '';",
    "            if (pageItems.length === 0) {",
    "                rowsHtml = `<tr id=\"linha-vazia\" style=\"display:table-row;\"><td colspan=\"4\" style=\"display:table-cell;padding:40px;text-align:center;color:#888;font-size:.95rem;\">Nenhum ambiente cadastrado.</td></tr>`;",
    "            } else {",
    "                pageItems.forEach(amb => {",
    "                    const isAtivo    = amb.status === 'Ativo';",
    "                    const badge      = isAtivo",
    "                        ? `<span style=\"display:inline-flex;align-items:center;gap:5px;background:rgba(40,167,69,.12);color:#28a745;border:1px solid #28a745;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;\"><i class=\"bi bi-check2\"></i> Ativo</span>`",
    "                        : `<span style=\"display:inline-flex;align-items:center;gap:5px;background:rgba(108,117,125,.12);color:#6c757d;border:1px solid #6c757d;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;\"><i class=\"bi bi-slash-circle\"></i> Inativo</span>`;",
    "                    const safeName   = escapeHtml(amb.nome_ambiente || '');",
    "                    const safeNameJs = (amb.nome_ambiente || '').replace(/'/g, \"\\\\'\").replace(/\"/g, '&quot;');",
    "                    const familia    = amb.familia || 'Geral';",
    "                    const tog        = isAtivo ? 'inativar' : 'ativar';",
    "                    const tip        = isAtivo ? 'Inativar' : 'Ativar';",
    "                    rowsHtml += `",
    "                        <tr id=\"row-${amb.id}\" style=\"display:table-row;border-bottom:1px solid #e8edf3;transition:background .15s;\">",
    "                            <td style=\"display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;\">${amb.id}</td>",
    "                            <td style=\"display:table-cell;padding:13px 20px;text-align:left;vertical-align:middle;font-weight:700;text-transform:uppercase;\">${safeName}</td>",
    "                            <td style=\"display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;\">${badge}</td>",
    "                            <td style=\"display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;\">",
    "                                <div style=\"display:inline-flex;gap:5px;align-items:center;\">",
    "                                    <button type=\"button\" style=\"${BTN_STYLE}background:#00c5ff;\" title=\"Editar\" onclick=\"abrirModalEdicao(${amb.id},'${safeNameJs}','${amb.status}')\"><i class=\"bi bi-pencil-square\"></i></button>",
    "                                    <button type=\"button\" style=\"${BTN_STYLE}background:#ff2323;\" title=\"Excluir\" onclick=\"abrirModalExclusao(${amb.id},'${safeNameJs}')\"><i class=\"bi bi-trash\"></i></button>",
    "                                    <a href=\"corretivas.php?ambiente_id=${amb.id}\" style=\"${BTN_STYLE}background:#6f42c1;text-decoration:none;\" title=\"Ordem de Serviço\"><i class=\"bi bi-tools\"></i></a>",
    "                                </div>",
    "                            </td>",
    "                        </tr>`;",
    "                });",
    "            }",
    "            // Garante o atributo style na tag tbody também",
    "            const tbodyOpenEnd = html.indexOf('>', tbodyStart) + 1;",
    "            html = html.slice(0, tbodyStart)",
    "                + `<tbody id=\"tabela-ambientes\" style=\"display:table-row-group;\">${rowsHtml}</tbody>`",
    "                + html.slice(tbodyEnd + '</tbody>'.length);",
    "        }",
    "",
    "        // ── 2. Totalizador e Paginação ───────────────────────────────────────────",
    "        html = html.replace(",
    "            /\\(<span id=\"totalVisiveis\">\\d+<\\/span>\\) de \\d+ ambientes/,",
    "            `(<span id=\"totalVisiveis\">${pageItems.length}</span>) de ${totalItems} ambientes`",
    "        );",
    "        html = html.replace(",
    "            /<small id=\"contadorAmbientes\"[^>]*>\\(\\d+ registros\\)<\\/small>/,",
    "            `<small id=\"contadorAmbientes\" style=\"font-size:.75rem;font-weight:500;color:var(--corTxt2);margin-left:6px;\">(${totalItems} registros)</small>`",
    "        );",
    "",
    "        let pagHTML = '';",
    "        if (totalPags > 1) {",
    "            const qs = pesquisa ? `&search=${encodeURIComponent(pesquisa)}` : '';",
    "            pagHTML += '<div style=\"display:flex;gap:5px;\">';",
    "            if (paginaAtual > 1) {",
    "                pagHTML += `<a href=\"?page=${paginaAtual - 1}${qs}\" style=\"padding:6px 12px;border:1px solid var(--corBordas);border-radius:4px;color:var(--corTxt3);text-decoration:none;\">&laquo; Ant</a>`;",
    "            }",
    "            pagHTML += `<span style=\"padding:6px 12px;background:var(--corBase);color:#fff;border-radius:4px;\">${paginaAtual} de ${totalPags}</span>`;",
    "            if (paginaAtual < totalPags) {",
    "                pagHTML += `<a href=\"?page=${paginaAtual + 1}${qs}\" style=\"padding:6px 12px;border:1px solid var(--corBordas);border-radius:4px;color:var(--corTxt3);text-decoration:none;\">Próx &raquo;</a>`;",
    "            }",
    "            pagHTML += '</div>';",
    "        }",
    "        html = html.replace('<!-- INJETAR_PAGINACAO -->', pagHTML);",
    "",
    "        require('fs').writeFileSync('debug_ambientes_final.html', html);",
    "    }",
    "    // ──────────────────────────────────────────────────────────────────────",
];

// Replace lines START_LINE to END_LINE (0-indexed: START_LINE-1 to END_LINE-1)
const before  = lines.slice(0, START_LINE - 1);
const after   = lines.slice(END_LINE);
const newLines = [...before, ...replacement, ...after];
fs.writeFileSync(serverPath, newLines.join('\n'));
console.log('✅ Repair complete! New line count:', newLines.length);

// Quick syntax check
const { execSync } = require('child_process');
try {
    execSync(`node --check "${serverPath}"`, { stdio: 'pipe' });
    console.log('✅ Syntax check PASSED');
} catch(e) {
    console.error('❌ Syntax check FAILED:', e.stderr.toString());
}
