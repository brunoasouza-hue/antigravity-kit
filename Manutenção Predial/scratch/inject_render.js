const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const targetStr = `function renderTemplate(filePath, session, context = {}) {`;
const injectStr = `function renderTemplate(filePath, session, context = {}) {
    console.log("RENDER TEMPLATE CALLED FOR:", filePath);
`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, injectStr);
    fs.writeFileSync('start_test_server.js', content);
    console.log("Injected log.");
}
