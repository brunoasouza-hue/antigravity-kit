const fs = require('fs');

let php = fs.readFileSync('public/views/ambientes.php', 'utf8');

// 1. Add column to table head
const thOld = `<th style="display:table-cell;padding:13px 20px;text-align:center;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#444;border-bottom:2px solid #ddd;white-space:nowrap;">
                            Status
                        </th>`;
const thNew = `<th style="display:table-cell;padding:13px 20px;text-align:center;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#444;border-bottom:2px solid #ddd;white-space:nowrap;">
                            Família
                        </th>
                        <th style="display:table-cell;padding:13px 20px;text-align:center;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#444;border-bottom:2px solid #ddd;white-space:nowrap;">
                            Status
                        </th>`;

if (php.includes(thOld)) {
    php = php.replace(thOld, thNew);
}

// 2. Add cell to table body (PHP)
const tdOld = `<!-- Status -->
                        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">`;
const tdNew = `<!-- Família -->
                        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;font-weight:700;color:var(--corTxt3);font-size:.9rem;">
                            <?php echo htmlspecialchars($amb->getFamilia() ?? 'Geral'); ?>
                        </td>
                        <!-- Status -->
                        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">`;

if (php.includes(tdOld)) {
    php = php.replace(tdOld, tdNew);
}

// 3. Update abrirModalEdicao arguments in PHP loop
const phpEditOld = `onclick="abrirModalEdicao(<?php echo $amb->getId(); ?>, '<?php echo addslashes($amb->getNomeAmbiente()); ?>', '<?php echo $amb->getStatus(); ?>')"`;
const phpEditNew = `onclick="abrirModalEdicao(<?php echo $amb->getId(); ?>, '<?php echo addslashes($amb->getNomeAmbiente()); ?>', '<?php echo $amb->getStatus(); ?>', '<?php echo $amb->getFamilia() ?? 'Geral'; ?>')"`;

if (php.includes(phpEditOld)) {
    php = php.replace(phpEditOld, phpEditNew);
}

// 4. Update the modals
const selectHtml = `
            <div class="modal-input" style="margin-bottom:15px;">
                <label style="font-weight:bold;display:block;margin-bottom:8px;">Família:</label>
                <select name="familia" CLASS_TO_REPLACE style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--corBordas);outline:none;background:var(--corFundo);color:var(--corTxt3);">
                    <option value="Salas de Aulas">📚 Salas de Aulas</option>
                    <option value="Laboratórios">🔬 Laboratórios</option>
                    <option value="Oficinas">⚙️ Oficinas</option>
                    <option value="Administrativos">🏢 Administrativos</option>
                    <option value="Externos">🌳 Externos</option>
                    <option value="Geral">📦 Geral</option>
                </select>
            </div>`;

// Add to cadastro
const statusGroupCad = `<div class="modal-input" style="margin-bottom:20px;">
                <label for="cad_status" style="font-weight:bold;display:block;margin-bottom:8px;">Status Inicial:</label>`;
const newStatusGroupCad = selectHtml.replace('CLASS_TO_REPLACE', 'id="cad_familia"') + "\n            " + statusGroupCad;

if (php.includes(statusGroupCad)) {
    php = php.replace(statusGroupCad, newStatusGroupCad);
}

// Add to edicao
const statusGroupEd = `<div class="modal-input" style="margin-bottom:20px;">
                <label for="edit_status" style="font-weight:bold;display:block;margin-bottom:8px;">Status:</label>`;
const newStatusGroupEd = selectHtml.replace('CLASS_TO_REPLACE', 'id="edit_familia"') + "\n            " + statusGroupEd;

if (php.includes(statusGroupEd)) {
    php = php.replace(statusGroupEd, newStatusGroupEd);
}

