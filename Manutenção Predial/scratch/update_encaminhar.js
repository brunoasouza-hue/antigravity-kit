const fs = require('fs');
const path = 'public/views/corretivas.php';
let html = fs.readFileSync(path, 'utf8');

const replacement = `
            <div id="aprov_buttons_container" style="display: flex; justify-content: space-between; gap: 15px;">
                <button onclick="document.getElementById('modalAprovacao').style.display='none'; abrirModalTramitacao(document.getElementById('aprov_id_hidden').value)" style="background: #9d50bb; color: #fff; border: none; border-radius: 25px; padding: 14px 24px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; justify-content: center; transition: 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bi bi-clock-history" style="font-size: 18px;"></i> HISTÓRICO
                </button>
                <button onclick="document.getElementById('modalAprovacao').style.display='none'; abrirModalTramitacao(document.getElementById('aprov_id_hidden').value)" style="background: #607d8b; color: #fff; border: none; border-radius: 25px; padding: 14px 24px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; justify-content: center; transition: 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bi bi-chat-left-text" style="font-size: 18px;"></i> OBSERVAÇÃO
                </button>
                <button onclick="document.getElementById('aprov_buttons_container').style.display='none'; document.getElementById('aprov_forward_container').style.display='block';" style="background: #00bfa5; color: #fff; border: none; border-radius: 25px; padding: 14px 24px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1.2; justify-content: center; transition: 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bi bi-send" style="font-size: 18px;"></i> ENCAMINHAR
                </button>
                <input type="hidden" id="aprov_id_hidden">
            </div>

            <!-- ENCAMINHAR FORWARD CONTAINER -->
            <div id="aprov_forward_container" style="display: none; background: #f0f4f8; padding: 20px; border-radius: 12px; margin-top: 15px; border: 1px solid #dce4ec;">
                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Encaminhar para Executor</h4>
                
                <div style="font-size: 11px; color: #555; font-weight: 700; margin-bottom: 6px;">SELECIONE O EXECUTOR RESPONSÁVEL:</div>
                <select id="aprov_novo_executor" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 15px; outline: none; background: #fff;">
                    <option value="" disabled selected>Selecione o usuário executor...</option>
                    <?php foreach($executores as $exe): ?>
                        <option value="<?php echo $exe->getId(); ?>"><?php echo htmlspecialchars($exe->getNome()); ?></option>
                    <?php endforeach; ?>
                </select>
                
                <div style="font-size: 11px; color: #555; font-weight: 700; margin-bottom: 6px;">ADICIONAR OBSERVAÇÃO AO HISTÓRICO:</div>
                <textarea id="aprov_nova_obs" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 15px; outline: none; background: #fff;" rows="2" placeholder="Ex: Por favor, verificar o circuito prioritariamente..."></textarea>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="document.getElementById('aprov_forward_container').style.display='none'; document.getElementById('aprov_buttons_container').style.display='flex';" style="background: #e0e0e0; color: #555; border: none; border-radius: 8px; padding: 12px; flex: 1; font-weight: bold; cursor: pointer;">CANCELAR</button>
                    <button onclick="confirmarEncaminhamentoRapido()" style="background: #00bfa5; color: white; border: none; border-radius: 8px; padding: 12px; flex: 2; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="bi bi-check-circle"></i> CONFIRMAR E SALVAR
                    </button>
                </div>
            </div>
`;

html = html.replace(
    /<div style="display: flex; justify-content: space-between; gap: 15px;">[\s\S]*?<input type="hidden" id="aprov_id_hidden">[\s\S]*?<\/div>/,
    replacement
);

// Adicionar a função JS confirmarEncaminhamentoRapido
const jsFunction = `
    function confirmarEncaminhamentoRapido() {
        const id = document.getElementById('aprov_id_hidden').value;
        const executorId = document.getElementById('aprov_novo_executor').value;
        const obs = document.getElementById('aprov_nova_obs').value;
        
        if (!executorId) {
            alert('Por favor, selecione um executor.');
            return;
        }

        const formData = new URLSearchParams();
        formData.append('acao', 'tramitar_os');
        formData.append('os_id', id);
        formData.append('status_tramite', 'Em Execução');
        formData.append('executor_atual_id', executorId);
        formData.append('nova_observacao', obs);

        fetch(window.location.href, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
            body: formData.toString()
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Ordem de serviço encaminhada com sucesso!');
                window.location.reload();
            } else {
                alert(data.message || 'Erro ao encaminhar.');
            }
        })
        .catch(err => {
            console.error(err);
            alert('Erro de comunicação.');
        });
    }
    
    // Add reset logic to abrirModalAprovacao
    const oldAbrirModalAprovacao = abrirModalAprovacao;
    abrirModalAprovacao = function(id) {
        document.getElementById('aprov_buttons_container').style.display = 'flex';
        const fwd = document.getElementById('aprov_forward_container');
        if (fwd) fwd.style.display = 'none';
        document.getElementById('aprov_novo_executor').value = '';
        document.getElementById('aprov_nova_obs').value = '';
        oldAbrirModalAprovacao(id);
    };
    </script>
`;

html = html.replace(/<\/script>[\s\n\r]*$/, jsFunction);

fs.writeFileSync(path, html, 'utf8');
console.log('Adicionada funcionalidade de encaminhamento inline no modal');
