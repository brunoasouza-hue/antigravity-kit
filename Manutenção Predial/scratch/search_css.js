const fs = require('fs');
const content = fs.readFileSync('public/assets/css/style.css', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('btnAcao')) {
        console.log(`Line ${index + 1}: ${line}`);
    }
});
