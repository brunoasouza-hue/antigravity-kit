const fs = require('fs');
let html = fs.readFileSync('public/views/usuarios.php', 'utf8');

// 1. Add search bar to main users table and min-height to container
const tableContainerTarget = `<!-- Tabela de Usuários -->
          <div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto;">`;
          
const tableContainerReplacement = `<!-- Tabela de Usuários -->
          <div style="margin-bottom: 15px;">
              <input type="text" id="search-usuario" placeholder="🔍 Pesquisar usuário por nome, email ou perfil..." onkeyup="filtrarUsuariosTabela()" style="width: 100%; max-width: 400px; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14px;">
          </div>
          <div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto; min-height: 350px;">`;

html = html.replace(tableContainerTarget, tableContainerReplacement);

// 2. Modify the select in the modal to size="5" and add search
const modalTarget = `<div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <select id="select-add-ambiente" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; font-size: 13px;">
                            <option value="">-- Selecione um ambiente --</option>`;

const modalReplacement = `<div style="margin-bottom: 10px;">
                        <input type="text" id="search-ambiente" placeholder="🔍 Buscar ambiente..." onkeyup="filtrarAmbientesModal()" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 8px; outline: none; font-size: 13px;">
                        <div style="display: flex; gap: 10px;">
                        <select id="select-add-ambiente" size="5" style="flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; font-size: 13px;">`;

html = html.replace(modalTarget, modalReplacement);

// 3. Add JS functions
const jsTarget = `<script>
    let ambientesSelecionados = [];`;

const jsReplacement = `<script>
    function filtrarUsuariosTabela() {
        const input = document.getElementById('search-usuario').value.toLowerCase();
        const trs = document.querySelectorAll('table tbody tr');
        trs.forEach(tr => {
            const text = tr.innerText.toLowerCase();
            tr.style.display = text.includes(input) ? '' : 'none';
        });
    }

    function filtrarAmbientesModal() {
        const input = document.getElementById('search-ambiente').value.toLowerCase();
        const select = document.getElementById('select-add-ambiente');
        for (let i = 0; i < select.options.length; i++) {
            const txt = select.options[i].text.toLowerCase();
            select.options[i].style.display = txt.includes(input) ? '' : 'none';
        }
    }

    let ambientesSelecionados = [];`;

html = html.replace(jsTarget, jsReplacement);

fs.writeFileSync('public/views/usuarios.php', html);
console.log('Fixed users and environments search and height!');
