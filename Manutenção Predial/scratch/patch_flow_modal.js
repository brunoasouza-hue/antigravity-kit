const fs = require('fs');

let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

const newContainers = `
            <!-- CONCLUIR EXECUCAO (EXECUTOR) -->
            <div id="aprov_concluir_container" style="display: none; background: #e3f2fd; padding: 20px; border-radius: 12px; margin-top: 15px; border: 1px solid #bbdefb;">
                <h4 style="margin: 0 0 15px 0; color: #1565c0; font-size: 16px;">Concluir Execução</h4>
                <div style="font-size: 11px; color: #555; font-weight: 700; margin-bottom: 6px;">OBSERVAÇÃO DA CONCLUSÃO:</div>
                <textarea id="aprov_concluir_obs" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #90caf9; margin-bottom: 15px; outline: none; background: #fff;" rows="3" placeholder="Ex: Vidro trocado e limpeza do local realizada."></textarea>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="document.getElementById('modalAprovacao').style.display='none';" style="background: #e0e0e0; color: #555; border: none; border-radius: 8px; padding: 12px; flex: 1; font-weight: bold; cursor: pointer;">CANCELAR</button>
                    <button onclick="confirmarConclusaoExecucao()" style="background: #1976d2; color: white; border: none; border-radius: 8px; padding: 12px; flex: 2; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="bi bi-check-all"></i> ENVIAR PARA VALIDAÇÃO
                    </button>
                </div>
            </div>

            <!-- VALIDAR OS (SOLICITANTE) -->
            <div id="aprov_validar_container" style="display: none; background: #f3e5f5; padding: 20px; border-radius: 12px; margin-top: 15px; border: 1px solid #e1bee7;">
                <h4 style="margin: 0 0 15px 0; color: #6a1b9a; font-size: 16px;">Validação do Serviço</h4>
                <p style="font-size: 13px; color: #444; margin-top: 0;">Você confirma que o serviço foi executado corretamente?</p>
                
                <div style="font-size: 11px; color: #555; font-weight: 700; margin-bottom: 6px; margin-top: 15px;">OBSERVAÇÃO (Opcional para Aprovar, Obrigatória para Reprovar):</div>
                <textarea id="aprov_validar_obs" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ce93d8; margin-bottom: 15px; outline: none; background: #fff;" rows="2" placeholder="Ex: Serviço perfeito / Ainda com vazamento..."></textarea>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="confirmarValidacao(false)" style="background: #d32f2f; color: white; border: none; border-radius: 8px; padding: 12px; flex: 1; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="bi bi-x-circle"></i> REPROVAR
                    </button>
                    <button onclick="confirmarValidacao(true)" style="background: #00e676; color: white; border: none; border-radius: 8px; padding: 12px; flex: 2; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="bi bi-check-circle"></i> APROVAR E FECHAR
                    </button>
                </div>
            </div>
`;

code = code.replace(
    /<!-- ENCAMINHAR FORWARD CONTAINER -->[\s\S]*?<\/div>\s*<\/div>/,
    match => match + "\n" + newContainers
);

const newLogicAbrirModal = `
                    document.getElementById('aprov_origem_nome').innerText = criador;
                    document.getElementById('aprov_destino_nome').innerText = executor;
                    
                    document.getElementById('aprov_reject_obs').value = '';
                    document.getElementById('aprov_nova_obs').value = '';
                    if (document.getElementById('aprov_concluir_obs')) document.getElementById('aprov_concluir_obs').value = '';
                    if (document.getElementById('aprov_validar_obs')) document.getElementById('aprov_validar_obs').value = '';
                    
                    // Reset all displays
                    document.getElementById('aprov_buttons_container').style.display='none';
                    document.getElementById('aprov_reject_container').style.display='none';
                    document.getElementById('aprov_forward_container').style.display='none';
                    if (document.getElementById('aprov_concluir_container')) document.getElementById('aprov_concluir_container').style.display='none';
                    if (document.getElementById('aprov_validar_container')) document.getElementById('aprov_validar_container').style.display='none';
                    
                    // Determine which block to show based on user role and OS status
                    const currentRole = '<?php echo $usuarioNivel; ?>';
                    
                    if (currentRole === 'Gestor' && os.status === 'Pendente') {
                        document.getElementById('aprov_buttons_container').style.display='flex';
                    } else if (currentRole === 'Executor' && os.status === 'Em Execução') {
                        document.getElementById('aprov_concluir_container').style.display='block';
                    } else if (currentRole === 'Solicitante' && os.status === 'Aguardando Validação') {
                        document.getElementById('aprov_validar_container').style.display='block';
                    }
                    
                    document.getElementById('modalAprovacao').style.display = 'flex';
`;

code = code.replace(
    /document\.getElementById\('aprov_origem_nome'\)\.innerText = criador;[\s\S]*?document\.getElementById\('modalAprovacao'\)\.style\.display = 'flex';/,
    newLogicAbrirModal
);

const newFunctions = `
    function confirmarConclusaoExecucao() {
        const id = document.getElementById('aprov_id_hidden').value;
        const obs = document.getElementById('aprov_concluir_obs').value;

        const params = new URLSearchParams();
        params.append('acao', 'tramitar_os');
        params.append('os_id', id);
        params.append('nova_observacao', obs);
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
                window.location.reload();
            } else {
                alert(data.message || 'Erro ao concluir execução.');
            }
        });
    }

    function confirmarValidacao(isAprovado) {
        const id = document.getElementById('aprov_id_hidden').value;
        const obs = document.getElementById('aprov_validar_obs').value;

        if (!isAprovado && (!obs || obs.trim() === '')) {
            alert('A observação é obrigatória para reprovar a manutenção.');
            return;
        }

        const params = new URLSearchParams();
        params.append('acao', isAprovado ? 'tramitar_os' : 'reprovar_validacao_os');
        params.append('os_id', id);
        params.append('nova_observacao', obs);
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
                window.location.reload();
            } else {
                alert(data.message || 'Erro ao processar validação.');
            }
        });
    }
</script>`;

code = code.replace(/<\/script>$/, newFunctions);

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log('corretivas.php modal logic patched!');
