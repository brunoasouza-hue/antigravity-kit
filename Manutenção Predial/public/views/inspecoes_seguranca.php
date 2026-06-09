<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Inspeções de Segurança (Quadro Elétrico - RH-064-FR009)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Controllers/InspecaoPainelController.php';
require_once __DIR__ . '/../../src/Models/InspecaoPainel.php';
require_once __DIR__ . '/../../src/Models/InspecaoGeral.php';

// Exige autenticação básica
AuthController::verificarAutenticacao();

$usuarioNome = $_SESSION['usuario_nome'] ?? 'Usuário';
$usuarioNivel = $_SESSION['usuario_nivel'] ?? 'Solicitante';
$usuarioId = $_SESSION['usuario_id'] ?? 0;

// Processamento de Ações do Controller antes do carregamento da página
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['acao'])) {
    $controller = new InspecaoPainelController();
    $controller->processarAcao();
}

$inspecoesPainel = InspecaoPainel::listarTodas();

$totalVistorias = count($inspecoesPainel);
$conformes = 0;
$naoConformes = 0;
foreach ($inspecoesPainel as $ins) {
    if ($ins->getStatusGeral() === 'Conforme') {
        $conformes++;
    } else {
        $naoConformes++;
    }
}

$inspecaoGeralAtiva = InspecaoGeral::buscarAtiva();
$inspecoesGeral = array_filter(InspecaoGeral::listarTodas(), function($ig) {
    return $ig->getStatus() === 'Encerrada';
});

