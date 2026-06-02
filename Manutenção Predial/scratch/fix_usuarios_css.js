const fs = require('fs');

let usu = fs.readFileSync('public/views/usuarios.php', 'utf8');

// Fix CSS links in head
const oldCssStr = `    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">`;

const newCssStr = `    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/modal.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/bootstrap-icons.min.css">`;

usu = usu.replace(oldCssStr, newCssStr);

// Add script.js at the end
if (!usu.includes('scripts.js')) {
    usu = usu.replace('</body>', '    <script src="../assets/js/scripts.js" defer></script>\n</body>');
}

fs.writeFileSync('public/views/usuarios.php', usu);
console.log('usuarios.php CSS and scripts fixed!');
