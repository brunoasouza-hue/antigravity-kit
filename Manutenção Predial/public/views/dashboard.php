<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Painel Dashboard (PHP OOP)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Models/Ambiente.php';
require_once __DIR__ . '/../../src/Models/Checklist.php';

// Exige autenticação básica para qualquer perfil de usuário logado
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

// Estatísticas Dinâmicas para o Dashboard
$totalAmbientes = count(Ambiente::listarTodos());
$totalAtivos = count(Ambiente::listarAtivos());
$totalInativos = $totalAmbientes - $totalAtivos;
$totalChecklists = count(Checklist::listarTodos());

// Data atual formatada para exibição no cabeçalho
$dataAtual = date('d/m/Y');
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SENAI MANUTENÇÃO</title>

    <!-- Estilização Base, Sidebar, Header e Bootstrap Icons -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="../assets/css/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="../assets/img/favicon.ico" type="image/x-icon">
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

            <!-- Dashboard Link (Ativo) -->
            <a href="./dashboard.php" class="ativo links">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>

            <!-- Menu Manutenção condicional: Apenas para Gestor e Executor -->
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
                <!-- Solicitantes acessam apenas ordens corretivas diretamente -->
                <a href="./corretivas.php" class="links">
                    <i class="bi bi-wrench"></i> Solicitar Corretiva (O.S)
                </a>
            <?php endif; ?>

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

        <!-- CONTEÚDO DO DASHBOARD -->
        <div class="dashboard-container" style="margin-top: 30px;">
            <div style="margin-bottom: 25px;">
                <h2 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3);">Painel de Controle Predial</h2>
                <p style="color: var(--corTxt2); margin-top: 5px;">Acompanhe os principais indicadores e métricas do sistema predial.</p>
            </div>

            <!-- CARDS DE MÉTRICAS RÁPIDAS -->
            <div class="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <!-- Card 1: Ambientes -->
                <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s;">
                    <div>
                        <span style="color: var(--corTxt2); font-size: 14px; font-weight: 500; display: block; margin-bottom: 5px;">Total de Ambientes</span>
                        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--corTxt3);"><?php echo $totalAmbientes; ?></h1>
                    </div>
                    <div style="background: rgba(252, 35, 35, 0.1); color: var(--corBase); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        <i class="bi bi-building"></i>
                    </div>
                </div>

                <!-- Card 2: Ambientes Ativos -->
                <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s;">
                    <div>
                        <span style="color: var(--corTxt2); font-size: 14px; font-weight: 500; display: block; margin-bottom: 5px;">Ambientes Ativos</span>
                        <h1 style="font-size: 2.2rem; font-weight: 800; color: #28a745;"><?php echo $totalAtivos; ?></h1>
                    </div>
                    <div style="background: rgba(40, 167, 69, 0.1); color: #28a745; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                </div>

                <!-- Card 3: Ambientes Inativos -->
                <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s;">
                    <div>
                        <span style="color: var(--corTxt2); font-size: 14px; font-weight: 500; display: block; margin-bottom: 5px;">Ambientes Inativos</span>
                        <h1 style="font-size: 2.2rem; font-weight: 800; color: #6c757d;"><?php echo $totalInativos; ?></h1>
                    </div>
                    <div style="background: rgba(108, 117, 125, 0.1); color: #6c757d; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        <i class="bi bi-slash-circle"></i>
                    </div>
                </div>

                <!-- Card 4: Checklists -->
                <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s;">
                    <div>
                        <span style="color: var(--corTxt2); font-size: 14px; font-weight: 500; display: block; margin-bottom: 5px;">Checklists Gravados</span>
                        <h1 style="font-size: 2.2rem; font-weight: 800; color: #007bff;"><?php echo $totalChecklists; ?></h1>
                    </div>
                    <div style="background: rgba(0, 123, 255, 0.1); color: #007bff; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        <i class="bi bi-clock-fill"></i>
                    </div>
                </div>
            </div>


        </div>
    </section>

    <!-- JS Globais -->
    <script src="../assets/js/scripts.js" defer></script>
</body>
</html>
