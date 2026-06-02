const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
html = html.replace(foreachRegex, "ROWS_GO_HERE");

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
let matchCount = 0;
html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
    matchCount++;
    console.log("MATCHED COND:", condStr);
});
console.log("Total if-else blocks found AFTER foreach:", matchCount);
