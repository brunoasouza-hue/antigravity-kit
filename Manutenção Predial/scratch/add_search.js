const fs = require('fs');
let html = fs.readFileSync('public/views/usuarios.php', 'utf8');

const target = `<div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto; min-height: 380px;">`;

const searchInputStr = `
        <div style="margin-bottom: 15px;">
            <input type="text" id="search-usuario" placeholder="🔍 Pesquisar usuário por nome ou email..." onkeyup="filtrarUsuariosTabela()" style="width: 100%; max-width: 400px; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14px;">
        </div>\n`;

if (!html.includes('search-usuario')) {
    html = html.replace(target, searchInputStr + '        ' + target);
    fs.writeFileSync('public/views/usuarios.php', html);
    console.log('Added search to usuarios.php');
} else {
    console.log('Search already exists!');
}
