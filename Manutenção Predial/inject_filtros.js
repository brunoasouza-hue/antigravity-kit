const fs = require('fs');
let html = fs.readFileSync('public/views/corretivas.php', 'utf8');

// 1. Add data-status to the rows
html = html.replace(/<tr style="border-bottom: 1px solid var\(--corBorda\);">/g, '<tr class="os-row" data-status="<?php echo htmlspecialchars($status); ?>" style="border-bottom: 1px solid var(--corBorda);">');

// 2. Add the JS filtering logic to the bottom of the file (before closing </body> or at the end of <script> tag)
const scriptFiltro = `
        // NOVA LÓGICA DE FILTROS (ABAS E BUSCA)
        document.addEventListener('DOMContentLoaded', () => {
            const inputBusca = document.getElementById('pesquisa');
            const botoesAba = document.querySelectorAll('.btn-aba-os');
            const linhasOS = document.querySelectorAll('.os-row');
            
            let filtroAtualStatus = 'Todas';
            let filtroBusca = '';

            function aplicarFiltros() {
                linhasOS.forEach(linha => {
                    const statusRow = linha.getAttribute('data-status');
                    const textoLinha = linha.innerText.toLowerCase();
                    
                    let passaStatus = false;
                    if (filtroAtualStatus === 'Todas') passaStatus = true;
                    else if (filtroAtualStatus === 'Abertas' && statusRow === 'Pendente') passaStatus = true;
                    else if (filtroAtualStatus === 'Em Andamento' && (statusRow === 'Em Execução' || statusRow === 'Aguardando Validação')) passaStatus = true;
                    else if (filtroAtualStatus === 'Concluídas' && statusRow === 'Concluída') passaStatus = true;

                    let passaBusca = true;
                    if (filtroBusca !== '') {
                        passaBusca = textoLinha.includes(filtroBusca);
                    }

                    if (passaStatus && passaBusca) {
                        linha.style.display = 'table-row';
                    } else {
                        linha.style.display = 'none';
                    }
                });
            }

            if (inputBusca) {
                inputBusca.addEventListener('input', (e) => {
                    filtroBusca = e.target.value.toLowerCase();
                    aplicarFiltros();
                });
            }

            botoesAba.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all
                    botoesAba.forEach(b => {
                        b.classList.remove('active');
                        b.style.background = 'rgba(108,117,125,0.1)';
                        b.style.color = '#6c757d';
                    });
                    
                    // Add active to clicked
                    btn.classList.add('active');
                    btn.style.background = 'var(--corDestaque)';
                    btn.style.color = '#fff';
                    
                    filtroAtualStatus = btn.getAttribute('data-filter');
                    aplicarFiltros();
                });
            });
        });

        // MODAL DE TRAMITAÇÃO (Unificado)
        function abrirModalTramitacao(osRaw) {
            const os = typeof osRaw === 'string' ? JSON.parse(osRaw) : osRaw;
            
            document.getElementById('tramitacao_os_id').value = os.id;
            document.getElementById('lbl_tram_id').innerText = '#' + os.id;
            document.getElementById('lbl_tram_ambiente').innerText = os.ambiente;
            document.getElementById('lbl_tram_abertura').innerText = os.data_abertura;
            document.getElementById('lbl_tram_status').innerText = os.status;
            document.getElementById('lbl_tram_desc').innerText = os.descricao;
            document.getElementById('lbl_tram_historico').innerHTML = os.relato_servico ? os.relato_servico.replace(/\\n/g, '<br>') : 'Nenhum histórico registrado.';
            
            document.getElementById('nova_observacao').value = '';

            // Dinamica de botões dependendo do nivel e status
            const nivel = '${"<?php echo $usuarioNivel; ?>"}';
            const btnTramitar = document.getElementById('btnTramitarAcao');
            const selectExecutor = document.getElementById('div_select_executor');
            
            btnTramitar.style.display = 'none';
            selectExecutor.style.display = 'none';

            if (nivel === 'Gestor' && os.status === 'Pendente') {
                selectExecutor.style.display = 'block';
                btnTramitar.innerText = 'Atribuir a Executor';
                btnTramitar.style.background = '#007bff';
                btnTramitar.style.display = 'block';
            } else if (nivel === 'Executor' && os.status === 'Em Execução') {
                btnTramitar.innerText = 'Relatar e Concluir Serviço';
                btnTramitar.style.background = '#28a745';
                btnTramitar.style.display = 'block';
            } else if (nivel === 'Solicitante' && os.status === 'Aguardando Validação') {
                btnTramitar.innerText = 'Aprovar Serviço (Concluir)';
                btnTramitar.style.background = '#17a2b8';
                btnTramitar.style.display = 'block';
            }

            document.getElementById('modalTramitacao').style.display = 'flex';
        }

        function fecharModalTramitacao() {
            document.getElementById('modalTramitacao').style.display = 'none';
        }

        function submeterTramitacao(event) {
            event.preventDefault();
            const form = document.getElementById('form-tramitacao');
            const formData = new FormData(form);
            const searchParams = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                searchParams.append(key, value);
            }
            searchParams.append('acao', 'tramitar_os');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: searchParams.toString()
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    window.location.reload();
                } else {
                    alert('Erro: ' + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Erro interno de conexão.');
            });
        }
`;

