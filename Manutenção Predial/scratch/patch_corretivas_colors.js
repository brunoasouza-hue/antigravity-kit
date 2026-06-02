const fs = require('fs');

let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

// 1. Add CSS for badges
const css = `
    <style>
        .badge-status {
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
        }
        .badge-status[data-status="Pendente"],
        .badge-status[data-status="Aguardando Aprovação"] { background-color: rgba(255, 152, 0, 0.12) !important; color: #ff9800 !important; }
        .badge-status[data-status="Em Execução"] { background-color: rgba(2, 119, 189, 0.12) !important; color: #0277bd !important; }
        .badge-status[data-status="Aguardando Validação"] { background-color: rgba(106, 27, 154, 0.12) !important; color: #6a1b9a !important; }
        .badge-status[data-status="Concluída"] { background-color: rgba(46, 125, 50, 0.12) !important; color: #2e7d32 !important; }
        .badge-status[data-status="Recusada"],
        .badge-status[data-status="Arquivada"] { background-color: rgba(198, 40, 40, 0.12) !important; color: #c62828 !important; }
    </style>
`;

if (!code.includes('.badge-status')) {
    code = code.replace(/<\/style>/, `</style>\n${css}`);
}

// 2. Replace the hardcoded green span in the table with dynamic badge-status span
code = code.replace(
    /<span style="background-color: #e8f5e9; color: #2e7d32; padding: 5px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;"><\?php echo \$os->getStatus\(\); \?><\/span>/g,
    '<span class="badge-status" data-status="<?php echo $os->getStatus(); ?>"><?php echo $os->getStatus(); ?></span>'
);

// 3. Update the renderStatusBadge in JS
const renderStatusJs = `
        function renderStatusBadge(status) {
            let color = '#777', bg = '#eee', icon = 'bi-record-circle';
            if (status === 'Pendente' || status === 'Aguardando Aprovação') {
                color = '#ff9800'; bg = 'rgba(255, 152, 0, 0.12)'; icon = 'bi-hourglass-split';
            } else if (status === 'Em Execução') {
                color = '#0277bd'; bg = 'rgba(2, 119, 189, 0.12)'; icon = 'bi-gear-fill';
            } else if (status === 'Aguardando Validação') {
                color = '#6a1b9a'; bg = 'rgba(106, 27, 154, 0.12)'; icon = 'bi-clock-fill';
            } else if (status === 'Concluída') {
                color = '#2e7d32'; bg = 'rgba(46, 125, 50, 0.12)'; icon = 'bi-check2-all';
            } else if (status === 'Recusada' || status === 'Arquivada') {
                color = '#c62828'; bg = 'rgba(198, 40, 40, 0.12)'; icon = 'bi-x-circle-fill';
            }
            return \`<span style="background-color: \${bg}; color: \${color}; border: 1px solid \${color}; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi \${icon}"></i> \${status}</span>\`;
        }
`;

// Replace the old renderStatusBadge
const oldRenderBadgePattern = /function renderStatusBadge\(status\) \{[\s\S]*?return '';\s*\}/;
code = code.replace(oldRenderBadgePattern, renderStatusJs.trim());

// 4. Update visualizing OS badge generator
const oldVisBadgePattern = /let badgeHtml = '';\s*if \(statusVal === 'Pendente'\) \{[\s\S]*?document\.getElementById\('vis_status'\)\.innerHTML = badgeHtml;/;
const newVisBadgeStr = `
                    const badgeHtml = renderStatusBadge(statusVal);
                    document.getElementById('vis_status').innerHTML = badgeHtml;
`;
code = code.replace(oldVisBadgePattern, newVisBadgeStr.trim());

// 5. Hide 'V' button if status is not Pendente
code = code.replace(
    /<button title="Aprovar\/Tramitar" onclick="abrirModalAprovacao\(<\?php echo \$os->getId\(\); \?>\)" style="(.*?)"(.*?)>V<\/button>/g,
    `<?php if ($os->getStatus() === 'Pendente'): ?>
                            <button title="Aprovar/Tramitar" onclick="abrirModalAprovacao(<?php echo $os->getId(); ?>)" style="$1"$2>V</button>
                            <?php endif; ?>`
);

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log("Patched corretivas.php for colors and table button logic.");
