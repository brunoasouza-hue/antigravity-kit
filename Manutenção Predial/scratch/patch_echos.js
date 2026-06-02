const fs = require('fs');

let serverCode = fs.readFileSync('start_test_server.js', 'utf8');

const echosBlock = `    const echos = [
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\['usuario_id'\\]\\s*;?\\s*\\?>/g, val: context.usuarioId },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\["usuario_id"\\]\\s*;?\\s*\\?>/g, val: context.usuarioId },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\['usuario_nivel'\\]\\s*;?\\s*\\?>/g, val: context.usuarioNivel },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\["usuario_nivel"\\]\\s*;?\\s*\\?>/g, val: context.usuarioNivel },`;

serverCode = serverCode.replace('    const echos = [', echosBlock);

fs.writeFileSync('start_test_server.js', serverCode, 'utf8');
console.log('Echos injected successfully.');
