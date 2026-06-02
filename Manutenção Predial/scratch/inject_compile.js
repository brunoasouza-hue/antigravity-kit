const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const targetStr = `function compilePhp(filePath, session, getParams = {}) {`;
const injectStr = `function compilePhp(filePath, session, getParams = {}) {
    console.log("COMPILE PHP CALLED FOR:", filePath);
`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, injectStr);
    fs.writeFileSync('start_test_server.js', content);
    console.log("Injected log.");
}
