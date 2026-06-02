const fs = require('fs');
let content = fs.readFileSync('start_test_server.js', 'utf8');

const regex = /if \(checks\.length < ambsAtivos\.length\) \{[\\s\\S]*?return respondJson\(false,[\\s\\S]*?\}\n/;
if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync('start_test_server.js', content);
    console.log('Backend validation removed successfully!');
} else {
    console.log('Could not find the validation block.');
}
