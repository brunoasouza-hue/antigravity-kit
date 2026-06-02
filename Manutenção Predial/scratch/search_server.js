const fs = require('fs');
const content = fs.readFileSync('start_test_server.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('ambientes.php') || line.includes('getNomeAmbiente')) {
        console.log(`Line ${index + 1}: ${line}`);
    }
});
