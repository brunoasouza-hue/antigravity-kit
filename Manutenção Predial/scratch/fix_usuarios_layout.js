const fs = require('fs');

const amb = fs.readFileSync('public/views/ambientes.php', 'utf8');

const navStart = amb.indexOf('<nav class="sidebar">');
const navEnd = amb.indexOf('</nav>') + 6;
let sidebarHtml = amb.substring(navStart, navEnd);
sidebarHtml = sidebarHtml.replace('<a href="./ambientes.php" class="ativo links">', '<a href="./ambientes.php" class="links">');
sidebarHtml = sidebarHtml.replace('<a href="./usuarios.php" class="links">', '<a href="./usuarios.php" class="ativo links">');

const headerStart = amb.indexOf('<div class="div-header">');
const headerEnd = amb.indexOf('<!-- ALERTAS -->');
const headerHtml = amb.substring(headerStart, headerEnd);

let usu = fs.readFileSync('public/views/usuarios.php', 'utf8');

usu = usu.replace("<?php include __DIR__ . '/includes/header.php'; ?>", sidebarHtml);
usu = usu.replace("<?php include __DIR__ . '/includes/sidebar.php'; ?>", "");

usu = usu.replace('<main class="main-content">', '<section class="sec-main">\n' + headerHtml);
usu = usu.replace('</main>', '</section>');

fs.writeFileSync('public/views/usuarios.php', usu);
console.log('usuarios.php was fixed with hardcoded nav and header!');
