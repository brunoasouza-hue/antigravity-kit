
/* ── BUSCA EM TEMPO REAL (keyup) ─────────────────────────────────── */
function filtrarAmbientes(termo) {
    const t     = termo.toLowerCase().trim();
    const rows  = document.querySelectorAll('#tabela-ambientes tr[id^="row-"]');
    let visivel = 0;

    rows.forEach(row => {
        const id   = row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
        const nome = row.cells[1] ? row.cells[1].textContent.toLowerCase() : '';
        const ok   = t === '' || id.includes(t) || nome.includes(t);
        row.style.display = ok ? '' : 'none';
        if (ok) visivel++;
    });

    const el = document.getElementById('totalVisiveis');
    if (el) el.textContent = visivel;
}

/* ── TOAST ───────────────────────────────────────────────────────── */
function showToast(msg, tipo) {
    const c = document.getElementById('_tc') || (() => {
        const d = document.createElement('div');
        d.id = '_tc';
        d.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
        document.body.appendChild(d);
        return d;
    })();
    const t = document.createElement('div');
    t.style.cssText = `pointer-events:auto;background:${tipo==='success'?'rgba(40,167,69,.93)':'rgba(220,38,38,.93)'};color:#fff;padding:13px 20px;border-radius:10px;backdrop-filter:blur(8px);font-weight:600;display:flex;align-items:center;gap:9px;box-shadow:0 6px 24px rgba(0,0,0,.18);transform:translateY(-16px);opacity:0;transition:all .3s cubic-bezier(.68,-.55,.265,1.55);`;
    t.innerHTML = `<i class="bi bi-${tipo==='success'?'check-circle-fill':'exclamation-triangle-fill'}" style="font-size:1.1rem;"></i><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.transform='translateY(0)'; t.style.opacity='1'; }, 30);
    setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 3500);
}

/* ── RENDER ROW (AJAX reactive) ──────────────────────────────────── */
function renderRowHtml(id, nome, status) {
    const isAtivo = status === 'Ativo';
    const badge = isAtivo
        ? `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(40,167,69,.12);color:#28a745;border:1px solid #28a745;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-check2"></i> Ativo</span>`
        : `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(108,117,125,.12);color:#6c757d;border:1px solid #6c757d;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-slash-circle"></i> Inativo</span>`;
    const n = nome.replace(/'/g,"\\\'").replace(/"/g,'&quot;');
    const tog = isAtivo ? 'inativar' : 'ativar';
    const tip = isAtivo ? 'Inativar' : 'Ativar';
    const BTN = 'width:36px;height:36px;border:none;border-radius:6px;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;';
    return `
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">${id}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:left;vertical-align:middle;font-weight:700;text-transform:uppercase;">${nome}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">${badge}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">
            <div style="display:inline-flex;gap:5px;align-items:center;">
                <button type="button" style="${BTN}background:#00c5ff;" title="Editar" onclick="abrirModalEdicao(${id},'${n}','${status}')"><i class="bi bi-pencil-square"></i></button>
                <button type="button" style="${BTN}background:#ff2323;" title="Excluir" onclick="abrirModalExclusao(${id},'${n}')"><i class="bi bi-trash"></i></button>
                <a href="corretivas.php?ambiente_id=${id}" style="${BTN}background:#6f42c1;text-decoration:none;" title="Ordem de Serviço"><i class="bi bi-tools"></i></a>
            </div>
        </td>`;
}

/* ── MODAIS ──────────────────────────────────────────────────────── */
function abrirModalCadastro() {
    ['cad_id','cad_nome'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    document.getElementById('cad_erro').style.display='none';
    document.getElementById('adicaoAmbiente').style.display='flex';
}
function abrirModalEdicao(id, nome, status) {
    document.getElementById('edit_id').value     = id;
    document.getElementById('edit_nome').value   = nome;
    document.getElementById('edit_status').value = status;
    document.getElementById('edit_erro').style.display='none';
    document.getElementById('edicaoAmbiente').style.display='flex';
}
function abrirModalExclusao(id, nome) {
    document.getElementById('del_nome_display').innerText = nome;
    document.getElementById('del_id_inativar').value = id;
    document.getElementById('del_id_excluir').value  = id;
    document.getElementById('confirmarExclusao').style.display='flex';
}
function fecharModal(id) { document.getElementById(id).style.display='none'; }

/* ── VALIDAÇÃO ───────────────────────────────────────────────────── */
function validar(inputId) {
    const el  = document.getElementById(inputId);
    const err = document.getElementById(inputId==='cad_nome'?'cad_erro':'edit_erro');
    if (!el.value.trim()) { err.innerText='✖ Nome obrigatório.'; err.style.display='block'; el.focus(); return false; }
    if (el.value.trim().toUpperCase()==='VAZIO') { err.innerText="✖ Nome não pode ser 'VAZIO'."; err.style.display='block'; el.focus(); return false; }
    err.style.display='none'; return true;
}

/* ── AJAX: CADASTRAR ─────────────────────────────────────────────── */
function submeterFormCadastro(e) {
    e.preventDefault();
    if (!validar('cad_nome')) return false;
    const fd = new FormData(document.getElementById('form-cadastro'));
    fd.append('ajax','1');
    fetch(window.location.href, {method:'POST',headers:{'X-Requested-With':'XMLHttpRequest'},body:fd})
    .then(r=>r.json()).then(d=>{
        if (d.success) {
            showToast(d.message,'success'); fecharModal('adicaoAmbiente');
            const tbody = document.getElementById('tabela-ambientes');
            const vazia = document.getElementById('linha-vazia');
            if (vazia) vazia.remove();
            const tr = document.createElement('tr');
            tr.id = `row-${d.data.id}`;
            tr.style.cssText='display:table-row;border-bottom:1px solid #e8edf3;';
            tr.innerHTML = renderRowHtml(d.data.id, d.data.nome_ambiente, d.data.status);
            tr.style.background='rgba(40,167,69,.07)';
            const rows = [...tbody.querySelectorAll('tr[id^="row-"]')];
            const after = rows.find(r=>parseInt(r.id.replace('row-',''))>d.data.id);
            after ? tbody.insertBefore(tr,after) : tbody.appendChild(tr);
            setTimeout(()=>{tr.style.background='';},900);
            atualizarContador();
        } else { showToast(d.message,'danger'); }
    }).catch(()=>showToast('Erro de rede.','danger'));
}

/* ── AJAX: EDITAR ────────────────────────────────────────────────── */
function submeterFormEdicao(e) {
    e.preventDefault();
    if (!validar('edit_nome')) return false;
    const fd = new FormData(document.getElementById('form-edicao'));
    fd.append('ajax','1');
    fetch(window.location.href, {method:'POST',headers:{'X-Requested-With':'XMLHttpRequest'},body:fd})
    .then(r=>r.json()).then(d=>{
        if (d.success) {
            showToast(d.message,'success'); fecharModal('edicaoAmbiente');
            const row = document.getElementById(`row-${d.data.id}`);
            if (row) { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status); row.style.background='rgba(0,123,255,.07)'; setTimeout(()=>{row.style.background='';},900); }
        } else { showToast(d.message,'danger'); }
    }).catch(()=>showToast('Erro de rede.','danger'));
}

/* ── AJAX: ALTERNAR STATUS ───────────────────────────────────────── */
function alternarStatus(id, acao) {
    const fd = new FormData();
    fd.append('acao',acao); fd.append('id',id); fd.append('ajax','1');
    fetch(window.location.href, {method:'POST',headers:{'X-Requested-With':'XMLHttpRequest'},body:fd})
    .then(r=>r.json()).then(d=>{
        if (d.success) {
            showToast(d.message,'success');
            const row = document.getElementById(`row-${d.data.id}`);
            if (row) { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status); row.style.background='rgba(224,168,0,.08)'; setTimeout(()=>{row.style.background='';},900); }
        } else { showToast(d.message,'danger'); }
    }).catch(()=>showToast('Erro de rede.','danger'));
}

