const fs = require('fs');
let html = fs.readFileSync('public/views/usuarios.php', 'utf8');

const target = `<div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto; min-height: 380px;">`;
const targetAlt = `<div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto;">`;

const searchInputStr = `
        <div style="margin-bottom: 15px; display: flex; align-items: center; justify-content: flex-start;">
            <input type="text" id="search-usuario" placeholder="🔍 Pesquisar usuário por nome ou email..." onkeyup="filtrarUsuariosTabela()" style="width: 100%; max-width: 400px; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14px; margin-top: 10px;">
        </div>\n`;

if (!html.includes('id="search-usuario"')) {
    if (html.includes(target)) {
        html = html.replace(target, searchInputStr + '        ' + target);
        fs.writeFileSync('public/views/usuarios.php', html);
        console.log('Added search to usuarios.php');
    } else if (html.includes(targetAlt)) {
        html = html.replace(targetAlt, searchInputStr + '        ' + targetAlt.replace('overflow-x: auto;">', 'overflow-x: auto; min-height: 380px;">'));
        fs.writeFileSync('public/views/usuarios.php', html);
        console.log('Added search and min-height to usuarios.php');
    } else {
        console.log('Could not find target container!');
    }
} else {
    console.log('Search already exists!');
}
