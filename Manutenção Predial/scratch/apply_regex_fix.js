const fs = require('fs');
const path = 'public/views/corretivas.php';
let html = fs.readFileSync(path, 'utf8');

// Replace else with endif; if(!empty) to avoid the regex bug in the mock server
html = html.replace(
    /<\?php else: \?>\s*<\?php foreach \(\$ordensServico as \$os\): \?>/,
    "<?php endif; ?>\\n                <?php if (!empty($ordensServico)): ?>\\n                    <?php foreach ($ordensServico as $os): ?>"
);

fs.writeFileSync(path, html);
console.log('Fixed corretivas.php to avoid mock server else regex bug.');
