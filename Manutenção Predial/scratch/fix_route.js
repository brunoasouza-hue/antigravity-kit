const fs = require('fs');
let server = fs.readFileSync('start_test_server.js', 'utf8');

server = server.replace(
    "if (pathname.includes('/public/views/usuarios.php')) {",
    "if (pathname.includes('/public/views/usuarios.php') || pathname.includes('UsuarioController.php')) {"
);

fs.writeFileSync('start_test_server.js', server);
console.log('Fixed route intercept in start_test_server.js');
