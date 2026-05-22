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
    $controller->processarAcao();
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
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }

        /* Botão Defeito Ativo (Vermelho Premium / Cor Base) */
        .seg-btn.btn-defeito.active {
            background-color: #fc2323 !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(252, 35, 35, 0.3);
        }

        /* Botão Não se Aplica Ativo (Cinza/Neutro) */
        .seg-btn.btn-nsa.active {
            background-color: var(--corBorda) !important;
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
            <?php if ($usuarioNivel === 'Gestor'): ?>
                <a href="./ambientes.php" class="links">
                    <i class="bi bi-building"></i> Painel de Ambientes
                </a>

                <a href="./dashboard_analise.php" class="links">
                    <i class="bi bi-bar-chart-line-fill"></i> Análise de Dados
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
                <h2 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3);">Manutenção Preventiva (Checklist)</h2>
                <p style="color: var(--corTxt2); font-size: 13px; margin-top: 5px;">Acompanhe o histórico de vistorias prediais ou registre uma nova inspeção.</p>
            </div>
            <button class="btn-page-action" onclick="abrirModalChecklist()" style="background: var(--corBase); color: #fff; border: none; border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; font-weight: bold; font-family: 'TASA Orbiter', sans-serif;">
                <i class="bi bi-plus-lg"></i> Novo Checklist
            </button>
        </div>

        <!-- HISTÓRICO DE CHECKLISTS PREVENTIVAS -->
        <div class="tabela-bg2" style="margin-top: 25px;">
            <div class="tabela-titulo" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <i class="bi bi-clock-history" style="font-size: 1.5rem; color: var(--corBase);"></i>
                <h2>Histórico de Inspeções Prediais</h2>
            </div>
            
            <div class="tabela-wrapper" style="overflow-x: auto; background: var(--corFundo); border-radius: 12px; border: 1px solid var(--corBorda);">
                <table class="tabela-main" style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--corBorda); background: rgba(0,0,0,0.02);">
                            <th style="padding: 15px; width: 80px;">ID</th>
                            <th style="padding: 15px;">Bloco / Sala</th>
                            <th style="padding: 15px;">Responsável</th>
                            <th style="padding: 15px; text-align: center; width: 150px;">Data Inspeção</th>
                            <th style="padding: 15px; text-align: center; width: 180px;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-checklists">
                        <?php if (empty($checklists)): ?>
                            <tr id="linha-vazia">
                                <td colspan="5" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhum checklist de vistoria registrado no histórico.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($checklists as $c): ?>
                                <tr id="row-<?php echo $c->getId(); ?>" style="border-bottom: 1px solid var(--corBorda); transition: 0.2s;">
                                    <td style="padding: 15px; font-weight: bold; color: var(--corTxt2);">#<?php echo $c->getId(); ?></td>
                                    <td style="padding: 15px; font-size: 15px; font-weight: 500; color: var(--corTxt3);"><?php echo htmlspecialchars($c->getAmbienteNome() ?? 'Desconhecido'); ?></td>
                                    <td style="padding: 15px; font-size: 14px; color: var(--corTxt2);"><?php echo htmlspecialchars($c->getResponsavelNome() ?? 'N/A'); ?></td>
                                    <td style="padding: 15px; text-align: center; font-size: 14px; color: var(--corTxt3);"><?php echo date('d/m/Y', strtotime($c->getDataInspecao())); ?></td>
                                    <td style="padding: 15px; text-align: center;">
                                        <div style="display: flex; gap: 8px; justify-content: center;">
                                            <button class="btnAcao editar" type="button" title="Visualizar Detalhes"
                                                    onclick="visualizarDetalhes(<?php echo htmlspecialchars(json_encode([
                                                        'id' => $c->getId(),
                                                        'ambiente_nome' => $c->getAmbienteNome(),
                                                        'responsavel_nome' => $c->getResponsavelNome(),
                                                        'data_inspecao' => date('d/m/Y', strtotime($c->getDataInspecao())),
                                                        'status_tomadas' => $c->getStatusTomadas(),
                                                        'status_forros' => $c->getStatusForros(),
                                                        'status_paredes' => $c->getStatusParedes(),
                                                        'status_projetor' => $c->getStatusProjetor(),
                                                        'status_tela' => $c->getStatusTela(),
                                                        'status_lousa' => $c->getStatusLousa(),
                                                        'observacoes' => $c->getObservacoes()
                                                    ])); ?>)"
                                                    style="background: #007bff; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                                <i class="bi bi-eye"></i> Detalhes
                                            </button>
                                            
                                            <button class="btnAcao deletar" type="button" title="Excluir Registro"
                                                    onclick="excluirChecklist(<?php echo $c->getId(); ?>)"
                                                    style="background: var(--corBase); color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
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

                <!-- Bloco / Sala e Data da Inspeção -->
                <div class="modal-row quebraMobile">
                    <div class="modal-input" style="flex: 1;">
                        <label for="ambiente_id">Ambiente (Bloco / Sala):</label>
                        <div class="input-wrapper">
                            <select name="ambiente_id" id="ambiente_id" required style="width: 100%;">
                                <option value="" disabled selected>Selecione um ambiente...</option>
                                <?php foreach ($ambientesAtivos as $a): ?>
                                    <option value="<?php echo $a->getId(); ?>"><?php echo htmlspecialchars($a->getNomeBlocoSala()); ?></option>
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

                <!-- 6 ITENS OBRIGATÓRIOS DO CHECKLIST COM SELECTORES SVG VECTOR VERDES QUANDO "OK" -->
                <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
                    
                    <!-- Item 1: Tomadas -->
                    <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                        <span style="font-weight: bold; color: var(--corTxt3); width: 120px;">Tomadas:</span>
                        <div class="segmented-control-wrapper" data-field="status_tomadas">
                            <button type="button" class="seg-btn btn-ok" data-value="Ok">
                                <svg class="check-svg" viewBox="0 0 24 24" width="16" height="16" style="display: none;">
                                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Ok
                            </button>
                            <button type="button" class="seg-btn btn-defeito" data-value="Defeito">Defeito</button>
                            <button type="button" class="seg-btn btn-nsa active" data-value="Não se aplica">Não se aplica</button>
                        </div>
                        <input type="hidden" name="status_tomadas" id="status_tomadas" value="Não se aplica">
                    </div>

                    <!-- Item 2: Forros -->
                    <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                        <span style="font-weight: bold; color: var(--corTxt3); width: 120px;">Forros:</span>
                        <div class="segmented-control-wrapper" data-field="status_forros">
                            <button type="button" class="seg-btn btn-ok" data-value="Ok">
                                <svg class="check-svg" viewBox="0 0 24 24" width="16" height="16" style="display: none;">
                                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Ok
                            </button>
                            <button type="button" class="seg-btn btn-defeito" data-value="Defeito">Defeito</button>
                            <button type="button" class="seg-btn btn-nsa active" data-value="Não se aplica">Não se aplica</button>
                        </div>
                        <input type="hidden" name="status_forros" id="status_forros" value="Não se aplica">
                    </div>

                    <!-- Item 3: Paredes -->
                    <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                        <span style="font-weight: bold; color: var(--corTxt3); width: 120px;">Paredes:</span>
                        <div class="segmented-control-wrapper" data-field="status_paredes">
                            <button type="button" class="seg-btn btn-ok" data-value="Ok">
                                <svg class="check-svg" viewBox="0 0 24 24" width="16" height="16" style="display: none;">
                                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Ok
                            </button>
                            <button type="button" class="seg-btn btn-defeito" data-value="Defeito">Defeito</button>
                            <button type="button" class="seg-btn btn-nsa active" data-value="Não se aplica">Não se aplica</button>
                        </div>
                        <input type="hidden" name="status_paredes" id="status_paredes" value="Não se aplica">
                    </div>

                    <!-- Item 4: Projetor -->
                    <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                        <span style="font-weight: bold; color: var(--corTxt3); width: 120px;">Projetor:</span>
                        <div class="segmented-control-wrapper" data-field="status_projetor">
                            <button type="button" class="seg-btn btn-ok" data-value="Ok">
                                <svg class="check-svg" viewBox="0 0 24 24" width="16" height="16" style="display: none;">
                                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Ok
                            </button>
                            <button type="button" class="seg-btn btn-defeito" data-value="Defeito">Defeito</button>
                            <button type="button" class="seg-btn btn-nsa active" data-value="Não se aplica">Não se aplica</button>
                        </div>
                        <input type="hidden" name="status_projetor" id="status_projetor" value="Não se aplica">
                    </div>

                    <!-- Item 5: Tela -->
                    <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                        <span style="font-weight: bold; color: var(--corTxt3); width: 120px;">Tela:</span>
                        <div class="segmented-control-wrapper" data-field="status_tela">
                            <button type="button" class="seg-btn btn-ok" data-value="Ok">
                                <svg class="check-svg" viewBox="0 0 24 24" width="16" height="16" style="display: none;">
                                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Ok
                            </button>
                            <button type="button" class="seg-btn btn-defeito" data-value="Defeito">Defeito</button>
                            <button type="button" class="seg-btn btn-nsa active" data-value="Não se aplica">Não se aplica</button>
                        </div>
                        <input type="hidden" name="status_tela" id="status_tela" value="Não se aplica">
                    </div>

                    <!-- Item 6: Lousa -->
                    <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                        <span style="font-weight: bold; color: var(--corTxt3); width: 120px;">Lousa:</span>
                        <div class="segmented-control-wrapper" data-field="status_lousa">
                            <button type="button" class="seg-btn btn-ok" data-value="Ok">
                                <svg class="check-svg" viewBox="0 0 24 24" width="16" height="16" style="display: none;">
                                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Ok
                            </button>
                            <button type="button" class="seg-btn btn-defeito" data-value="Defeito">Defeito</button>
                            <button type="button" class="seg-btn btn-nsa active" data-value="Não se aplica">Não se aplica</button>
                        </div>
                        <input type="hidden" name="status_lousa" id="status_lousa" value="Não se aplica">
                    </div>

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
                <div class="grid-detalhes-check">
                    <div class="card-detalhe-item">
                        <span class="title">Tomadas:</span>
                        <div id="detalhe_status_tomadas"></div>
                    </div>
                    <div class="card-detalhe-item">
                        <span class="title">Forros:</span>
                        <div id="detalhe_status_forros"></div>
                    </div>
                    <div class="card-detalhe-item">
                        <span class="title">Paredes:</span>
                        <div id="detalhe_status_paredes"></div>
                    </div>
                    <div class="card-detalhe-item">
                        <span class="title">Projetor:</span>
                        <div id="detalhe_status_projetor"></div>
                    </div>
                    <div class="card-detalhe-item">
                        <span class="title">Tela:</span>
                        <div id="detalhe_status_tela"></div>
                    </div>
                    <div class="card-detalhe-item">
                        <span class="title">Lousa:</span>
                        <div id="detalhe_status_lousa"></div>
                    </div>
                </div>

                <!-- Observações -->
                <div class="modal-input" style="margin-top: 15px;">
                    <label style="font-weight: bold; color: var(--corTxt3);">Observações:</label>
                    <div style="background-color: var(--corFundo2); border: 1px solid var(--corBorda); border-radius: 10px; padding: 15px; color: var(--corTxt3); min-height: 60px; font-size: 13px;" id="detalhe_observacoes">
                        Sem observações adicionais.
                    </div>
                </div>

                <div class="modal-footer" style="margin-top: 20px;">
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
            const formData = new FormData(form);
            formData.append('ajax', '1');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    fecharModal('modalNovoChecklist');

                    // Adiciona dinamicamente à tabela de histórico
                    const tbody = document.getElementById('tabela-checklists');
                    const linhaVazia = document.getElementById('linha-vazia');
                    if (linhaVazia) {
                        linhaVazia.remove();
                    }

                    // Prepara informações para botão de visualizar detalhes
                    const rawInfo = {
                        id: data.data.id,
                        ambiente_nome: data.data.ambiente_nome,
                        responsavel_nome: data.data.responsavel_nome,
                        data_inspecao: formatarData(data.data.data_inspecao),
                        status_tomadas: data.data.status_tomadas,
                        status_forros: data.data.status_forros,
                        status_paredes: data.data.status_paredes,
                        status_projetor: data.data.status_projetor,
                        status_tela: data.data.status_tela,
                        status_lousa: data.data.status_lousa,
                        observacoes: data.data.observacoes
                    };

                    const novaLinha = document.createElement('tr');
                    novaLinha.id = `row-${data.data.id}`;
                    novaLinha.style.cssText = 'border-bottom: 1px solid var(--corBorda); transition: 0.2s; background-color: rgba(40, 167, 69, 0.08);';
                    
                    novaLinha.innerHTML = `
                        <td style="padding: 15px; font-weight: bold; color: var(--corTxt2);">#${data.data.id}</td>
                        <td style="padding: 15px; font-size: 15px; font-weight: 500; color: var(--corTxt3);">${escapeHtml(data.data.ambiente_nome)}</td>
                        <td style="padding: 15px; font-size: 14px; color: var(--corTxt2);">${escapeHtml(data.data.responsavel_nome)}</td>
                        <td style="padding: 15px; text-align: center; font-size: 14px; color: var(--corTxt3);">${formatarData(data.data.data_inspecao)}</td>
                        <td style="padding: 15px; text-align: center;">
                            <div style="display: flex; gap: 8px; justify-content: center;">
                                <button class="btnAcao editar" type="button" title="Visualizar Detalhes"
                                        onclick='visualizarDetalhes(${JSON.stringify(rawInfo)})'
                                        style="background: #007bff; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                    <i class="bi bi-eye"></i> Detalhes
                                </button>
                                
                                <button class="btnAcao deletar" type="button" title="Excluir Registro"
                                        onclick="excluirChecklist(${data.data.id})"
                                        style="background: var(--corBase); color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;

                    tbody.prepend(novaLinha);
                    setTimeout(() => {
                        novaLinha.style.backgroundColor = '';
                    }, 1000);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro interno de conexão ao salvar checklist.', 'danger');
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
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
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
</body>
</html>
