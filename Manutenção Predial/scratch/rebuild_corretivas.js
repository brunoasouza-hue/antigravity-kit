const fs = require('fs');
const path = 'C:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Manutenção Predial\\public\\views\\corretivas.php';
let content = fs.readFileSync(path, 'utf8');

const phpTopTarget = "if (isset($_GET['logout'])) {";
const tramitarLogic = `if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'tramitar_os') {
    header('Content-Type: application/json');
    try {
        $pdo = Database::getConnection();
        $pdo->beginTransaction();
        $os_id = $_POST['os_id'] ?? 0;
        $status_tramite = $_POST['status_tramite'] ?? '';
        $executor_id = $_POST['executor_id'] ?? null;
        $observacao_etapa = $_POST['observacao_etapa'] ?? '';

        $stmt = $pdo->prepare("UPDATE ordens_servico SET status = ?, executor_atual_id = ? WHERE id = ?");
        $stmt->execute([$status_tramite, $executor_id, $os_id]);

        $stmtHist = $pdo->prepare("INSERT INTO os_historico_tramites (os_id, origem_usuario_id, destino_usuario_id, status_etapa, observacao_etapa, data_tramite) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmtHist->execute([$os_id, $_SESSION['usuario_id'] ?? 1, $executor_id, $status_tramite, $observacao_etapa]);

        $pdo->commit();
        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

if (isset($_GET['logout'])) {`;
content = content.replace(phpTopTarget, tramitarLogic);

const dataFetchTarget = `if ($usuarioNivel === 'Solicitante') {
    $ordensServico = OrdemServico::listarPorSolicitante($usuarioId);
    $ambientesAtivos = Ambiente::listarAtivos(); // para o modal de abertura
} elseif ($usuarioNivel === 'Gestor') {
    $ordensServico = OrdemServico::listarTodosComRelacionamentos();
    $executores = Usuario::listarPorNivel('Executor'); // para o modal de despacho
} elseif ($usuarioNivel === 'Executor') {
    $ordensServico = OrdemServico::listarPorExecutor($usuarioId);
}`;
const directFetch = `if ($usuarioNivel === 'Solicitante') {
    $ambientesAtivos = Ambiente::listarAtivos(); // para o modal de abertura
} elseif ($usuarioNivel === 'Gestor') {
    $executores = Usuario::listarPorNivel('Executor'); // para o modal de despacho
}

$db = Database::getConnection();
$sqlListagem = "SELECT os.*, amb.nome_ambiente, solic.nome AS nome_solicitante, exec.nome AS nome_executor_atual 
FROM ordens_servico os 
LEFT JOIN ambientes amb ON os.ambiente_id = amb.id 
LEFT JOIN usuarios solic ON os.solicitante_id = solic.id 
LEFT JOIN usuarios exec ON os.executor_atual_id = exec.id 
WHERE os.tipo = 'Corretivo' OR os.tipo IS NULL OR os.tipo = '' 
ORDER BY os.id DESC";
$ordens_dados = $db->query($sqlListagem)->fetchAll(PDO::FETCH_ASSOC);

// Converte array associativo para objetos OrdemServico
$ordensServico = [];
foreach ($ordens_dados as $dado) {
    $os = new OrdemServico(
        $dado['ambiente_id'],
        $dado['solicitante_id'],
        $dado['descricao_problema'],
        $dado['prioridade']
    );
    $os->setId($dado['id']);
    $os->setStatus($dado['status']);
    // Usa uma propriedade dinâmica para o ambiente e executor na view
    $os->ambiente_nome_view = $dado['nome_ambiente'];
    $os->solicitante_nome_view = $dado['nome_solicitante'];
    $os->executor_nome_view = $dado['nome_executor_atual'];
    $ordensServico[] = $os;
}`;
content = content.replace(dataFetchTarget, directFetch);

const searchRegex = /<div class="page-search-box"[^>]*>.*?<\/div>/s;
const selectFilter = `<div class="page-search-box" style="flex-grow: 1; display: flex; align-items: center; background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 10px; padding: 0 10px;">
                    <i class="bi bi-search" style="color: var(--corTxt2); margin-right: 8px;"></i>
                    <input type="text" id="pesquisa" placeholder="Filtrar por sala, solicitante, executor ou status..." style="border: none; background: transparent; width: 100%; padding: 10px 0; color: var(--corTxt3); outline: none;">
                </div>
                <!-- NOVO FILTRO DE STATUS -->
                <select id="filtro-status" style="border: 1px solid var(--corBorda); background: var(--corFundo); color: var(--corTxt3); border-radius: 10px; padding: 0 15px; outline: none; cursor: pointer; font-weight: bold; height: 100%; min-height: 44px;">
                    <option value="">Todos os Status</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM ANDAMENTO">Em Andamento</option>
                    <option value="EM EXECUÇÃO">Em Execução</option>
                    <option value="AGUARDANDO VALIDAÇÃO">Aguardando Validação</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="ENCAMINHADA">Encaminhada</option>
                    <option value="RECUSADA">Recusada</option>
                </select>`;
