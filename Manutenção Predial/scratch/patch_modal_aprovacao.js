const fs = require('fs');

let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

// 1. Rewrite the aprov_buttons_container and add aprov_reject_container
const oldButtonsContainerPattern = /<div id="aprov_buttons_container"[\s\S]*?<\/div>\s*<!-- ENCAMINHAR FORWARD CONTAINER -->/;

const newButtonsHtml = `
            <div id="aprov_buttons_container" style="display: flex; justify-content: space-between; gap: 15px;">
                <button onclick="document.getElementById('aprov_buttons_container').style.display='none'; document.getElementById('aprov_forward_container').style.display='block';" style="background: #00e676; color: #fff; border: none; border-radius: 25px; padding: 14px 24px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; justify-content: center; transition: 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bi bi-check-circle" style="font-size: 18px;"></i> APROVAR
                </button>
                <button onclick="document.getElementById('aprov_buttons_container').style.display='none'; document.getElementById('aprov_reject_container').style.display='block';" style="background: #ff1744; color: #fff; border: none; border-radius: 25px; padding: 14px 24px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; justify-content: center; transition: 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bi bi-x-circle" style="font-size: 18px;"></i> RECUSAR
                </button>
                <input type="hidden" id="aprov_id_hidden">
            </div>

            <!-- RECUSAR CONTAINER -->
            <div id="aprov_reject_container" style="display: none; background: #ffebee; padding: 20px; border-radius: 12px; margin-top: 15px; border: 1px solid #ffcdd2;">
                <h4 style="margin: 0 0 15px 0; color: #c62828; font-size: 16px;">Recusar Ordem de Serviço</h4>
                
                <div style="font-size: 11px; color: #555; font-weight: 700; margin-bottom: 6px;">JUSTIFICATIVA (Obrigatória):</div>
                <textarea id="aprov_reject_obs" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ef9a9a; margin-bottom: 15px; outline: none; background: #fff;" rows="3" placeholder="Ex: Manutenção não pertinente..."></textarea>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="document.getElementById('aprov_reject_container').style.display='none'; document.getElementById('aprov_buttons_container').style.display='flex';" style="background: #e0e0e0; color: #555; border: none; border-radius: 8px; padding: 12px; flex: 1; font-weight: bold; cursor: pointer;">CANCELAR</button>
                    <button onclick="confirmarRecusa()" style="background: #d32f2f; color: white; border: none; border-radius: 8px; padding: 12px; flex: 2; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="bi bi-archive-fill"></i> CONFIRMAR E ARQUIVAR
                    </button>
                </div>
            </div>

            <!-- ENCAMINHAR FORWARD CONTAINER -->
`;
code = code.replace(oldButtonsContainerPattern, newButtonsHtml.trim() + "\n");

// 2. Add confirmarRecusa function
const confirmarRecusaScript = `
    function confirmarRecusa() {
        const id = document.getElementById('aprov_id_hidden').value;
        const obs = document.getElementById('aprov_reject_obs').value;

        if (!obs.trim()) {
            alert("A justificativa é obrigatória.");
            return;
        }

        const params = new URLSearchParams();
        params.append('acao', 'recusar_os');
        params.append('os_id', id);
        params.append('justificativa', obs);
        params.append('ajax', '1');

        fetch(window.location.href, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
            body: params.toString()
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('modalAprovacao').style.display = 'none';
                if (typeof showToast === 'function') {
                    showToast(data.message, 'success');
                } else {
                    alert(data.message);
                }
                setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.message || 'Erro ao recusar.');
            }
        })
        .catch(err => {
            console.error(err);
            alert("Erro de rede.");
        });
    }
`;

const insertAfterPattern = /function confirmarEncaminhamentoRapido\(\) \{[\s\S]*?\}\s*<\/script>/;
code = code.replace(insertAfterPattern, (match) => {
    return match.replace(/<\/script>/, confirmarRecusaScript + "\n    </script>");
});

// Fix to clear text areas when opening modal
const abrirModalPattern = /document\.getElementById\('aprov_destino_nome'\)\.innerText = executor;/;
code = code.replace(abrirModalPattern, `document.getElementById('aprov_destino_nome').innerText = executor;\n                    document.getElementById('aprov_reject_obs').value = '';\n                    document.getElementById('aprov_nova_obs').value = '';\n                    document.getElementById('aprov_buttons_container').style.display='flex';\n                    document.getElementById('aprov_reject_container').style.display='none';\n                    document.getElementById('aprov_forward_container').style.display='none';`);


fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log("Patched corretivas.php for modalAprovacao layout and behavior.");
