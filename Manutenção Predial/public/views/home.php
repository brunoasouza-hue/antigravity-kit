<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Tela Inicial "Home" (PHP OOP)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';

// Exige autenticação básica
AuthController::verificarAutenticacao();

$usuarioNome = $_SESSION['usuario_nome'] ?? 'Usuário';
$usuarioNivel = $_SESSION['usuario_nivel'] ?? 'Solicitante';

// Consome alertas temporários de sessão
$alertaSucesso = $_SESSION['alerta_sucesso'] ?? '';
$alertaErro = $_SESSION['alerta_erro'] ?? '';
unset($_SESSION['alerta_sucesso'], $_SESSION['alerta_erro']);

// Roteamento de Logout local
if (isset($_GET['logout'])) {
    $auth = new AuthController();
    $auth->logout();
    header("Location: " . BASE_URL . "/public/index.php");
    exit;
}

// Data atual formatada para o cabeçalho
$dataAtual = date('d/m/Y');

// Busca pendências para notificações
require_once __DIR__ . '/../../src/Models/OrdemServico.php';

$usuarioId = (int)($_SESSION['usuario_id'] ?? 0);
$pendenciasCount = 0;
$alertaMensagem = '';

if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador') {
    $todas = OrdemServico::listarTodosComRelacionamentos();
    $despachosCount = 0;
    $validacoesCount = 0;
    foreach ($todas as $os) {
        if ($os->getStatus() === 'Pendente') {
            $despachosCount++;
        } elseif ($os->getStatus() === 'Aguardando Validação') {
            $validacoesCount++;
        }
    }
    $pendenciasCount = $despachosCount + $validacoesCount;
    if ($pendenciasCount > 0) {
        $pendenciasMensagem = [];
        if ($despachosCount > 0) {
            $pendenciasMensagem[] = $despachosCount === 1
                ? '1 O.S. aguardando aprovação e despacho'
                : "{$despachosCount} O.S. aguardando aprovação e despacho";
        }
        if ($validacoesCount > 0) {
            $pendenciasMensagem[] = $validacoesCount === 1
                ? '1 O.S. aguardando validação do reparo'
                : "{$validacoesCount} O.S. aguardando validação do reparo";
        }
        $alertaMensagem = 'Você possui ' . implode(' e ', $pendenciasMensagem) . '.';
    }
} elseif ($usuarioNivel === 'Executor') {
    $minhas = OrdemServico::listarPorExecutor($usuarioId);
    $pendentes = array_filter($minhas, function($os) {
        return $os->getStatus() === 'Aguardando Aceite';
    });
    $pendenciasCount = count($pendentes);
    if ($pendenciasCount > 0) {
        $alertaMensagem = "Você possui {$pendenciasCount} Ordem(ns) de Serviço aguardando o seu aceite.";
    }
} elseif ($usuarioNivel === 'Solicitante') {
    $minhas = OrdemServico::listarPorSolicitante($usuarioId);
    $pendentes = array_filter($minhas, function($os) {
        return $os->getStatus() === 'Aguardando Validação';
    });
    $pendenciasCount = count($pendentes);
    if ($pendenciasCount > 0) {
        $alertaMensagem = "Você possui {$pendenciasCount} Ordem(ns) de Serviço aguardando a sua validação.";
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Início - SENAI MANUTENÇÃO</title>

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
            --corHeroBg: #f1f5f9;
        }
        
        html[data-tema='escuro'] {
            --corCardBg: #2a2c36;
            --corHeroBg: #2a2c36;
        }

        /* Remove o botão do menu sanduíche especificamente na tela inicial */
        #mobile-sidebar-toggle {
            display: none !important;
        }

        .home-welcome-hero {
            background: var(--corHeroBg);
            border: 1px solid var(--corBordas);
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: var(--sombra);
            transition: all 0.3s ease;
        }
        
        .home-welcome-title {
            color: #fc2323;
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 15px;
            line-height: 1.2;
            font-family: 'TASA Orbiter', sans-serif;
        }
        
        .home-welcome-desc {
            color: var(--corTxt2);
            font-size: 1rem;
            line-height: 1.6;
            margin: 0;
            opacity: 0.85;
        }

        .home-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            margin-top: 20px;
            counter-reset: card-counter;
        }

        .home-card {
            text-decoration: none;
            display: flex;
            flex-direction: column;
            background: var(--corCardBg);
            border: 1px solid var(--corBordas);
            border-radius: 20px;
            padding: 35px;
            color: inherit;
            box-shadow: var(--sombra);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
        }

        .home-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--sombra2);
            border-color: rgba(252, 35, 35, 0.3);
        }

        .home-card-icon-box {
            background: rgba(252, 35, 35, 0.08);
            color: #fc2323;
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            margin-bottom: 24px;
            border: 1px solid rgba(252, 35, 35, 0.1);
        }

        .home-card-title {
            font-weight: 800;
            font-size: 1.25rem;
            color: #fc2323;
            font-family: 'TASA Orbiter', sans-serif;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--corBordas);
        }

        .home-card-title::before {
            counter-increment: card-counter;
            content: counter(card-counter) ". ";
        }

        .home-card-desc {
            color: var(--corTxt2);
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
            opacity: 0.95;
        }

        @media (max-width: 768px) {
            .home-welcome-hero {
                padding: 25px;
            }
            .home-welcome-title {
                font-size: 1.7rem;
            }
            .home-card {
                padding: 25px;
            }
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
            <!-- Início (Ativo nesta tela) -->
            <a href="./home.php" class="ativo links">
                <i class="bi bi-house-door-fill"></i> Início
            </a>

            <!-- Dashboard de Indicadores -->
            <a href="./dashboard.php" class="links">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>

            <!-- Menu Manutenção condicional: Apenas para Gestor e Executor -->
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
                        <a href="./corretivas.php" class="links-sub">
                            <i class="bi bi-wrench"></i> Corretiva (O.S)
                        </a>
                        <a href="./preventivas.php" class="links-sub">
                            <i class="bi bi-clock-fill"></i> Preventiva (Checklist)
                        </a>
                    </div>
                </div>
            <?php else: ?>
                <!-- Solicitantes acessam apenas ordens corretivas diretamente -->
                <a href="./corretivas.php" class="links">
                    <i class="bi bi-wrench"></i> Solicitar Corretiva (O.S)
                </a>
            <?php endif; ?>

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

        <!-- CONTEÚDO DA HOME -->
        <div class="dashboard-container" style="margin-top: 30px;">
            
            <!-- ALERTAS FLASH DE STATUS -->
            <?php if (!empty($alertaSucesso)): ?>
                <div style="background-color: rgba(40, 167, 69, 0.15); border: 1px solid #28a745; padding: 15px; border-radius: 12px; margin-bottom: 25px; color: #155724; font-family: 'TASA Orbiter', sans-serif;" class="alerta-sucesso">
                    <i class="bi bi-check-circle-fill" style="margin-right: 8px;"></i> <?php echo htmlspecialchars($alertaSucesso); ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($alertaErro)): ?>
                <div style="background-color: rgba(252, 35, 35, 0.15); border: 1px solid #fc2323; padding: 15px; border-radius: 12px; margin-bottom: 25px; color: #ca2525; font-family: 'TASA Orbiter', sans-serif;" class="alerta-erro">
                    <i class="bi bi-exclamation-triangle-fill" style="margin-right: 8px;"></i> <?php echo htmlspecialchars($alertaErro); ?>
                </div>
            <?php endif; ?>

            <!-- NOTIFICACOES_PENDENTES_BLOQUEIO -->
            <?php if ($pendenciasCount > 0): ?>
                <?php
                $bannerClass = '';
                $bannerIcon = 'bi-exclamation-triangle-fill';
                $bannerColor = '#f59e0b'; // Amber por padrão
                $bannerBg = 'rgba(245, 158, 11, 0.08)';
                $bannerBorder = 'rgba(245, 158, 11, 0.3)';
                
                if ($usuarioNivel === 'Executor') {
                    $bannerIcon = 'bi-info-circle-fill';
                    $bannerColor = '#3b82f6'; // Azul
                    $bannerBg = 'rgba(59, 130, 246, 0.08)';
                    $bannerBorder = 'rgba(59, 130, 246, 0.3)';
                } elseif ($usuarioNivel === 'Solicitante') {
                    $bannerIcon = 'bi-question-circle-fill';
                    $bannerColor = '#10b981'; // Verde
                    $bannerBg = 'rgba(16, 185, 129, 0.08)';
                    $bannerBorder = 'rgba(16, 185, 129, 0.3)';
                }
                ?>
                <div style="background: <?php echo $bannerBg; ?>; border: 1px solid <?php echo $bannerBorder; ?>; padding: 20px; border-radius: 16px; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; gap: 15px; box-shadow: var(--sombra); transition: all 0.3s ease;" class="notificacao-banner">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: <?php echo $bannerBg; ?>; border: 1px solid <?php echo $bannerBorder; ?>; color: <?php echo $bannerColor; ?>; width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                            <i class="bi <?php echo $bannerIcon; ?>"></i>
                        </div>
                        <div>
                            <strong style="color: <?php echo $bannerColor; ?>; display: block; font-size: 15px; margin-bottom: 3px; font-family: 'TASA Orbiter', sans-serif;">Atenção: Ação Requerida</strong>
                            <span style="color: var(--corTxt3); font-size: 14px; opacity: 0.9;"><?php echo htmlspecialchars($alertaMensagem); ?></span>
                        </div>
                    </div>
                    <a href="./corretivas.php" style="background: <?php echo $bannerColor; ?>; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13.5px; transition: 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 8px;" class="notificacao-btn">
                        Ver chamados <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            <?php endif; ?>
            <!-- FIM_NOTIFICACOES_PENDENTES_BLOQUEIO -->

            <!-- BANNER DE BOAS-VINDAS HERO -->
            <div class="home-welcome-hero">
                <h1 class="home-welcome-title">Bem-vindo ao Sistema de Manutenção</h1>
                <p class="home-welcome-desc">Este sistema foi desenvolvido para otimizar o controle de máquinas do SENAI. Veja abaixo como começar a utilizar a plataforma.</p>
            </div>

            <!-- GRID DE CARD DE ATALHOS PREMIUM -->
            <div class="home-cards-grid">

                <!-- 1. Checklist Preventiva (Apenas Gestor e Executor) -->
                <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador' || $usuarioNivel === 'Executor'): ?>
                    <a href="./preventivas.php" class="home-card">
                        <div class="home-card-icon-box">
                            <i class="bi bi-clock-fill"></i>
                        </div>
                        <h4 class="home-card-title">Checklist Preventiva</h4>
                        <p class="home-card-desc">Realizar inspeções regulares de tomadas, lousas, projetores, paredes e forros prediais.</p>
                    </a>
                <?php endif; ?>

                <!-- 2. Ordem de Serviço (O.S) (Todos os usuários) -->
                <a href="./corretivas.php" class="home-card">
                    <div class="home-card-icon-box">
                        <i class="bi bi-wrench"></i>
                    </div>
                    <h4 class="home-card-title">Ordem de Serviço (O.S)</h4>
                    <p class="home-card-desc">
                        <?php if ($usuarioNivel === 'Solicitante'): ?>
                            Solicitar reparos imediatos de manutenção corretiva para salas do Senai.
                        <?php endif; ?>
                        <?php if ($usuarioNivel !== 'Solicitante'): ?>
                            Gerenciar e executar chamados de manutenção corretiva em tempo real.
                        <?php endif; ?>
                    </p>
                </a>

                <!-- 3. Dashboard (Todos os usuários) -->
                <a href="./dashboard.php" class="home-card">
                    <div class="home-card-icon-box" style="background: rgba(251, 192, 45, 0.08); color: #fbc02d; border: 1px solid rgba(251, 192, 45, 0.1);">
                        <i class="bi bi-speedometer2"></i>
                    </div>
                    <h4 class="home-card-title">Dashboard</h4>
                    <p class="home-card-desc">Acompanhar indicadores gerenciais unificados, gráficos de status, tendência, ranking e fluxo de ordens de serviço em tempo real.</p>
                </a>

                <!-- 4. Gestão de Ambientes (Apenas Gestor) -->
                <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador'): ?>
                    <a href="./ambientes.php" class="home-card">
                        <div class="home-card-icon-box">
                            <i class="bi bi-building"></i>
                        </div>
                        <h4 class="home-card-title">Gestão de Ambientes</h4>
                        <p class="home-card-desc">Cadastrar novas salas e blocos, inativar salas obsoletas e gerenciar a infraestrutura física.</p>
                    </a>

                    <!-- 5. Gestão de Usuários (Apenas Gestor) -->
                    <a href="./usuarios.php" class="home-card">
                        <div class="home-card-icon-box">
                            <i class="bi bi-file-earmark-person-fill"></i>
                        </div>
                        <h4 class="home-card-title">Gestão de Usuários</h4>
                        <p class="home-card-desc">Cadastrar e gerenciar perfis de acesso dos solicitantes, gestores e executores de manutenção.</p>
                    </a>
                <?php endif; ?>

                <!-- 6. Inspeções de Segurança (Todos os usuários) -->
                <a href="./inspecoes_seguranca.php" class="home-card">
                    <div class="home-card-icon-box" style="background: rgba(252, 35, 35, 0.1); color: #fc2323;">
                        <i class="bi bi-shield-fill-check"></i>
                    </div>
                    <h4 class="home-card-title">Inspeções de Segurança</h4>
                    <p class="home-card-desc">Realizar vistorias preventivas de segurança predial, checar extintores, rotas de fuga e conformidade das normas regulamentadoras.</p>
                </a>

                <!-- 7. Meu Perfil (Todos os usuários) -->
                <a href="./perfil.php" class="home-card">
                    <div class="home-card-icon-box">
                        <i class="bi bi-person-fill"></i>
                    </div>
                    <h4 class="home-card-title">Meu Perfil</h4>
                    <p class="home-card-desc">Visualizar suas informações cadastrais de cargo e alterar sua senha com segurança via AJAX.</p>
                </a>
                
            </div>
        </div>
    </section>

    <!-- JS Globais -->
    <script src="../assets/js/scripts.js" defer></script>
</body>
</html>
