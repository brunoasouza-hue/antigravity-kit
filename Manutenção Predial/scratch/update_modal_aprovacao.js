const fs = require('fs');
const path = 'public/views/corretivas.php';
let html = fs.readFileSync(path, 'utf8');

// The exact new HTML for modalAprovacao
const novoModal = `
    <!-- MODAL DE APROVAÇÃO/TRAMITAÇÃO (NOVO DESIGN) -->
    <div class="modal-fundo" id="modalAprovacao" style="display: none; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
        <div class="modal-box" style="background: #fafafa; border-radius: 16px; width: 100%; max-width: 700px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); position: relative; font-family: 'Inter', sans-serif;">
            
            <button type="button" onclick="document.getElementById('modalAprovacao').style.display='none'" style="position: absolute; top: 25px; right: 25px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666; transition: 0.2s;" onmouseover="this.style.color='#000'" onmouseout="this.style.color='#666'">✕</button>

            <h2 style="margin: 0 0 30px 0; color: #f44336; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Ordem de Serviço: #<span id="aprov_id"></span></h2>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div>
                    <div style="font-size: 11px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">DATA ABERTURA:</div>
                    <div id="aprov_data" style="font-size: 15px; color: #222; font-weight: 500;"></div>
                </div>
                <div>
                    <div style="font-size: 11px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">CRIADO POR:</div>
                    <div id="aprov_criador" style="font-size: 15px; color: #222; font-weight: 500;"></div>
                </div>

                <div>
                    <div style="font-size: 11px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">TIPO:</div>
                    <div style="font-size: 15px; color: #222; font-weight: 500;">Corretivo</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">STATUS:</div>
                    <div style="margin-top: 2px;"><span id="aprov_status" style="background: #e1f5fe; color: #0288d1; padding: 4px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;"></span></div>
                </div>

                <div>
                    <div style="font-size: 11px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">LOCAL REGISTRADO:</div>
                    <div id="aprov_local" style="font-size: 15px; color: #222; font-weight: 500; line-height: 1.4;"></div>
                </div>
                <div>
                    <div style="font-size: 11px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">RESPONSÁVEL ATUAL:</div>
                    <div id="aprov_resp" style="font-size: 15px; color: #222; font-weight: 500;"></div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <div style="font-size: 11px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">DESCRIÇÃO:</div>
                <div id="aprov_desc" style="font-size: 14px; color: #333; line-height: 1.6; font-weight: 400;"></div>
            </div>

            <div style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 15px 0; margin-bottom: 30px;">
                <div style="font-size: 14px; color: #222; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <i class="bi bi-paperclip" style="font-size: 16px;"></i> Anexos:
                </div>
                <div style="font-size: 14px; color: #888;">Nenhum anexo encontrado</div>
            </div>

            <div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin-bottom: 40px;">
                <div style="text-align: center;">
                    <div style="font-size: 11px; color: #888; font-weight: 700; margin-bottom: 10px;">ORIGEM</div>
                    <div style="width: 54px; height: 54px; border-radius: 50%; border: 3px solid #ff1744; color: #ff1744; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto; background: #fff;">
                        <i class="bi bi-person-fill"></i>
                    </div>
                    <div id="aprov_origem_nome" style="font-size: 13px; font-weight: 700; margin-top: 10px; color: #111;"></div>
                </div>

                <div style="color: #00bcd4; font-size: 32px; font-weight: 300;">
                    →
                </div>

                <div style="text-align: center;">
                    <div style="font-size: 11px; color: #888; font-weight: 700; margin-bottom: 10px;">DESTINO ATUAL</div>
                    <div style="width: 54px; height: 54px; border-radius: 50%; border: 3px solid #ff1744; color: #ff1744; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto; background: #fff;">
                        <i class="bi bi-person-fill"></i>
                    </div>
                    <div id="aprov_destino_nome" style="font-size: 13px; font-weight: 700; margin-top: 10px; color: #111;"></div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; gap: 15px;">
                <button onclick="document.getElementById('modalAprovacao').style.display='none'; abrirModalTramitacao(document.getElementById('aprov_id_hidden').value)" style="background: #9d50bb; color: #fff; border: none; border-radius: 25px; padding: 14px 24px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; justify-content: center; transition: 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bi bi-clock-history" style="font-size: 18px;"></i> HISTÓRICO
                </button>
                <button style="background: #607d8b; color: #fff; border: none; border-radius: 25px; padding: 14px 24px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; justify-content: center; transition: 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bi bi-chat-left-text" style="font-size: 18px;"></i> OBSERVAÇÃO
                </button>
                <button onclick="document.getElementById('modalAprovacao').style.display='none'; abrirModalTramitacao(document.getElementById('aprov_id_hidden').value)" style="background: #00bfa5; color: #fff; border: none; border-radius: 25px; padding: 14px 24px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1.2; justify-content: center; transition: 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bi bi-send" style="font-size: 18px;"></i> ENCAMINHAR
                </button>
                <input type="hidden" id="aprov_id_hidden">
            </div>

        </div>
    </div>
    
    <script>
    function abrirModalAprovacao(id) {
        // Fetch data from API
        fetch('/public/api/os_historico.php?os_id=' + id)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.os) {
                    const os = data.os;
                    document.getElementById('aprov_id').innerText = os.id;
                    document.getElementById('aprov_id_hidden').value = os.id;
                    
                    document.getElementById('aprov_data').innerText = os.data_abertura ? os.data_abertura.replace(/-/g, '/').substring(0, 16) : 'N/D';
                    
                    const criador = os.solicitante ? os.solicitante.replace(/\\s*\\(.*?\\)/, '') : 'N/D';
                    const executor = os.executor_atual && os.executor_atual !== 'null' ? os.executor_atual : 'Não Atribuído';
                    
                    document.getElementById('aprov_criador').innerText = criador;
                    document.getElementById('aprov_status').innerText = os.status;
                    document.getElementById('aprov_local').innerText = os.ambiente;
                    document.getElementById('aprov_resp').innerText = executor;
                    document.getElementById('aprov_desc').innerText = os.descricao;
                    
                    document.getElementById('aprov_origem_nome').innerText = criador;
                    document.getElementById('aprov_destino_nome').innerText = executor;
                    
                    document.getElementById('modalAprovacao').style.display = 'flex';
                } else {
                    alert('Erro ao carregar dados da OS.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Erro de conexão ao buscar dados.');
            });
    }
    </script>
`;

// Extract old modal and replace it
const startIndex = html.indexOf('<!-- MODAL DE APROVAÇÃO/TRAMITAÇÃO (INJETADO) -->');
if (startIndex !== -1) {
    const endIndex = html.indexOf('</body>', startIndex);
    html = html.substring(0, startIndex) + novoModal + '\n</body>' + html.substring(endIndex + 7);
}

fs.writeFileSync(path, html, 'utf8');
console.log('modalAprovacao rewritten with new design');
