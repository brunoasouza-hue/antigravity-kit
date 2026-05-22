<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Gestão Dinâmica de Ordens de Serviço Corretivas (O.S.)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Models/OrdemServico.php';
require_once __DIR__ . '/../../src/Models/Ambiente.php';
require_once __DIR__ . '/../../src/Models/Usuario.php';
require_once __DIR__ . '/../../src/Controllers/OrdemServicoController.php';

// Exige autenticação básica
AuthController::verificarAutenticacao();

$usuarioId = (int)$_SESSION['usuario_id'];
$usuarioNome = $_SESSION['usuario_nome'] ?? 'Usuário';
$usuarioNivel = $_SESSION['usuario_nivel'] ?? 'Solicitante';

// Roteamento de Logout local
if (isset($_GET['logout'])) {
    $auth = new AuthController();
    $auth->logout();
    header("Location: " . BASE_URL . "/public/index.php");
    exit;
}

// Se for POST ou GET com ação configurada, delega ao controlador
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['acao'])) {
    $osController = new OrdemServicoController();
    $osController->processarAcao();
}

// Consome mensagens de status de sessão (fallback para não-AJAX)
$alertaSucesso = $_SESSION['alerta_sucesso'] ?? '';
$alertaErro = $_SESSION['alerta_erro'] ?? '';
unset($_SESSION['alerta_sucesso'], $_SESSION['alerta_erro']);

// Filtro de busca na barra (opcional para reload)
$pesquisa = $_GET['search'] ?? '';

// Carrega dados baseados no nível de acesso do usuário para as tabelas e modais
$ambientesAtivos = [];
$executores = [];
$ordensServico = [];

if ($usuarioNivel === 'Solicitante') {
    $ordensServico = OrdemServico::listarPorSolicitante($usuarioId);
    $ambientesAtivos = Ambiente::listarAtivos(); // para o modal de abertura
} elseif ($usuarioNivel === 'Gestor') {
    $ordensServico = OrdemServico::listarTodosComRelacionamentos();
    $executores = Usuario::listarPorNivel('Executor'); // para o modal de despacho
} elseif ($usuarioNivel === 'Executor') {
    $ordensServico = OrdemServico::listarPorExecutor($usuarioId);
}

