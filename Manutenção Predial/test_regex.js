const fs = require('fs');
const html = fs.readFileSync('public/views/corretivas.php', 'utf8');
const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
let match;
while ((match = foreachRegex.exec(html)) !== null) {
    console.log('Found foreach for:', match[1]);
}
