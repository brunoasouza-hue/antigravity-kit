const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
html = html.replace(foreachRegex, "ROWS_GO_HERE");

let idxStart = html.indexOf("empty($ordensServico)");
let idxEnd = html.indexOf("endif;", idxStart) + 10;
console.log("BLOCK:\\n" + html.substring(idxStart - 10, idxEnd));