// Data atual formatada para exibição no cabeçalho
$dataAtual = date('d/m/Y');
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ordens de Serviço - SENAI MANUTENÇÃO</title>

    <!-- Estilização Base, Sidebar, Header, Modais, Toasts e Bootstrap Icons -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/modal.css">
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

            <a href="./dashboard.php" class="links">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>

            <!-- Menu Manutenção condicional: Apenas para Gestor e Executor -->
            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Executor'): ?>
                <div class="menu-manutencao aberto">
                    <a href="javascript:void(0)" class="links ativo manutencao-btn" id="btn-manutencao">
                        <div>
                            <i class="bi bi-tools"></i>
                            <span>Manutenção</span>
                        </div>
                        <i class="bi bi-caret-down-fill seta"></i>
                    </a>
                    <div class="submenu aberto" id="submenu-manutencao" style="display: flex;">
                        <a href="./corretivas.php" class="ativo links-sub">
                            <i class="bi bi-wrench"></i> Corretiva (O.S)
                        </a>
                        <a href="./preventivas.php" class="links-sub">
                            <i class="bi bi-clock-fill"></i> Preventiva (Checklist)
                        </a>
                    </div>
                </div>
            <?php else: ?>
                <!-- Solicitantes acessam apenas ordens corretivas diretamente -->
                <a href="./corretivas.php" class="ativo links">
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

        <!-- BANNERS DE ALERTA (SUCESSO / ERRO) -->
        <?php if (!empty($alertaSucesso)): ?>
            <div class="alerta-sucesso" style="background-color: rgba(40, 167, 69, 0.12); border: 1px solid #28a745; padding: 15px; border-radius: 12px; margin-bottom: 20px; color: #28a745; font-family: 'TASA Orbiter', sans-serif; display: flex; align-items: center; gap: 10px;">
                <i class="bi bi-check-circle-fill" style="font-size: 1.2rem;"></i>
                <span><?php echo htmlspecialchars($alertaSucesso); ?></span>
            </div>
        <?php endif; ?>

        <?php if (!empty($alertaErro)): ?>
            <div class="alerta-erro" style="background-color: rgba(252, 35, 35, 0.12); border: 1px solid #fc2323; padding: 15px; border-radius: 12px; margin-bottom: 20px; color: #ca2525; font-family: 'TASA Orbiter', sans-serif; display: flex; align-items: center; gap: 10px;">
                <i class="bi bi-exclamation-triangle-fill" style="font-size: 1.2rem;"></i>
                <span><?php echo htmlspecialchars($alertaErro); ?></span>
            </div>
        <?php endif; ?>

        <!-- BARRA DE AÇÕES UNIFICADA -->
        <div class="page-actions-bar" style="margin-top: 20px;">
            <div class="page-search-form" style="display: flex; gap: 10px; width: 100%; max-width: 600px;">
                <div class="page-search-box" style="flex-grow: 1; display: flex; align-items: center; background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 10px; padding: 0 10px;">
                    <i class="bi bi-search" style="color: var(--corTxt2); margin-right: 8px;"></i>
                    <input type="text" id="pesquisa" placeholder="Filtrar por sala, solicitante, executor ou status..." style="border: none; background: transparent; width: 100%; padding: 10px 0; color: var(--corTxt3); outline: none;">
                </div>
            </div>
            
            <?php if ($usuarioNivel === 'Solicitante' || $usuarioNivel === 'Gestor'): ?>
                <button class="btn-page-action" onclick="abrirModalAbertura()" style="background: var(--corBase); color: #fff; border: none; border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; font-weight: bold;">
                    <i class="bi bi-plus-lg"></i> Abrir Nova O.S.
                </button>
            <?php endif; ?>
        </div>

        <!-- TABELA DE ORDENS DE SERVIÇO -->
        <div class="tabela-bg2" style="margin-top: 20px;">
            <div class="tabela-titulo" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <i class="bi bi-wrench" style="font-size: 1.5rem; color: var(--corBase);"></i>
                <h2>Ordens de Serviço Corretivas</h2>
            </div>
            
            <div class="tabela-wrapper" style="overflow-x: auto; background: var(--corFundo); border-radius: 12px; border: 1px solid var(--corBorda);">
                <table class="tabela-main" style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--corBorda); background: rgba(0,0,0,0.02);">
                            <th style="padding: 15px; width: 8%;">ID</th>
                            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Executor'): ?>
                                <th style="padding: 15px; width: 15%;">Solicitante</th>
                            <?php endif; ?>
                            <th style="padding: 15px; width: 15%;">Ambiente</th>
                            <th style="padding: 15px;">Descrição do Problema</th>
                            <?php if ($usuarioNivel === 'Gestor'): ?>
                                <th style="padding: 15px; width: 10%;">Tipo</th>
                            <?php endif; ?>
                            <?php if ($usuarioNivel === 'Solicitante' || $usuarioNivel === 'Gestor'): ?>
                                <th style="padding: 15px; width: 15%;">Executor</th>
                            <?php endif; ?>
                            <th style="padding: 15px; width: 12%;">Abertura</th>
                            <th style="padding: 15px; text-align: center; width: 15%;">Status</th>
                            <th style="padding: 15px; text-align: center; width: 10%;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-os-body">
                        <?php if (empty($ordensServico)): ?>
                            <tr id="linha-vazia">
                                <td colspan="10" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhuma ordem de serviço registrada.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($ordensServico as $os): ?>
                            <?php 
                                $status = $os->getStatus();
                                $podeClicarLinha = ($usuarioNivel === 'Gestor' && $status === 'Pendente') || ($usuarioNivel === 'Executor' && $status === 'Em Execução');
                                $rowStyle = $podeClicarLinha ? 'cursor: pointer; border-bottom: 1px solid var(--corBorda); transition: 0.2s;' : 'border-bottom: 1px solid var(--corBorda); transition: 0.2s;';
                                $onClick = '';
                                if ($usuarioNivel === 'Gestor' && $status === 'Pendente') {
                                    $onClick = 'onclick="abrirModalDespacho(' . $os->getId() . ')"';
                                } elseif ($usuarioNivel === 'Executor' && $status === 'Em Execução') {
                                    $onClick = 'onclick="abrirModalFinalizacao(' . $os->getId() . ')"';
                                }
                            ?>
                                <tr id="row-<?php echo $os->getId(); ?>" <?php echo $onClick; ?> style="<?php echo $rowStyle; ?>" class="linha-tabela-os">
                                    <!-- ID -->
                                    <td style="padding: 15px; font-weight: bold; color: var(--corTxt2);">#<?php echo $os->getId(); ?></td>
                                    
                                    <!-- Solicitante (para Gestor/Executor) -->
                                    <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Executor'): ?>
                                        <td style="padding: 15px; font-weight: 500; color: var(--corTxt3);"><?php echo htmlspecialchars($os->getSolicitanteNome() ?? 'N/D'); ?></td>
                                    <?php endif; ?>
                                    
                                    <!-- Ambiente -->
                                    <td style="padding: 15px; font-weight: bold; color: var(--corDestaque);"><?php echo htmlspecialchars($os->getAmbienteNome() ?? 'N/D'); ?></td>
                                    
                                    <!-- Descrição do Problema -->
                                    <td style="padding: 15px; font-size: 14px; color: var(--corTxt3); white-space: pre-line;"><?php echo htmlspecialchars($os->getDescricaoProblema()); ?></td>
                                    
                                    <!-- Tipo Execução (Gestor) -->
                                    <?php if ($usuarioNivel === 'Gestor'): ?>
                                        <td style="padding: 15px; font-weight: 500; color: var(--corTxt2);"><?php echo htmlspecialchars($os->getTipoExecucao()); ?></td>
                                    <?php endif; ?>
                                    
                                    <!-- Executor (para Solicitante/Gestor) -->
                                    <?php if ($usuarioNivel === 'Solicitante' || $usuarioNivel === 'Gestor'): ?>
                                        <td style="padding: 15px; font-weight: 500; color: var(--corTxt3);">
                                            <?php if ($os->getExecutorNome()): ?>
                                                <i class="bi bi-person-fill" style="margin-right: 4px;"></i> <?php echo htmlspecialchars($os->getExecutorNome()); ?>
                                            <?php else: ?>
                                                <span style="opacity: 0.6; font-style: italic;">A definir</span>
                                            <?php endif; ?>
                                        </td>
                                    <?php endif; ?>
                                    
                                    <!-- Abertura -->
                                    <td style="padding: 15px; font-size: 13px; color: var(--corTxt2);"><?php echo date('d/m/Y H:i', strtotime($os->getDataAbertura() ?? '')); ?></td>
                                    
                                    <!-- Status Badge -->
                                    <td style="padding: 15px; text-align: center;">
                                        <?php if ($status === 'Pendente'): ?>
                                            <span style="background-color: rgba(255, 193, 7, 0.12); color: #ffc107; border: 1px solid #ffc107; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                                                <i class="bi bi-hourglass-split"></i> Pendente
                                            </span>
                                        <?php elseif ($status === 'Em Execução'): ?>
                                            <span style="background-color: rgba(0, 123, 255, 0.12); color: #007bff; border: 1px solid #007bff; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                                                <i class="bi bi-gear-fill"></i> Em Execução
                                            </span>
                                        <?php elseif ($status === 'Aguardando Validação'): ?>
                                            <span style="background-color: rgba(23, 162, 184, 0.12); color: #17a2b8; border: 1px solid #17a2b8; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                                                <i class="bi bi-clock-fill"></i> Aguardando Validação
                                            </span>
                                        <?php elseif ($status === 'Concluída'): ?>
                                            <span style="background-color: rgba(40, 167, 69, 0.12); color: #28a745; border: 1px solid #28a745; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                                                <i class="bi bi-check2-all"></i> Concluída
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    
                                    <!-- Ações Individuais -->
                                    <td style="padding: 15px; text-align: center;" onclick="event.stopPropagation()">
                                        <div style="display: flex; gap: 8px; justify-content: center;">
                                            <?php if ($usuarioNivel === 'Solicitante' && $status === 'Aguardando Validação'): ?>
                                                <button class="btnAcao editar" type="button" title="Validar O.S." 
                                                        onclick="abrirModalValidacao(<?php echo $os->getId(); ?>)"
                                                        style="background: #28a745; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                                    <i class="bi bi-patch-check-fill"></i>
                                                </button>
                                            <?php elseif ($usuarioNivel === 'Gestor' && $status === 'Pendente'): ?>
                                                <button class="btnAcao editar" type="button" title="Despachar O.S." 
                                                        onclick="abrirModalDespacho(<?php echo $os->getId(); ?>)"
                                                        style="background: #007bff; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                                    <i class="bi bi-send-fill"></i>
                                                </button>
                                            <?php elseif ($usuarioNivel === 'Executor' && $status === 'Em Execução'): ?>
                                                <button class="btnAcao status-toggle" type="button" title="Finalizar Serviço" 
                                                        onclick="abrirModalFinalizacao(<?php echo $os->getId(); ?>)"
                                                        style="background: #28a745; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                                    <i class="bi bi-check-circle-fill"></i>
                                                </button>
                                            <?php else: ?>
                                                <button class="btnAcao" type="button" title="Visualizar Detalhes" 
                                                        onclick="visualizarOS(<?php echo $os->getId(); ?>)"
                                                        style="background: #6c757d; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                                    <i class="bi bi-eye-fill"></i>
                                                </button>
                                            <?php endif; ?>
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

    <!-- =========================================================================
         1. MODAL DE ABERTURA DE O.S. (SOLICITANTE)
         ========================================================================= -->
    <?php if ($usuarioNivel === 'Solicitante' || $usuarioNivel === 'Gestor'): ?>
        <div class="modal-fundo" id="modalAbertura" style="display: none;">
            <div class="modal-box" style="backdrop-filter: blur(20px); border: 1px solid var(--corBorda);">
                <div class="modal-header" style="border-bottom: 1px solid var(--corBorda); padding-bottom: 15px;">
                    <h3>Solicitar Reparo Corretivo</h3>
                    <button onclick="fecharModal('modalAbertura')"><i class="bi bi-x-lg"></i></button>
                </div>
                
                <form action="" method="POST" class="modal-form" id="form-abertura" style="padding-top: 15px;" onsubmit="submeterAbertura(event)">
                    <input type="hidden" name="acao" value="abrir">

                    <div class="modal-input" style="margin-bottom: 15px;">
                        <label for="abrir_ambiente_id" style="font-weight: bold; display: block; margin-bottom: 8px;">Ambiente (Sala / Bloco):</label>
                        <div class="input-wrapper">
                            <select name="ambiente_id" id="abrir_ambiente_id" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3);">
                                <option value="" disabled selected>Selecione o ambiente com problema...</option>
                                <?php foreach ($ambientesAtivos as $amb): ?>
                                    <option value="<?php echo $amb->getId(); ?>"><?php echo htmlspecialchars($amb->getNomeBlocoSala()); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="modal-input" style="margin-bottom: 20px;">
                        <label for="abrir_descricao_problema" style="font-weight: bold; display: block; margin-bottom: 8px;">Descrição Detalhada do Problema:</label>
                        <div class="input-wrapper">
                            <textarea name="descricao_problema" id="abrir_descricao_problema" placeholder="Descreva claramente o defeito ou avaria encontrada..." required style="width: 100%; height: 120px; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3); resize: none;"></textarea>
                        </div>
                        <!-- Mensagem de erro em tempo real contra literal VAZIO -->
                        <span id="abrir_erro" style="color: #fc2323; font-size: 12px; display: none; margin-top: 5px; font-weight: bold;"></span>
                    </div>

                    <div class="modal-footer" style="border-top: 1px solid var(--corBorda); padding-top: 15px; display: flex; justify-content: flex-end;">
                        <button type="submit" id="btn-enviar-abertura" class="btn-confirmar-full confirmar" style="background: var(--corBase); color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;">
                            Abrir Chamado O.S. <i class="bi bi-megaphone-fill" style="margin-left: 5px;"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>

    <!-- =========================================================================
         2. MODAL DE DESPACHO DE O.S. (GESTOR)
         ========================================================================= -->
    <?php if ($usuarioNivel === 'Gestor'): ?>
        <div class="modal-fundo" id="modalDespacho" style="display: none;">
            <div class="modal-box" style="backdrop-filter: blur(20px); border: 1px solid var(--corBorda);">
                <div class="modal-header" style="border-bottom: 1px solid var(--corBorda); padding-bottom: 15px;">
                    <h3>Despachar Ordem de Serviço #<span id="despacho_id_display" style="color: var(--corBase);"></span></h3>
                    <button onclick="fecharModal('modalDespacho')"><i class="bi bi-x-lg"></i></button>
                </div>
                
                <form action="" method="POST" class="modal-form" id="form-despacho" style="padding-top: 15px;" onsubmit="submeterDespacho(event)">
                    <input type="hidden" name="acao" value="despachar">
                    <input type="hidden" name="id" id="despacho_id">

                    <!-- Relato do Problema Original para Contexto -->
                    <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; border-left: 4px solid var(--corBase); margin-bottom: 20px;">
                        <strong style="font-size: 13px; color: var(--corTxt2); display: block; margin-bottom: 5px;">Relato do Solicitante:</strong>
                        <p id="despacho_descricao_display" style="color: var(--corTxt3); font-size: 14px; white-space: pre-line; margin: 0;"></p>
                    </div>

                    <div class="modal-input" style="margin-bottom: 15px;">
                        <label for="despacho_tipo_execucao" style="font-weight: bold; display: block; margin-bottom: 8px;">Tipo de Reparo (Origem):</label>
                        <div class="input-wrapper">
                            <select name="tipo_execucao" id="despacho_tipo_execucao" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3);">
                                <option value="Interna" selected>Interna (Equipe Escolar)</option>
                                <option value="Terceirizada">Terceirizada (Prestadores Externos)</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-input" style="margin-bottom: 20px;">
                        <label for="despacho_executor_id" style="font-weight: bold; display: block; margin-bottom: 8px;">Atribuir Executor de Manutenção:</label>
                        <div class="input-wrapper">
                            <select name="executor_id" id="despacho_executor_id" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3);">
                                <option value="" disabled selected>Escolha o profissional designado...</option>
                                <?php foreach ($executores as $exec): ?>
                                    <option value="<?php echo $exec->getId(); ?>"><?php echo htmlspecialchars($exec->getNome()); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="modal-footer" style="border-top: 1px solid var(--corBorda); padding-top: 15px; display: flex; justify-content: flex-end;">
                        <button type="submit" class="btn-confirmar-full confirmar" style="background: var(--corBase); color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;">
                            Despachar Chamado <i class="bi bi-send-fill" style="margin-left: 5px;"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>

    <!-- =========================================================================
         3. MODAL DE FINALIZAÇÃO DE O.S. (EXECUTOR)
         ========================================================================= -->
    <?php if ($usuarioNivel === 'Executor'): ?>
        <div class="modal-fundo" id="modalFinalizacao" style="display: none;">
            <div class="modal-box" style="backdrop-filter: blur(20px); border: 1px solid var(--corBorda);">
                <div class="modal-header" style="border-bottom: 1px solid var(--corBorda); padding-bottom: 15px;">
                    <h3>Concluir Serviço O.S. #<span id="finalizacao_id_display" style="color: var(--corBase);"></span></h3>
                    <button onclick="fecharModal('modalFinalizacao')"><i class="bi bi-x-lg"></i></button>
                </div>
                
                <form action="" method="POST" class="modal-form" id="form-finalizacao" style="padding-top: 15px;" onsubmit="submeterFinalizacao(event)">
                    <input type="hidden" name="acao" value="finalizar">
                    <input type="hidden" name="id" id="finalizacao_id">

                    <!-- Problema Original para Contexto -->
                    <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; border-left: 4px solid var(--corBase); margin-bottom: 20px;">
                        <strong style="font-size: 13px; color: var(--corTxt2); display: block; margin-bottom: 5px;">Serviço Requisitado:</strong>
                        <p id="finalizacao_descricao_display" style="color: var(--corTxt3); font-size: 14px; white-space: pre-line; margin: 0;"></p>
                    </div>

                    <div class="modal-input" style="margin-bottom: 20px;">
                        <label for="finalizacao_relato" style="font-weight: bold; display: block; margin-bottom: 8px;">Relato Técnico de Conclusão (Solução):</label>
                        <div class="input-wrapper">
                            <textarea name="relato_conclusao" id="finalizacao_relato" placeholder="Descreva os materiais usados, os reparos feitos e o estado final..." required style="width: 100%; height: 120px; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3); resize: none;"></textarea>
                        </div>
                        <!-- Mensagem de erro em tempo real contra literal VAZIO -->
                        <span id="finalizacao_erro" style="color: #fc2323; font-size: 12px; display: none; margin-top: 5px; font-weight: bold;"></span>
                    </div>

                    <div class="modal-footer" style="border-top: 1px solid var(--corBorda); padding-top: 15px; display: flex; justify-content: flex-end;">
                        <button type="submit" id="btn-enviar-finalizacao" class="btn-confirmar-full confirmar" style="background: #28a745; color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;">
                            Registrar Término <i class="bi bi-check-circle-fill" style="margin-left: 5px;"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>

    <!-- =========================================================================
         4. MODAL DE VALIDAÇÃO / AVALIAÇÃO DE O.S. (SOLICITANTE)
         ========================================================================= -->
    <?php if ($usuarioNivel === 'Solicitante' || $usuarioNivel === 'Gestor'): ?>
        <div class="modal-fundo" id="modalValidacao" style="display: none;">
            <div class="modal-box" style="width: 550px; backdrop-filter: blur(20px); border: 1px solid var(--corBorda);">
                <div class="modal-header" style="border-bottom: 1px solid var(--corBorda); padding-bottom: 15px;">
                    <h3>Avaliar Execução O.S. #<span id="validacao_id_display" style="color: var(--corBase);"></span></h3>
                    <button onclick="fecharModal('modalValidacao')"><i class="bi bi-x-lg"></i></button>
                </div>
                
                <form action="" method="POST" class="modal-form" id="form-validacao" style="padding-top: 15px;">
                    <input type="hidden" name="acao" value="validar">
                    <input type="hidden" name="id" id="validacao_id">
                    <input type="hidden" name="decisao" id="validacao_decisao">

                    <!-- Histórico Completo de logs para Auditoria de Campo -->
                    <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8; margin-bottom: 20px; max-height: 180px; overflow-y: auto;">
                        <strong style="font-size: 13px; color: var(--corTxt2); display: block; margin-bottom: 5px;">Histórico do Chamado:</strong>
                        <p id="validacao_historico_display" style="color: var(--corTxt3); font-size: 14px; white-space: pre-line; margin: 0; line-height: 1.4;"></p>
                    </div>

                    <div class="modal-input" style="margin-bottom: 20px;">
                        <label for="validacao_observacoes" style="font-weight: bold; display: block; margin-bottom: 8px;">Observações da Validação / Motivo da Recusa:</label>
                        <div class="input-wrapper">
                            <textarea name="observacoes_validacao" id="validacao_observacoes" placeholder="Caso aprove, registre um elogio ou observação. Caso recuse, relate detalhadamente o que faltou ser feito..." style="width: 100%; height: 100px; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3); resize: none;"></textarea>
                        </div>
                        <!-- Mensagem de erro em tempo real contra literal VAZIO -->
                        <span id="validacao_erro" style="color: #fc2323; font-size: 12px; display: none; margin-top: 5px; font-weight: bold;"></span>
                    </div>

                    <div class="modal-footer" style="border-top: 1px solid var(--corBorda); padding-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                        <!-- Duplo botão de ação inteligente -->
                        <div style="display: flex; gap: 10px; width: 100%;">
                            <button type="button" id="btn-aprovar" onclick="submeterValidacao('aprovar')" class="btn-confirmar-full" style="flex: 1; background: #28a745; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <i class="bi bi-check-circle-fill"></i> Aprovar e Concluir
                            </button>
                            <button type="button" id="btn-recusar" onclick="submeterValidacao('recusar')" class="btn-confirmar-full" style="flex: 1; background: var(--corBase); color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <i class="bi bi-x-circle-fill"></i> Recusar Serviço
                            </button>
                        </div>
                        
                        <button type="button" onclick="fecharModal('modalValidacao')" class="btn-confirmar-full" style="width: 100%; background: #6c757d; color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                            Voltar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>

    <!-- =========================================================================
         5. MODAL DE VISUALIZAÇÃO GERAL DE DETALHES (LEITURA APENAS - TODOS)
         ========================================================================= -->
    <div class="modal-fundo" id="modalVisualizacao" style="display: none;">
        <div class="modal-box" style="width: 500px; backdrop-filter: blur(20px); border: 1px solid var(--corBorda);">
            <div class="modal-header" style="border-bottom: 1px solid var(--corBorda); padding-bottom: 15px;">
                <h3>Detalhes da O.S. #<span id="vis_id_display" style="color: var(--corBase);"></span></h3>
                <button onclick="fecharModal('modalVisualizacao')"><i class="bi bi-x-lg"></i></button>
            </div>
            
            <div style="padding-top: 15px; color: var(--corTxt3); font-size: 14px; line-height: 1.6; display: grid; grid-template-columns: 1fr; gap: 15px;">
                
                <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 8px;">
                    <strong>Ambiente:</strong> <span id="vis_ambiente" style="color: var(--corDestaque); font-weight: bold;"></span><br>
                    <strong>Solicitante:</strong> <span id="vis_solicitante"></span><br>
                    <strong>Abertura:</strong> <span id="vis_abertura"></span><br>
                    <strong>Fechamento:</strong> <span id="vis_fechamento" style="font-weight: bold;"></span>
                </div>

                <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 8px;">
                    <strong>Executor Designado:</strong> <span id="vis_executor" style="font-weight: bold;"></span><br>
                    <strong>Tipo de Reparo:</strong> <span id="vis_tipo"></span><br>
                    <strong>Status Atual:</strong> <span id="vis_status"></span>
                </div>

                <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; border-left: 4px solid var(--corBase); max-height: 180px; overflow-y: auto;">
                    <strong>Histórico de Ocorrência & Conclusão:</strong>
                    <p id="vis_descricao" style="margin: 5px 0 0 0; white-space: pre-line; color: var(--corTxt3); font-size: 13.5px;"></p>
                </div>
            </div>

            <div class="modal-footer" style="border-top: 1px solid var(--corBorda); padding-top: 15px; display: flex; justify-content: flex-end;">
                <button type="button" onclick="fecharModal('modalVisualizacao')" class="btn-confirmar-full" style="background: #6c757d; color: #fff; border: none; padding: 10px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                    Fechar Detalhes
                </button>
            </div>
        </div>
    </div>

    <!-- JAVASCRIPT GERAL DA TELA DE OS CORRETIVAS -->
    <script>
        // Transições Suaves - Fecha Modais clicando fora no fundo do dialog
        window.onclick = function(event) {
            if (event.target.classList.contains('modal-fundo')) {
                fecharModal(event.target.id);
            }
        }

        // Fecha qualquer modal pelo ID
        function fecharModal(id) {
            document.getElementById(id).style.display = 'none';
        }

        // Sistema de Toast Premium Glassmorphic
        function showToast(mensagem, tipo = 'success') {
            const container = document.getElementById('toast-container') || (() => {
                const div = document.createElement('div');
                div.id = 'toast-container';
                div.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
                document.body.appendChild(div);
                return div;
            })();

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

        // Constrói HTML do badge de status dinamicamente
        function renderStatusBadge(status) {
            if (status === 'Pendente') {
                return `<span style="background-color: rgba(255, 193, 7, 0.12); color: #ffc107; border: 1px solid #ffc107; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-hourglass-split"></i> Pendente</span>`;
            } else if (status === 'Em Execução') {
                return `<span style="background-color: rgba(0, 123, 255, 0.12); color: #007bff; border: 1px solid #007bff; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-gear-fill"></i> Em Execução</span>`;
            } else if (status === 'Aguardando Validação') {
                return `<span style="background-color: rgba(23, 162, 184, 0.12); color: #17a2b8; border: 1px solid #17a2b8; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-clock-fill"></i> Aguardando Validação</span>`;
            } else if (status === 'Concluída') {
                return `<span style="background-color: rgba(40, 167, 69, 0.12); color: #28a745; border: 1px solid #28a745; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-check2-all"></i> Concluída</span>`;
            }
            return '';
        }

        // Constrói HTML das ações dinamicamente de acordo com o nível de acesso e status
        function renderActionsHtml(id, status) {
            const nivel = '<?php echo $usuarioNivel; ?>';
            if (nivel === 'Solicitante' && status === 'Aguardando Validação') {
                return `<button class="btnAcao editar" type="button" title="Validar O.S." onclick="abrirModalValidacao(${id})" style="background: #28a745; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;"><i class="bi bi-patch-check-fill"></i></button>`;
            } else if (nivel === 'Gestor' && status === 'Pendente') {
                return `<button class="btnAcao editar" type="button" title="Despachar O.S." onclick="abrirModalDespacho(${id})" style="background: #007bff; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;"><i class="bi bi-send-fill"></i></button>`;
            } else if (nivel === 'Executor' && status === 'Em Execução') {
                return `<button class="btnAcao status-toggle" type="button" title="Finalizar Serviço" onclick="abrirModalFinalizacao(${id})" style="background: #28a745; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;"><i class="bi bi-check-circle-fill"></i></button>`;
            } else {
                return `<button class="btnAcao" type="button" title="Visualizar Detalhes" onclick="visualizarOS(${id})" style="background: #6c757d; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;"><i class="bi bi-eye-fill"></i></button>`;
            }
        }

        // Re-renderiza de forma inteligente e reativa as linhas da tabela
        function renderRowHtml(data) {
            const nivel = '<?php echo $usuarioNivel; ?>';
            const solicitanteTd = (nivel === 'Gestor' || nivel === 'Executor') ? `<td style="padding: 15px; font-weight: 500; color: var(--corTxt3);">${data.solicitante_nome}</td>` : '';
            const gestorTd = (nivel === 'Gestor') ? `<td style="padding: 15px; font-weight: 500; color: var(--corTxt2);">${data.tipo_execucao}</td>` : '';
            
            let executorTd = '';
            if (nivel === 'Solicitante' || nivel === 'Gestor') {
                const execNome = data.executor_nome ? `<i class="bi bi-person-fill" style="margin-right: 4px;"></i> ${data.executor_nome}` : '<span style="opacity: 0.6; font-style: italic;">A definir</span>';
                executorTd = `<td style="padding: 15px; font-weight: 500; color: var(--corTxt3);">${execNome}</td>`;
            }

            return `
                <td style="padding: 15px; font-weight: bold; color: var(--corTxt2);">#${data.id}</td>
                ${solicitanteTd}
                <td style="padding: 15px; font-weight: bold; color: var(--corDestaque);">${data.ambiente_nome}</td>
                <td style="padding: 15px; font-size: 14px; color: var(--corTxt3); white-space: pre-line;">${data.descricao_problema}</td>
                ${gestorTd}
                ${executorTd}
                <td style="padding: 15px; font-size: 13px; color: var(--corTxt2);">${data.data_abertura}</td>
                <td style="padding: 15px; text-align: center;">${renderStatusBadge(data.status)}</td>
                <td style="padding: 15px; text-align: center;" onclick="event.stopPropagation()">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        ${renderActionsHtml(data.id, data.status)}
                    </div>
                </td>
            `;
        }

        // =========================================================================
        // MÉTODOS DE ABERTURA E CONTROLE DOS MODAIS VIA FETCH API
        // =========================================================================
        
        // Abre o modal de abertura (Solicitante)
        function abrirModalAbertura() {
            const form = document.getElementById('form-abertura');
            if (form) form.reset();
            const erroSpan = document.getElementById('abrir_erro');
            if (erroSpan) erroSpan.style.display = 'none';
            document.getElementById('modalAbertura').style.display = 'flex';
        }

        // Submete abertura de OS
        function submeterAbertura(event) {
            event.preventDefault();
            const descInput = document.getElementById('abrir_descricao_problema');
            const erroSpan = document.getElementById('abrir_erro');
            
            if (descInput.value.trim().toUpperCase() === 'VAZIO') {
                erroSpan.innerText = "✖ Erro: A descrição do problema não pode ser a palavra 'VAZIO'.";
                erroSpan.style.display = 'block';
                descInput.style.borderColor = '#fc2323';
                descInput.focus();
                return false;
            }

            const form = document.getElementById('form-abertura');
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
                    fecharModal('modalAbertura');

                    // Insere reativamente na tabela
                    const tbody = document.getElementById('tabela-os-body');
                    const linhaVazia = document.getElementById('linha-vazia');
                    if (linhaVazia) {
                        linhaVazia.remove();
                    }

                    const novaLinha = document.createElement('tr');
                    novaLinha.id = `row-${data.data.id}`;
                    novaLinha.className = 'linha-tabela-os';
                    novaLinha.style.cssText = 'border-bottom: 1px solid var(--corBorda); transition: 0.2s;';
                    
                    const nivel = '<?php echo $usuarioNivel; ?>';
                    if (nivel === 'Gestor') {
                        novaLinha.style.cursor = 'pointer';
                        novaLinha.onclick = () => abrirModalDespacho(data.data.id);
                    }

                    novaLinha.innerHTML = renderRowHtml({
                        id: data.data.id,
                        solicitante_nome: data.data.solicitante_nome,
                        ambiente_nome: data.data.ambiente_nome,
                        descricao_problema: data.data.descricao_problema,
                        tipo_execucao: data.data.tipo_execucao,
                        executor_nome: null,
                        data_abertura: data.data.data_abertura,
                        status: data.data.status
                    });

                    // Efeito flash suave de fade-in
                    novaLinha.style.backgroundColor = 'rgba(40, 167, 69, 0.08)';
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
                showToast('Erro interno de rede ao abrir ordem de serviço.', 'danger');
            });
        }

        // Abre o modal de despacho de OS (Gestor)
        function abrirModalDespacho(id) {
            fecharModal('modalVisualizacao');
            const form = document.getElementById('form-despacho');
            if (form) form.reset();

            // Carrega dinamicamente os detalhes do banco via AJAX (buscar)
            fetch(`${window.location.pathname}?acao=buscar&id=${id}&ajax=1`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    document.getElementById('despacho_id').value = res.data.id;
                    document.getElementById('despacho_id_display').innerText = res.data.id;
                    document.getElementById('despacho_descricao_display').innerText = res.data.descricao_problema;
                    document.getElementById('modalDespacho').style.display = 'flex';
                } else {
                    showToast(res.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro de rede ao buscar detalhes do chamado.', 'danger');
            });
        }

        // Submete despacho de OS (Gestor)
        function submeterDespacho(event) {
            event.preventDefault();
            const form = document.getElementById('form-despacho');
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
                    fecharModal('modalDespacho');

                    // Atualiza a linha reativamente no painel
                    const row = document.getElementById(`row-${data.data.id}`);
                    if (row) {
                        // Carrega detalhes atualizados e substitui o HTML
                        fetch(`${window.location.pathname}?acao=buscar&id=${data.data.id}&ajax=1`, {
                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                        })
                        .then(r => r.json())
                        .then(rData => {
                            if (rData.success) {
                                row.innerHTML = renderRowHtml(rData.data);
                                // Remove link de click da linha já despachada
                                row.onclick = null;
                                row.style.cursor = '';
                                row.style.backgroundColor = 'rgba(0, 123, 255, 0.08)';
                                setTimeout(() => row.style.backgroundColor = '', 1000);
                            }
                        });
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao despachar chamado.', 'danger');
            });
        }

        // Abre o modal de finalização de OS (Executor)
        function abrirModalFinalizacao(id) {
            fecharModal('modalVisualizacao');
            const form = document.getElementById('form-finalizacao');
            if (form) form.reset();
            const erroSpan = document.getElementById('finalizacao_erro');
            if (erroSpan) erroSpan.style.display = 'none';

            fetch(`${window.location.pathname}?acao=buscar&id=${id}&ajax=1`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    document.getElementById('finalizacao_id').value = res.data.id;
                    document.getElementById('finalizacao_id_display').innerText = res.data.id;
                    document.getElementById('finalizacao_descricao_display').innerText = res.data.descricao_problema;
                    document.getElementById('modalFinalizacao').style.display = 'flex';
                } else {
                    showToast(res.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro de rede ao buscar detalhes do chamado.', 'danger');
            });
        }

        // Submete finalização de OS (Executor)
        function submeterFinalizacao(event) {
            event.preventDefault();
            const relatoInput = document.getElementById('finalizacao_relato');
            const erroSpan = document.getElementById('finalizacao_erro');
            
            if (relatoInput.value.trim().toUpperCase() === 'VAZIO') {
                erroSpan.innerText = "✖ Erro: O relato técnico não pode ser a palavra 'VAZIO'.";
                erroSpan.style.display = 'block';
                relatoInput.style.borderColor = '#fc2323';
                relatoInput.focus();
                return false;
            }

            const form = document.getElementById('form-finalizacao');
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
                    fecharModal('modalFinalizacao');

                    // Atualiza a linha reativamente
                    const row = document.getElementById(`row-${data.data.id}`);
                    if (row) {
                        fetch(`${window.location.pathname}?acao=buscar&id=${data.data.id}&ajax=1`, {
                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                        })
                        .then(r => r.json())
                        .then(rData => {
                            if (rData.success) {
                                row.innerHTML = renderRowHtml(rData.data);
                                row.onclick = null;
                                row.style.cursor = '';
                                row.style.backgroundColor = 'rgba(23, 162, 184, 0.08)';
                                setTimeout(() => row.style.backgroundColor = '', 1000);
                            }
                        });
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao finalizar chamado.', 'danger');
            });
        }

        // Abre o modal de validação de OS (Solicitante)
        function abrirModalValidacao(id) {
            fecharModal('modalVisualizacao');
            const form = document.getElementById('form-validacao');
            if (form) form.reset();
            const erroSpan = document.getElementById('validacao_erro');
            if (erroSpan) erroSpan.style.display = 'none';

            fetch(`${window.location.pathname}?acao=buscar&id=${id}&ajax=1`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    document.getElementById('validacao_id').value = res.data.id;
                    document.getElementById('validacao_id_display').innerText = res.data.id;
                    document.getElementById('validacao_historico_display').innerText = res.data.descricao_problema;
                    document.getElementById('modalValidacao').style.display = 'flex';
                } else {
                    showToast(res.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao buscar dados do chamado.', 'danger');
            });
        }

        // Submete validação (Aprovar / Recusar)
        function submeterValidacao(decisao) {
            const obsInput = document.getElementById('validacao_observacoes');
            const erroSpan = document.getElementById('validacao_erro');
            
            if (obsInput.value.trim().toUpperCase() === 'VAZIO') {
                erroSpan.innerText = "✖ Erro: As observações não podem ser preenchidas como 'VAZIO'.";
                erroSpan.style.display = 'block';
                obsInput.style.borderColor = '#fc2323';
                obsInput.focus();
                return false;
            }

            if (decisao === 'recusar' && obsInput.value.trim() === '') {
                erroSpan.innerText = "✖ Erro: Ao recusar o serviço, é obrigatório indicar o motivo da recusa.";
                erroSpan.style.display = 'block';
                obsInput.style.borderColor = '#fc2323';
                obsInput.focus();
                return false;
            }

            document.getElementById('validacao_decisao').value = decisao;

            const form = document.getElementById('form-validacao');
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
                    fecharModal('modalValidacao');

                    // Atualiza a linha reativamente
                    const row = document.getElementById(`row-${data.data.id}`);
                    if (row) {
                        fetch(`${window.location.pathname}?acao=buscar&id=${data.data.id}&ajax=1`, {
                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                        })
                        .then(r => r.json())
                        .then(rData => {
                            if (rData.success) {
                                row.innerHTML = renderRowHtml(rData.data);
                                const isAprovado = decisao === 'aprovar';
                                row.style.backgroundColor = isAprovado ? 'rgba(40, 167, 69, 0.08)' : 'rgba(252, 35, 35, 0.08)';
                                setTimeout(() => row.style.backgroundColor = '', 1000);
                            }
                        });
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao validar ordem de serviço.', 'danger');
            });
        }

        // Abre o modal de apenas leitura para visualizar detalhes
        function visualizarOS(id) {
            fetch(`${window.location.pathname}?acao=buscar&id=${id}&ajax=1`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    document.getElementById('vis_id_display').innerText = res.data.id;
                    document.getElementById('vis_ambiente').innerText = res.data.ambiente_nome;
                    document.getElementById('vis_solicitante').innerText = res.data.solicitante_nome;
                    document.getElementById('vis_abertura').innerText = res.data.data_abertura;
                    document.getElementById('vis_fechamento').innerText = res.data.data_fechamento ? res.data.data_fechamento : 'Em andamento';
                    document.getElementById('vis_executor').innerText = res.data.executor_nome ? res.data.executor_nome : 'Não designado';
                    document.getElementById('vis_tipo').innerText = res.data.tipo_execucao;
                    
                    const statusVal = res.data.status;
                    let badgeHtml = '';
                    if (statusVal === 'Pendente') {
                        badgeHtml = `<span style="background-color: rgba(255, 193, 7, 0.12); color: #ffc107; border: 1px solid #ffc107; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-hourglass-split"></i> Pendente</span>`;
                    } else if (statusVal === 'Em Execução') {
                        badgeHtml = `<span style="background-color: rgba(0, 123, 255, 0.12); color: #007bff; border: 1px solid #007bff; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-gear-fill"></i> Em Execução</span>`;
                    } else if (statusVal === 'Aguardando Validação') {
                        badgeHtml = `<span style="background-color: rgba(23, 162, 184, 0.12); color: #17a2b8; border: 1px solid #17a2b8; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-clock-fill"></i> Aguardando Validação</span>`;
                    } else if (statusVal === 'Concluída') {
                        badgeHtml = `<span style="background-color: rgba(40, 167, 69, 0.12); color: #28a745; border: 1px solid #28a745; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-check2-all"></i> Concluída</span>`;
                    }
                    document.getElementById('vis_status').innerHTML = badgeHtml;
                    document.getElementById('vis_descricao').innerText = res.data.descricao_problema;
                    
                    document.getElementById('modalVisualizacao').style.display = 'flex';
                } else {
                    showToast(res.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro de rede ao buscar detalhes do chamado.', 'danger');
            });
        }

        // =========================================================================
        // VALIDADDORES EM TEMPO REAL CONTRA PALAVRA 'VAZIO' E NOME DO CAMPO
        // =========================================================================
        document.addEventListener('DOMContentLoaded', () => {
            const inputsVal = [
                { id: 'abrir_descricao_problema', erroId: 'abrir_erro' },
                { id: 'finalizacao_relato', erroId: 'finalizacao_erro' },
                { id: 'validacao_observacoes', erroId: 'validacao_erro' }
            ];

            inputsVal.forEach(item => {
                const el = document.getElementById(item.id);
                const erroSpan = document.getElementById(item.erroId);

                if (el && erroSpan) {
                    el.addEventListener('input', () => {
                        const val = el.value.trim().toUpperCase();
                        if (val === 'VAZIO') {
                            erroSpan.innerText = "✖ Erro: O texto do campo não pode ser 'VAZIO'.";
                            erroSpan.style.display = 'block';
                            el.style.borderColor = '#fc2323';
                        } else {
                            erroSpan.style.display = 'none';
                            el.style.borderColor = '';
                        }
                    });
                }
            });

            // Filtro visual rápido na tabela utilizando o input de pesquisa principal
            const inputPesquisa = document.getElementById('pesquisa');
            if (inputPesquisa) {
                inputPesquisa.addEventListener('input', function() {
                    const termo = this.value.toLowerCase().trim();
                    const linhas = document.querySelectorAll('.linha-tabela-os');
                    let visiveis = 0;

                    linhas.forEach(linha => {
                        const texto = linha.textContent.toLowerCase();
                        if (termo === '' || texto.includes(termo)) {
                            linha.style.display = '';
                            visiveis++;
                        } else {
                            linha.style.display = 'none';
                        }
                    });

                    // Se a tabela ficou vazia após o filtro
                    const tbody = document.getElementById('tabela-os-body');
                    const linhaVazia = document.getElementById('linha-vazia');
                    if (visiveis === 0) {
                        if (!linhaVazia) {
                            const tr = document.createElement('tr');
                            tr.id = 'linha-vazia';
                            tr.innerHTML = `<td colspan="10" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhum chamado corresponde aos filtros.</td>`;
                            tbody.appendChild(tr);
                        }
                    } else {
                        if (linhaVazia) {
                            linhaVazia.remove();
                        }
                    }
                });
            }
        });
    </script>

    <!-- Scripts de utilidades globais e relógio em tempo real -->
    <script src="../assets/js/scripts.js" defer></script>
</body>
</html>
