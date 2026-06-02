const fs = require('fs');

// 1. Revert modal select
let html = fs.readFileSync('public/views/usuarios.php', 'utf8');

// Change size="5" back to normal select in modal
html = html.replace(/<select id="select-add-ambiente" size="5"/, '<select id="select-add-ambiente"');

// 2. Add search to main table
const tableComment = '<!-- Tabela de Usuários -->';
const searchInputStr = `
        <div style="margin-bottom: 15px;">
            <input type="text" id="search-usuario" placeholder="🔍 Pesquisar usuário por nome ou email..." onkeyup="filtrarUsuariosTabela()" style="width: 100%; max-width: 400px; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14px;">
        </div>`;

// Insert the search input only if it's not already there
if (!html.includes('search-usuario')) {
    html = html.replace(tableComment, tableComment + searchInputStr);
}

// 3. Add min-height to table container
const tableContainerStart = '<div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto;">';
const tableContainerReplacement = '<div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto; min-height: 380px;">';

if (html.includes(tableContainerStart)) {
    html = html.replace(tableContainerStart, tableContainerReplacement);
}

fs.writeFileSync('public/views/usuarios.php', html);

// 4. Also add 2 extra users to the mock_database.json to visually show 5 rows
let dbStr = fs.readFileSync('mock_database.json', 'utf8');
let db = JSON.parse(dbStr);

if (db.usuarios.length === 3) {
    db.usuarios.push({
        id: 4,
        nome: "Ana Beatriz (Manutenção)",
        email: "ana.beatriz@senai.br",
        senha: "hash",
        nivel_acesso: "Executor",
        ambientes_vinculados: [20770001],
        status: "Ativo"
    });
    db.usuarios.push({
        id: 5,
        nome: "Roberto Carlos (Suporte)",
        email: "roberto.carlos@senai.br",
        senha: "hash",
        nivel_acesso: "Solicitante",
        ambientes_vinculados: [],
        status: "Ativo"
    });
    fs.writeFileSync('mock_database.json', JSON.stringify(db, null, 4));
}

console.log('Fixed everything!');
