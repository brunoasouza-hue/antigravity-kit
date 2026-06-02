const fs = require('fs');
const html = fs.readFileSync('public/views/corretivas.php', 'utf8');

const foreachRegex = /<\?php\s+foreach\s*\(\s*\$(.*?)\s+as\s+\$(.*?)\s*\)\s*:\s*\?>(.*?)<\?php\s+endforeach\s*;?\s*\?>/gs;
let matchCount = 0;
html.replace(foreachRegex, (match, c1, c2, body) => {
    matchCount++;
    console.log("MATCHED COLLECTION:", c1);
    console.log("MATCHED ITEM:", c2);
});
console.log("Total foreach loops found:", matchCount);

const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;
matchCount = 0;
html.replace(ifElseRegex, (match, condStr, ifBody, elseBody) => {
    matchCount++;
    console.log("MATCHED COND:", condStr);
});
console.log("Total if-else blocks found:", matchCount);
