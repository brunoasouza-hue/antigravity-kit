const fs = require('fs');
let html = fs.readFileSync('public/views/usuarios.php', 'utf8');

const regex = /<\?php foreach \(\$nivelOpcoes as \$op\): \?>\s*<option value="<\?php echo \$op; \?>"><\?php echo \$op; \?><\/option>\s*<\?php endforeach; \?>/g;

const hardcodedOptions = `
                            <option value="Solicitante">Solicitante</option>
                            <option value="Executor">Executor</option>
                            <option value="Gestor">Gestor</option>
                            <option value="Administrador">Administrador</option>
`;

html = html.replace(regex, hardcodedOptions);
fs.writeFileSync('public/views/usuarios.php', html);
console.log('Fixed nivelOpcoes in usuarios.php!');
