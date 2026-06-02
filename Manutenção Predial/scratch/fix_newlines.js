const fs = require('fs');
const path = 'public/views/corretivas.php';
let html = fs.readFileSync(path, 'utf8');

// The exact string to replace is:
const targetString = `            <?php endif; ?>\\n                <?php if (!empty($ordensServico)): ?>\\n                    <?php foreach ($ordensServico as $os): ?>`;

html = html.replace(targetString, "            <?php foreach ($ordensServico as $os): ?>");

fs.writeFileSync(path, html);
console.log('Fixed literally injected newlines and removed condition wrappers.');
