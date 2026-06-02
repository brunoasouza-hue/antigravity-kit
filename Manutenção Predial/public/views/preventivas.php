<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Tela de Gestão de Manutenções Preventivas (PHP OOP)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Controllers/ChecklistController.php';
require_once __DIR__ . '/../../src/Models/Ambiente.php';
require_once __DIR__ . '/../../src/Models/Checklist.php';

// Exige autenticação e privilégio de Gestor ou Executor
AuthController::exigirNivelAcesso(['Gestor', 'Executor']);

$usuarioNome = $_SESSION['usuario_nome'] ?? 'Usuário';
$usuarioNivel = $_SESSION['usuario_nivel'] ?? 'Executor';

// Roteamento de Logout local
if (isset($_GET['logout'])) {
    $auth = new AuthController();
    $auth->logout();
    header("Location: " . BASE_URL . "/public/index.php");
    exit;
}

// Processamento de Ações do Controller antes do carregamento da página
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['acao'])) {
    $controller = new ChecklistController();
}

// =========================================================================
// EXPORTAÇÃO DE RELATÓRIO PARA EXCEL (CSV)
// =========================================================================
if (isset($_GET['action']) && $_GET['action'] == 'exportar_excel') {
    $data_inicio = $_GET['data_inicio'] ?? date('Y-m-01');
    $data_fim = $_GET['data_fim'] ?? date('Y-m-t');

    // Conexão e Busca
    $db = \Database::getConnection();
    $sql = "
        SELECT 
            c.id AS checklist_id,
            a.nome_ambiente,
            c.data_inspecao,
            u.nome AS tecnico_responsavel,
            im.status AS status_inspecao
        FROM checklists c
        JOIN ambientes a ON c.ambiente_id = a.id
        JOIN usuarios u ON c.responsavel_id = u.id
        JOIN inspecoes_mensais im ON c.inspecao_mensal_id = im.id
        WHERE c.data_inspecao BETWEEN :inicio AND :fim
        ORDER BY c.data_inspecao DESC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([':inicio' => $data_inicio, ':fim' => $data_fim]);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Headers de Download CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=relatorio_preventivas.csv');

    // Abertura do Stream e Escrita do CSV (delimitador ;)
    $output = fopen('php://output', 'w');
    // Adiciona o BOM do UTF-8 para o Excel reconhecer acentuação corretamente
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    fputcsv($output, ['ID Checklist', 'Ambiente', 'Data Inspeção', 'Técnico Responsável', 'Status da Inspeção Mensal'], ';');

    foreach ($resultados as $row) {
        $data_br = date('d/m/Y', strtotime($row['data_inspecao']));
        fputcsv($output, [
            $row['checklist_id'],
            $row['nome_ambiente'],
            $data_br,
            $row['tecnico_responsavel'],
            $row['status_inspecao']
        ], ';');
    }

    fclose($output);
    exit;
}
// =========================================================================    $controller->processarAcao();
}

// Busca dados necessários para renderizar a página
$ambientesAtivos = Ambiente::listarAtivos();
$checklists = Checklist::listarTodos();