// Insert script at the end of the file before </body> or inside the last <script> block
if (html.includes('</script>\n</body>')) {
    html = html.replace('</script>\n</body>', scriptFiltro + '\n</script>\n</body>');
} else {
    html = html.replace('</body>', '<script>\n' + scriptFiltro + '\n</script>\n</body>');
}

// 3. Add the Modal HTML just before </body>
const modalHTML = `
    <!-- MODAL DE TRAMITAÇÃO / HISTÓRICO -->
    <div class="modal-fundo" id="modalTramitacao" style="display: none; align-items: center; justify-content: center;">
        <div class="modal-box" style="width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>Tramitação da Ordem de Serviço <span id="lbl_tram_id" style="color:var(--corBase);"></span></h3>
                <button type="button" onclick="fecharModalTramitacao()"><i class="bi bi-x-lg"></i></button>
            </div>
            
            <form id="form-tramitacao" onsubmit="submeterTramitacao(event)" class="modal-form">
                <input type="hidden" name="os_id" id="tramitacao_os_id">
                
                <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; border: 1px solid var(--corBorda); margin-bottom: 20px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <strong>Ambiente:</strong> <span id="lbl_tram_ambiente" style="color:var(--corTxt3);"></span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <strong>Status Atual:</strong> <span id="lbl_tram_status" style="font-weight:bold; color:#007bff;"></span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <strong>Abertura:</strong> <span id="lbl_tram_abertura" style="color:var(--corTxt2);"></span>
                    </div>
                    <hr style="border:0; border-top:1px solid var(--corBorda); margin: 15px 0;">
                    <strong style="display:block; margin-bottom:5px;">Descrição do Problema:</strong>
                    <p id="lbl_tram_desc" style="color:var(--corTxt3); font-size:14px; line-height:1.5;"></p>
                </div>

                <div style="margin-bottom: 20px;">
                    <strong style="display:block; margin-bottom:8px; color:var(--corTxt3);">Histórico da OS:</strong>
                    <div id="lbl_tram_historico" style="background:var(--corFundo); border:1px solid var(--corBorda); padding:12px; border-radius:8px; font-size:13px; color:var(--corTxt2); min-height:60px; max-height:150px; overflow-y:auto; line-height:1.5;"></div>
                </div>

                <div class="modal-input">
                    <label for="nova_observacao">Adicionar Observação (Registro no Histórico):</label>
                    <textarea name="nova_observacao" id="nova_observacao" rows="3" placeholder="Digite uma nova observação ou relatório de serviço..."></textarea>
                </div>

                <div class="modal-input" id="div_select_executor" style="display: none;">
                    <label for="executor_id">Atribuir a um Executor (Gestores):</label>
                    <select name="executor_id" id="executor_id">
                        <option value="" disabled selected>Selecione o funcionário...</option>
                        <?php foreach($executores as $exe): ?>
                            <option value="<?php echo $exe->getId(); ?>"><?php echo htmlspecialchars($exe->getNome()); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="modal-footer" style="margin-top: 25px; display:flex; justify-content:flex-end;">
                    <button type="submit" id="btnTramitarAcao" style="color: #fff; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;"></button>
                </div>
            </form>
        </div>
    </div>
`;
html = html.replace('</body>', modalHTML + '\n</body>');

fs.writeFileSync('public/views/corretivas.php', html);
console.log('UI Filtros e Modal Injetados!');