/* ── AJAX: EXCLUSÃO INTELIGENTE ──────────────────────────────────── */
function submeterExclusaoInteligente(e, acao) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append('ajax','1');
    fetch(window.location.href, {method:'POST',headers:{'X-Requested-With':'XMLHttpRequest'},body:fd})
    .then(r=>r.json()).then(d=>{
        if (d.success) {
            showToast(d.message,'success'); fecharModal('confirmarExclusao');
            const row = document.getElementById(`row-${d.data.id}`);
            if (row) {
                if (acao==='excluir') {
                    row.style.opacity='0'; row.style.transform='scale(.95)';
                    setTimeout(()=>{ row.remove(); atualizarContador();
                        const tbody=document.getElementById('tabela-ambientes');
                        if(!tbody.querySelector('tr[id^="row-"]')) {
                            tbody.innerHTML='<tr id="linha-vazia" style="display:table-row;"><td colspan="4" style="display:table-cell;padding:40px;text-align:center;color:#888;">Nenhum ambiente cadastrado.</td></tr>';
                        }
                    },300);
                } else { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status); }
            }
        } else { showToast(d.message,'danger'); }
    }).catch(()=>showToast('Erro de rede.','danger'));
}

/* ── CONTADOR ────────────────────────────────────────────────────── */
function atualizarContador() {
    const total = document.querySelectorAll('#tabela-ambientes tr[id^="row-"]').length;
    const el = document.getElementById('totalVisiveis');
    if (el) el.textContent = total;
    const c = document.getElementById('contadorAmbientes');
    if (c) c.textContent = `(${total} registros)`;
}

/* ── VALIDAÇÃO TEMPO REAL ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    ['cad_nome','edit_nome'].forEach(id => {
        const el  = document.getElementById(id);
        const err = document.getElementById(id==='cad_nome'?'cad_erro':'edit_erro');
        if (!el) return;
        el.addEventListener('input', () => {
            if (el.value.trim().toUpperCase()==='VAZIO') { err.innerText="✖ Nome não pode ser 'VAZIO'."; err.style.display='block'; el.style.borderColor='#fc2323'; }
            else { err.style.display='none'; el.style.borderColor=''; }
        });
    });
});
