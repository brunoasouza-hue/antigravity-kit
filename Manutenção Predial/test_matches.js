const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
html = html.replace(foreachRegex, (m, c) => {
    if (c.trim() === 'ordensServico') return 'ROW_MOCK_RENDERED';
    return '';
});

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
html = html.replace(ifElseRegex, (m, c) => {
    console.log('ifElse MATCHED:', c);
    return 'IF_ELSE_REPLACED';
});

const ifRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
html = html.replace(ifRegex, (m, c) => {
    console.log('if MATCHED:', c);
    return 'IF_REPLACED';
});

console.log('Final length:', html.length);
