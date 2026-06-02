const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');
const search = `if (checks.length < ambsAtivos.length) {`;
const startIdx = content.indexOf(search);

if (startIdx !== -1) {
    const endIdx = content.indexOf('}', startIdx) + 1;
    const block = content.substring(startIdx, endIdx);
    content = content.replace(block, '');
    fs.writeFileSync('start_test_server.js', content);
    console.log('Removed validation block securely!');
} else {
    console.log('Block not found!');
}
