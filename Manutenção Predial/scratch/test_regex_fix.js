const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

// Replace else with endif; if(!empty)
html = html.replace(
    /<\?php else: \?>\s*<\?php foreach \(\$ordensServico as \$os\): \?>/,
    "<?php endif; ?>\\n                <?php if (!empty($ordensServico)): ?>\\n                    <?php foreach ($ordensServico as $os): ?>"
);

// We must also fix the END of the foreach block
// Currently it is: <?php endforeach; ?> <?php endif; ?>
// Since we added an endif, there are now two endifs. That's correct.

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;

html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
    console.log("MATCH FOUND!");
    console.log("condStr:", condStr.trim());
});

fs.writeFileSync('scratch/test_corretivas.php', html);
