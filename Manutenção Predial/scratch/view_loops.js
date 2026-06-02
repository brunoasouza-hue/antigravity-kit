const fs = require('fs');
const content = fs.readFileSync('start_test_server.js', 'utf8');
const lines = content.split('\n');
for (let i = 874; i <= 950; i++) {
    console.log(`${i}: ${lines[i - 1]}`);
}
