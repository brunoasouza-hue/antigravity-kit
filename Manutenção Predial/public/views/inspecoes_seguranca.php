<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Inspeções de Segurança (PHP OOP Mockup View)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';

// Exige autenticação básica
AuthController::verificarAutenticacao();

$usuarioNome = $_SESSION['usuario_nome'] ?? 'Usuário';
$usuarioNivel = $_SESSION['usuario_nivel'] ?? 'Solicitante';

// Roteamento de Logout local
if (isset($_GET['logout'])) {
    $auth = new AuthController();
    $auth->logout();
    header("Location: " . BASE_URL . "/public/index.php");
    exit;
}

// Data atual formatada para o cabeçalho
$dataAtual = date('d/m/Y');
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inspeções de Segurança - SENAI MANUTENÇÃO</title>

    <!-- Estilização Base, Sidebar, Header e Bootstrap Icons -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="../assets/img/favicon.ico" type="image/x-icon">

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

        .inspecoes-badge.pendente {
            background: rgba(255, 193, 7, 0.1);
            color: #b58600;
        }

        .inspecoes-badge.risco {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
        }

        /* Botão premium novo */
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
            border: 1px solid var(--corBorda);
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
            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Executor'): ?>
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
            <div class="menu-inspecoes">
                <a href="javascript:void(0)" class="links ativo inspecoes-btn" id="btn-inspecoes">
                    <div>
                        <i class="bi bi-shield-fill-check"></i>
                        <span>Inspeções</span>
                    </div>
                    <i class="bi bi-caret-down-fill seta"></i>
                </a>
                <div class="submenu" id="submenu-inspecoes" style="display: block;">
                    <a href="./inspecoes_seguranca.php" class="links-sub ativo">
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
                        <h3>24</h3>
                        <p>Vistorias Efetuadas</p>
                    </div>
                </div>

                <div class="inspecoes-stat-card">
                    <div class="inspecoes-stat-icon stat-green">
                        <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="inspecoes-stat-info">
                        <h3>22</h3>
                        <p>Ambientes Conformes</p>
                    </div>
                </div>

                <div class="inspecoes-stat-card">
                    <div class="inspecoes-stat-icon stat-red">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <div class="inspecoes-stat-info">
                        <h3>2</h3>
                        <p>Não Conformidades</p>
                    </div>
                </div>
            </div>

            <!-- Caixa de Vistorias e Tabela Principal -->
            <div class="section-box">
                <div class="section-box-header">
                    <div>
                        <h2 class="section-box-title">Histórico de Vistorias de Segurança</h2>
                        <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: var(--corTxt2); opacity: 0.8;">Lista de verificações de extintores, sinalizações, alarmes e integridade predial.</p>
                    </div>
                    <a href="javascript:void(0)" class="btn-premium" onclick="alert('Funcionalidade de preenchimento de nova inspeção predial será ativada na próxima versão de produção.')">
                        <i class="bi bi-plus-lg"></i> Nova Vistoria
                    </a>
                </div>

                <!-- Barra de Pesquisa Integrada -->
                <div class="box-pesquisa-e-filtro" style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                    <div class="page-search-box" style="flex: 1; min-width: 250px; position: relative;">
                        <input type="text" id="pesquisa" class="input-pesquisa" placeholder="Pesquise por ambiente ou tipo de vistoria..." style="width: 100%; padding: 12px 40px 12px 15px; border-radius: 8px; border: 1px solid var(--corBordas); background: var(--corFundo2); color: var(--corTxt3);">
                        <i class="bi bi-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: var(--corTxt2); opacity: 0.7;"></i>
                    </div>
                </div>

                <!-- Tabela de Inspeções -->
                <div style="overflow-x: auto; width: 100%;">
                    <table class="tabela-main" style="width: 100%; border-collapse: collapse; text-align: left;" id="tabela-inspecoes">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--corBordas);">
                                <th style="padding: 15px; color: var(--corTxt3);">#</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Tipo de Inspeção</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Local / Ambiente</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Inspetor</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Data</th>
                                <th style="padding: 15px; color: var(--corTxt3);">Status</th>
                                <th style="padding: 15px; text-align: center; color: var(--corTxt3);">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--corBordas);">
                                <td style="padding: 15px;">1</td>
                                <td style="padding: 15px; font-weight: bold;">Extintores de Incêndio</td>
                                <td style="padding: 15px;">Bloco A - Lab Informática 1</td>
                                <td style="padding: 15px;">Marcos Silva</td>
                                <td style="padding: 15px;">22/05/2026</td>
                                <td style="padding: 15px;">
                                    <span class="inspecoes-badge ok">
                                        <i class="bi bi-check-circle-fill"></i> Conforme
                                    </span>
                                </td>
                                <td style="padding: 15px; text-align: center;">
                                    <button class="table-action-btn" onclick="alert('Detalhes da inspeção de extintores Bloco A carregados com sucesso (Visualização Mock).')">
                                        <i class="bi bi-eye"></i> Ver
                                    </button>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--corBordas);">
                                <td style="padding: 15px;">2</td>
                                <td style="padding: 15px; font-weight: bold;">Luminárias de Emergência</td>
                                <td style="padding: 15px;">Bloco A - Lab Redes</td>
                                <td style="padding: 15px;">Marcos Silva</td>
                                <td style="padding: 15px;">21/05/2026</td>
                                <td style="padding: 15px;">
                                    <span class="inspecoes-badge ok">
                                        <i class="bi bi-check-circle-fill"></i> Conforme
                                    </span>
                                </td>
                                <td style="padding: 15px; text-align: center;">
                                    <button class="table-action-btn" onclick="alert('Detalhes da inspeção de luminárias Bloco A carregados com sucesso.')">
                                        <i class="bi bi-eye"></i> Ver
                                    </button>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--corBordas);">
                                <td style="padding: 15px;">3</td>
                                <td style="padding: 15px; font-weight: bold;">Rotas de Fuga & Sinalização</td>
                                <td style="padding: 15px;">Bloco B - Oficina Mecânica</td>
                                <td style="padding: 15px;">Marcos Silva</td>
                                <td style="padding: 15px;">20/05/2026</td>
                                <td style="padding: 15px;">
                                    <span class="inspecoes-badge risco">
                                        <i class="bi bi-exclamation-triangle-fill"></i> Não Conforme
                                    </span>
                                </td>
                                <td style="padding: 15px; text-align: center;">
                                    <button class="table-action-btn" onclick="alert('Atenção: Placa indicativa de saída de emergência quebrada ou obstruída na Oficina Mecânica. Risco registrado.')">
                                        <i class="bi bi-exclamation-circle"></i> Alerta
                                    </button>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--corBordas);">
                                <td style="padding: 15px;">4</td>
                                <td style="padding: 15px; font-weight: bold;">Quadros Elétricos & Aterramento</td>
                                <td style="padding: 15px;">Bloco B - Sala Eletroeletrônica</td>
                                <td style="padding: 15px;">Marcos Silva</td>
                                <td style="padding: 15px;">18/05/2026</td>
                                <td style="padding: 15px;">
                                    <span class="inspecoes-badge ok">
                                        <i class="bi bi-check-circle-fill"></i> Conforme
                                    </span>
                                </td>
                                <td style="padding: 15px; text-align: center;">
                                    <button class="table-action-btn" onclick="alert('Inspeção elétrica Bloco B carregada com sucesso.')">
                                        <i class="bi bi-eye"></i> Ver
                                    </button>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--corBordas);">
                                <td style="padding: 15px;">5</td>
                                <td style="padding: 15px; font-weight: bold;">Alarmes e Sensores de Fumaça</td>
                                <td style="padding: 15px;">Bloco C - Auditório Principal</td>
                                <td style="padding: 15px;">Marcos Silva</td>
                                <td style="padding: 15px;">15/05/2026</td>
                                <td style="padding: 15px;">
                                    <span class="inspecoes-badge pendente">
                                        <i class="bi bi-hourglass-split"></i> Em Andamento
                                    </span>
                                </td>
                                <td style="padding: 15px; text-align: center;">
                                    <button class="table-action-btn" onclick="alert('Vistoria em andamento. Bateria reserva do sensor em processo de recarga.')">
                                        <i class="bi bi-eye"></i> Ver
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação Simulada -->
                <div class="div-botoes-tabela" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px;">
                    <button class="btn-ant-prox" disabled style="opacity: 0.4; cursor: not-allowed; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--corBordas); background: var(--corFundo2); color: var(--corTxt3);"><i class="bi bi-chevron-left"></i> Anterior</button>
                    <button class="btn-ant-prox" disabled style="opacity: 0.4; cursor: not-allowed; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--corBordas); background: var(--corFundo2); color: var(--corTxt3);">Próximo <i class="bi bi-chevron-right"></i></button>
                </div>
            </div>
        </div>
    </section>

    <!-- JS Globais -->
    <script src="../assets/js/scripts.js" defer></script>
</body>
</html>
