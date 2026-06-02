const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const regexFind = `{ regex: /<\\\\?php\\\\s+echo\\\\s+htmlspecialchars\\\\(\\\\s*\\\\$usuarioNivel\\\\s*\\\\)\\\\s*;?\\\\s*\\\\?>/g, val: escapeHtml(context.usuarioNivel) },`;
const regexReplace = regexFind + `
        { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$usuarioNivel\\\\s*;?\\\\s*\\\\?>/g, val: context.usuarioNivel },
        { regex: /<\\\\?php\\\\s+echo\\\\s+\\\\$usuarioId\\\\s*;?\\\\s*\\\\?>/g, val: context.usuarioId },`;

code = code.replace(regexFind, regexReplace);

fs.writeFileSync('start_test_server.js', code, 'utf8');
console.log('Fixed mock server tags for raw variables');
