const fs = require('fs');

const html = fs.readFileSync('public/views/preventivas.php', 'utf8');
const ifElseRegex = /<\?php\s+if\s*\((.*?)\)\s*:\s*\?>(.*?)<\?php\s+else\s*:\s*\?>(.*?)<\?php\s+endif\s*;\s*\?>/gs;

let match;
let count = 0;
while ((match = ifElseRegex.exec(html)) !== null) {
    count++;
    console.log(`Match ${count} cond:`, match[1]);
}
console.log(`Total matches: ${count}`);
