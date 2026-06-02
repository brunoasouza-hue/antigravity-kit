const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'start_test_server.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the "corretivas.php" check
const pat1 = "if (filePath.endsWith('corretivas.php'))";
const idx1 = content.indexOf(pat1);
console.log('corretivas block at char:', idx1, 
    'line:', content.substring(0, idx1).split('\n').length);

// Show the 5 lines around it
const lines = content.split('\n');
const lineNum = content.substring(0, idx1).split('\n').length - 1;
console.log('\nContext around corretivas block:');
for (let i = Math.max(0, lineNum - 1); i < Math.min(lines.length, lineNum + 6); i++) {
    console.log(`L${i+1}: ${lines[i].substring(0, 120)}`);
}

// Also find writeFileSync
const pat2 = "writeFileSync('debug_ambientes_final.html'";
const idx2 = content.indexOf(pat2);
console.log('\ndebug write at char:', idx2, 'line:', content.substring(0, idx2).split('\n').length);
