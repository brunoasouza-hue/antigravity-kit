const fs = require('fs');
let lines = fs.readFileSync('start_test_server.js', 'utf8').split('\\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (checks.length < ambsAtivos.length) {')) {
        skip = true;
    }
    
    if (!skip) {
        newLines.push(lines[i]);
    }
    
    if (skip && lines[i].includes('}')) {
        skip = false;
    }
}

fs.writeFileSync('start_test_server.js', newLines.join('\\n'));
console.log('Backend validation removed via lines!');
