const fs = require('fs');

let serverCode = fs.readFileSync('start_test_server.js', 'utf8');

const regex1 = /itemHtml = itemHtml\.replace\(new RegExp\(`\\\\\$\\\$\{itemVar\}->getExecutorId\\\\\\(\\\\\\)`,\s*'g'\),\s*item\.executor_atual_id\s*\|\|\s*'null'\);/g;
const regex2 = /itemHtml = itemHtml\.replace\(new RegExp\(`\\\\\$\\\$\{itemVar\}->getSolicitanteId\\\\\\(\\\\\\)`,\s*'g'\),\s*item\.solicitante_id\s*\|\|\s*'null'\);/g;

serverCode = serverCode.replace(regex1, `itemHtml = itemHtml.replace(new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getExecutorId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), item.executor_atual_id || 'null');`);
serverCode = serverCode.replace(regex2, `itemHtml = itemHtml.replace(new RegExp(\`<\\\\?php\\\\s+echo\\\\s+\\\\$\\\${itemVar}->getSolicitanteId\\\\(\\\\)\\\\s*;?\\\\s*\\\\?>\`, 'g'), item.solicitante_id || 'null');`);

fs.writeFileSync('start_test_server.js', serverCode, 'utf8');
console.log('Fixed getExecutorId and getSolicitanteId regexes!');
