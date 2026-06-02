const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');
const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
let match;
while ((match = foreachRegex.exec(html)) !== null) {
    if (match[1].trim() === 'ordensServico') {
        console.log('Body length:', match[3].length);
        console.log('Body includes inner if:', match[3].includes('getExecutorNome'));
    }
}
