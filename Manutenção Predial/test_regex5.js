const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
html = html.replace(foreachRegex, "ROWS_GO_HERE");

console.log(html.substring(15740, 15900));

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
let matchCount = 0;
html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
    matchCount++;
    if (condStr.includes("empty")) console.log("MATCHED COND:", condStr);
});
