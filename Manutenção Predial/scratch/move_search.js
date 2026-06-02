const fs = require('fs');
let html = fs.readFileSync('public/views/usuarios.php', 'utf8');

// 1. Remove the old search div
const oldSearchTarget = /<div style="margin-bottom: 15px; display: flex; align-items: center; justify-content: flex-start;">\s*<input type="text" id="search-usuario"[\s\S]*?<\/div>/;
html = html.replace(oldSearchTarget, '');

// 2. Replace the content-header button area
const buttonRegex = /<button onclick="document.getElementById\('modalNovoUsuario'\)\.style\.display='flex';"[\s\S]*?<\/button>/;
const match = html.match(buttonRegex);

if (match) {
    const originalButton = match[0];
    
    // Check if it already has the search input wrapping it
    if (!html.includes('<div style="display: flex; gap: 15px; align-items: center;">')) {
        const newButtonArea = `
            <div style="display: flex; gap: 15px; align-items: center;">
                <input type="text" id="search-usuario" placeholder="🔍 Pesquisar usuário..." onkeyup="filtrarUsuariosTabela()" style="width: 300px; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14px;">
                <button onclick="document.getElementById('modalNovoUsuario').style.display='flex';" style="background: var(--corDestaque); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; white-space: nowrap;">
                    <i class="bi bi-person-plus-fill"></i> NOVO USUÁRIO
                </button>
            </div>`;
        html = html.replace(originalButton, newButtonArea);
        fs.writeFileSync('public/views/usuarios.php', html);
        console.log('Moved search to next to Novo Usuario button!');
    } else {
        console.log('Already wrapped!');
    }
} else {
    console.log('Could not find Novo Usuario button!');
}
