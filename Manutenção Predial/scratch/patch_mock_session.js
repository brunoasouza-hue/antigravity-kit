const fs = require('fs');
let code = fs.readFileSync('start_test_server.js', 'utf8');

const regexVars = `        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\['usuario_id'\\]\\s*;?\\s*\\?>/g, val: context.usuarioId },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\["usuario_id"\\]\\s*;?\\s*\\?>/g, val: context.usuarioId },`;

code = code.replace(
    /const echos = \[/,
    `const echos = [\n${regexVars}`
);

fs.writeFileSync('start_test_server.js', code, 'utf8');
console.log('start_test_server.js variables patched!');