// 5. Update JS renderRowHtml
const jsRenderOld = `function renderRowHtml(id, nome, status) {
    const isAtivo = status === 'Ativo';
    const badge = isAtivo
        ? \`<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(40,167,69,.12);color:#28a745;border:1px solid #28a745;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-check2"></i> Ativo</span>\`
        : \`<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(108,117,125,.12);color:#6c757d;border:1px solid #6c757d;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-slash-circle"></i> Inativo</span>\`;
    const n = nome.replace(/'/g,"\\\\\\'").replace(/"/g,'&quot;');
    const tog = isAtivo ? 'inativar' : 'ativar';
    const tip = isAtivo ? 'Inativar' : 'Ativar';
    const BTN = 'width:36px;height:36px;border:none;border-radius:6px;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;';
    return \`
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">\${id}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:left;vertical-align:middle;font-weight:700;text-transform:uppercase;">\${nome}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">\${badge}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">
            <div style="display:inline-flex;gap:5px;align-items:center;">
                <button type="button" style="\${BTN}background:#00c5ff;" title="Editar" onclick="abrirModalEdicao(\${id},'\${n}','\${status}')"><i class="bi bi-pencil-square"></i></button>`;

const jsRenderNew = `function renderRowHtml(id, nome, status, familia = 'Geral') {
    const isAtivo = status === 'Ativo';
    const badge = isAtivo
        ? \`<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(40,167,69,.12);color:#28a745;border:1px solid #28a745;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-check2"></i> Ativo</span>\`
        : \`<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(108,117,125,.12);color:#6c757d;border:1px solid #6c757d;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-slash-circle"></i> Inativo</span>\`;
    const n = nome.replace(/'/g,"\\\\\\'").replace(/"/g,'&quot;');
    const tog = isAtivo ? 'inativar' : 'ativar';
    const tip = isAtivo ? 'Inativar' : 'Ativar';
    const BTN = 'width:36px;height:36px;border:none;border-radius:6px;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;';
    return \`
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">\${id}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:left;vertical-align:middle;font-weight:700;text-transform:uppercase;">\${nome}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;font-weight:700;color:var(--corTxt3);font-size:.9rem;">\${familia}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">\${badge}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">
            <div style="display:inline-flex;gap:5px;align-items:center;">
                <button type="button" style="\${BTN}background:#00c5ff;" title="Editar" onclick="abrirModalEdicao(\${id},'\${n}','\${status}', '\${familia}')"><i class="bi bi-pencil-square"></i></button>`;

if (php.includes(jsRenderOld)) {
    php = php.replace(jsRenderOld, jsRenderNew);
}

// 6. Update JS modal functions
const jsModalOld = `function abrirModalEdicao(id, nome, status) {
    document.getElementById('edit_id').value     = id;
    document.getElementById('edit_nome').value   = nome;
    document.getElementById('edit_status').value = status;`;
const jsModalNew = `function abrirModalEdicao(id, nome, status, familia = 'Geral') {
    document.getElementById('edit_id').value     = id;
    document.getElementById('edit_nome').value   = nome;
    document.getElementById('edit_status').value = status;
    document.getElementById('edit_familia').value = familia;`;

if (php.includes(jsModalOld)) {
    php = php.replace(jsModalOld, jsModalNew);
}

// 7. Update fetch callback row rendering (cadastrar)
const cbCadOld = `tr.innerHTML = renderRowHtml(d.data.id, d.data.nome_ambiente, d.data.status);`;
const cbCadNew = `tr.innerHTML = renderRowHtml(d.data.id, d.data.nome_ambiente, d.data.status, d.data.familia);`;
if (php.includes(cbCadOld)) {
    php = php.replace(cbCadOld, cbCadNew);
}

// 8. Update fetch callback row rendering (editar)
const cbEdOld = `if (row) { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status); row.style.background='rgba(0,123,255,.07)'; setTimeout(()=>{row.style.background='';},900); }`;
const cbEdNew = `if (row) { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status,d.data.familia); row.style.background='rgba(0,123,255,.07)'; setTimeout(()=>{row.style.background='';},900); }`;
if (php.includes(cbEdOld)) {
    php = php.replace(cbEdOld, cbEdNew);
}

// 9. Update fetch callback row rendering (excluir inativar)
const cbExcOld = `} else { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status); }`;
const cbExcNew = `} else { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status,d.data.familia); }`;
if (php.includes(cbExcOld)) {
    php = php.replace(cbExcOld, cbExcNew);
}

fs.writeFileSync('public/views/ambientes.php', php);
