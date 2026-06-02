const fs = require('fs');

let content = fs.readFileSync('start_test_server.js', 'utf8');

const targetStr = `function compileConditionals(html, session, localContext = {}) {`;
const injectStr = `function compileConditionals(html, session, localContext = {}) {
    if (html.includes('historicoInspecoes')) {
         require('fs').appendFileSync('debug_eval.txt', "\\n[COMPILE] hist length: " + (localContext.historicoInspecoes ? localContext.historicoInspecoes.length : 'undefined'));
         require('fs').appendFileSync('debug_eval.txt', "\\nHTML chunk: " + html.substring(html.indexOf('<?php if (empty($historicoInspecoes)): ?>'), html.indexOf('<?php if (empty($historicoInspecoes)): ?>') + 150));
    }`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, injectStr);
    fs.writeFileSync('start_test_server.js', content);
    console.log("Injected debug log.");
}
