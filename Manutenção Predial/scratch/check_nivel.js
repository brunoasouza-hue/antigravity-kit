const fs = require('fs');
const html = fs.readFileSync('public/views/usuarios.php', 'utf8');
const lines = html.split('\n');
lines.forEach((line, i) => {
    if (line.includes('name="nivel_acesso"')) {
        console.log('--- LINE', i);
        console.log(lines.slice(i, i+6).join('\n'));
    }
});