// Data atual formatada para exibição no cabeçalho
$dataAtual = date('d/m/Y');
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manutenção Preventiva - SENAI MANUTENÇÃO</title>

    <script>
        // Carrega o tema do localStorage imediatamente para evitar flash de tela clara/escura
        const temaSalvo = localStorage.getItem('tema') || 'claro';
        document.documentElement.setAttribute('data-tema', temaSalvo);
    </script>

    <!-- Estilização Base, Sidebar, Header, Modais e Bootstrap Icons -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/modal.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="../assets/img/favicon.ico" type="image/x-icon">

    <style>
        /* Estilização Premium para Segmented Controls de Checklist */
        .segmented-control-wrapper {
            background: var(--corFundo2);
            border: 1px solid var(--corBorda);
            border-radius: 14px;
            padding: 4px;
            display: inline-flex;
            gap: 4px;
            width: 100%;
            max-width: 480px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .seg-btn {
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px 14px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 10px;
            cursor: pointer;
            color: var(--corTxt2);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
        }

        .seg-btn:hover {
            color: var(--corTxt3);
            background: rgba(0, 0, 0, 0.03);
        }

        [data-tema="escuro"] .seg-btn:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        /* Botão OK Ativo (Verde Premium) */
        .seg-btn.btn-ok.active {
            background-color: #28a745 !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
            border-color: #28a745 !important;
        }

        /* Botão Defeito Ativo (Vermelho Premium / Cor Base) */
        .seg-btn.btn-defeito.active {
            background-color: #fc2323 !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(252, 35, 35, 0.4);
            border-color: #fc2323 !important;
        }

        /* Botão Não se Aplica Ativo (Cinza/Neutro) */
        .seg-btn.btn-nsa.active {
            background-color: rgba(108, 117, 125, 0.15) !important;
            color: #6c757d !important;
            box-shadow: none;
            color: var(--corTxt3) !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        /* Badges customizadas de visualização de status na tabela e detalhes */
        .badge-status {
            padding: 4px 12px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 11px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .badge-ok {
            background-color: rgba(40, 167, 69, 0.12);
            color: #28a745;
            border: 1px solid #28a745;
        }
        .badge-defeito {
            background-color: rgba(252, 35, 35, 0.12);
            color: #fc2323;
            border: 1px solid #fc2323;
        }
        .badge-nsa {
            background-color: rgba(108, 117, 125, 0.12);
            color: #6c757d;
            border: 1px solid #6c757d;
        }

        /* Card de detalhe do checklist */
        .grid-detalhes-check {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .card-detalhe-item {
            background: var(--corFundo2);
            border: 1px solid var(--corBorda);
            border-radius: 12px;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .card-detalhe-item span.title {
            font-weight: bold;
            color: var(--corTxt3);
            font-size: 14px;
        }
    </style>
</head>
<body>

    <!-- SIDEBAR / PAINEL DE NAVEGAÇÃO -->
    <nav class="sidebar">
        <div class="botao-fechar">
            <button id="fechar-nav">
                <i class="bi bi-arrow-left-circle-fill"></i>
            </button>
        </div>

        <div class="div-img">
            <img src="../assets/img/senailogo2.png" alt="Logo Senai" id="senai-logo2" style="width: 80%;">
        </div>

        <div class="div-links">
            <!-- Início -->
            <a href="./home.php" class="links">
                <i class="bi bi-house-door-fill"></i> Início
            </a>

            <a href="./dashboard.php" class="links">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>

            <!-- Menu Manutenção Ativo -->
            <div class="menu-manutencao aberto">
                <a href="javascript:void(0)" class="links ativo manutencao-btn" id="btn-manutencao">
                    <div>
                        <i class="bi bi-tools"></i>
                        <span>Manutenção</span>
                    </div>
                    <i class="bi bi-caret-down-fill seta"></i>
                </a>
                <div class="submenu aberto" id="submenu-manutencao" style="display: flex;">
                    <a href="./corretivas.php" class="links-sub">
                        <i class="bi bi-wrench"></i> Corretiva (O.S)
                    </a>
                    <a href="./preventivas.php" class="ativo links-sub">
                        <i class="bi bi-clock-fill"></i> Preventiva (Checklist)
                    </a>
                </div>
            </div>

            <!-- Inspeções de segurança (Todos os usuários) -->
            <div class="menu-inspecoes">
                <a href="javascript:void(0)" class="links inspecoes-btn" id="btn-inspecoes">
                    <div>
                        <i class="bi bi-shield-fill-check"></i>
                        <span>Inspeções</span>
                    </div>
                    <i class="bi bi-caret-down-fill seta"></i>
                </a>
                <div class="submenu" id="submenu-inspecoes">
                    <a href="./inspecoes_seguranca.php" class="links-sub">
                        <i class="bi bi-plus-circle-fill"></i> Nova Inspeção
                    </a>
                    <a href="./inspecoes_seguranca.php" class="links-sub">
                        <i class="bi bi-clock-history"></i> Histórico
                    </a>
                </div>
            </div>

            <!-- Painel de Ambientes: Apenas Gestor -->
            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador'): ?>
                <a href="./ambientes.php" class="links">
                    <i class="bi bi-building"></i> Painel de Ambientes
                </a>


                <a href="./usuarios.php" class="links">
                    <i class="bi bi-file-earmark-person-fill"></i> Painel de Usuários
                </a>

                <a href="./log.php" class="links">
                    <i class="bi bi-person-vcard"></i> Painel de Logs
                </a>
            <?php endif; ?>
        </div>

        <div class="div-configs">
            <div>
                <!-- Tonalidade de temas claro/escuro -->
                <button onclick="changeTheme()" id="tema"><i class="bi bi-brightness-high-fill"></i></button>
                
                <a href="./perfil.php" class="configs dont-rotate" title="Perfil">
                    <i class="bi bi-person-fill"></i>
                </a>
            </div>

            <!-- Botão Sair com redirecionamento de Logout local seguro -->
            <a href="?logout=1" class="btn sair" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>Sair</span> <i class="bi bi-door-closed-fill"></i>
            </a>
        </div>
    </nav>

    <!-- CONTEÚDO PRINCIPAL -->
    <section class="sec-main">
        
        <!-- CABEÇALHO (HEADER) -->
        <div class="div-header">
            <div class="div-img-header">
                <div class="avatar">
                    <i class="bi bi-person-badge-fill"></i>
                </div>
                <h4 style="color: var(--corTxt3)">Olá, <span style="color: var(--corDestaque);"><?php echo htmlspecialchars($usuarioNome); ?></span> <small style="font-size: 12px; color: var(--corTxt2);"> (<?php echo htmlspecialchars($usuarioNivel); ?>)</small></h4>
            </div>
            <div class="div-txt-header">
                <p>
                    <i class="bi bi-calendar3"></i> <?php echo $dataAtual; ?>
                </p>
            </div>
        </div>

        <!-- BARRA DE AÇÕES UNIFICADA -->
        <div class="page-actions-bar" style="margin-top: 30px;">
            <div style="flex-grow: 1;">
                <h2 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3);">Manutenção Preventiva (Mensal)</h2>
                <p style="color: var(--corTxt2); font-size: 13px; margin-top: 5px;">Acompanhe o ciclo de vistorias mensais e inspecione os ambientes.</p>
            </div>
            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador'): ?>
            <div style="display: flex; gap: 10px;">
                <button onclick="abrirModalExportacao()" style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="bi bi-file-earmark-excel-fill"></i> 📥 Exportar Relatório Excel
                </button>
                <button onclick="abrirModalGerenciarItens()" style="background: var(--corDestaque); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="bi bi-list-check"></i> Gerenciar Itens
                </button>
            </div>
            <?php endif; ?>
        </div>

        <!-- INJETAR_INSPECAO_ATIVA -->

        <!-- HISTÓRICO DE INSPEÇÕES MENSAIS -->
        <div class="tabela-bg2" style="margin-top: 25px;">
            <div class="tabela-titulo" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <i class="bi bi-clock-history" style="font-size: 1.5rem; color: var(--corBase);"></i>
                <h2>Histórico de Inspeções Finalizadas</h2>
            </div>
            
            <div class="tabela-wrapper" style="overflow-x: auto; background: var(--corFundo); border-radius: 12px; border: 1px solid var(--corBorda);">
                <table class="tabela-main" style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--corBorda); background: rgba(0,0,0,0.02);">
                            <th style="padding: 15px; width: 80px;">Ciclo #</th>
                            <th style="padding: 15px;">Início</th>
                            <th style="padding: 15px;">Fim</th>
                            <th style="padding: 15px; text-align: center; width: 180px;">Status</th>
                            <th style="padding: 15px; text-align: right; width: 120px;">Ação</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-historico">
                        <?php if (empty($historicoInspecoes)): ?>
                            <tr id="linha-vazia">
                                <td colspan="5" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhum ciclo finalizado no histórico.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($historicoInspecoes as $h): ?>
                                <tr style="border-bottom: 1px solid var(--corBorda); transition: 0.2s;">
                                    <td style="padding: 15px; font-weight: bold; color: var(--corTxt2);">#<?php echo $h['id']; ?></td>
                                    <td style="padding: 15px; font-size: 14px; color: var(--corTxt3);"><?php echo date('d/m/Y', strtotime($h['data_inicio'])); ?></td>
                                    <td style="padding: 15px; font-size: 14px; color: var(--corTxt3);"><?php echo $h['data_fim'] ? date('d/m/Y', strtotime($h['data_fim'])) : '-'; ?></td>
                                    <td style="padding: 15px; text-align: center;">
                                        <span class="badge" style="background: rgba(40,167,69,0.1); color: #28a745; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold;"><i class="bi bi-check2-circle"></i> Finalizada</span>
                                    </td>
                                    <td style="padding: 15px; text-align: right;">
                                        <button onclick="visualizarHistorico(<?php echo $h['id']; ?>)" style="background: var(--corBase); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;"><i class="bi bi-eye"></i> Visualizar</button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- ========================================================================= -->
    <!-- MODAL DE VISUALIZAÇÃO DE HISTÓRICO -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalVisualizarHistorico" style="display: none;">
        <div class="modal-box modal-box-wide" style="max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>Detalhes da Inspeção Mensal #<span id="vis-id-hist"></span></h3>
                <button type="button" onclick="fecharModal('modalVisualizarHistorico')"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-body">
                <div style="background: var(--corFundo); padding: 20px; border-radius: 8px; border: 1px solid var(--corBorda); margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <small style="color: var(--corTxt2); display: block; margin-bottom: 5px;">Data de Início</small>
                        <div style="font-weight: bold; color: var(--corTxt3);" id="vis-data-inicio">--</div>
                    </div>
                    <div>
                        <small style="color: var(--corTxt2); display: block; margin-bottom: 5px;">Data de Fim</small>
                        <div style="font-weight: bold; color: var(--corTxt3);" id="vis-data-fim">--</div>
                    </div>
                </div>

                <h4 style="margin-bottom: 15px; color: var(--corTxt3); border-bottom: 1px solid var(--corBorda); padding-bottom: 10px;">Ambientes Verificados</h4>
                <div style="overflow-x: auto; background: var(--corFundo); border-radius: 8px; border: 1px solid var(--corBorda);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                        <thead>
                            <tr style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--corBorda);">
                                <th style="padding: 12px 15px;">Ambiente</th>
                                <th style="padding: 12px 15px; text-align: center;">Status Geral</th>
                                <th style="padding: 12px 15px; text-align: center;">Data Inspeção</th>
                                <th style="padding: 12px 15px; text-align: center;">Observações</th>
                            </tr>
                        </thead>
                        <tbody id="tabela-itens-historico">
                            <!-- Injetado via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 1: REGISTRO DE NOVO CHECKLIST PREVENTIVO -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalNovoChecklist" style="display: none;">
        <div class="modal-box modal-box-wide" style="max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>Registrar Inspeção Preventiva</h3>
                <button type="button" onclick="fecharModal('modalNovoChecklist')"><i class="bi bi-x-lg"></i></button>
            </div>

            <form action="" method="POST" id="form-checklist" onsubmit="submeterChecklist(event)" class="modal-form">
                <input type="hidden" name="acao" value="cadastrar">
                <input type="hidden" name="checklist_id" id="checklist_id" value="">

                <!-- Bloco / Sala e Data da Inspeção -->
                <div class="modal-row quebraMobile">
                    <div class="modal-input" style="flex: 1;">
                        <label for="ambiente_id">Ambiente (Bloco / Sala):</label>
                        <div class="input-wrapper">
                            <select name="ambiente_id" id="ambiente_id" required style="width: 100%;">
                                <option value="" disabled selected>Selecione um ambiente...</option>
                                <?php foreach ($ambientesAtivos as $a): ?>
                                    <option value="<?php echo $a->getId(); ?>"><?php echo $a->getId(); ?> - <?php echo htmlspecialchars($a->getNomeAmbiente()); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="modal-input" style="width: 200px;">
                        <label for="data_inspecao">Data da Inspeção:</label>
                        <div class="input-wrapper">
                            <input type="date" name="data_inspecao" id="data_inspecao" value="<?php echo date('Y-m-d'); ?>" required style="width: 100%;">
                        </div>
                    </div>
                </div>

                <div style="margin: 20px 0 10px 0; border-bottom: 1px solid var(--corBorda); padding-bottom: 8px;">
                    <h4 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3);">Vistoria dos Ativos Prediais</h4>
                </div>

                <!-- CONTAINER DINÂMICO DE ITENS DO CHECKLIST -->
                <div id="container-itens-checklist-dinamico" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
                    <!-- Preenchido pelo JS -->
                </div>

                <!-- Observações -->
                <div class="modal-input">
                    <label for="observacoes">Observações Gerais:</label>
                    <div class="input-wrapper">
                        <textarea name="observacoes" id="observacoes" rows="3" placeholder="Insira detalhes sobre anomalias encontradas, justificativas para 'Defeito', etc..." style="width: 100%; border: none; padding: 10px; background: transparent; font-family: inherit; color: var(--corTxt3); outline: none;"></textarea>
                    </div>
                    <span id="observacoes_erro" style="color: #fc2323; font-size: 11px; font-weight: bold; display: none; margin-top: 5px;"></span>
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn-confirmar-full confirmar">
                        Salvar Inspeção <i class="bi bi-check-lg"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 2: VISUALIZAR DETALHES DO CHECKLIST SELECIONADO -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalVerDetalhes" style="display: none;">
        <div class="modal-box modal-box-wide">
            <div class="modal-header">
                <h3>Detalhes do Checklist de Vistoria</h3>
                <button type="button" onclick="fecharModal('modalVerDetalhes')"><i class="bi bi-x-lg"></i></button>
            </div>

            <div class="modal-form">
                <!-- Info Cabeçalho do Checklist -->
                <div class="p-3 mb-3 bg-white border" style="border-radius: 12px; background-color: var(--corFundo2); border: 1px solid var(--corBorda);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                        <div>
                            <small style="color: var(--corTxt2); text-uppercase; font-weight: bold; font-size: 10px;">Ambiente:</small><br>
                            <span class="font-weight-bold" id="detalhe_ambiente" style="font-weight: 800; color: var(--corTxt3);">CÉLULA 1</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-uppercase; font-weight: bold; font-size: 10px;">Responsável:</small><br>
                            <span class="font-weight-bold" id="detalhe_responsavel" style="font-weight: 700; color: var(--corTxt3);">Carlos Silva</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-uppercase; font-weight: bold; font-size: 10px;">Data Vistoria:</small><br>
                            <span class="font-weight-bold" id="detalhe_data" style="font-weight: 700; color: var(--corTxt3);">06/02/2026</span>
                        </div>
                    </div>
                </div>

                <!-- Lista de Itens do Checklist -->
                <div class="grid-detalhes-check" id="detalhes-itens-container">
                    <!-- Preenchido pelo JS -->
                </div>

                <!-- Observações -->
                <div class="modal-input" style="margin-top: 15px;">
                    <label style="font-weight: bold; color: var(--corTxt3);">Observações:</label>
                    <div style="background-color: var(--corFundo2); border: 1px solid var(--corBorda); border-radius: 10px; padding: 15px; color: var(--corTxt3); min-height: 60px; font-size: 13px;" id="detalhe_observacoes">
                        Sem observações adicionais.
                    </div>
                </div>

                <div class="modal-footer" style="margin-top: 20px; display: flex; gap: 10px;">
                    <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador' || $usuarioNivel === 'Executor'): ?>
                    <button type="button" class="btn-confirmar-full btn" onclick="editarChecklistAtual()" style="background-color: var(--corDestaque); color: white;">
                        Editar Inspeção <i class="bi bi-pencil-square"></i>
                    </button>
                    <?php endif; ?>
                    <button type="button" class="btn-confirmar-full btn" onclick="fecharModal('modalVerDetalhes')" style="background-color: var(--corBorda); color: var(--corTxt3);">
                        Fechar <i class="bi bi-x-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- CONTAINER DE TOASTS GLASSMORPHIC -->
    <div id="toast-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;"></div>

    <!-- SCRIPTS DE GERENCIAMENTO AJAX FETCH API -->
    <script>
        // Visualizar histórico
        function visualizarHistorico(id) {
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'buscar_historico_detalhes', ajax: '1', inspecao_id: id })
            })
            .then(res => res.json())
            .then(response => {
                if (response.success) {
                    const dados = response.data;
                    document.getElementById('vis-id-hist').innerText = dados.inspecao.id;
                    document.getElementById('vis-data-inicio').innerText = dados.inspecao.data_inicio;
                    document.getElementById('vis-data-fim').innerText = dados.inspecao.data_fim;

                    const tbody = document.getElementById('tabela-itens-historico');
                    tbody.innerHTML = '';
                    if (dados.checklists.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #888;">Nenhum ambiente verificado neste ciclo.</td></tr>`;
                    } else {
                        dados.checklists.forEach(c => {
                            let hasError = false;
                            if (c.itens_dinamicos) {
                                Object.values(c.itens_dinamicos).forEach(val => {
                                    if (val === 'Reparo Necessário' || val === 'NOk' || val === 'NOK') hasError = true;
                                });
                            }
                            
                            const badgeOk = `<span style="background:rgba(40,167,69,0.1); color:#28a745; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold;"><i class="bi bi-check-circle-fill"></i> OK</span>`;
                            const badgeNok = `<span style="background:rgba(220,53,69,0.1); color:#dc3545; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold;"><i class="bi bi-exclamation-triangle-fill"></i> Com Ocorrências</span>`;

                            const dataInspecao = c.data_inspecao ? c.data_inspecao.split('-').reverse().join('/') : '-';

                            tbody.innerHTML += `
                                <tr style="border-bottom: 1px solid var(--corBorda);">
                                    <td style="padding: 12px 15px; font-weight: bold; color: var(--corTxt3);">${c.ambiente_nome}</td>
                                    <td style="padding: 12px 15px; text-align: center;">${hasError ? badgeNok : badgeOk}</td>
                                    <td style="padding: 12px 15px; text-align: center; font-size: 13px;">${dataInspecao}</td>
                                    <td style="padding: 12px 15px; text-align: center;">${c.observacoes ? '<span title="' + c.observacoes + '" style="cursor:help; color:var(--corBase);"><i class="bi bi-chat-text-fill"></i></span>' : '-'}</td>
                                </tr>
                            `;
                        });
                    }
                    document.getElementById('modalVisualizarHistorico').style.display = 'flex';
                } else {
                    alert(response.message || 'Erro ao carregar detalhes.');
                }
            })
            .catch(err => {
                alert('Erro de conexão ao buscar histórico: ' + err.message);
            });
        }

        // Abre o modal de cadastro
        function abrirModalChecklist() {
            document.getElementById('form-checklist').reset();
            // Resetar botões do segmented control para "Não se aplica" padrão
            document.querySelectorAll('.segmented-control-wrapper').forEach(wrapper => {
                wrapper.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
                const defaultBtn = wrapper.querySelector('.btn-nsa');
                if (defaultBtn) defaultBtn.classList.add('active');
                
                const fieldName = wrapper.getAttribute('data-field');
                document.getElementById(fieldName).value = 'Não se aplica';
            });
            document.getElementById('observacoes_erro').style.display = 'none';
            document.getElementById('observacoes').style.borderColor = '';
            document.getElementById('modalNovoChecklist').style.display = 'flex';
        }

        // Abre o modal de visualização de detalhes
        function visualizarDetalhes(info) {
            window.checklistAtual = info;
            document.getElementById('detalhe_ambiente').innerText = info.ambiente_nome || 'Desconhecido';
            document.getElementById('detalhe_responsavel').innerText = info.responsavel_nome || 'N/A';
            document.getElementById('detalhe_data').innerText = info.data_inspecao;

            // Renderiza as badges coloridas correspondentes para os status
            const statusFields = ['tomadas', 'forros', 'paredes', 'projetor', 'tela', 'lousa'];
            statusFields.forEach(field => {
                const status = info['status_' + field] || 'Não se aplica';
                let badgeClass = 'badge-nsa';
                let iconClass = 'bi-slash-circle';
                if (status === 'Ok') {
                    badgeClass = 'badge-ok';
                    iconClass = 'bi-check-circle-fill';
                } else if (status === 'Defeito') {
                    badgeClass = 'badge-defeito';
                    iconClass = 'bi-exclamation-triangle-fill';
                }
                
                document.getElementById('detalhe_status_' + field).innerHTML = `
                    <span class="badge-status ${badgeClass}">
                        <i class="bi ${iconClass}"></i> ${status}
                    </span>
                `;
            });

            document.getElementById('detalhe_observacoes').innerText = info.observacoes || 'Nenhuma observação registrada.';
            document.getElementById('modalVerDetalhes').style.display = 'flex';
        }

        // Abre o modal de edição com os dados atuais
        function editarChecklistAtual() {
            fecharModal('modalVerDetalhes');
            if (!window.checklistAtual) return;
            
            abrirModalChecklist(window.checklistAtual.ambiente_id);
            document.querySelector('#modalNovoChecklist .modal-header h3').innerText = 'Editar Inspeção Preventiva';
            const btnSubmit = document.querySelector('#modalNovoChecklist button[type="submit"]');
            if (btnSubmit) btnSubmit.innerHTML = 'Atualizar Inspeção <i class="bi bi-arrow-repeat"></i>';
            
            document.getElementById('checklist_id').value = window.checklistAtual.id;
            
            if (document.getElementById('data_inspecao')) {
                // Conversão simples se for YYYY-MM-DD
                let dateStr = window.checklistAtual.data_inspecao;
                if (dateStr && dateStr.includes('/')) {
                    dateStr = dateStr.split('/').reverse().join('-');
                }
                document.getElementById('data_inspecao').value = dateStr;
            }
            
            if (document.getElementById('observacoes')) {
                document.getElementById('observacoes').value = window.checklistAtual.observacoes || '';
            }
            
            // Set dynamic fields if they exist
            const fields = ['tomadas', 'forros', 'paredes', 'projetor', 'tela', 'lousa'];
            setTimeout(() => {
                fields.forEach((field, index) => {
                    const status = window.checklistAtual['status_' + field];
                    if (!status) return;
                    
                    const hiddenInp = document.getElementById('status_' + index);
                    if (hiddenInp) {
                        hiddenInp.value = status;
                        const wrapper = hiddenInp.parentElement;
                        wrapper.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
                        
                        let btnSel = wrapper.querySelector('.btn-nsa');
                        if (status === 'Ok' || status === 'OK') btnSel = wrapper.querySelector('.btn-ok');
                        else if (status === 'Defeito') btnSel = wrapper.querySelector('.btn-defeito');
                        
                        if (btnSel) btnSel.classList.add('active');
                    }
                });
            }, 50);
        }

        // Fecha modais pelo ID
        function fecharModal(id) {
            document.getElementById(id).style.display = 'none';
        }

        // Inicializa interatividade de botões de segmented control do checklist
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.segmented-control-wrapper').forEach(wrapper => {
                const fieldName = wrapper.getAttribute('data-field');
                const hiddenInput = document.getElementById(fieldName);

                wrapper.querySelectorAll('.seg-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        // Remove active de todas as opções do item
                        wrapper.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
                        // Adiciona active no clicado
                        btn.classList.add('active');
                        // Atualiza o input oculto com o valor real
                        hiddenInput.value = btn.getAttribute('data-value');
                    });
                });
            });
        });

        // Sistema Premium de Toast
        function showToast(mensagem, tipo = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.style.cssText = `
                pointer-events: auto;
                background: ${tipo === 'success' ? 'rgba(40, 167, 69, 0.9)' : 'rgba(252, 35, 35, 0.9)'};
                color: white;
                padding: 15px 25px;
                border-radius: 12px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
                font-family: 'TASA Orbiter', sans-serif;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 10px;
                transform: translateY(-20px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            `;

            const icon = document.createElement('i');
            icon.className = tipo === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill';
            icon.style.fontSize = '1.2rem';
            toast.appendChild(icon);

            const text = document.createElement('span');
            text.innerText = mensagem;
            toast.appendChild(text);

            container.appendChild(toast);

            setTimeout(() => {
                toast.style.transform = 'translateY(0)';
                toast.style.opacity = '1';
            }, 50);

            setTimeout(() => {
                toast.style.transform = 'translateY(-20px)';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        // Validação cliente de banimento da palavra literal "VAZIO" (case-insensitive)
        function validarCamposChecklist() {
            const obsEl = document.getElementById('observacoes');
            const erroSpan = document.getElementById('observacoes_erro');
            const valor = obsEl.value.trim();

            if (valor.toUpperCase() === 'VAZIO') {
                erroSpan.innerText = "✖ Erro: O preenchimento das observações não pode ser 'VAZIO'.";
                erroSpan.style.display = 'block';
                obsEl.focus();
                obsEl.style.borderColor = '#fc2323';
                return false;
            }

            erroSpan.style.display = 'none';
            obsEl.style.borderColor = '';
            return true;
        }

        // Event listener para validação em tempo real de observações
        document.getElementById('observacoes').addEventListener('input', function() {
            const erroSpan = document.getElementById('observacoes_erro');
            if (this.value.trim().toUpperCase() === 'VAZIO') {
                erroSpan.innerText = "✖ O preenchimento do campo não pode ser 'VAZIO'.";
                erroSpan.style.display = 'block';
                this.style.borderColor = '#fc2323';
            } else {
                erroSpan.style.display = 'none';
                this.style.borderColor = '';
            }
        });

        // AJAX FETCH API: Enviar novo checklist
        function submeterChecklist(event) {
            event.preventDefault();
            if (!validarCamposChecklist()) return false;

            const form = document.getElementById('form-checklist');
            const formDataObj = new FormData(form);
            const searchParams = new URLSearchParams();
            
            for (const [key, value] of formDataObj.entries()) {
                searchParams.append(key, value);
            }
            searchParams.append('ajax', '1');
            // Forçamos a nova acao
            searchParams.set('acao', 'salvar_checklist');
            
            if (inspecaoAtualId) {
                searchParams.append('inspecao_id', inspecaoAtualId);
            }

            fetch(window.location.href, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                body: searchParams.toString()
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    fecharModal('modalNovoChecklist');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro interno de conexão ao salvar checklist.', 'danger');
            });
        }

        // NOVAS FUNÇÕES: Motor de Inspeção Mensal

        function iniciarInspecaoMensal() {
            if (!confirm('Deseja iniciar um novo ciclo de Inspeção Mensal?')) return;
            
            const formData = new URLSearchParams();
            formData.append('acao', 'iniciar_inspecao');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: formData.toString()
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro interno de conexão.', 'danger');
            });
        }

        let inspecaoAtualId = null;

        function abrirModalChecklistRapido(inspecaoId, ambId, ambNome) {
            inspecaoAtualId = inspecaoId;
            abrirModalChecklist(ambId);
            
            // Se for um select visível, forçamos o valor e desabilitamos para o usuário não trocar
            let inpHiddenAmb = document.getElementById('ambiente_id');
            if(inpHiddenAmb && inpHiddenAmb.tagName === 'SELECT') {
                inpHiddenAmb.style.pointerEvents = 'none';
                inpHiddenAmb.style.opacity = '0.7';
            }
        }

        function finalizarInspecao(inspecaoId) {
            if (!confirm('Tem certeza que deseja finalizar esta Inspeção Mensal? Não será possível adicionar mais ambientes.')) return;
            
            const formData = new URLSearchParams();
            formData.append('acao', 'finalizar_inspecao');
            formData.append('inspecao_id', inspecaoId);

            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: formData.toString()
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro interno de conexão.', 'danger');
            });
        }

        // AJAX FETCH API: Excluir um checklist
        function excluirChecklist(id) {
            if (!confirm(`Tem certeza de que deseja remover permanentemente o checklist de vistoria #${id}?`)) {
                return false;
            }

            const formData = new FormData();
            formData.append('acao', 'excluir');
            formData.append('id', id);
            formData.append('ajax', '1');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');

                    const row = document.getElementById(`row-${id}`);
                    if (row) {
                        row.style.opacity = '0';
                        row.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            row.remove();

                            // Verifica se a tabela ficou vazia
                            const tbody = document.getElementById('tabela-checklists');
                            if (tbody.children.length === 0) {
                                tbody.innerHTML = `
                                    <tr id="linha-vazia">
                                        <td colspan="5" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhum checklist de vistoria registrado no histórico.</td>
                                    </tr>
                                `;
                            }
                        }, 300);
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro de comunicação ao excluir o checklist.', 'danger');
            });
        }

        // Utilitários auxiliares de formatação e escape
        function formatarData(dataSql) {
            if (!dataSql) return '';
            const partes = dataSql.split('-');
            if (partes.length !== 3) return dataSql;
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
    </script>

    <!-- JS Globais -->
    <script src="../assets/js/scripts.js" defer></script>

    <!-- MODAL GERENCIAR ITENS DO CHECKLIST -->
    <div class="modal-fundo" id="modalGerenciarItens" style="display: none;">
        <div class="modal-box">
            <div class="modal-header">
                <h3>Gerenciar Itens do Checklist</h3>
                <button type="button" onclick="fecharModal('modalGerenciarItens')"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-form" style="padding: 20px;">
                <p style="font-size: 13px; color: var(--corTxt2); margin-bottom: 20px;">Selecione a família de ambientes e defina os itens que deverão ser inspecionados.</p>
                
                <div style="margin-bottom: 20px;">
                    <label style="font-weight: bold; font-size: 14px; margin-bottom: 5px; display: block;">Família do Ambiente:</label>
                    <select id="seletorFamiliaGerenciar" onchange="renderizarItensGerenciamento()" style="width: 100%; padding: 10px; border: 1px solid var(--corBorda); border-radius: 8px; outline: none; background: #fff; font-size: 14px; color: var(--corTxt3);">
                        <option value="Salas de Aulas">📚 Salas de Aulas</option>
                        <option value="Laboratórios">🔬 Laboratórios</option>
                        <option value="Oficinas">⚙️ Oficinas</option>
                        <option value="Administrativos">🏢 Administrativos</option>
                        <option value="Externos">🌳 Externos</option>
                        <option value="Geral">📦 Geral (Sem família cadastrada)</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="novoItemNome" placeholder="Ex: Extintores" style="flex: 1; padding: 10px; border: 1px solid var(--corBorda); border-radius: 8px; outline: none;">
                    <button type="button" onclick="adicionarItemChecklist()" style="background: var(--corDestaque); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;"><i class="bi bi-plus-lg"></i> Adicionar</button>
                </div>
                <div id="lista-itens-checklist" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto;">
                    <!-- Itens gerados dinamicamente pelo JS -->
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Lógica do Modal de Gerenciar Itens
        function abrirModalGerenciarItens() {
            renderizarItensGerenciamento();
            document.getElementById('modalGerenciarItens').style.display = 'flex';
        }
        
        function renderizarItensGerenciamento() {
            const container = document.getElementById('lista-itens-checklist');
            const familiaSelect = document.getElementById('seletorFamiliaGerenciar');
            const familia = familiaSelect ? familiaSelect.value : 'Geral';
            container.innerHTML = '';
            
            const itens = window.ITENS_CHECKLIST[familia] || [];
            
            if (itens.length === 0) {
                container.innerHTML = '<p style="color: #666; font-size: 13px;">Nenhum item cadastrado para esta família.</p>';
                return;
            }
            
            itens.forEach((item, index) => {
                container.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: var(--corFundo2); border: 1px solid var(--corBorda); border-radius: 8px;">
                        <span style="font-weight: bold; color: var(--corTxt3); font-size: 14px;">${item}</span>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" onclick="editarItemChecklist('${item}', '${familia}')" style="background: none; border: none; color: #00c5ff; cursor: pointer; font-size: 1.1rem;" title="Editar"><i class="bi bi-pencil-square"></i></button>
                            <button type="button" onclick="removerItemChecklist('${item}', '${familia}')" style="background: none; border: none; color: #fc2323; cursor: pointer; font-size: 1.1rem;" title="Excluir"><i class="bi bi-trash-fill"></i></button>
                        </div>
                    </div>
                `;
            });
        }
        
        function adicionarItemChecklist() {
            const input = document.getElementById('novoItemNome');
            const nome = input.value.trim();
            const familiaSelect = document.getElementById('seletorFamiliaGerenciar');
            const familia = familiaSelect ? familiaSelect.value : 'Geral';
            
            if (!nome) return;
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'adicionar_item_checklist', ajax: '1', nome: nome, familia: familia })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (!window.ITENS_CHECKLIST[familia]) window.ITENS_CHECKLIST[familia] = [];
                    window.ITENS_CHECKLIST[familia].push(nome);
                    input.value = '';
                    renderizarItensGerenciamento();
                    showToast('Item adicionado na família ' + familia + '!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }
        
        function editarItemChecklist(nomeAntigo, familia) {
            document.getElementById('edit_item_familia').value = familia;
            document.getElementById('edit_item_nome_antigo').value = nomeAntigo;
            document.getElementById('edit_item_nome_novo').value = nomeAntigo;
            document.getElementById('modalEditarItemChecklist').style.display = 'flex';
            setTimeout(() => document.getElementById('edit_item_nome_novo').focus(), 100);
        }
        
        function removerItemChecklist(nome, familia) {
            if (!confirm(`Tem certeza que deseja remover o item '${nome}' da família '${familia}'?`)) return;
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'remover_item_checklist', ajax: '1', nome: nome, familia: familia })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (window.ITENS_CHECKLIST[familia]) {
                        window.ITENS_CHECKLIST[familia] = window.ITENS_CHECKLIST[familia].filter(i => i !== nome);
                    }
                    renderizarItensGerenciamento();
                    showToast('Item removido!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }
        
        // Substituir a abertura de modal antigo
        // Detecta quando o usuário troca de ambiente no Select
        document.getElementById('ambiente_id').addEventListener('change', function(e) {
            const ambId = this.value;
            const familia = window.AMBIENTES_FAMILIAS[ambId] || 'Geral';
            renderizarFormularioInspecao(familia);
        });

        function renderizarFormularioInspecao(familia) {
            const container = document.getElementById('container-itens-checklist-dinamico');
            container.innerHTML = '';
            
            const itens = window.ITENS_CHECKLIST[familia] || window.ITENS_CHECKLIST['Geral'] || [];
            
            if (itens.length === 0) {
                container.innerHTML = '<p style="color: #666; font-size: 13px;">Nenhum item padrão para esta família. Inspeção opcional.</p>';
                return;
            }
            
            itens.forEach((item, index) => {
                const safeId = 'status_' + index;
                container.innerHTML += `
                    <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                        <span style="font-weight: bold; color: var(--corTxt3); width: 120px;">${item}:</span>
                        <div class="segmented-control-wrapper" data-field="${safeId}">
                            <button type="button" class="seg-btn btn-ok" data-value="Ok" title="Ok"><i class="bi bi-check-lg" style="font-size: 1.3rem; font-weight: bold;"></i></button>
                            <button type="button" class="seg-btn btn-defeito" data-value="Defeito" title="Defeito"><i class="bi bi-x-lg" style="font-size: 1.3rem; font-weight: bold;"></i></button>
                            <button type="button" class="seg-btn btn-nsa active" data-value="Não se aplica" title="Não se aplica">N/A</button>
                        </div>
                        <input type="hidden" name="item_name_${index}" value="${item}">
                        <input type="hidden" name="item_status_${index}" id="${safeId}" value="Não se aplica">
                    </div>
                `;
            });
            
            // Re-bind segmented controls for dynamic items
            container.querySelectorAll('.segmented-control-wrapper').forEach(wrapper => {
                const hiddenInput = document.getElementById(wrapper.getAttribute('data-field'));
                wrapper.querySelectorAll('.seg-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        wrapper.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        hiddenInput.value = btn.getAttribute('data-value');
                    });
                });
            });
        }

        const abrirModalChecklistOld = abrirModalChecklist;
        abrirModalChecklist = function(ambientePreSelecionado = null) {
            document.getElementById('form-checklist').reset();
            
            const ambSelect = document.getElementById('ambiente_id');
            if (ambientePreSelecionado) {
                ambSelect.value = ambientePreSelecionado;
            } else {
                ambSelect.selectedIndex = 0; // Se não enviou preselecionado, reseta
            }
            
            // Renderiza itens baseados na familia do ambiente selecionado (ou vazio se não selecionou)
            const ambId = ambSelect.value;
            const familia = ambId ? (window.AMBIENTES_FAMILIAS[ambId] || 'Geral') : 'Geral';
            renderizarFormularioInspecao(familia);
            
            document.getElementById('observacoes_erro').style.display = 'none';
            document.getElementById('observacoes').style.borderColor = '';
            document.getElementById('modalNovoChecklist').style.display = 'flex';
        }
        
        // Atualizar visualizarDetalhes para campos dinâmicos
        function visualizarDetalhes(info) {
            document.getElementById('detalhe_ambiente').innerText = info.ambiente_nome || 'Desconhecido';
            document.getElementById('detalhe_responsavel').innerText = info.responsavel_nome || 'N/A';
            document.getElementById('detalhe_data').innerText = info.data_inspecao;

            const container = document.getElementById('detalhes-itens-container');
            container.innerHTML = '';
            
            if (info.itens_dinamicos) {
                for (const [nome, status] of Object.entries(info.itens_dinamicos)) {
                    let badgeClass = 'badge-nsa';
                    let iconClass = 'bi-slash-circle';
                    if (status === 'Ok') { badgeClass = 'badge-ok'; iconClass = 'bi-check-circle-fill'; } 
                    else if (status === 'Defeito') { badgeClass = 'badge-defeito'; iconClass = 'bi-exclamation-triangle-fill'; }
                    
                    container.innerHTML += `
                        <div class="card-detalhe-item">
                            <span class="title">${nome}:</span>
                            <div>
                                <span class="badge-status ${badgeClass}">
                                    <i class="bi ${iconClass}"></i> ${status}
                                </span>
                            </div>
                        </div>
                    `;
                }
            }

            document.getElementById('detalhe_observacoes').innerText = info.observacoes || 'Nenhuma observação registrada.';
            document.getElementById('modalVerDetalhes').style.display = 'flex';
        }
    </script>
    

    <!-- MODAL EDITAR ITEM CHECKLIST -->
    <div class="modal-fundo" id="modalEditarItemChecklist" style="display: none; z-index: 10001;">
        <div class="modal-box" style="width: 400px; padding: 25px;">
            <div class="modal-header" style="margin-bottom: 20px;">
                <h3>Editar Item</h3>
                <button type="button" onclick="fecharModal('modalEditarItemChecklist')"><i class="bi bi-x-lg"></i></button>
            </div>
            <form onsubmit="submeterEdicaoItemChecklist(event)">
                <input type="hidden" id="edit_item_familia">
                <input type="hidden" id="edit_item_nome_antigo">
                <div class="modal-input" style="margin-bottom: 20px;">
                    <label style="font-weight: bold; margin-bottom: 8px; display: block;">Nome do Item:</label>
                    <input type="text" id="edit_item_nome_novo" required style="width: 100%; padding: 12px; border: 1px solid var(--corBorda); border-radius: 8px; outline: none; background: var(--corFundo); color: var(--corTxt3);">
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" onclick="fecharModal('modalEditarItemChecklist')" style="background: var(--corFundo2); color: var(--corTxt2); border: 1px solid var(--corBorda); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">Cancelar</button>
                    <button type="submit" style="background: var(--corDestaque); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">Salvar <i class="bi bi-check-lg"></i></button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        function submeterEdicaoItemChecklist(e) {
            e.preventDefault();
            const familia = document.getElementById('edit_item_familia').value;
            const nomeAntigo = document.getElementById('edit_item_nome_antigo').value;
            const novoNome = document.getElementById('edit_item_nome_novo').value.trim();
            
            if (!novoNome || novoNome === nomeAntigo) {
                fecharModal('modalEditarItemChecklist');
                return;
            }
            
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({ acao: 'editar_item_checklist', ajax: '1', nome_antigo: nomeAntigo, nome_novo: novoNome, familia: familia })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (window.ITENS_CHECKLIST[familia]) {
                        const idx = window.ITENS_CHECKLIST[familia].indexOf(nomeAntigo);
                        if (idx !== -1) window.ITENS_CHECKLIST[familia][idx] = novoNome;
                    }
                    renderizarItensGerenciamento();
                    fecharModal('modalEditarItemChecklist');
                    showToast('Item atualizado com sucesso!', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            });
        }
    </script>

    <!-- ========================================================================= -->
    <!-- MODAL EXPORTAR RELATÓRIO EXCEL -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalExportacaoExcel" style="display: none;">
        <div class="modal-box" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Exportar Relatório</h3>
                <button type="button" onclick="fecharModalExportacao()"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-body">
                <form id="form-exportar-excel" onsubmit="enviarExportacao(event)">
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="export_data_inicio" style="display:block; margin-bottom: 5px;">Data Inicial:</label>
                        <input type="date" id="export_data_inicio" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--corBorda); background: var(--corFundo); color: var(--corTxt3);">
                    </div>
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label for="export_data_fim" style="display:block; margin-bottom: 5px;">Data Final:</label>
                        <input type="date" id="export_data_fim" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--corBorda); background: var(--corFundo); color: var(--corTxt3);">
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="fecharModalExportacao()" style="background: var(--corFundo); color: var(--corTxt3); border: 1px solid var(--corBorda); padding: 10px 15px; border-radius: 6px; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="background: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            <i class="bi bi-download"></i> Baixar Arquivo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        function abrirModalExportacao() {
            document.getElementById('modalExportacaoExcel').style.display = 'flex';
        }

        function fecharModalExportacao() {
            document.getElementById('modalExportacaoExcel').style.display = 'none';
        }

        function enviarExportacao(event) {
            event.preventDefault();
            const inicio = document.getElementById('export_data_inicio').value;
            const fim = document.getElementById('export_data_fim').value;
            window.location.href = '?action=exportar_excel&data_inicio=' + inicio + '&data_fim=' + fim;
            fecharModalExportacao();
        }
    </script>

</body>
</html>
