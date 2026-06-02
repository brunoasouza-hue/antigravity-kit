const str = `<?php if (empty($ordensServico)): ?>
                <tr><td colspan="7" style="text-align:center; padding:20px; color:#666;">Nenhuma O.S. encontrada.</td></tr>
            <?php else: ?>
                ROWS_GO_HERE
            <?php endif; ?>`;
const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;

console.log(ifElseRegex.test(str));
