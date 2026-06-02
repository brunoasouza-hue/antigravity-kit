const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const regexFind = `{ regex: new RegExp(\`<?=\\\\\\s*\\\\$\${itemVar}->getId\\\\(\\\\)\\\\\\s*\\\\?>\`, 'g'), val: item.id },`;
const regexReplace = regexFind + `
                { regex: new RegExp(\`<?=\\\\\\s*\\\\$\${itemVar}->getExecutorId\\\\(\\\\)\\\\\\s*\\\\?>\`, 'g'), val: item.executor_atual_id || '' },
                { regex: new RegExp(\`<?=\\\\\\s*\\\\$\${itemVar}->getSolicitanteId\\\\(\\\\)\\\\\\s*\\\\?>\`, 'g'), val: item.solicitante_id || '' },`;

code = code.replace(regexFind, regexReplace);

fs.writeFileSync('start_test_server.js', code, 'utf8');
console.log('Fixed mock server tags');
