const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
html = html.replace(foreachRegex, "ROWS_GO_HERE");

console.log("INDEX OF EMPTY COND:", html.indexOf("empty($ordensServico)"));

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;

let matches = [];
let match;
while ((match = ifElseRegex.exec(html)) !== null) {
    matches.push(match[1]);
}
console.log("MATCHES:", matches);