content = content.replace(searchRegex, selectFilter);

const tableStartRegex = /<table class="tabela-main".*?<\/table>/s;
const newTable = `<div class="table-responsive" style="margin-top: 20px;">
    <table style="width: 100%; border-collapse: collapse; text-align: left; background-color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead style="background-color: #C62828; color: white; text-transform: uppercase; font-size: 13px;">
            <tr>
                <th style="padding: 12px; text-align: center;">Nº O.S.</th>
                <th style="padding: 12px;">Descrição / Ambiente</th>
                <th style="padding: 12px; text-align: center;">Tipo</th>
                <th style="padding: 12px; text-align: center;">Solicitante</th>
                <th style="padding: 12px; text-align: center;">Responsável</th>
                <th style="padding: 12px; text-align: center;">Status</th>
                <th style="padding: 12px; text-align: center;">Ações</th>
            </tr>
        </thead>
        <tbody id="corpoTabelaOS">
            <?php if (empty($ordensServico)): ?>
                <tr id="linha-vazia">
                    <td colspan="7" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhuma ordem de serviço encontrada.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($ordensServico as $os): ?>
                    <tr class="linha-tabela-os" data-status="<?php echo strtoupper(htmlspecialchars($os->getStatus())); ?>" style="border-bottom: 1px solid #e0e0e0; background-color: #fff;">
                        <td style="padding: 15px; text-align: center; font-weight: bold; color: #333;">#<?php echo $os->getId(); ?></td>
                        <td style="padding: 15px;">
                            <div style="color: #000; font-weight: bold; font-size: 14px; margin-bottom: 5px;"><?php echo htmlspecialchars($os->getDescricaoProblema()); ?></div>
                            <div style="color: #666; font-size: 12px;">⚙️ <?php echo htmlspecialchars($os->ambiente_nome_view ?? 'Desconhecido'); ?></div>
                        </td>
                        <td style="padding: 15px; text-align: center;"><span style="background-color: #ffebee; color: #c62828; padding: 5px 10px; border-radius: 4px; font-size: 11px; font-weight: bold;">CORRETIVA</span></td>
                        <td style="padding: 15px; text-align: center; color: #444;"><?php echo htmlspecialchars($os->solicitante_nome_view ?? 'N/A'); ?></td>
                        <td style="padding: 15px; text-align: center; color: #444;"><?php echo htmlspecialchars($os->executor_nome_view ?? 'Não Atribuído'); ?></td>
                        <td style="padding: 15px; text-align: center;"><span style="background-color: #e8f5e9; color: #2e7d32; padding: 5px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;"><?php echo $os->getStatus(); ?></span></td>
                        <td style="padding: 15px; text-align: center;">
                            <button title="Visualizar" onclick="visualizarOS(<?php echo $os->getId(); ?>)" style="background-color: #00b0ff; border: none; color: white; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; margin-right: 5px;">👁️</button>
                            <button title="Aprovar/Tramitar" onclick="abrirModalAprovacao(<?php echo $os->getId(); ?>)" style="background-color: #00e676; border: none; color: white; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; margin-right: 5px;">✓</button>
                            <button title="Excluir" style="background-color: #ff1744; border: none; color: white; width: 34px; height: 34px; border-radius: 6px; cursor: pointer;">🗑️</button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>`;
content = content.replace(tableStartRegex, newTable);

