const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
html = html.replace(foreachRegex, "ROWS_GO_HERE");

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;

let m;
while ((m = ifElseRegex.exec(html)) !== null) {
    console.log("MATCHED COND:", m[1]);
    console.log("MATCH STRING:\\n", m[0].substring(0, 50) + " ... " + m[0].substring(m[0].length - 50));
}