// Data atual formatada para o cabeçalho
$dataAtual = date('d/m/Y');
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inspeções de Segurança - SENAI MANUTENÇÃO</title>

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

    <!-- Biblioteca html2pdf.js via CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

    <style>
        :root {
            --corCardBg: #ffffff;
            --corBadgeOk: #28a745;
            --corBadgePendente: #ffc107;
            --corBadgeAviso: #dc3545;
        }

        html[data-tema='escuro'] {
            --corCardBg: #2a2c36;
        }

        .inspecoes-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .inspecoes-stat-card {
            background: var(--corCardBg);
            border: 1px solid var(--corBordas);
            border-radius: 15px;
            padding: 25px;
            box-shadow: var(--sombra);
            display: flex;
            align-items: center;
            gap: 20px;
            transition: all 0.3s ease;
        }

        .inspecoes-stat-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--sombra2);
        }

        .inspecoes-stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
        }

        .stat-blue {
            background: rgba(0, 123, 255, 0.1);
            color: #007bff;
        }

        .stat-green {
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
        }

        .stat-red {
            background: rgba(252, 35, 35, 0.1);
            color: #fc2323;
        }

        .inspecoes-stat-info h3 {
            font-size: 1.8rem;
            font-weight: 800;
            margin: 0;
            color: var(--corTxt3);
            font-family: 'TASA Orbiter', sans-serif;
        }

        .inspecoes-stat-info p {
            margin: 0;
            font-size: 0.85rem;
            color: var(--corTxt2);
            opacity: 0.85;
            font-weight: 600;
        }

        .section-box {
            background: var(--corCardBg);
            border: 1px solid var(--corBordas);
            border-radius: 20px;
            padding: 30px;
            box-shadow: var(--sombra);
            margin-bottom: 30px;
        }

        .section-box-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--corBordas);
        }

        .section-box-title {
            font-size: 1.4rem;
            font-weight: 800;
            color: #fc2323;
            font-family: 'TASA Orbiter', sans-serif;
            margin: 0;
        }

        .inspecoes-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .inspecoes-badge.ok {
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
        }

        .inspecoes-badge.risco {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
        }

        .btn-premium {
            background: #fc2323;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-family: 'TASA Orbiter', sans-serif;
            text-decoration: none;
        }

        .btn-premium:hover {
            background: #d61a1a;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(252, 35, 35, 0.25);
        }

        .table-action-btn {
            background: var(--corFundo2);
            border: 1px solid var(--corBordas);
            color: var(--corTxt3);
            border-radius: 8px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: bold;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .table-action-btn:hover {
            background: #fc2323;
            color: white;
            border-color: #fc2323;
        }

        /* Controles Segmentados e Detalhes Condicionais */
        .segmented-control-wrapper {
            background: var(--corFundo2);
            border: 1px solid var(--corBordas);
            border-radius: 14px;
            padding: 4px;
            display: inline-flex;
            gap: 4px;
            width: 100%;
            max-width: 250px;
        }

        .seg-btn {
            flex: 1;
            border: none;
            background: transparent;
            padding: 8px 12px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 10px;
            cursor: pointer;
            color: var(--corTxt2);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            transition: all 0.2s ease;
        }

        .seg-btn.active.btn-ok {
            background-color: #28a745 !important;
            color: white !important;
        }

        .seg-btn.active.btn-defeito {
            background-color: #fc2323 !important;
            color: white !important;
        }

        .seg-btn.active.btn-nsa {
            background-color: rgba(108, 117, 125, 0.15) !important;
            color: var(--corTxt3) !important;
        }

        .sub-detalhe-container {
            background: rgba(0, 0, 0, 0.02);
            border: 1px dashed var(--corBordas);
            border-radius: 8px;
            padding: 12px 15px;
            margin-top: 8px;
            display: none;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
            width: 100%;
        }

        html[data-tema='escuro'] .sub-detalhe-container {
            background: rgba(255, 255, 255, 0.02);
        }

        .sub-detalhe-container label {
            font-size: 11px;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            color: var(--corTxt3);
        }

        /* Detalhes de Vistoria */
        .card-detalhe-item {
            background: var(--corFundo2);
            border: 1px solid var(--corBordas);
            border-radius: 12px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .card-detalhe-item span.title {
            font-weight: bold;
            color: var(--corTxt3);
            font-size: 13px;
        }

        .card-detalhe-item .value-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Template Invisível de Visualização do PDF */
        #pdf-template {
            width: 700px;
            padding: 10px;
            font-family: Arial, sans-serif;
            color: #000;
            background-color: #fff;
            box-sizing: border-box;
        }

        #pdf-template table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        #pdf-template th, #pdf-template td {
            border: 1px solid #000;
            padding: 2.5px 4px;
            font-size: 8.5px;
            vertical-align: middle;
            color: #000;
            background-color: #fff;
        }

        #pdf-template .header-main td {
            text-align: center;
            font-weight: bold;
        }

        #pdf-template .item-num {
            text-align: center;
            width: 35px;
            font-weight: bold;
        }

        #pdf-template .col-check {
            text-align: center;
            width: 35px;
            font-size: 12px;
            font-weight: bold;
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

            <!-- Dashboard de Indicadores -->
            <a href="./dashboard.php" class="links">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>

            <!-- Menu Manutenção condicional -->
            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador' || $usuarioNivel === 'Executor'): ?>
                <div class="menu-manutencao">
                    <a href="javascript:void(0)" class="links manutencao-btn" id="btn-manutencao">
                        <div>
                            <i class="bi bi-tools"></i>
                            <span>Manutenção</span>
                        </div>
                        <i class="bi bi-caret-down-fill seta"></i>
                    </a>
                    <div class="submenu" id="submenu-manutencao">
                        <a href="./preventivas.php" class="links-sub">
                            <i class="bi bi-clock-fill"></i> Preventiva (Checklist)
                        </a>
                        <a href="./corretivas.php" class="links-sub">
                            <i class="bi bi-wrench"></i> Corretiva (O.S)
                        </a>
                    </div>
                </div>
            <?php else: ?>
                <a href="./corretivas.php" class="links">
                    <i class="bi bi-wrench"></i> Solicitar Corretiva (O.S)
                </a>
            <?php endif; ?>

            <!-- Inspeções de segurança (Ativo) -->
            <div class="menu-inspecoes aberto">
                <a href="javascript:void(0)" class="links ativo inspecoes-btn" id="btn-inspecoes">
                    <div>
                        <i class="bi bi-shield-fill-check"></i>
                        <span>Inspeções</span>
                    </div>
                    <i class="bi bi-caret-down-fill seta"></i>
                </a>
                <div class="submenu aberto" id="submenu-inspecoes" style="display: flex;">
                    <a href="./inspecoes_seguranca.php" class="links-sub ativo">
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
                <button onclick="changeTheme()" id="tema"><i class="bi bi-brightness-high-fill"></i></button>
                <a href="./perfil.php" class="configs dont-rotate" title="Perfil">
                    <i class="bi bi-person-fill"></i>
                </a>
            </div>
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

        <!-- CONTEÚDO DA PÁGINA -->
        <div class="dashboard-container" style="margin-top: 30px;">

            <!-- Estatísticas Rápidas de Inspeções de Segurança -->
            <div class="inspecoes-stats-grid">
                <div class="inspecoes-stat-card">
                    <div class="inspecoes-stat-icon stat-blue">
                        <i class="bi bi-journal-check"></i>
                    </div>
                    <div class="inspecoes-stat-info">
                        <h3 id="stat-total"><?php echo $totalVistorias; ?></h3>
                        <p>Vistorias Efetuadas</p>
                    </div>
                </div>

                <div class="inspecoes-stat-card">
                    <div class="inspecoes-stat-icon stat-green">
                        <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="inspecoes-stat-info">
                        <h3 id="stat-conforme"><?php echo $conformes; ?></h3>
                        <p>Quadros Conformes</p>
                    </div>
                </div>

                <div class="inspecoes-stat-card">
                    <div class="inspecoes-stat-icon stat-red">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <div class="inspecoes-stat-info">
                        <h3 id="stat-nconforme"><?php echo $naoConformes; ?></h3>
                        <p>Não Conformidades</p>
                    </div>
                </div>
            </div>

            <!-- PAINEL DE SESSÃO ATIVA OU BANNER DE CRIAÇÃO -->
            <?php if (isset($inspecaoGeralAtiva)): ?>
                <div class="section-box" style="border: 2px solid #fc2323; background: rgba(252, 35, 35, 0.02); margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid var(--corBordas); padding-bottom: 15px;">
                        <div>
                            <span class="inspecoes-badge risco" style="font-weight: bold; margin-bottom: 8px;">
                                <i class="bi bi-play-fill"></i> Auditoria em Andamento
                            </span>
                            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--corTxt3); margin: 0; font-family: 'TASA Orbiter', sans-serif;">
                                Sessão de Inspeção: <?php echo htmlspecialchars($inspecaoGeralAtiva->getUnidade()); ?>
                            </h2>
                            <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: var(--corTxt2);">
                                Iniciada em <?php echo date('d/m/Y', strtotime($inspecaoGeralAtiva->getDataInspecao())); ?> pelo inspetor <strong><?php echo htmlspecialchars($inspecaoGeralAtiva->getResponsavelNome() ?? 'N/D'); ?></strong>.
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Executor'): ?>
                            <button class="btn-premium" onclick="abrirModalNovaInspecaoSetor(<?php echo $inspecaoGeralAtiva->getId(); ?>, '<?php echo htmlspecialchars(addslashes($inspecaoGeralAtiva->getUnidade())); ?>', '<?php echo $inspecaoGeralAtiva->getDataInspecao(); ?>')">
                                <i class="bi bi-plus-lg"></i> Adicionar Setor
                            </button>
                            <button class="btn-premium" onclick="abrirModalEncerrarGeral(<?php echo $inspecaoGeralAtiva->getId(); ?>)" style="background: #dc3545;">
                                <i class="bi bi-stop-fill"></i> Encerrar Auditoria
                            </button>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Lista de Setores da Sessão Ativa -->
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--corTxt3); margin-bottom: 15px; font-family: 'TASA Orbiter', sans-serif;">
                        Setores/Painéis Cadastrados nesta Sessão:
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;" id="setores-ativos-lista">
                        <!-- LOOP_SETORESATIVOS_MOCK_INICIAL -->
                        <!-- FIM_LOOP_SETORESATIVOS_MOCK_INICIAL -->
                        <?php $setoresAtivos = $inspecaoGeralAtiva->buscarItensPainel(); ?>
                        <?php foreach ($setoresAtivos as $setorAtivo): ?>
                        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--corFundo2); border: 1px solid var(--corBordas); padding: 12px 20px; border-radius: 12px;">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-weight: bold; color: var(--corTxt3); font-size: 13.5px;">
                                    Setor: <?php echo htmlspecialchars($setorAtivo->getSetor()); ?>
                                </span>
                                <span style="font-size: 11.5px; color: var(--corTxt2);">
                                    Quadro (TAG): <?php echo htmlspecialchars($setorAtivo->getQuadroTag()); ?>
                                </span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <?php if ($setorAtivo->getStatusGeral() === 'Conforme'): ?>
                                    <span class="inspecoes-badge ok">
                                        <i class="bi bi-check-circle-fill"></i> Conforme
                                    </span>
                                <?php else: ?>
                                    <span class="inspecoes-badge risco">
                                        <i class="bi bi-exclamation-triangle-fill"></i> Não Conforme
                                    </span>
                                <?php endif; ?>
                                <div style="display: flex; gap: 5px;">
                                    <button class="table-action-btn" onclick="visualizarDetalhes(<?php echo $setorAtivo->getId(); ?>)">
                                        <i class="bi bi-eye"></i> Ver
                                    </button>
                                    <button class="table-action-btn" onclick="exportarPDF(<?php echo $setorAtivo->getId(); ?>)" style="background: #28a745; color: white; border-color: #28a745;">
                                        <i class="bi bi-file-earmark-pdf-fill"></i> PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                        <?php if (empty($setoresAtivos)): ?>
                            <div style="padding: 20px; text-align: center; color: var(--corTxt2); border: 1px dashed var(--corBordas); border-radius: 10px;">
                                Nenhum setor ou painel auditado ainda. Clique em "Adicionar Setor" para começar.
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php else: ?>
                <div class="section-box" style="text-align: center; padding: 40px 30px; margin-bottom: 30px;">
                    <div style="font-size: 3rem; color: var(--corTxt2); opacity: 0.7; margin-bottom: 15px;">
                        <i class="bi bi-shield-fill-check"></i>
                    </div>
                    <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--corTxt3); font-family: 'TASA Orbiter', sans-serif; margin-bottom: 10px;">
                        Nenhuma Sessão de Auditoria Iniciada
                    </h2>
                    <p style="max-width: 600px; margin: 0 auto 25px auto; color: var(--corTxt2); line-height: 1.5; font-size: 0.9rem;">
                        Uma inspeção de segurança NR10 de quadros elétricos é realizada por visita técnica ao prédio, analisando diversos setores. Inicie uma nova auditoria para agrupar todas as inspeções da visita em um único relatório consolidado.
                    </p>
                    <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Executor'): ?>
                    <button class="btn-premium" onclick="abrirModalIniciarGeral()">
                        <i class="bi bi-play-fill"></i> Iniciar Inspeção Geral (Auditoria)
                    </button>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <!-- Caixa de Vistorias e Tabela Principal (Histórico) -->
            <div class="section-box">
                <div class="section-box-header">
                    <div>
                        <h2 class="section-box-title">Histórico de Auditorias Gerais Finalizadas (NR10)</h2>
                        <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: var(--corTxt2); opacity: 0.8;">Sessões de auditorias consolidadas concluídas no sistema.</p>
                    </div>
                </div>

                <!-- Barra de Pesquisa Integrada -->
                <div class="box-pesquisa-e-filtro" style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                    <div class="page-search-box" style="flex: 1; min-width: 250px; position: relative;">
                        <input type="text" id="pesquisa" oninput="filtrarTabela()" class="input-pesquisa" placeholder="Pesquise por unidade..." style="width: 100%; padding: 12px 40px 12px 15px; border-radius: 8px; border: 1px solid var(--corBordas); background: var(--corFundo2); color: var(--corTxt3);">
                        <i class="bi bi-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: var(--corTxt2); opacity: 0.7;"></i>
                    </div>
                </div>

                <!-- Tabela de Inspeções Gerais -->
                <div style="overflow-x: auto; width: 100%;">
                    <table class="tabela-main" style="width: 100%; border-collapse: collapse; text-align: left;" id="tabela-inspecoes">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--corBordas);">
                                <th style="padding: 15px; color: var(--corTxt3); width: 80px;">#</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Unidade</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Data</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Inspetor</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Setores Inspecionados</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Status</th>
                                <th style="padding: 15px; text-align: center; color: var(--corTxt3); width: 280px;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- LOOP_INSPECOESGERAL_MOCK_INICIAL -->
                            <!-- FIM_LOOP_INSPECOESGERAL_MOCK_INICIAL -->
                            <?php foreach ($inspecoesGeral as $ins): ?>
                            <tr style="border-bottom: 1px solid var(--corBordas);" id="row-<?php echo $ins->getId(); ?>" class="inspecoes-row">
                                <td style="padding: 15px;"><?php echo $ins->getId(); ?></td>
                                <td style="padding: 15px; font-weight: bold;"><?php echo htmlspecialchars($ins->getUnidade()); ?></td>
                                <td style="padding: 15px;"><?php echo date('d/m/Y', strtotime($ins->getDataInspecao())); ?></td>
                                <td style="padding: 15px;"><?php echo htmlspecialchars($ins->getResponsavelNome() ?? 'N/D'); ?></td>
                                <td style="padding: 15px; text-align: center; font-weight: bold;"><?php echo count($ins->buscarItensPainel()); ?> setor(es)</td>
                                <td style="padding: 15px;">
                                    <span class="inspecoes-badge ok" style="background: rgba(40, 167, 69, 0.1); color: #28a745;">
                                        <i class="bi bi-check-circle-fill"></i> Finalizado
                                    </span>
                                </td>
                                <td style="padding: 15px; text-align: center;">
                                    <div style="display: flex; gap: 8px; justify-content: center;">
                                        <button class="table-action-btn" onclick="visualizarDetalhesGeral(<?php echo $ins->getId(); ?>)">
                                            <i class="bi bi-eye"></i> Ver
                                        </button>
                                        <button class="table-action-btn" onclick="exportarPDFGeral(<?php echo $ins->getId(); ?>)" style="background: #28a745; color: white; border-color: #28a745;">
                                            <i class="bi bi-file-earmark-pdf-fill"></i> PDF Consolidado
                                        </button>
                                        <?php if ($usuarioNivel === 'Gestor'): ?>
                                        <button class="table-action-btn" onclick="excluirInspecao(<?php echo $ins->getId(); ?>)" style="background: #dc3545; color: white; border-color: #dc3545;">
                                            <i class="bi bi-trash"></i> Excluir
                                        </button>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php if (empty($inspecoesGeral)): ?>
                            <tr id="linha-vazia">
                                <td colspan="7" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhuma auditoria geral registrada.</td>
                            </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <!-- ========================================================================= -->
    <!-- MODAL 1: REGISTRO DE NOVA INSPEÇÃO DE PAINEL -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalNovaInspecao" style="display: none;">
        <div class="modal-box modal-box-wide" style="max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>Lista de Inspeção Visual em Quadros (RH-064)</h3>
                <button type="button" onclick="fecharModal('modalNovaInspecao')"><i class="bi bi-x-lg"></i></button>
            </div>

            <form action="" method="POST" id="form-inspecao" onsubmit="submeterFormInspecao(event)" class="modal-form">
                <input type="hidden" name="acao" value="salvar_inspecao">
                <input type="hidden" name="inspecao_id" id="inspecao_id" value="">
                <input type="hidden" name="inspecao_geral_id" id="inspecao_geral_id" value="">

                <!-- Cabeçalho do Laudo -->
                <div class="modal-row quebraMobile">
                    <div class="modal-input" style="flex: 1;">
                        <label for="unidade">Unidade:</label>
                        <div class="input-wrapper">
                            <input type="text" name="unidade" id="unidade" value="SENAI" required style="width: 100%; border:none; padding: 10px; color:var(--corTxt3); background:transparent; outline:none;">
                        </div>
                    </div>
                    <div class="modal-input" style="flex: 1;">
                        <label for="setor">Setor:</label>
                        <div class="input-wrapper">
                            <input type="text" name="setor" id="setor" placeholder="Ex: Metalmecânica" required style="width: 100%; border:none; padding: 10px; color:var(--corTxt3); background:transparent; outline:none;">
                        </div>
                    </div>
                </div>

                <div class="modal-row quebraMobile">
                    <div class="modal-input" style="flex: 1;">
                        <label for="quadro_tag">Identificação / TAG ou Localização do Quadro:</label>
                        <div class="input-wrapper">
                            <input type="text" name="quadro_tag" id="quadro_tag" placeholder="Ex: QD-01 Bloco A" required style="width: 100%; border:none; padding: 10px; color:var(--corTxt3); background:transparent; outline:none;">
                        </div>
                    </div>
                    <div class="modal-input" style="width: 200px;">
                        <label for="data_inspecao">Data:</label>
                        <div class="input-wrapper">
                            <input type="date" name="data_inspecao" id="data_inspecao" value="<?php echo date('Y-m-d'); ?>" required style="width: 100%; border:none; padding: 10px; color:var(--corTxt3); background:transparent; outline:none;">
                        </div>
                    </div>
                </div>

                <div style="margin: 25px 0 15px 0; border-bottom: 1px solid var(--corBordas); padding-bottom: 8px;">
                    <h4 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3);">Itens de Verificação Predial</h4>
                </div>

                <!-- Lista de 20 Itens de Inspeção -->
                <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px;" id="itens-checklist-container">
                    <?php
                    $itensVerificacao = [
                        1 => "O quadro de distribuição elétrica está instalado em local de fácil acesso?",
                        2 => "O quadro de distribuição elétrica e componentes estão instalados adequadamente? (altura de acesso, influencias externas, local)",
                        3 => "O quadro de distribuição elétrica é mantido desobstruído para operações e manutenções?",
                        4 => "Existe algum tipo de material combustível ou inflamável próximo ao quadro de distribuição elétrica?",
                        5 => "As sinalizações de advertência e de identificação do quadro de distribuição encontram-se em bom estado de conservação e legível?",
                        6 => "O quadro de distribuição possibilita a utilização de bloqueio NR-10 (fechadura, trava) para os casos de serviços de manutenção?",
                        7 => "O estado de conservação geral do invólucro do quadro de distribuição está adequado? (limpeza, ferrugem, amassado)",
                        8 => "O quadro de distribuição elétrica possui proteção contra contato com as \"partes vivas\"? (sobre porta, placa de material isolante ou metálico)",
                        9 => "Se o quadro de distribuição elétrica for de material metálico, o mesmo possui aterramento de equipotencialização das partes móveis (portas e sobre porta)?",
                        10 => "Existe identificação dos circuitos do quadro de distribuição (TAG)? (ex:Tom. Sala 1, Ilum. Banh 2)",
                        11 => "Existe diagrama (desenho dos circuitos) dos quadros de distribuição elétrica?",
                        12 => "Se SIM, onde se encontram localizados?",
                        13 => "O quadro de distribuição elétrica possui todos os condutores (fios, cabos) isolados e em bom estado de conservação? (ressecamento, isolação, queimadura)",
                        14 => "O quadro de distribuição elétrica possui todos os condutores (fios, cabos) organizados? (emaranhados, fora de canaletas, esticados)",
                        15 => "O quadro de distribuição elétrica possui disjuntor ou chave geral para abertura do circuito com carga? (\"chave faca tipo-seca\" não são dispositivos de abertura com carga)",
                        16 => "Existem objetos e/ou outros tipos de circuitos dentro do quadro de distribuição elétrica? (ex: telefônica, dados, equipamentos de segurança contra incêndio e outros objetos)",
                        17 => "O quadro de distribuição elétrica possui proteção contra sobrecorrentes e curto-circuitos em bom estado de conservação (ex: disjuntores e/ou fusíveis)?",
                        18 => "Os circuitos (tomadas/chuveiros) em locais úmidos e/ou molhados, alimentados pelo quadro de distribuição possuem proteção diferencial residual (DR) para choques elétricos?",
                        19 => "O quadro de distribuição elétrica possui dispositivo de proteção contra surto (DPS) para proteção contra descargas atmosféricas e sobretensões na rede elétrica?",
                        20 => "Os dispositivos de proteção contra surtos (DPS) instalados no quadro de distribuição estão em bom estado de conservação e funcionais?"
                    ];
                    ?>
                    <?php foreach ($itensVerificacao as $num => $desc): ?>
                        <div style="border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 15px;">
                            <div class="modal-row" style="align-items: center; justify-content: space-between; gap: 15px;">
                                <div style="flex: 1;">
                                    <span style="font-weight: bold; color: var(--corTxt3); font-size: 13.5px;"><?= $num ?>. <?= $desc ?></span>
                                </div>
                                
                                <?php if ($num === 12): ?>
                                    <!-- Item 12 é apenas entrada de texto associado ao diagrama do item 11 -->
                                    <div style="flex: 1; min-width: 250px;">
                                        <div class="input-wrapper" id="wrapper-item-12" style="opacity: 0.5; pointer-events: none;">
                                            <input type="text" name="item_12_localizacao" id="item_12_localizacao" placeholder="Informe a localização do diagrama..." style="width: 100%; border:none; padding: 10px; color:var(--corTxt3); background:transparent; outline:none;">
                                        </div>
                                    </div>
                                    <input type="hidden" name="item_12_status" id="status_item_12" value="C">
                                <?php else: ?>
                                    <div class="segmented-control-wrapper" data-item="<?= $num ?>">
                                        <button type="button" class="seg-btn btn-ok" data-value="C" onclick="atualizarSegmentedControl(this, <?= $num ?>, 'C')"><i class="bi bi-check-lg"></i> C</button>
                                        <button type="button" class="seg-btn btn-defeito" data-value="NC" onclick="atualizarSegmentedControl(this, <?= $num ?>, 'NC')"><i class="bi bi-x-lg"></i> NC</button>
                                        <button type="button" class="seg-btn btn-nsa active" data-value="NA" onclick="atualizarSegmentedControl(this, <?= $num ?>, 'NA')">NA</button>
                                    </div>
                                    <input type="hidden" name="item_<?= $num ?>_status" id="status_item_<?= $num ?>" value="NA">
                                <?php endif; ?>
                            </div>

                            <!-- Inputs Adicionais Condicionais -->
                            <?php if ($num === 5): ?>
                                <div class="sub-detalhe-container" id="sub-detalhe-5">
                                    <span style="font-size: 11px; font-weight: bold; color: var(--corTxt2);">Indique as falhas encontradas:</span>
                                    <label><input type="checkbox" name="item_5_adv" value="1"> Advertência</label>
                                    <label><input type="checkbox" name="item_5_ident" value="1"> Identificação</label>
                                    <label><input type="checkbox" name="item_5_tensao" value="1"> Nível Tensão</label>
                                </div>
                            <?php elseif ($num === 6): ?>
                                <div class="sub-detalhe-container" id="sub-detalhe-6">
                                    <span style="font-size: 11px; font-weight: bold; color: var(--corTxt2);">Dispositivo de bloqueio utilizado:</span>
                                    <label><input type="checkbox" name="item_6_cadeado" value="1"> Cadeado</label>
                                    <label><input type="checkbox" name="item_6_chave" value="1"> Chave</label>
                                </div>
                            <?php elseif ($num === 10): ?>
                                <div class="sub-detalhe-container" id="sub-detalhe-10">
                                    <span style="font-size: 11px; font-weight: bold; color: var(--corTxt2);">Os circuitos são eficientes?</span>
                                    <label><input type="radio" name="item_10_eficiente" value="SIM"> SIM</label>
                                    <label><input type="radio" name="item_10_eficiente" value="NÃO"> NÃO</label>
                                </div>
                            <?php elseif ($num === 11): ?>
                                <div class="sub-detalhe-container" id="sub-detalhe-11">
                                    <span style="font-size: 11px; font-weight: bold; color: var(--corTxt2);">Se SIM, o diagrama está atualizado?</span>
                                    <label><input type="radio" name="item_11_atualizado" value="SIM" onchange="toggleItem12(true)"> SIM</label>
                                    <label><input type="radio" name="item_11_atualizado" value="NÃO" onchange="toggleItem12(false)"> NÃO</label>
                                </div>
                            <?php elseif ($num === 20): ?>
                                <div class="sub-detalhe-container" id="sub-detalhe-20">
                                    <span style="font-size: 11px; font-weight: bold; color: var(--corTxt2);">Tipo de não conformidade no DPS:</span>
                                    <label><input type="checkbox" name="item_20_conservacao" value="1"> Conservação</label>
                                    <label><input type="checkbox" name="item_20_funcional" value="1"> Funcional</label>
                                </div>
                            <?php endif; ?>

                            <!-- Container para fotos e observações obrigatórias de Não Conformidade (NC) -->
                            <?php if ($num !== 12): ?>
                                <div class="nc-fields-container" id="nc-fields-<?php echo $num; ?>" style="display: none; background: rgba(252, 35, 35, 0.03); border: 1px dashed rgba(252, 35, 35, 0.2); border-radius: 8px; padding: 12px; margin-top: 10px; flex-direction: column; gap: 10px;">
                                    <span style="font-size: 11px; font-weight: bold; color: #fc2323;"><i class="bi bi-exclamation-triangle-fill"></i> Detalhes da Não Conformidade (Obrigatórios):</span>
                                    <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
                                        <div style="flex: 1; min-width: 200px;">
                                            <small style="font-weight: bold; color: var(--corTxt2); display: block; margin-bottom: 4px;">Legenda/Observação do Item:</small>
                                            <div class="input-wrapper">
                                                <input type="text" name="item_<?php echo $num; ?>_obs_nc" id="item_<?php echo $num; ?>_obs_nc" placeholder="Descreva brevemente a falha..." style="width: 100%; border:none; padding: 8px; color:var(--corTxt3); background:transparent; outline:none; font-size: 12px;">
                                            </div>
                                        </div>
                                        <div style="width: 230px; display: flex; flex-direction: column; gap: 4px;">
                                            <small style="font-weight: bold; color: var(--corTxt2); display: block;">Fotografia da Falha (Tablet/Câmera):</small>
                                            <button type="button" onclick="abrirModalCamera(<?php echo $num; ?>)" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; background: #28a745; color: white; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: bold; border: none; box-shadow: 0 2px 4px rgba(40,167,69,0.2); transition: all 0.2s ease; text-align: center; width: 100%;">
                                                <i class="bi bi-camera-fill" style="font-size: 16px;"></i> Abrir Câmera
                                            </button>
                                            <input type="file" accept="image/*" onchange="converterParaBase64(this, <?php echo $num; ?>)" id="item_<?php echo $num; ?>_foto_input" style="display: none;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                                                <span id="item_<?php echo $num; ?>_foto_status" style="font-size: 11px; color: var(--corTxt2); font-style: italic;">Nenhuma foto anexada</span>
                                                <a href="javascript:void(0)" onclick="document.getElementById('item_<?php echo $num; ?>_foto_input').click()" style="font-size: 11px; color: #007bff; text-decoration: underline; font-weight: 500;">anexar arquivo</a>
                                            </div>
                                            <input type="hidden" name="item_<?php echo $num; ?>_foto_base64" id="item_<?php echo $num; ?>_foto_base64">
                                            <img id="item_<?php echo $num; ?>_preview" style="display: none; max-width: 80px; max-height: 60px; margin-top: 5px; border-radius: 6px; border: 1px solid var(--corBordas); object-fit: cover;">
                                        </div>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>

                <!-- Observações -->
                <div class="modal-input">
                    <label for="observacoes">Observações Gerais (Item 21):</label>
                    <div class="input-wrapper">
                        <textarea name="observacoes" id="observacoes" rows="4" placeholder="Insira observações relevantes sobre o estado de conservação do quadro, detalhes de não conformidades, etc..." style="width: 100%; border: none; padding: 10px; background: transparent; font-family: inherit; color: var(--corTxt3); outline: none;"></textarea>
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
    <!-- MODAL 2: VISUALIZAR DETALHES DE UMA INSPEÇÃO -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalVerDetalhes" style="display: none;">
        <div class="modal-box modal-box-wide" style="max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>Detalhes da Inspeção de Quadro Elétrico</h3>
                <button type="button" onclick="fecharModal('modalVerDetalhes')"><i class="bi bi-x-lg"></i></button>
            </div>

            <div class="modal-form">
                <!-- Info Cabeçalho da Inspeção -->
                <div class="p-3 mb-3 bg-white border" style="border-radius: 12px; background-color: var(--corFundo2); border: 1px solid var(--corBordas); margin-bottom: 20px; padding: 15px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">Unidade:</small><br>
                            <span class="font-weight-bold" id="detalhe_unidade" style="font-weight: 800; color: var(--corTxt3);">SENAI</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">Setor:</small><br>
                            <span class="font-weight-bold" id="detalhe_setor" style="font-weight: 700; color: var(--corTxt3);">Administração</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">Quadro (TAG):</small><br>
                            <span class="font-weight-bold" id="detalhe_quadro_tag" style="font-weight: 700; color: var(--corTxt3);">QD-01</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">Responsável:</small><br>
                            <span class="font-weight-bold" id="detalhe_responsavel" style="font-weight: 700; color: var(--corTxt3);">Carlos Silva</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">Data:</small><br>
                            <span class="font-weight-bold" id="detalhe_data" style="font-weight: 700; color: var(--corTxt3);">06/02/2026</span>
                        </div>
                    </div>
                </div>

                <!-- Lista de Itens do Checklist -->
                <div style="display: flex; flex-direction: column; gap: 12px;" id="detalhes-itens-container">
                    <!-- Preenchido dinamicamente via JS -->
                </div>

                <!-- Observações -->
                <div class="modal-input" style="margin-top: 20px;">
                    <label style="font-weight: bold; color: var(--corTxt3);">Observações Gerais (Item 21):</label>
                    <div style="background-color: var(--corFundo2); border: 1px solid var(--corBordas); border-radius: 10px; padding: 15px; color: var(--corTxt3); min-height: 60px; font-size: 13px;" id="detalhe_observacoes">
                        Sem observações adicionais.
                    </div>
                </div>

                <div class="modal-footer" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn-confirmar-full btn" onclick="exportarPDFChecklistAtual()" style="background-color: #28a745; color: white;">
                        Exportar PDF <i class="bi bi-file-earmark-pdf-fill"></i>
                    </button>
                    <button type="button" class="btn-confirmar-full btn" onclick="fecharModal('modalVerDetalhes')" style="background-color: var(--corBordas); color: var(--corTxt3);">
                        Fechar <i class="bi bi-x-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 4: DETALHES DE INSPEÇÃO GERAL (NR10) -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalVerDetalhesGeral" style="display: none;">
        <div class="modal-box modal-box-wide" style="max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>Detalhes da Inspeção Geral (Sessão de Auditoria)</h3>
                <button type="button" onclick="fecharModal('modalVerDetalhesGeral')"><i class="bi bi-x-lg"></i></button>
            </div>

            <div class="modal-form">
                <!-- Info Cabeçalho Geral -->
                <div class="p-3 mb-3 bg-white border" style="border-radius: 12px; background-color: var(--corFundo2); border: 1px solid var(--corBordas); margin-bottom: 20px; padding: 15px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">ID Sessão:</small><br>
                            <span class="font-weight-bold" id="detalhe_geral_id" style="font-weight: 800; color: var(--corTxt3);">#1</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">Unidade:</small><br>
                            <span class="font-weight-bold" id="detalhe_geral_unidade" style="font-weight: 700; color: var(--corTxt3);">SENAI</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">Data da Auditoria:</small><br>
                            <span class="font-weight-bold" id="detalhe_geral_data" style="font-weight: 700; color: var(--corTxt3);">06/02/2026</span>
                        </div>
                        <div>
                            <small style="color: var(--corTxt2); text-transform: uppercase; font-weight: bold; font-size: 10px;">Inspetor Responsável:</small><br>
                            <span class="font-weight-bold" id="detalhe_geral_responsavel" style="font-weight: 700; color: var(--corTxt3);">Carlos Silva</span>
                        </div>
                    </div>
                </div>

                <!-- Lista de Setores Accordion -->
                <h4 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3); margin-bottom: 15px;">Setores e Painéis Auditados</h4>
                <div id="geral-setores-accordion" style="display: flex; flex-direction: column; gap: 10px;">
                    <!-- Preenchido dinamicamente via JS -->
                </div>

                <!-- Observações de Encerramento -->
                <div class="modal-input" style="margin-top: 20px;">
                    <label style="font-weight: bold; color: var(--corTxt3);">Observação Final de Encerramento (Item 21):</label>
                    <div style="background-color: var(--corFundo2); border: 1px solid var(--corBordas); border-radius: 10px; padding: 15px; color: var(--corTxt3); min-height: 60px; font-size: 13px;" id="detalhe_geral_observacoes">
                        Sem observações de encerramento.
                    </div>
                </div>

                <div class="modal-footer" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn-confirmar-full btn" id="btn-exportar-pdf-geral" style="background-color: #28a745; color: white;">
                        Exportar PDF Consolidado <i class="bi bi-file-earmark-pdf-fill"></i>
                    </button>
                    <button type="button" class="btn-confirmar-full btn" onclick="fecharModal('modalVerDetalhesGeral')" style="background-color: var(--corBordas); color: var(--corTxt3);">
                        Fechar <i class="bi bi-x-circle-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 5: INICIAR INSPEÇÃO GERAL -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalIniciarGeral" style="display: none;">
        <div class="modal-box" style="max-width: 450px;">
            <div class="modal-header">
                <h3>Iniciar Inspeção Geral (NR10)</h3>
                <button type="button" onclick="fecharModal('modalIniciarGeral')"><i class="bi bi-x-lg"></i></button>
            </div>
            <form id="form-iniciar-geral" onsubmit="submeterIniciarGeral(event)" class="modal-form">
                <input type="hidden" name="acao" value="iniciar_inspecao_geral">
                
                <div class="modal-input">
                    <label for="geral_unidade_input">Unidade:</label>
                    <div class="input-wrapper">
                        <input type="text" name="unidade" id="geral_unidade_input" value="SENAI" required style="width: 100%; border:none; padding: 10px; color:var(--corTxt3); background:transparent; outline:none;">
                    </div>
                </div>
                
                <div class="modal-input">
                    <label for="geral_data_input">Data de Início da Auditoria:</label>
                    <div class="input-wrapper">
                        <input type="date" name="data_inspecao" id="geral_data_input" value="<?php echo date('Y-m-d'); ?>" required style="width: 100%; border:none; padding: 10px; color:var(--corTxt3); background:transparent; outline:none;">
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn-confirmar-full confirmar">
                        Iniciar Sessão <i class="bi bi-play-fill"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 6: ENCERRAR INSPEÇÃO GERAL -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalEncerrarGeral" style="display: none;">
        <div class="modal-box" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Encerrar Inspeção Geral</h3>
                <button type="button" onclick="fecharModal('modalEncerrarGeral')"><i class="bi bi-x-lg"></i></button>
            </div>
            <form id="form-encerrar-geral" onsubmit="submeterEncerrarGeral(event)" class="modal-form">
                <input type="hidden" name="acao" value="encerrar_inspecao_geral">
                <input type="hidden" name="inspecao_geral_id" id="encerrar_geral_id" value="">
                
                <div class="modal-input">
                    <label for="encerrar_observacoes">Observação Final de Encerramento (Item 21):</label>
                    <div class="input-wrapper">
                        <textarea name="observacoes" id="encerrar_observacoes" rows="4" placeholder="Insira observações finais sobre a auditoria realizada no prédio..." required style="width: 100%; border: none; padding: 10px; background: transparent; font-family: inherit; color: var(--corTxt3); outline: none;"></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn-confirmar-full" style="background-color: #dc3545; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;">
                        Finalizar e Encerrar <i class="bi bi-stop-fill"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 3: CAPTURA DE FOTO DA CÂMERA (LIVE STREAM) -->
    <!-- ========================================================================= -->
    <div class="modal-fundo" id="modalCamera" style="display: none; z-index: 10000; align-items: center; justify-content: center;">
        <div class="modal-box" style="max-width: 450px; background: var(--corCardBg); border: 1px solid var(--corBordas); border-radius: 16px; box-shadow: var(--sombra2); overflow: hidden;">
            <div class="modal-header" style="padding: 15px 20px; border-bottom: 1px solid var(--corBordas); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 1.1rem; color: var(--corTxt3); font-weight: bold;">Capturar Foto (Câmera)</h3>
                <button type="button" onclick="fecharModalCamera()" style="background: none; border: none; font-size: 1.2rem; color: var(--corTxt2); cursor: pointer;"><i class="bi bi-x-lg"></i></button>
            </div>
            <div style="padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                <!-- Video Stream Container -->
                <div style="position: relative; width: 100%; aspect-ratio: 4/3; background: #000; border-radius: 10px; overflow: hidden; border: 2px solid var(--corBordas);">
                    <video id="cameraVideo" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                    <canvas id="cameraCanvas" style="display: none;"></canvas>
                </div>
                
                <div style="display: flex; gap: 10px; width: 100%; justify-content: center;">
                    <button type="button" onclick="tirarFoto()" style="background: #28a745; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: none; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px;">
                        <i class="bi bi-camera-fill"></i> Capturar Foto
                    </button>
                    <button type="button" onclick="fecharModalCamera()" style="background: var(--corBordas); color: var(--corTxt3); padding: 10px 20px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; font-size: 14px;">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- CONTAINER DE TOASTS GLASSMORPHIC -->
    <div id="toast-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;"></div>

    <!-- ========================================================================= -->
    <!-- TEMPLATE OCULTO PARA EXPORTAÇÃO PDF -->
    <!-- ========================================================================= -->
    <div style="display: none;">
        <div id="pdf-template">
            <!-- Cabeçalho -->
            <table>
                <tr class="header-main">
                    <td rowspan="2" style="width: 150px; text-align: center; vertical-align: middle;">
                        <img src="../assets/img/senailogo.png" alt="Logo Senai" style="width: 110px; filter: grayscale(1);">
                    </td>
                    <td colspan="3" style="font-size: 14px; padding: 10px;">LISTA DE INSPEÇÃO VISUAL EM QUADROS E PAINEIS ELÉTRICOS</td>
                </tr>
                <tr>
                    <td style="width: 180px;">Unidade: <span id="pdf_unidade" style="font-weight: normal;"></span></td>
                    <td style="width: 180px;">Setor: <span id="pdf_setor" style="font-weight: normal;"></span></td>
                    <td>Data: <span id="pdf_data" style="font-weight: normal;"></span></td>
                </tr>
                <tr>
                    <td colspan="4" style="font-size: 10px; padding: 6px; font-weight: bold;">Identificação / TAG ou Localização do QUADRO: <span id="pdf_quadro_tag" style="font-weight: normal;"></span></td>
                </tr>
            </table>

            <div style="font-size: 10px; font-weight: bold; text-align: center; margin-bottom: 10px;">
                C = CONFORME &nbsp;&nbsp;/&nbsp;&nbsp; NC = NÃO CONFORME &nbsp;&nbsp;/&nbsp;&nbsp; NA = NÃO APLICÁVEL
            </div>

            <!-- Tabela Principal de Itens -->
            <table>
                <thead>
                    <tr style="background-color: #f2f2f2; font-weight: bold;">
                        <th class="item-num">Item</th>
                        <th>Itens de verificação para inspeção de Quadros de Distribuição Eletrica</th>
                        <th class="col-check">C</th>
                        <th class="col-check">NC</th>
                        <th class="col-check">NA</th>
                    </tr>
                </thead>
                <tbody id="pdf-itens-body">
                    <!-- Preenchido dinamicamente por JS -->
                </tbody>
            </table>

            <!-- Rodapé e Assinaturas -->
            <table>
                <tr>
                    <td colspan="2" style="padding: 6px; font-size: 9.5px;">
                        <strong>Observações (Item 21):</strong><br>
                        <span id="pdf_observacoes" style="font-style: italic;"></span>
                    </td>
                </tr>
                <tr>
                    <td style="width: 50%; padding: 8px; font-size: 9px;">
                        <strong>CONFORME = </strong> <span id="pdf_total_c" style="font-weight: bold; font-size: 11px;"></span>
                    </td>
                    <td style="width: 50%; padding: 8px; font-size: 9px;">
                        <strong>NÃO CONFORME = </strong> <span id="pdf_total_nc" style="font-weight: bold; font-size: 11px;"></span>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align: center; font-size: 8.5px; padding: 5px; border: none; font-style: italic; color: #555;">
                        RH-064-FR009 LISTA DE VERIFICAÇÃO - INSPEÇÃO DE QUADROS E PAINEIS ELETRICOS V.1.
                    </td>
                </tr>
            </table>

            <!-- Página 2: Relatório Fotográfico de Não Conformidades (obrigatório se houver NC) -->
            <div id="pdf-page-2" style="display: none; page-break-before: always; margin-top: 20px;">
                <div style="font-family: Arial, sans-serif; padding: 5px;">
                    <div style="border: 2px solid #000; padding: 8px; font-weight: bold; text-align: center; font-size: 12px; background-color: #f2f2f2; margin-bottom: 15px;">
                        RELATÓRIO FOTOGRÁFICO DE NÃO CONFORMIDADES
                    </div>
                    <div id="pdf-nc-photos-container" style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
                        <!-- Preenchido dinamicamente com as fotos e legendas -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SCRIPTS DE GERENCIAMENTO AJAX FETCH API & PDF EXPORT -->
    <script>
        // Mapeamento estático de descrições para visualização e PDF
        const ITENS_DESCRICOES = {
            1: "O quadro de distribuição elétrica está instalado em local de fácil acesso?",
            2: "O quadro de distribuição elétrica e componentes estão instalados adequadamente? (altura de acesso, influencias externas, local)",
            3: "O quadro de distribuição elétrica é mantido desobstruído para operações e manutenções?",
            4: "Existe algum tipo de material combustível ou inflamável próximo ao quadro de distribuição elétrica?",
            5: "As sinalizações de advertência e de identificação do quadro de distribuição encontram-se em bom estado de conservação e legível?",
            6: "O quadro de distribuição possibilita a utilização de bloqueio NR-10 (fechadura, trava) para os casos de serviços de manutenção?",
            7: "O estado de conservação geral do invólucro do quadro de distribuição está adequado? (limpeza, ferrugem, amassado)",
            8: "O quadro de distribuição elétrica possui proteção contra contato com as \"partes vivas\"? (sobre porta, placa de material isolante ou metálico)",
            9: "Se o quadro de distribuição elétrica for de material metálico, o mesmo possui aterramento de equipotencialização das partes móveis (portas e sobre porta)?",
            10: "Existe identificação dos circuitos do quadro de distribuição (TAG)? (ex:Tom. Sala 1, Ilum. Banh 2)",
            11: "Existe diagrama (desenho dos circuitos) dos quadros de distribuição elétrica?",
            12: "Se SIM, onde se encontram localizados?",
            13: "O quadro de distribuição elétrica possui todos os condutores (fios, cabos) isolados e em bom estado de conservação? (ressecamento, isolação, queimadura)",
            14: "O quadro de distribuição elétrica possui todos os condutores (fios, cabos) organizados? (emaranhados, fora de canaletas, esticados)",
            15: "O quadro de distribuição elétrica possui disjuntor ou chave geral para abertura do circuito com carga? (\"chave faca tipo-seca\" não são dispositivos de abertura com carga)",
            16: "Existem objetos e/ou outros tipos de circuitos dentro do quadro de distribuição elétrica? (ex: telefônica, dados, equipamentos de segurança contra incêndio e outros objetos)",
            17: "O quadro de distribuição elétrica possui proteção contra sobrecorrentes e curto-circuitos em bom estado de conservação (ex: disjuntores e/ou fusíveis)?",
            18: "Os circuitos (tomadas/chuveiros) em locais úmidos e/ou molhados, alimentados pelo quadro de distribuição possuem proteção diferencial residual (DR) para choques elétricos?",
            19: "O quadro de distribuição elétrica possui dispositivo de proteção contra surto (DPS) para proteção contra descargas atmosféricas e sobretensões na rede elétrica?",
            20: "Os dispositivos de proteção contra surtos (DPS) instalados no quadro de distribuição estão em bom estado de conservação e funcionais?"
        };

        window.inspecaoAtual = null;
        window.inspecaoGeralAtual = null;

        function abrirModalIniciarGeral() {
            document.getElementById('form-iniciar-geral').reset();
            document.getElementById('geral_data_input').value = new Date().toISOString().split('T')[0];
            document.getElementById('modalIniciarGeral').style.display = 'flex';
        }

        function submeterIniciarGeral(e) {
            e.preventDefault();
            const form = document.getElementById('form-iniciar-geral');
            const formData = new FormData(form);
            const searchParams = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                searchParams.append(key, value);
            }
            searchParams.append('ajax', '1');

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
                    fecharModal('modalIniciarGeral');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao iniciar auditoria geral.', 'danger');
            });
        }

        function abrirModalNovaInspecaoSetor(geralId, unidade, dataInspecao) {
            abrirModalNovaInspecao();
            // Pre-fill active session context
            document.getElementById('inspecao_geral_id').value = geralId;
            const unidadeInput = document.getElementById('unidade');
            const dataInput = document.getElementById('data_inspecao');
            
            unidadeInput.value = unidade;
            unidadeInput.readOnly = true;
            
            dataInput.value = dataInspecao;
            dataInput.readOnly = true;
        }

        function abrirModalEncerrarGeral(id) {
            document.getElementById('form-encerrar-geral').reset();
            document.getElementById('encerrar_geral_id').value = id;
            document.getElementById('modalEncerrarGeral').style.display = 'flex';
        }

        function submeterEncerrarGeral(e) {
            e.preventDefault();
            const form = document.getElementById('form-encerrar-geral');
            const obsVal = document.getElementById('encerrar_observacoes').value.trim();

            if (obsVal.toUpperCase() === 'VAZIO') {
                showToast("Erro: O preenchimento das observações não pode ser 'VAZIO'.", 'danger');
                return false;
            }

            const formData = new FormData(form);
            const searchParams = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                searchParams.append(key, value);
            }
            searchParams.append('ajax', '1');

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
                    fecharModal('modalEncerrarGeral');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao encerrar auditoria geral.', 'danger');
            });
        }

        function visualizarDetalhesGeral(info) {
            if (typeof info === 'number') {
                fetch(window.location.pathname + '?acao=buscar_detalhes_geral_ajax&id=' + info, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(res => res.json())
                .then(response => {
                    if (response.success) {
                        const normalized = {
                            id: response.data.geral.id,
                            unidade: response.data.geral.unidade,
                            data_inspecao: response.data.geral.data_inspecao,
                            responsavel_nome: response.data.geral.responsavel_nome,
                            observacoes: response.data.geral.observacoes,
                            setores: response.data.setores
                        };
                        renderizarDetalhesGeralModal(normalized);
                    }
                });
                return;
            }
            renderizarDetalhesGeralModal(info);
        }

        function renderizarDetalhesGeralModal(data) {
            window.inspecaoGeralAtual = data;
            document.getElementById('detalhe_geral_id').innerText = '#' + data.id;
            document.getElementById('detalhe_geral_unidade').innerText = data.unidade;
            document.getElementById('detalhe_geral_data').innerText = data.data_inspecao;
            document.getElementById('detalhe_geral_responsavel').innerText = data.responsavel_nome;
            document.getElementById('detalhe_geral_observacoes').innerText = data.observacoes || 'Nenhuma observação de encerramento registrada.';

            document.getElementById('btn-exportar-pdf-geral').onclick = function() {
                exportarPDFGeral(data);
            };

            const accordion = document.getElementById('geral-setores-accordion');
            accordion.innerHTML = '';

            if (!data.setores || data.setores.length === 0) {
                accordion.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--corTxt2); border: 1px dashed var(--corBordas); border-radius: 8px;">Nenhum setor ou painel cadastrado nesta sessão.</div>';
            } else {
                data.setores.forEach((s, idx) => {
                    const itens = typeof s.itens === 'string' ? JSON.parse(s.itens) : s.itens;
                    let conformes = 0;
                    let naoConformes = 0;
                    for (let i = 1; i <= 20; i++) {
                        const item = itens['item_' + i] || { status: 'NA' };
                        if (item.status === 'C') conformes++;
                        else if (item.status === 'NC') naoConformes++;
                    }

                    const headerBadgeClass = naoConformes > 0 ? 'risco' : 'ok';
                    const headerBadgeText = naoConformes > 0 ? `${naoConformes} Não Conforme(s)` : 'Conforme';
                    const headerBadgeIcon = naoConformes > 0 ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill';

                    let itemsHtml = '';
                    for (let i = 1; i <= 20; i++) {
                        const item = itens['item_' + i] || { status: 'NA' };
                        let badgeClass = 'badge-nsa';
                        let iconClass = 'bi-slash-circle';
                        let displayStatus = 'Não Aplicável';

                        if (item.status === 'C') {
                            badgeClass = 'badge-ok';
                            iconClass = 'bi-check-circle-fill';
                            displayStatus = 'Conforme';
                        } else if (item.status === 'NC') {
                            badgeClass = 'badge-defeito';
                            iconClass = 'bi-exclamation-triangle-fill';
                            displayStatus = 'Não Conforme';
                        }

                        let extraText = '';
                        if (i === 5 && item.detalhes) {
                            const falhas = [];
                            if (item.detalhes.advertencia) falhas.push('Advertência');
                            if (item.detalhes.identificacao) falhas.push('Identificação');
                            if (item.detalhes.nivel_tensao) falhas.push('Nível Tensão');
                            if (falhas.length > 0) extraText = `<br><small style="color:var(--corTxt2);">Falhas: ${falhas.join(', ')}</small>`;
                        } else if (i === 6 && item.detalhes) {
                            const tipos = [];
                            if (item.detalhes.cadeado) tipos.push('Cadeado');
                            if (item.detalhes.chave) tipos.push('Chave');
                            if (tipos.length > 0) extraText = `<br><small style="color:var(--corTxt2);">Bloqueio: ${tipos.join(', ')}</small>`;
                        } else if (i === 10 && item.eficiente) {
                            extraText = `<br><small style="color:var(--corTxt2);">Eficientes? ${item.eficiente}</small>`;
                        } else if (i === 11 && item.atualizado) {
                            extraText = `<br><small style="color:var(--corTxt2);">Atualizado? ${item.atualizado}</small>`;
                        } else if (i === 12 && item.localizacao) {
                            extraText = `<br><small style="color:var(--corTxt2);">Localização: ${item.localizacao}</small>`;
                        } else if (i === 20 && item.detalhes) {
                            const falhas = [];
                            if (item.detalhes.conservacao) falhas.push('Conservação');
                            if (item.detalhes.funcional) falhas.push('Funcional');
                            if (falhas.length > 0) extraText = `<br><small style="color:var(--corTxt2);">Falhas DPS: ${falhas.join(', ')}</small>`;
                        }

                        if (item.status === 'NC' && item.foto_nc) {
                            extraText += `
                                <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px; background: rgba(0,0,0,0.01); border: 1px solid var(--corBordas); border-radius: 8px; padding: 10px;">
                                    <span style="font-size: 11px; font-weight: bold; color: var(--corTxt2);">Observação / Legenda da falha:</span>
                                    <span style="font-size: 12px; color: var(--corTxt3); font-style: italic;">${item.obs_nc}</span>
                                    <div style="margin-top: 5px; max-width: 250px; max-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid var(--corBordas);">
                                        <img src="${item.foto_nc}" style="width: 100%; height: auto; display: block;">
                                    </div>
                                </div>
                            `;
                        }

                        itemsHtml += `
                            <div class="card-detalhe-item" style="margin-bottom: 8px;">
                                <div class="value-container">
                                    <span class="title">${i}. ${ITENS_DESCRICOES[i]}</span>
                                    <span class="badge-status ${badgeClass}">
                                        <i class="bi ${iconClass}"></i> ${displayStatus}
                                    </span>
                                </div>
                                ${extraText}
                            </div>
                        `;
                    }

                    accordion.innerHTML += `
                        <div class="accordion-item" style="border: 1px solid var(--corBordas); border-radius: 12px; overflow: hidden; background: var(--corCardBg); margin-bottom: 10px;">
                            <div class="accordion-header" onclick="toggleAccordionItem(${idx})" style="padding: 15px 20px; background: var(--corFundo2); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-weight: 800; color: var(--corTxt3); font-size: 14px;">Setor: ${s.setor}</span>
                                    <span style="font-size: 12px; color: var(--corTxt2); font-weight: 600;">Quadro (TAG): ${s.quadro_tag}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <span class="inspecoes-badge ${headerBadgeClass}">
                                        <i class="bi ${headerBadgeIcon}"></i> ${headerBadgeText}
                                    </span>
                                    <i class="bi bi-chevron-down accordion-arrow-${idx}" style="transition: transform 0.2s ease; color: var(--corTxt3);"></i>
                                </div>
                            </div>
                            <div class="accordion-content-${idx}" style="display: none; padding: 20px; border-top: 1px solid var(--corBordas); max-height: 500px; overflow-y: auto;">
                                ${itemsHtml}
                            </div>
                        </div>
                    `;
                });
            }

            document.getElementById('modalVerDetalhesGeral').style.display = 'flex';
        }

        function toggleAccordionItem(idx) {
            const content = document.querySelector(`.accordion-content-${idx}`);
            const arrow = document.querySelector(`.accordion-arrow-${idx}`);
            if (content.style.display === 'none') {
                content.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            } else {
                content.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        }

        function exportarPDFGeral(info) {
            if (typeof info === 'number') {
                fetch(window.location.pathname + '?acao=buscar_detalhes_geral_ajax&id=' + info, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(res => res.json())
                .then(response => {
                    if (response.success) {
                        const normalized = {
                            id: response.data.geral.id,
                            unidade: response.data.geral.unidade,
                            data_inspecao: response.data.geral.data_inspecao,
                            responsavel_nome: response.data.geral.responsavel_nome,
                            observacoes: response.data.geral.observacoes,
                            setores: response.data.setores
                        };
                        gerarPDFGeralDocumento(normalized);
                    }
                });
                return;
            }
            gerarPDFGeralDocumento(info);
        }

        function gerarPDFGeralDocumento(info) {
            const container = document.createElement('div');
            container.style.width = '700px';
            container.style.padding = '10px';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.color = '#000';
            container.style.backgroundColor = '#fff';
            container.style.boxSizing = 'border-box';

            let html = `
                <div style="page-break-after: always;">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                        <tr style="text-align: center; font-weight: bold;">
                            <td rowspan="2" style="width: 150px; border: 1px solid #000; padding: 10px; vertical-align: middle; text-align: center;">
                                <img src="../assets/img/senailogo.png" alt="Logo Senai" style="width: 110px; filter: grayscale(1);">
                            </td>
                            <td colspan="3" style="font-size: 13px; border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold;">
                                RELATÓRIO CONSOLIDADO DE INSPEÇÃO EM PAINÉIS ELÉTRICOS (NR10)
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 33%; border: 1px solid #000; padding: 6px; font-size: 9px;">Unidade: <span style="font-weight: normal;">${info.unidade}</span></td>
                            <td style="width: 33%; border: 1px solid #000; padding: 6px; font-size: 9px;">Data: <span style="font-weight: normal;">${info.data_inspecao}</span></td>
                            <td style="border: 1px solid #000; padding: 6px; font-size: 9px;">Inspetor: <span style="font-weight: normal;">${info.responsavel_nome}</span></td>
                        </tr>
                    </table>

                    <div style="border: 2px solid #000; padding: 8px; font-weight: bold; text-align: center; font-size: 11px; background-color: #f2f2f2; margin-bottom: 15px;">
                        RESUMO DA AUDITORIA
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #f2f2f2; font-weight: bold;">
                                <th style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center;">Setor</th>
                                <th style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center;">Quadro (TAG)</th>
                                <th style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center;">Status</th>
                                <th style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center;">Conformes</th>
                                <th style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center;">Não Conformes</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            info.setores.forEach(s => {
                const itens = typeof s.itens === 'string' ? JSON.parse(s.itens) : s.itens;
                let c = 0;
                let nc = 0;
                for (let i = 1; i <= 20; i++) {
                    const item = itens['item_' + i] || { status: 'NA' };
                    if (item.status === 'C') c++;
                    else if (item.status === 'NC') nc++;
                }

                html += `
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px; font-size: 9px; font-weight: bold;">${s.setor}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center;">${s.quadro_tag}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center; font-weight: bold; color: ${nc > 0 ? '#dc3545' : '#28a745'};">
                            ${nc > 0 ? 'NÃO CONFORME' : 'CONFORME'}
                        </td>
                        <td style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center;">${c}</td>
                        <td style="border: 1px solid #000; padding: 6px; font-size: 9px; text-align: center;">${nc}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>

                    <div style="border: 1px solid #000; padding: 10px; font-size: 9.5px; margin-bottom: 20px; background-color: #fafafa;">
                        <strong>Observações Gerais de Encerramento (Item 21):</strong><br>
                        <span style="font-style: italic;">${info.observacoes || 'Sem observações adicionais.'}</span>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-top: 50px;">
                        <tr>
                            <td style="width: 50%; text-align: center; border: none; padding: 10px; font-size: 9px;">
                                <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto; padding-top: 5px;">
                                    <strong>${info.responsavel_nome}</strong><br>
                                    Inspetor Responsável
                                </div>
                            </td>
                            <td style="width: 50%; text-align: center; border: none; padding: 10px; font-size: 9px;">
                                <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto; padding-top: 5px;">
                                    <strong>SENAI Manutenção Predial</strong><br>
                                    Gestor/Supervisor Responsável
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            `;

            info.setores.forEach(s => {
                const itens = typeof s.itens === 'string' ? JSON.parse(s.itens) : s.itens;
                let totalC = 0;
                let totalNC = 0;

                html += `
                    <div style="page-break-after: always; margin-top: 10px;">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
                            <tr style="text-align: center; font-weight: bold;">
                                <td rowspan="2" style="width: 120px; border: 1px solid #000; padding: 5px; vertical-align: middle; text-align: center;">
                                    <img src="../assets/img/senailogo.png" alt="Logo Senai" style="width: 90px; filter: grayscale(1);">
                                </td>
                                <td colspan="3" style="font-size: 11px; border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">
                                    DETALHAMENTO DO SETOR: ${s.setor.toUpperCase()}
                                </td>
                            </tr>
                            <tr>
                                <td style="width: 33%; border: 1px solid #000; padding: 4px; font-size: 8px;">Quadro (TAG): <span style="font-weight: normal;">${s.quadro_tag}</span></td>
                                <td style="width: 33%; border: 1px solid #000; padding: 4px; font-size: 8px;">Data: <span style="font-weight: normal;">${s.data_inspecao}</span></td>
                                <td style="border: 1px solid #000; padding: 4px; font-size: 8px;">Status: <span style="font-weight: bold; color: ${s.status_geral === 'Conforme' ? '#28a745' : '#dc3545'}">${s.status_geral.toUpperCase()}</span></td>
                            </tr>
                        </table>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
                            <thead>
                                <tr style="background-color: #f2f2f2; font-weight: bold;">
                                    <th style="border: 1px solid #000; padding: 2.5px 4px; font-size: 8px; width: 30px; text-align: center;">Item</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 4px; font-size: 8px; text-align: left;">Perguntas de verificação para inspeção de Quadros</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 4px; font-size: 8px; width: 25px; text-align: center;">C</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 4px; font-size: 8px; width: 25px; text-align: center;">NC</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 4px; font-size: 8px; width: 25px; text-align: center;">NA</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                for (let i = 1; i <= 20; i++) {
                    const item = itens['item_' + i] || { status: 'NA' };
                    let markC = '';
                    let markNC = '';
                    let markNA = '';

                    if (item.status === 'C') {
                        markC = '✔';
                        totalC++;
                    } else if (item.status === 'NC') {
                        markNC = 'X';
                        totalNC++;
                    } else {
                        markNA = '✔';
                    }

                    let descCompleta = ITENS_DESCRICOES[i];
                    if (i === 5 && item.detalhes) {
                        const falhas = [];
                        if (item.detalhes.advertencia) falhas.push('ADVERTÊNCIA');
                        if (item.detalhes.identificacao) falhas.push('IDENTIFICAÇÃO');
                        if (item.detalhes.nivel_tensao) falhas.push('NÍVEL TENSÃO');
                        descCompleta += `<br><span style="margin-left: 10px; font-weight: bold; font-size: 7.5px;">Falhas: [${falhas.join('] [')}]</span>`;
                    } else if (i === 6 && item.detalhes) {
                        const tipos = [];
                        if (item.detalhes.cadeado) tipos.push('CADEADO');
                        if (item.detalhes.chave) tipos.push('CHAVE');
                        descCompleta += `<br><span style="margin-left: 10px; font-weight: bold; font-size: 7.5px;">Bloqueio: [${tipos.join('] [')}]</span>`;
                    } else if (i === 10 && item.eficiente) {
                        descCompleta += `<br><span style="margin-left: 10px; font-weight: bold; font-size: 7.5px;">Eficientes? [${item.eficiente === 'SIM' ? 'X' : ' '}] SIM &nbsp;&nbsp; [${item.eficiente === 'NÃO' ? 'X' : ' '}] NÃO</span>`;
                    } else if (i === 11 && item.atualizado) {
                        descCompleta += `<br><span style="margin-left: 10px; font-weight: bold; font-size: 7.5px;">Atualizados? [${item.atualizado === 'SIM' ? 'X' : ' '}] SIM &nbsp;&nbsp; [${item.atualizado === 'NÃO' ? 'X' : ' '}] NÃO</span>`;
                    } else if (i === 12 && item.localizacao) {
                        descCompleta += `<br><span style="margin-left: 10px; font-weight: bold; font-size: 7.5px;">Localização: <u>${item.localizacao}</u></span>`;
                    } else if (i === 20 && item.detalhes) {
                        const falhas = [];
                        if (item.detalhes.conservacao) falhas.push('CONSERVAÇÃO');
                        if (item.detalhes.funcional) falhas.push('FUNCIONAL');
                        descCompleta += `<br><span style="margin-left: 10px; font-weight: bold; font-size: 7.5px;">DPS falhas: [${falhas.join('] [')}]</span>`;
                    }

                    html += `
                        <tr>
                            <td style="border: 1px solid #000; padding: 2px 4px; font-size: 7.5px; text-align: center; font-weight: bold;">${i}</td>
                            <td style="border: 1px solid #000; padding: 2px 4px; font-size: 7.5px;">${descCompleta}</td>
                            <td style="border: 1px solid #000; padding: 2px 4px; font-size: 9px; text-align: center; font-weight: bold;">${markC}</td>
                            <td style="border: 1px solid #000; padding: 2px 4px; font-size: 9px; text-align: center; font-weight: bold;">${markNC}</td>
                            <td style="border: 1px solid #000; padding: 2px 4px; font-size: 9px; text-align: center; font-weight: bold;">${markNA}</td>
                        </tr>
                    `;
                }

                html += `
                            </tbody>
                        </table>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="border: 1px solid #000; padding: 5px; font-size: 8px;">
                                    <strong>Observações (Item 21):</strong> ${s.observacoes || 'Sem observações.'}
                                </td>
                            </tr>
                        </table>
                    </div>
                `;

                let sectorHasNc = false;
                let ncCount = 0;
                let photoHtml = '';

                for (let i = 1; i <= 20; i++) {
                    const item = itens['item_' + i] || { status: 'NA' };
                    if (item.status === 'NC' && item.foto_nc) {
                        sectorHasNc = true;
                        ncCount++;

                        if (ncCount > 2 && ncCount % 2 === 1) {
                            photoHtml += `<div style="page-break-before: always; height: 0; margin: 0; padding: 0; border: none;"></div>`;
                        }

                        photoHtml += `
                            <div style="border: 2px solid #000; padding: 8px; text-align: center; background-color: #fff; box-sizing: border-box; display: flex; flex-direction: column; gap: 6px; justify-content: space-between; height: 330px; width: 100%; margin-bottom: 15px;">
                                <div style="font-weight: bold; font-size: 9px; text-align: left; border-bottom: 1px solid #000; padding-bottom: 4px; color: #000;">
                                    Item ${i}: ${ITENS_DESCRICOES[i]}
                                </div>
                                <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #fafafa; border: 1px solid #ccc; border-radius: 4px;">
                                    <img src="${item.foto_nc}" style="width: 100%; height: 100%; object-fit: contain;">
                                </div>
                                <div style="font-size: 9px; text-align: left; font-style: italic; border-top: 1px solid #000; padding-top: 4px; font-weight: bold; background-color: #fdfdfd; color: #000;">
                                    Legenda/Observação: ${item.obs_nc}
                                </div>
                            </div>
                        `;
                    }
                }

                if (sectorHasNc) {
                    html += `
                        <div style="page-break-after: always; margin-top: 10px;">
                            <div style="border: 2px solid #000; padding: 6px; font-weight: bold; text-align: center; font-size: 11px; background-color: #f2f2f2; margin-bottom: 10px;">
                                RELATÓRIO FOTOGRÁFICO DE NÃO CONFORMIDADES - SETOR: ${s.setor.toUpperCase()}
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                                ${photoHtml}
                            </div>
                        </div>
                    `;
                }
            });

            container.innerHTML = html;
            document.body.appendChild(container);

            const opt = {
                margin:       10,
                filename:     'RH-064-FR009_Auditoria_Consolidada_' + info.unidade.replace(/\s+/g, '_') + '_' + info.id + '.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            showToast('Gerando Relatório Consolidado PDF...', 'success');
            html2pdf().from(container).set(opt).save().then(() => {
                container.remove();
            });
        }

        window.inspecaoAtual = null;

        function abrirModalNovaInspecao() {
            document.getElementById('form-inspecao').reset();
            // Reseta controles segmentados para 'NA'
            document.querySelectorAll('.segmented-control-wrapper').forEach(wrapper => {
                wrapper.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
                const btnNsa = wrapper.querySelector('.btn-nsa');
                if (btnNsa) btnNsa.classList.add('active');
                
                const itemNum = wrapper.getAttribute('data-item');
                const hiddenInp = document.getElementById('status_item_' + itemNum);
                if (hiddenInp) hiddenInp.value = 'NA';
            });

            // Reseta sub-detalhes condicionais
            document.querySelectorAll('.sub-detalhe-container').forEach(c => c.style.display = 'none');
            toggleItem12(false);

            // Reseta campos adicionais de Não Conformidade
            document.querySelectorAll('.nc-fields-container').forEach(c => c.style.display = 'none');
            document.querySelectorAll('[id$="_foto_base64"]').forEach(i => i.value = '');
            document.querySelectorAll('[id$="_preview"]').forEach(p => {
                p.style.display = 'none';
                p.src = '';
            });
            document.querySelectorAll('[id$="_obs_nc"]').forEach(i => i.required = false);
            document.querySelectorAll('[id$="_foto_input"]').forEach(i => i.required = false);

            document.getElementById('modalNovaInspecao').style.display = 'flex';
        }

        function fecharModal(id) {
            document.getElementById(id).style.display = 'none';
        }

        // Função de controle de estados do Segmented Control
        function atualizarSegmentedControl(btn, itemNum, valor) {
            const wrapper = btn.parentElement;
            wrapper.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const hiddenInp = document.getElementById('status_item_' + itemNum);
            if (hiddenInp) hiddenInp.value = valor;

            // Lógica de exibição das perguntas condicionais
            if (itemNum === 5) {
                document.getElementById('sub-detalhe-5').style.display = (valor === 'NC') ? 'flex' : 'none';
            } else if (itemNum === 6) {
                document.getElementById('sub-detalhe-6').style.display = (valor === 'C') ? 'flex' : 'none';
            } else if (itemNum === 10) {
                document.getElementById('sub-detalhe-10').style.display = (valor === 'C') ? 'flex' : 'none';
            } else if (itemNum === 11) {
                const isC = (valor === 'C');
                document.getElementById('sub-detalhe-11').style.display = isC ? 'flex' : 'none';
                if (!isC) {
                    toggleItem12(false);
                }
            } else if (itemNum === 20) {
                document.getElementById('sub-detalhe-20').style.display = (valor === 'NC') ? 'flex' : 'none';
            }

            // Mostra campos obrigatórios para Não Conforme (NC)
            if (itemNum !== 12) {
                const ncContainer = document.getElementById('nc-fields-' + itemNum);
                const ncObsInput = document.getElementById('item_' + itemNum + '_obs_nc');
                const ncFoHidden = document.getElementById('item_' + itemNum + '_foto_base64');
                const preview = document.getElementById('item_' + itemNum + '_preview');
                const statusText = document.getElementById('item_' + itemNum + '_foto_status');

                if (ncContainer) {
                    if (valor === 'NC') {
                        ncContainer.style.display = 'flex';
                        ncObsInput.required = true;
                    } else {
                        ncContainer.style.display = 'none';
                        ncObsInput.required = false;
                        ncObsInput.value = '';
                        ncFoHidden.value = '';
                        if (preview) {
                            preview.style.display = 'none';
                            preview.src = '';
                        }
                        if (statusText) {
                            statusText.innerText = "Nenhuma foto anexada";
                            statusText.style.color = "var(--corTxt2)";
                        }
                    }
                }
            }
        }

        function toggleItem12(show) {
            const wrapper = document.getElementById('wrapper-item-12');
            const input = document.getElementById('item_12_localizacao');
            const hiddenStatus = document.getElementById('status_item_12');

            if (show) {
                wrapper.style.opacity = '1';
                wrapper.style.pointerEvents = 'auto';
                input.required = true;
                hiddenStatus.value = 'C';
            } else {
                wrapper.style.opacity = '0.5';
                wrapper.style.pointerEvents = 'none';
                input.value = '';
                input.required = false;
                hiddenStatus.value = 'NA';
            }
        }

        function converterParaBase64(input, itemNum) {
            const file = input.files[0];
            const hiddenInput = document.getElementById('item_' + itemNum + '_foto_base64');
            const preview = document.getElementById('item_' + itemNum + '_preview');
            const statusText = document.getElementById('item_' + itemNum + '_foto_status');

            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    hiddenInput.value = e.target.result;
                    if (preview) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    }
                    if (statusText) {
                        statusText.innerText = "✓ Foto anexada com sucesso!";
                        statusText.style.color = "#28a745";
                    }
                };
                reader.readAsDataURL(file);
            } else {
                hiddenInput.value = '';
                if (preview) {
                    preview.style.display = 'none';
                    preview.src = '';
                }
                if (statusText) {
                    statusText.innerText = "Nenhuma foto anexada";
                    statusText.style.color = "var(--corTxt2)";
                }
            }
        }

        let activeCameraStream = null;
        let currentCameraItemNum = null;

        function abrirModalCamera(itemNum) {
            currentCameraItemNum = itemNum;
            const modal = document.getElementById('modalCamera');
            const video = document.getElementById('cameraVideo');
            modal.style.display = 'flex';

            // Solicita acesso à câmera (idealmente traseira/environment em tablets)
            const constraints = {
                video: {
                    facingMode: { ideal: "environment" }
                },
                audio: false
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    activeCameraStream = stream;
                    video.srcObject = stream;
                })
                .catch(err => {
                    console.error("Erro ao acessar câmera: ", err);
                    alert("Não foi possível abrir a câmera diretamente neste navegador. Use a opção de anexo padrão abaixo.");
                    fecharModalCamera();
                });
        }

        function fecharModalCamera() {
            const modal = document.getElementById('modalCamera');
            modal.style.display = 'none';
            
            if (activeCameraStream) {
                activeCameraStream.getTracks().forEach(track => track.stop());
                activeCameraStream = null;
            }
            
            const video = document.getElementById('cameraVideo');
            if (video) {
                video.srcObject = null;
            }
        }

        function tirarFoto() {
            if (!activeCameraStream || currentCameraItemNum === null) return;

            const video = document.getElementById('cameraVideo');
            const canvas = document.getElementById('cameraCanvas');
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const base64Data = canvas.toDataURL('image/jpeg');

            const hiddenInput = document.getElementById('item_' + currentCameraItemNum + '_foto_base64');
            const preview = document.getElementById('item_' + currentCameraItemNum + '_preview');
            const statusText = document.getElementById('item_' + currentCameraItemNum + '_foto_status');

            hiddenInput.value = base64Data;
            if (preview) {
                preview.src = base64Data;
                preview.style.display = 'block';
            }
            if (statusText) {
                statusText.innerText = "✓ Foto capturada da câmera!";
                statusText.style.color = "#28a745";
            }

            fecharModalCamera();
        }

        // Validação contra a palavra VAZIO e validação de fotos/obs para itens NC
        function validarCampos() {
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

            // Validar se todos os itens NC possuem fotos e observações preenchidas
            const wrappers = document.querySelectorAll('.segmented-control-wrapper');
            for (let wrapper of wrappers) {
                const itemNum = wrapper.getAttribute('data-item');
                const hiddenStatus = document.getElementById('status_item_' + itemNum);
                if (hiddenStatus && hiddenStatus.value === 'NC' && itemNum !== '12') {
                    const obsInp = document.getElementById('item_' + itemNum + '_obs_nc');
                    const base64Inp = document.getElementById('item_' + itemNum + '_foto_base64');
                    
                    if (!obsInp || !obsInp.value.trim()) {
                        showToast("Por favor, preencha a observação para o item " + itemNum, "danger");
                        if (obsInp) obsInp.focus();
                        return false;
                    }
                    if (!base64Inp || !base64Inp.value.trim()) {
                        showToast("Por favor, tire ou anexe uma foto para o item " + itemNum, "danger");
                        return false;
                    }
                }
            }

            erroSpan.style.display = 'none';
            obsEl.style.borderColor = '';
            return true;
        }

        // AJAX POST: Salvar nova inspeção
        function submeterFormInspecao(e) {
            e.preventDefault();
            if (!validarCampos()) return false;

            const form = document.getElementById('form-inspecao');
            const formData = new FormData(form);
            const searchParams = new URLSearchParams();

            for (const [key, value] of formData.entries()) {
                searchParams.append(key, value);
            }
            searchParams.append('ajax', '1');

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
                    fecharModal('modalNovaInspecao');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro interno ao salvar vistoria.', 'danger');
            });
        }

        // Excluir Inspeção
        function excluirInspecao(id) {
            if (!confirm(`Deseja realmente excluir permanentemente o laudo de inspeção #${id}?`)) return;

            const params = new URLSearchParams();
            params.append('acao', 'excluir');
            params.append('id', id);
            params.append('ajax', '1');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: params.toString()
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    const row = document.getElementById('row-' + id);
                    if (row) {
                        row.remove();
                    }
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao excluir registro.', 'danger');
            });
        }

        // Mostrar detalhes em Modal
        function visualizarDetalhes(info) {
            // Em ambiente Node.js mock, 'info' é injetado diretamente como objeto JSON
            // Se for executado num servidor PHP real, 'info' seria o ID. Buscamos compatibilidade:
            if (typeof info === 'number') {
                // PHP puro: Buscamos os dados dinamicamente ou buscamos de um cache local no JS
                // Para manter compatível local/produção, podemos fazer um fetch ou ler dados do DOM.
                // Criamos o fallback de requisição AJAX:
                fetch(window.location.pathname + '?acao=buscar_detalhes_ajax&id=' + info, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(res => res.json())
                .then(response => {
                    if (response.success) {
                        renderizarDetalhesModal(response.data);
                    }
                });
                return;
            }

            renderizarDetalhesModal(info);
        }

        function renderizarDetalhesModal(info) {
            window.inspecaoAtual = info;
            document.getElementById('detalhe_unidade').innerText = info.unidade;
            document.getElementById('detalhe_setor').innerText = info.setor;
            document.getElementById('detalhe_quadro_tag').innerText = info.quadro_tag;
            document.getElementById('detalhe_responsavel').innerText = info.responsavel_nome;
            document.getElementById('detalhe_data').innerText = info.data_inspecao;
            document.getElementById('detalhe_observacoes').innerText = info.observacoes || 'Nenhuma observação registrada.';

            const container = document.getElementById('detalhes-itens-container');
            container.innerHTML = '';

            const itens = typeof info.itens === 'string' ? JSON.parse(info.itens) : info.itens;

            for (let i = 1; i <= 20; i++) {
                const item = itens['item_' + i] || { status: 'NA' };
                let badgeClass = 'badge-nsa';
                let iconClass = 'bi-slash-circle';
                let displayStatus = 'Não Aplicável';

                if (item.status === 'C') {
                    badgeClass = 'badge-ok';
                    iconClass = 'bi-check-circle-fill';
                    displayStatus = 'Conforme';
                } else if (item.status === 'NC') {
                    badgeClass = 'badge-defeito';
                    iconClass = 'bi-exclamation-triangle-fill';
                    displayStatus = 'Não Conforme';
                }

                // Sub-detalhes adicionais textuais
                let extraText = '';
                if (i === 5 && item.detalhes) {
                    const falhas = [];
                    if (item.detalhes.advertencia) falhas.push('Advertência');
                    if (item.detalhes.identificacao) falhas.push('Identificação');
                    if (item.detalhes.nivel_tensao) falhas.push('Nível Tensão');
                    if (falhas.length > 0) {
                        extraText = `<br><small style="color:var(--corTxt2);">Falhas: ${falhas.join(', ')}</small>`;
                    }
                } else if (i === 6 && item.detalhes) {
                    const tipos = [];
                    if (item.detalhes.cadeado) tipos.push('Cadeado');
                    if (item.detalhes.chave) tipos.push('Chave');
                    if (tipos.length > 0) {
                        extraText = `<br><small style="color:var(--corTxt2);">Bloqueio: ${tipos.join(', ')}</small>`;
                    }
                } else if (i === 10 && item.eficiente) {
                    extraText = `<br><small style="color:var(--corTxt2);">Eficientes? ${item.eficiente}</small>`;
                } else if (i === 11 && item.atualizado) {
                    extraText = `<br><small style="color:var(--corTxt2);">Atualizado? ${item.atualizado}</small>`;
                } else if (i === 12 && item.localizacao) {
                    extraText = `<br><small style="color:var(--corTxt2);">Localização: ${item.localizacao}</small>`;
                } else if (i === 20 && item.detalhes) {
                    const falhas = [];
                    if (item.detalhes.conservacao) falhas.push('Conservação');
                    if (item.detalhes.funcional) falhas.push('Funcional');
                    if (falhas.length > 0) {
                        extraText = `<br><small style="color:var(--corTxt2);">Falhas DPS: ${falhas.join(', ')}</small>`;
                    }
                }

                if (item.status === 'NC' && item.foto_nc) {
                    extraText += `
                        <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px; background: rgba(0,0,0,0.01); border: 1px solid var(--corBordas); border-radius: 8px; padding: 10px;">
                            <span style="font-size: 11px; font-weight: bold; color: var(--corTxt2);">Observação / Legenda da falha:</span>
                            <span style="font-size: 12px; color: var(--corTxt3); font-style: italic;">${item.obs_nc}</span>
                            <div style="margin-top: 5px; max-width: 250px; max-height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid var(--corBordas);">
                                <img src="${item.foto_nc}" style="width: 100%; height: auto; display: block;">
                            </div>
                        </div>
                    `;
                }

                container.innerHTML += `
                    <div class="card-detalhe-item">
                        <div class="value-container">
                            <span class="title">${i}. ${ITENS_DESCRICOES[i]}</span>
                            <span class="badge-status ${badgeClass}">
                                <i class="bi ${iconClass}"></i> ${displayStatus}
                            </span>
                        </div>
                        ${extraText}
                    </div>
                `;
            }

            document.getElementById('modalVerDetalhes').style.display = 'flex';
        }

        // Exportação Dinâmica de PDF via html2pdf
        function exportarPDF(info) {
            if (typeof info === 'number') {
                // Caso seja o ID (execução PHP pura)
                fetch(window.location.pathname + '?acao=buscar_detalhes_ajax&id=' + info, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(res => res.json())
                .then(response => {
                    if (response.success) {
                        gerarPDFDocumento(response.data);
                    }
                });
                return;
            }
            gerarPDFDocumento(info);
        }

        function exportarPDFChecklistAtual() {
            if (window.inspecaoAtual) {
                gerarPDFDocumento(window.inspecaoAtual);
            }
        }

        function gerarPDFDocumento(info) {
            // Popula os campos do cabeçalho no template HTML
            document.getElementById('pdf_unidade').innerText = info.unidade;
            document.getElementById('pdf_setor').innerText = info.setor;
            document.getElementById('pdf_data').innerText = info.data_inspecao;
            document.getElementById('pdf_quadro_tag').innerText = info.quadro_tag;
            document.getElementById('pdf_observacoes').innerText = info.observacoes || 'Sem observações adicionais.';

            const tbody = document.getElementById('pdf-itens-body');
            tbody.innerHTML = '';

            const itens = typeof info.itens === 'string' ? JSON.parse(info.itens) : info.itens;
            let totalC = 0;
            let totalNC = 0;

            for (let i = 1; i <= 20; i++) {
                const item = itens['item_' + i] || { status: 'NA' };
                let markC = '';
                let markNC = '';
                let markNA = '';

                if (item.status === 'C') {
                    markC = '✔';
                    totalC++;
                } else if (item.status === 'NC') {
                    markNC = 'X';
                    totalNC++;
                } else {
                    markNA = '✔';
                }

                // Renderiza descrição contendo os sub-detalhes condicionais da norma
                let descCompleta = ITENS_DESCRICOES[i];
                if (i === 5 && item.detalhes) {
                    const falhas = [];
                    if (item.detalhes.advertencia) falhas.push('ADVERTÊNCIA');
                    if (item.detalhes.identificacao) falhas.push('IDENTIFICAÇÃO');
                    if (item.detalhes.nivel_tensao) falhas.push('NÍVEL TENSÃO');
                    descCompleta += `<br><span style="margin-left: 15px; font-weight: bold; font-size: 9px;">Falhas identificadas: [${falhas.join('] [')}]</span>`;
                } else if (i === 6 && item.detalhes) {
                    const tipos = [];
                    if (item.detalhes.cadeado) tipos.push('CADEADO');
                    if (item.detalhes.chave) tipos.push('CHAVE');
                    descCompleta += `<br><span style="margin-left: 15px; font-weight: bold; font-size: 9px;">Bloqueio utilizado: [${tipos.join('] [')}]</span>`;
                } else if (i === 10 && item.eficiente) {
                    descCompleta += `<br><span style="margin-left: 15px; font-weight: bold; font-size: 9px;">Eficientes? [${item.eficiente === 'SIM' ? 'X' : ' '}] SIM &nbsp;&nbsp; [${item.eficiente === 'NÃO' ? 'X' : ' '}] NÃO</span>`;
                } else if (i === 11 && item.atualizado) {
                    descCompleta += `<br><span style="margin-left: 15px; font-weight: bold; font-size: 9px;">Atualizados? [${item.atualizado === 'SIM' ? 'X' : ' '}] SIM &nbsp;&nbsp; [${item.atualizado === 'NÃO' ? 'X' : ' '}] NÃO</span>`;
                } else if (i === 12 && item.localizacao) {
                    descCompleta += `<br><span style="margin-left: 15px; font-weight: bold; font-size: 9px;">Localização: <u>${item.localizacao}</u></span>`;
                } else if (i === 20 && item.detalhes) {
                    const falhas = [];
                    if (item.detalhes.conservacao) falhas.push('CONSERVAÇÃO');
                    if (item.detalhes.funcional) falhas.push('FUNCIONAL');
                    descCompleta += `<br><span style="margin-left: 15px; font-weight: bold; font-size: 9px;">DPS falhas: [${falhas.join('] [')}]</span>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td class="item-num">${i}</td>
                        <td>${descCompleta}</td>
                        <td class="col-check">${markC}</td>
                        <td class="col-check">${markNC}</td>
                        <td class="col-check">${markNA}</td>
                    </tr>
                `;
            }

            document.getElementById('pdf_total_c').innerText = totalC;
            document.getElementById('pdf_total_nc').innerText = totalNC;

            // População dinâmica do Relatório Fotográfico de Não Conformidades (Página 2)
            const ncContainer = document.getElementById('pdf-nc-photos-container');
            ncContainer.innerHTML = '';
            let hasNc = false;
            let ncCount = 0;

            for (let i = 1; i <= 20; i++) {
                const item = itens['item_' + i] || { status: 'NA' };
                if (item.status === 'NC' && item.foto_nc) {
                    hasNc = true;
                    ncCount++;
                    
                    if (ncCount > 2 && ncCount % 2 === 1) {
                        // Insere quebra de página a cada 2 fotos
                        ncContainer.innerHTML += `<div style="page-break-before: always; height: 0; margin: 0; padding: 0; border: none;"></div>`;
                    }
                    
                    ncContainer.innerHTML += `
                        <div style="border: 2px solid #000; padding: 10px; text-align: center; background-color: #fff; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; justify-content: space-between; height: 345px; width: 100%;">
                            <div style="font-weight: bold; font-size: 10px; text-align: left; border-bottom: 1px solid #000; padding-bottom: 4px; color: #000;">
                                Item ${i}: ${ITENS_DESCRICOES[i]}
                            </div>
                            <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #fafafa; border: 1px solid #ccc; border-radius: 6px;">
                                <img src="${item.foto_nc}" style="width: 100%; height: 100%; object-fit: contain;">
                            </div>
                            <div style="font-size: 10px; text-align: left; font-style: italic; border-top: 1px solid #000; padding-top: 6px; font-weight: bold; background-color: #fdfdfd; color: #000;">
                                Legenda/Observação: ${item.obs_nc}
                            </div>
                        </div>
                    `;
                }
            }

            if (hasNc) {
                document.getElementById('pdf-page-2').style.display = 'block';
            } else {
                document.getElementById('pdf-page-2').style.display = 'none';
            }

            const element = document.getElementById('pdf-template');
            
            // Opções do pdf
            const opt = {
                margin:       10,
                filename:     'RH-064-FR009_Inspecao_' + info.quadro_tag.replace(/\s+/g, '_') + '.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Trigger da exportação do laudo
            showToast('Gerando documento PDF preenchido...', 'success');
            html2pdf().from(element).set(opt).save();
        }

        // Sistema de busca rápida da tabela
        function filtrarTabela() {
            const query = document.getElementById('pesquisa').value.toLowerCase().trim();
            const rows = document.querySelectorAll('.inspecoes-row');
            let visibleCount = 0;

            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            const linhaVazia = document.getElementById('linha-vazia');
            if (visibleCount === 0) {
                if (!linhaVazia) {
                    const tbody = document.querySelector('#tabela-inspecoes tbody');
                    tbody.innerHTML += `
                        <tr id="linha-vazia">
                            <td colspan="7" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhuma inspeção de segurança encontrada para a pesquisa.</td>
                        </tr>
                    `;
                }
            } else {
                if (linhaVazia) {
                    linhaVazia.remove();
                }
            }
        }

        // Premium Toast notification helper
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
    </script>
    <!-- JS Globais -->
    <script src="../assets/js/scripts.js" defer></script>
</body>
</html>