const bodyEndTarget = "</body>";
const modalAprovacao = `    <!-- MODAL DE APROVAÇÃO/TRAMITAÇÃO (INJETADO) -->
    <div class="modal-fundo" id="modalAprovacao" style="display: none; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
        <div class="modal-box" style="background: #fff; border-radius: 12px; width: 100%; max-width: 500px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--corBorda); padding-bottom: 15px;">
                <h3 style="margin: 0; color: #333;">Tramitar Ordem de Serviço #<span id="aprovacao_id_display" style="color: var(--corBase);"></span></h3>
                <button type="button" onclick="fecharModalAprovacao()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;"><i class="bi bi-x-lg"></i></button>
            </div>
            <form class="modal-form" id="formAprovacaoOS" style="padding-top: 15px;" onsubmit="enviarTramite(event)">
                <input type="hidden" name="action" value="tramitar_os">
                <input type="hidden" name="os_id" id="aprovacao_os_id">
                
                <div class="modal-input" style="margin-bottom: 15px;">
                    <label for="aprovacao_status" style="font-weight: bold; display: block; margin-bottom: 8px;">Novo Status:</label>
                    <select name="status_tramite" id="aprovacao_status" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none;">
                        <option value="EM ANDAMENTO">Em Andamento</option>
                        <option value="EM EXECUÇÃO">Em Execução</option>
                        <option value="AGUARDANDO VALIDAÇÃO">Aguardando Validação</option>
                        <option value="FINALIZADO">Finalizado</option>
                        <option value="ENCAMINHADA">Encaminhada</option>
                        <option value="RECUSADA">Recusada</option>
                    </select>
                </div>

                <div class="modal-input" style="margin-bottom: 15px;">
                    <label for="aprovacao_executor" style="font-weight: bold; display: block; margin-bottom: 8px;">Designar Executor (Opcional):</label>
                    <select name="executor_id" id="aprovacao_executor" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none;">
                        <option value="">-- Manter Atual / Nenhum --</option>
                        <?php foreach (Usuario::listarPorNivel('Executor') as $exec): ?>
                            <option value="<?php echo $exec->getId(); ?>"><?php echo htmlspecialchars($exec->getNome()); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="modal-input" style="margin-bottom: 20px;">
                    <label for="aprovacao_observacao" style="font-weight: bold; display: block; margin-bottom: 8px;">Observação da Etapa:</label>
                    <textarea name="observacao_etapa" id="aprovacao_observacao" required style="width: 100%; height: 80px; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none;"></textarea>
                </div>

                <div class="modal-footer" style="display: flex; justify-content: flex-end;">
                    <button type="submit" class="btn-confirmar-full" style="background: #28a745; color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;">
                        Confirmar Trâmite <i class="bi bi-check-lg" style="margin-left: 5px;"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>
</body>`;
content = content.replace(bodyEndTarget, modalAprovacao);

const scriptEndTarget = "});\n    </script>";
const jsLogic = `        // Abertura Modal Aprovação
        window.abrirModalAprovacao = function(id) {
            document.getElementById('aprovacao_os_id').value = id;
            document.getElementById('aprovacao_id_display').innerText = id;
            document.getElementById('modalAprovacao').style.display = 'flex';
        };

        window.fecharModalAprovacao = function() {
            document.getElementById('modalAprovacao').style.display = 'none';
        };

        window.enviarTramite = function(e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            // Também adiciona 'acao' para o start_test_server.js
            formData.append('acao', 'tramitar_os');
            formData.append('nova_observacao', formData.get('observacao_etapa'));
            formData.append('executor_atual_id', formData.get('executor_id'));

            fetch('corretivas.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    if (typeof showToast === 'function') { showToast('Trâmite realizado com sucesso!', 'success'); } else { alert('Trâmite realizado com sucesso!'); }
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    if (typeof showToast === 'function') { showToast('Erro: ' + data.message, 'error'); } else { alert('Erro: ' + data.message); }
                }
            })
            .catch(err => {
                console.error(err);
                if (typeof showToast === 'function') { showToast('Erro de conexão.', 'error'); } else { alert('Erro de conexão.'); }
            });
        };

        // Filtro visual rápido
        const inputPesquisa = document.getElementById('pesquisa');
        const selectStatus = document.getElementById('filtro-status');

        function filtrarTabela() {
            const termo = (inputPesquisa ? inputPesquisa.value.toLowerCase().trim() : '');
            const statusFiltro = (selectStatus ? selectStatus.value.toUpperCase() : '');
            const linhas = document.querySelectorAll('.linha-tabela-os');
            let visiveis = 0;

            linhas.forEach(linha => {
                const texto = linha.textContent.toLowerCase();
                const statusLinha = (linha.getAttribute('data-status') || '').toUpperCase();
                
                const matchTexto = (termo === '' || texto.includes(termo));
                const matchStatus = (statusFiltro === '' || statusLinha === statusFiltro);

                if (matchTexto && matchStatus) {
                    linha.style.display = '';
                    visiveis++;
                } else {
                    linha.style.display = 'none';
                }
            });

            // Lida com tabela vazia
            const tbody = document.getElementById('corpoTabelaOS');
            let linhaVazia = document.getElementById('linha-vazia');
            if (visiveis === 0) {
                if (!linhaVazia && tbody) {
                    const tr = document.createElement('tr');
                    tr.id = 'linha-vazia';
                    tr.innerHTML = \`<td colspan="7" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhum chamado corresponde aos filtros.</td>\`;
                    tbody.appendChild(tr);
                }
            } else {
                if (linhaVazia) {
                    linhaVazia.remove();
                }
            }
        }

        if (inputPesquisa) inputPesquisa.addEventListener('input', filtrarTabela);
        if (selectStatus) selectStatus.addEventListener('change', filtrarTabela);
    });
    </script>`;
content = content.replace(scriptEndTarget, jsLogic);

fs.writeFileSync(path, content);
console.log('Rebuild completed again!');
