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
            
            <button class="btn-page-action" onclick="abrirModalAbertura()" style="background: var(--corBase); color: #fff; border: none; border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; font-weight: bold;">
                <i class="bi bi-plus-lg"></i> Abrir Nova O.S.
            </button>
        </div>

        <!-- TABELA DE ORDENS DE SERVIÇO -->
        <div class="tabela-bg2" style="margin-top: 20px;">
            <div class="tabela-titulo" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <i class="bi bi-wrench" style="font-size: 1.5rem; color: var(--corBase);"></i>
                <h2>Ordens de Serviço Corretivas</h2>
            </div>
            
            <div class="tabela-wrapper" style="overflow-x: auto; background: var(--corFundo); border-radius: 12px; border: 1px solid var(--corBorda);">
                <table class="tabela-main" style="width: 100%; border-collapse: collapse;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: #B91C1C; color: #fff;">
                        <tr>
                            <th style="padding: 15px; width: 8%; white-space: nowrap;">ID</th>
                            <th style="padding: 15px; width: 15%; white-space: nowrap;">Solicitante</th>
                            <th style="padding: 15px; width: 15%; white-space: nowrap;">Ambiente</th>
                            <th style="padding: 15px; white-space: nowrap;">Descrição do Problema</th>
                            <th style="padding: 15px; width: 10%; white-space: nowrap;">Tipo</th>
                            <th style="padding: 15px; width: 15%; white-space: nowrap;">Executor Atual</th>
                            <th style="padding: 15px; width: 12%; white-space: nowrap;">Abertura</th>
                            <th style="padding: 15px; text-align: center; width: 10%; white-space: nowrap;">Status</th>
                            <th style="padding: 15px; text-align: center; width: 10%; white-space: nowrap;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-os-body">
                        <?php if (empty($ordensServico)): ?>
                            <tr id="linha-vazia">
                                <td colspan="9" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhuma ordem de serviço registrada.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($ordensServico as $os): ?>
                                <?php $status = $os->getStatus(); ?>
                                <tr id="row-<?php echo $os->getId(); ?>" data-status="<?php echo htmlspecialchars($status); ?>" style="border-bottom: 1px solid var(--corBorda); transition: 0.2s; cursor: pointer;" class="linha-tabela-os" onclick="visualizarOS(<?php echo $os->getId(); ?>)">
                                    <td style="padding: 15px; font-weight: bold; color: var(--corTxt2); white-space: nowrap;">#<?php echo $os->getId(); ?></td>
                                    
                                    <td style="padding: 15px; font-weight: bold; color: #B91C1C; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;" title="<?php echo htmlspecialchars($os->getSolicitanteNome() ?? 'N/D'); ?>"><?php echo htmlspecialchars($os->getSolicitanteNome() ?? 'N/D'); ?></td>
                                    
                                    <td style="padding: 15px; font-weight: bold; color: var(--corDestaque); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;" title="<?php echo htmlspecialchars($os->getAmbienteNome() ?? 'N/D'); ?>"><?php echo htmlspecialchars($os->getAmbienteNome() ?? 'N/D'); ?></td>
                                    
                                    <td style="padding: 15px; font-size: 14px; color: var(--corTxt3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;" title="<?php echo htmlspecialchars($os->getDescricaoProblema()); ?>"><?php echo htmlspecialchars($os->getDescricaoProblema()); ?></td>
                                    
                                    <td style="padding: 15px; font-weight: 500; color: var(--corTxt2); white-space: nowrap;"><span class="badge-tipo"><?php echo htmlspecialchars($os->getTipoExecucao()); ?></span></td>
                                    
                                    <td style="padding: 15px; font-weight: 500; color: var(--corTxt2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;" title="<?php echo htmlspecialchars($os->getExecutorNome() ?? 'Não Atribuído'); ?>">
                                        <?php if ($os->getExecutorNome()): ?>
                                            <?php echo htmlspecialchars($os->getExecutorNome()); ?>
                                        <?php else: ?>
                                            <span style="color: #999; font-style: italic;">Não Atribuído</span>
                                        <?php endif; ?>
                                    </td>
                                    
                                    <td style="padding: 15px; font-size: 14px; color: var(--corTxt2); white-space: nowrap;">
                                        <?php echo date('d/m/Y H:i', strtotime($os->getDataAbertura() ?? '')); ?>
                                    </td>
                                    
                                    <td style="padding: 15px; text-align: center; white-space: nowrap;">
                                        <?php if ($status === 'Pendente'): ?>
                                            <span style="background-color: rgba(255, 193, 7, 0.12); color: #ffc107; border: 1px solid #ffc107; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">Pendente</span>
                                        <?php elseif ($status === 'Aguardando Aceite'): ?>
                                            <span style="background-color: rgba(0, 197, 255, 0.12); color: #00c5ff; border: 1px solid #00c5ff; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">Aguardando Aceite</span>
                                        <?php elseif ($status === 'Em Execução'): ?>
                                            <span style="background-color: rgba(0, 123, 255, 0.12); color: #007bff; border: 1px solid #007bff; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">Em Execução</span>
                                        <?php elseif ($status === 'Aguardando Validação'): ?>
                                            <span style="background-color: rgba(23, 162, 184, 0.12); color: #17a2b8; border: 1px solid #17a2b8; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">Aguardando Validação</span>
                                        <?php elseif ($status === 'Concluída'): ?>
                                            <span style="background-color: rgba(40, 167, 69, 0.12); color: #28a745; border: 1px solid #28a745; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">Concluída</span>
                                        <?php endif; ?>
                                    </td>
                                    
                                    <td style="padding: 15px; text-align: center; white-space: nowrap;" onclick="event.stopPropagation()">
                                        <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                                            <button class="btn-visualizar" type="button" title="Visualizar/Tramitar" onclick="visualizarOS(<?php echo $os->getId(); ?>)" style="background-color: #00C5FF; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-eye-fill"></i></button>
                                            <button class="btn-aprovar" type="button" title="Aprovar/Finalizar" onclick="visualizarOS(<?php echo $os->getId(); ?>)" style="background-color: #00E676; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-check-lg"></i></button>
                                            <button class="btn-excluir" type="button" title="Excluir/Cancelar" onclick="alert('Funcionalidade de cancelamento a ser implementada.');" style="background-color: #FF1744; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-trash-fill"></i></button>
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
                                    <option value="<?php echo $amb->getId(); ?>">
                                        #<?php echo $amb->getId(); ?> - <?php echo htmlspecialchars($amb->getNomeBlocoSala()); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="modal-input" style="margin-bottom: 15px;">
                        <label for="abrir_prioridade" style="font-weight: bold; display: block; margin-bottom: 8px;">Nível de Prioridade:</label>
                        <div class="input-wrapper">
                            <select name="prioridade" id="abrir_prioridade" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3);">
                                <option value="" disabled selected>Defina a urgência deste chamado...</option>
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Urgente">Urgente</option>
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
                        <!-- Campo de Pesquisa Rápida para o Executor -->
                        <div class="input-wrapper" style="margin-bottom: 10px;">
                            <input type="text" id="pesquisar_executor" placeholder="🔍 Pesquisar executor pelo nome..." style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo); color: var(--corTxt3); font-size: 14px;">
                        </div>
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
                <button onclick="fecharModalVisualizacao()"><i class="bi bi-x-lg"></i></button>
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
                
                <!-- Corpo do Modal: Interface do Formulário de Atribuição e Status -->
                <div id="vis_action_container"></div>
            </div>

            <!-- Rodapé do Modal: Reservado estritamente para os botões de ação -->
            <div id="vis_modal_footer" class="modal-footer" style="border-top: 1px solid var(--corBorda); padding-top: 15px; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
                <button type="button" onclick="fecharModalVisualizacao()" class="btn-confirmar-full" style="background: #6c757d; color: #fff; border: none; padding: 10px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                    Fechar Detalhes
                </button>
            </div>
        </div>
    </div>

    <!-- JAVASCRIPT GERAL DA TELA DE OS CORRETIVAS -->
    <script>
        // Variáveis de Sessão globais blindadas contra SyntaxError
        const usuarioLogadoId = parseInt('<?php echo $_SESSION['usuario_id'] ?? 0; ?>') || 0;
        const nivelUsuarioAtual = '<?php echo $_SESSION['usuario_nivel'] ?? ''; ?>';
        const rawExecutores = '<?php 
            if (empty($executores)) {
                $executores = Usuario::listarPorNivel('Executor');
            }
            echo json_encode(array_map(function($e) {
                return ['id' => $e->getId(), 'nome' => $e->getNome()];
            }, $executores), JSON_HEX_APOS);
        ?>';
        const executoresDisponiveis = rawExecutores.trim() !== '' ? JSON.parse(rawExecutores) : [];

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
            } else if (status === 'Aguardando Aceite') {
                return `<span style="background-color: rgba(0, 197, 255, 0.12); color: #00C5FF; border: 1px solid #00C5FF; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;"><i class="bi bi-hourglass"></i> Aguardando Aceite</span>`;
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
            return `
                <button class="btn-visualizar" type="button" title="Visualizar/Tramitar" onclick="visualizarOS(${id})" style="background-color: #00C5FF; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-eye-fill"></i></button>
                <button class="btn-aprovar" type="button" title="Aprovar/Finalizar" onclick="visualizarOS(${id})" style="background-color: #00E676; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-check-lg"></i></button>
                <button class="btn-excluir" type="button" title="Excluir/Cancelar" onclick="alert('Funcionalidade de cancelamento a ser implementada.');" style="background-color: #FF1744; border: none; color: white; padding: 5px; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: flex; justify-content: center; align-items: center;"><i class="bi bi-trash-fill"></i></button>
            `;
        }

        // Re-renderiza de forma inteligente e reativa as linhas da tabela
        function renderRowHtml(data) {
            const execNome = data.executor_nome ? data.executor_nome : '<span style="color: #999; font-style: italic;">Não Atribuído</span>';

            return `
                <td style="padding: 15px; font-weight: bold; color: var(--corTxt2); white-space: nowrap;">#${data.id}</td>
                <td style="padding: 15px; font-weight: bold; color: #B91C1C; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;" title="${data.solicitante_nome || 'N/D'}">${data.solicitante_nome || 'N/D'}</td>
                <td style="padding: 15px; font-weight: bold; color: var(--corDestaque); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;" title="${data.ambiente_nome || 'N/D'}">${data.ambiente_nome || 'N/D'}</td>
                <td style="padding: 15px; font-size: 14px; color: var(--corTxt3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;" title="${data.descricao_problema}">${data.descricao_problema}</td>
                <td style="padding: 15px; font-weight: 500; color: var(--corTxt2); white-space: nowrap;"><span class="badge-tipo">${data.tipo_execucao}</span></td>
                <td style="padding: 15px; font-weight: 500; color: var(--corTxt2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;" title="${data.executor_nome || 'Não Atribuído'}">${execNome}</td>
                <td style="padding: 15px; font-size: 13px; color: var(--corTxt2); white-space: nowrap;">${data.data_abertura}</td>
                <td style="padding: 15px; text-align: center; white-space: nowrap;">${renderStatusBadge(data.status)}</td>
                <td style="padding: 15px; text-align: center; white-space: nowrap;" onclick="event.stopPropagation()">
                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
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
            const formData = new URLSearchParams(new FormData(form));
            formData.append('ajax', '1');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                console.log("Payload recebido do servidor (Abertura):", data);
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
                    novaLinha.style.cursor = 'pointer';
                    if (nivel === 'Gestor') {
                        novaLinha.onclick = () => abrirModalDespacho(data.data.id);
                    } else {
                        novaLinha.onclick = () => visualizarOS(data.data.id);
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

            // Reseta a pesquisa de executores
            const inputPesquisaExecutor = document.getElementById('pesquisar_executor');
            if (inputPesquisaExecutor) {
                inputPesquisaExecutor.value = '';
                inputPesquisaExecutor.dispatchEvent(new Event('input'));
            }

            // Carrega dinamicamente os detalhes do banco via AJAX (buscar)
            fetch(`${window.location.pathname}?acao=buscar&id=${id}&ajax=1`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.json())
            .then(res => {
                console.log("Payload recebido do servidor (Busca Despacho):", res);
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
            const formData = new URLSearchParams(new FormData(form));
            formData.append('ajax', '1');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                console.log("Payload recebido do servidor (Despacho):", data);
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
            const formData = new URLSearchParams(new FormData(form));
            formData.append('ajax', '1');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest' 
                },
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
            const formData = new URLSearchParams(new FormData(form));
            formData.append('ajax', '1');

            fetch(window.location.href, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest' 
                },
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

        // Abre o modal de apenas leitura para visualizar detalhes e tramitar (Unificado)
        function visualizarOS(id) {
            fetch(`${window.location.pathname}?acao=buscar&id=${id}&ajax=1`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    const os = res.data;
                    
                    // 1. Dualidade de Ambiente (Aliasing Dinâmico)
                    os.executor_atual_id = os.executor_id || os.executor_atual_id;
                    
                    // 2. Preenchimento de campos fixos
                    document.getElementById('vis_id_display').innerText = os.id;
                    document.getElementById('vis_ambiente').innerText = os.ambiente_nome;
                    document.getElementById('vis_solicitante').innerText = os.solicitante_nome;
                    document.getElementById('vis_abertura').innerText = os.data_abertura;
                    document.getElementById('vis_fechamento').innerText = os.data_fechamento ? os.data_fechamento : 'Em andamento';
                    document.getElementById('vis_executor').innerText = os.executor_nome ? os.executor_nome : 'Não designado';
                    document.getElementById('vis_tipo').innerText = os.tipo_execucao;
                    document.getElementById('vis_status').innerHTML = renderStatusBadge(os.status);
                    document.getElementById('vis_descricao').innerText = os.descricao_problema;

                    // 3. Normalização de dados para controle da Máquina de Estados
                    const statusOS = (os.status || '').trim().toUpperCase();
                    const nivelUserOS = (nivelUsuarioAtual || '').trim().toUpperCase();
                    const executorIdOS = parseInt(os.executor_atual_id) || 0;
                    const solicitanteIdOS = parseInt(os.solicitante_id) || 0;
                    const currentUserId = parseInt(usuarioLogadoId) || 0;

                    const visActionContainer = document.getElementById('vis_action_container');
                    const visModalFooter = document.getElementById('vis_modal_footer');

                    // Reset de elementos dinâmicos
                    visActionContainer.innerHTML = '';
                    visModalFooter.innerHTML = '';

                    let actionHTML = '';
                    let botoesHTML = '';

                    // 4. Fluxo Triplo de Aprovação (Máquina de Estados)
                    
                    // GESTOR/ADMIN - PENDENTE -> Despacho
                    if (statusOS === 'PENDENTE' && (nivelUserOS === 'GESTOR' || nivelUserOS === 'ADMIN')) {
                        actionHTML = `
                            <div style="background: rgba(245, 158, 11, 0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2); margin-top: 15px;">
                                <strong style="color: #f59e0b; display: block; margin-bottom: 10px;"><i class="bi bi-exclamation-triangle-fill"></i> Designar Técnico Responsável</strong>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div>
                                        <label for="vis_executor_select" style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 13px;">Técnico Executor:</label>
                                        <div style="margin-bottom: 8px;">
                                            <input type="text" id="vis_pesquisar_executor" placeholder="🔍 Pesquisar executor..." style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--corBorda); background: var(--corFundo); color: var(--corTxt3); font-size: 13px; outline: none;">
                                        </div>
                                        <select id="vis_executor_select" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--corBorda); background: var(--corFundo); color: var(--corTxt3); font-size: 13px;">
                                            <option value="" disabled selected>Escolha o profissional...</option>
                                            ${executoresDisponiveis.map(e => `<option value="${e.id}">${e.nome}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label for="vis_tipo_select" style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 13px;">Tipo de Reparo:</label>
                                        <select id="vis_tipo_select" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--corBorda); background: var(--corFundo); color: var(--corTxt3); font-size: 13px;">
                                            <option value="Interna" selected>Interna (Equipe Escolar)</option>
                                            <option value="Terceirizada">Terceirizada (Externo)</option>
                                        </select>
                                    </div>
                                </div>
                                <span id="vis_atribuir_erro" style="color: #fc2323; font-size: 12px; display: none; margin-top: 5px; font-weight: bold;"></span>
                            </div>
                        `;

                        botoesHTML = `
                            <button type="button" id="btn-atribuir-os" class="btn-confirmar-full" style="background: #f59e0b; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                <i class="bi bi-send-fill"></i> Atribuir e Aprovar
                            </button>
                        `;
                    }
                    // EXECUTOR DESIGNADO - AGUARDANDO ACEITE -> Aceite
                    else if (statusOS === 'AGUARDANDO ACEITE' && currentUserId === executorIdOS && (nivelUserOS === 'EXECUTOR' || nivelUserOS === 'GESTOR' || nivelUserOS === 'ADMIN')) {
                        actionHTML = `
                            <div style="background: rgba(59, 130, 246, 0.08); padding: 15px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2); margin-top: 15px; display: flex; align-items: center; gap: 10px;">
                                <i class="bi bi-info-circle-fill" style="color: #3b82f6; font-size: 1.5rem;"></i>
                                <span style="color: var(--corTxt3); font-size: 13.5px;">Você foi designado para este serviço. Por favor, aceite a O.S. para iniciar os trabalhos.</span>
                            </div>
                        `;

                        botoesHTML = `
                            <button type="button" id="btn-aceitar-os" class="btn-confirmar-full" style="background: #3b82f6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                <i class="bi bi-check-lg"></i> Aceitar O.S.
                            </button>
                        `;
                    }
                    // EXECUTOR DESIGNADO - EM EXECUÇÃO -> Finalizar
                    else if (statusOS === 'EM EXECUÇÃO' && currentUserId === executorIdOS && (nivelUserOS === 'EXECUTOR' || nivelUserOS === 'GESTOR' || nivelUserOS === 'ADMIN')) {
                        actionHTML = `
                            <div style="background: rgba(16, 185, 129, 0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); margin-top: 15px;">
                                <label for="vis_relato_textarea" style="font-weight: bold; display: block; margin-bottom: 8px; color: #10b981; font-size: 13.5px;"><i class="bi bi-pencil-square"></i> Relato Técnico de Conclusão (Solução):</label>
                                <textarea id="vis_relato_textarea" placeholder="Descreva os materiais usados, os reparos feitos e o estado final..." style="width: 100%; height: 100px; padding: 10px; border-radius: 6px; border: 1px solid var(--corBorda); background: var(--corFundo); color: var(--corTxt3); resize: none; font-size: 13px; outline: none;"></textarea>
                                <span id="vis_relato_erro" style="color: #fc2323; font-size: 12px; display: none; margin-top: 5px; font-weight: bold;"></span>
                            </div>
                        `;

                        botoesHTML = `
                            <button type="button" id="btn-finalizar-os" class="btn-confirmar-full" style="background: #10b981; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                <i class="bi bi-wrench"></i> Finalizar Reparo
                            </button>
                        `;
                    }
                    // SOLICITANTE OU GESTOR - AGUARDANDO VALIDAÇÃO -> Validar/Recusar
                    else if (statusOS === 'AGUARDANDO VALIDAÇÃO' && (currentUserId === solicitanteIdOS || nivelUserOS === 'GESTOR' || nivelUserOS === 'ADMIN')) {
                        actionHTML = `
                            <div style="background: rgba(16, 185, 129, 0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); margin-top: 15px;">
                                <label for="vis_validacao_textarea" style="font-weight: bold; display: block; margin-bottom: 8px; color: var(--corTxt3); font-size: 13.5px;"><i class="bi bi-chat-left-text-fill"></i> Observações da Validação / Motivo da Recusa:</label>
                                <textarea id="vis_validacao_textarea" placeholder="Caso aprove, registre um elogio ou observação. Caso recuse, relate detalhadamente o que faltou ser feito..." style="width: 100%; height: 100px; padding: 10px; border-radius: 6px; border: 1px solid var(--corBorda); background: var(--corFundo); color: var(--corTxt3); resize: none; font-size: 13px; outline: none;"></textarea>
                                <span id="vis_validacao_erro" style="color: #fc2323; font-size: 12px; display: none; margin-top: 5px; font-weight: bold;"></span>
                            </div>
                        `;

                        botoesHTML = `
                            <button type="button" id="btn-aprovar-os" class="btn-confirmar-full" style="background: #10b981; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                <i class="bi bi-check-circle-fill"></i> Aprovar Serviço
                            </button>
                            <button type="button" id="btn-recusar-os" class="btn-confirmar-full" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                <i class="bi bi-x-circle-fill"></i> Recusar Serviço
                            </button>
                        `;
                    }

                    // Renderização no Corpo do Modal
                    visActionContainer.innerHTML = actionHTML;

                    // Injeção do botão de Fechar Padrão
                    botoesHTML += `
                        <button type="button" onclick="fecharModalVisualizacao()" class="btn-confirmar-full" style="background: #6b7280; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 14px;">
                            Fechar Detalhes
                        </button>
                    `;
                    visModalFooter.innerHTML = botoesHTML;

                    // 5. Instanciação e Event Listeners dinâmicos pós-injeção
                    
                    // Pesquisa dinâmica para o executor do modal de visualização (Gestor)
                    const selectVisExecutor = document.getElementById('vis_executor_select');
                    const inputVisPesquisaExecutor = document.getElementById('vis_pesquisar_executor');
                    if (selectVisExecutor && inputVisPesquisaExecutor) {
                        const visOptionsOriginais = Array.from(selectVisExecutor.options)
                            .slice(1)
                            .map(opt => ({
                                value: opt.value,
                                text: opt.text
                            }));
                        
                        inputVisPesquisaExecutor.addEventListener('input', function() {
                            const termo = this.value.toLowerCase().trim();
                            selectVisExecutor.innerHTML = '<option value="" disabled selected>Escolha o profissional...</option>';
                            const filtrados = visOptionsOriginais.filter(opt => opt.text.toLowerCase().includes(termo));
                            
                            if (filtrados.length > 0) {
                                filtrados.forEach(opt => {
                                    const newOpt = document.createElement('option');
                                    newOpt.value = opt.value;
                                    newOpt.textContent = opt.text;
                                    selectVisExecutor.appendChild(newOpt);
                                });
                            } else {
                                const newOpt = document.createElement('option');
                                newOpt.value = "";
                                newOpt.disabled = true;
                                newOpt.textContent = "Nenhum executor correspondente";
                                selectVisExecutor.appendChild(newOpt);
                            }
                        });
                    }

                    // Ação de Despachar (Gestor)
                    const btnAtribuir = document.getElementById('btn-atribuir-os');
                    if (btnAtribuir) {
                        btnAtribuir.onclick = () => {
                            const exeVal = document.getElementById('vis_executor_select').value;
                            const tipoVal = document.getElementById('vis_tipo_select').value;
                            const erroSpan = document.getElementById('vis_atribuir_erro');
                            
                            if (!exeVal) {
                                erroSpan.innerText = "✖ Erro: Selecione um técnico executor.";
                                erroSpan.style.display = 'block';
                                return;
                            }
                            erroSpan.style.display = 'none';
                            alterarStatusOS(os.id, 'despachar', { executor_id: exeVal, tipo_execucao: tipoVal });
                        };
                    }

                    // Ação de Aceitar (Executor)
                    const btnAceitar = document.getElementById('btn-aceitar-os');
                    if (btnAceitar) {
                        btnAceitar.onclick = () => {
                            alterarStatusOS(os.id, 'aceitar_os');
                        };
                    }

                    // Ação de Finalizar Reparo (Executor)
                    const btnFinalizar = document.getElementById('btn-finalizar-os');
                    const relatoTextarea = document.getElementById('vis_relato_textarea');
                    const relatoErro = document.getElementById('vis_relato_erro');
                    if (relatoTextarea && relatoErro) {
                        relatoTextarea.addEventListener('input', () => {
                            const val = relatoTextarea.value.trim().toUpperCase();
                            if (val === 'VAZIO') {
                                relatoErro.innerText = "✖ Erro: O relato técnico não pode ser a palavra 'VAZIO'.";
                                relatoErro.style.display = 'block';
                                relatoTextarea.style.borderColor = '#fc2323';
                            } else {
                                relatoErro.style.display = 'none';
                                relatoTextarea.style.borderColor = '';
                            }
                        });
                    }
                    if (btnFinalizar) {
                        btnFinalizar.onclick = () => {
                            const val = relatoTextarea.value.trim();
                            if (!val) {
                                relatoErro.innerText = "✖ Erro: Relato técnico de conclusão é obrigatório.";
                                relatoErro.style.display = 'block';
                                return;
                            }
                            if (val.toUpperCase() === 'VAZIO') return;
                            
                            alterarStatusOS(os.id, 'finalizar_reparo', { relato_conclusao: val });
                        };
                    }

                    // Ação de Validar Conclusão / Recusar (Solicitante)
                    const btnAprovar = document.getElementById('btn-aprovar-os');
                    const btnRecusar = document.getElementById('btn-recusar-os');
                    const validacaoTextarea = document.getElementById('vis_validacao_textarea');
                    const validacaoErro = document.getElementById('vis_validacao_erro');
                    if (validacaoTextarea && validacaoErro) {
                        validacaoTextarea.addEventListener('input', () => {
                            const val = validacaoTextarea.value.trim().toUpperCase();
                            if (val === 'VAZIO') {
                                validacaoErro.innerText = "✖ Erro: Observações não podem ser 'VAZIO'.";
                                validacaoErro.style.display = 'block';
                                validacaoTextarea.style.borderColor = '#fc2323';
                            } else {
                                validacaoErro.style.display = 'none';
                                validacaoTextarea.style.borderColor = '';
                            }
                        });
                    }
                    if (btnAprovar) {
                        btnAprovar.onclick = () => {
                            const val = validacaoTextarea.value.trim();
                            if (val.toUpperCase() === 'VAZIO') return;
                            alterarStatusOS(os.id, 'validar_conclusao', { observacoes_validacao: val });
                        };
                    }
                    if (btnRecusar) {
                        btnRecusar.onclick = () => {
                            const val = validacaoTextarea.value.trim();
                            if (!val) {
                                validacaoErro.innerText = "✖ Erro: Ao recusar o serviço, é obrigatório indicar o motivo da recusa.";
                                validacaoErro.style.display = 'block';
                                return;
                            }
                            if (val.toUpperCase() === 'VAZIO') return;
                            alterarStatusOS(os.id, 'recusar_servico', { observacoes_validacao: val });
                        };
                    }

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

        // Helper global de fechamento seguro
        function fecharModalVisualizacao() {
            fecharModal('modalVisualizacao');
        }

        // Executa a alteração do status da O.S. via AJAX (POST)
        function alterarStatusOS(id, action, extraParams = {}) {
            const params = new URLSearchParams();
            params.append('acao', action);
            params.append('action', action);
            params.append('id', id);
            params.append('ajax', '1');

            for (const [key, value] of Object.entries(extraParams)) {
                params.append(key, value);
            }

            fetch(window.location.href, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                body: params.toString()
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    fecharModalVisualizacao();

                    // Atualização Reativa e Suave da Linha da Tabela
                    const row = document.getElementById(`row-${id}`);
                    if (row) {
                        fetch(`${window.location.pathname}?acao=buscar&id=${id}&ajax=1`, {
                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                        })
                        .then(r => r.json())
                        .then(rData => {
                            if (rData.success) {
                                row.innerHTML = renderRowHtml(rData.data);
                                row.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
                                setTimeout(() => {
                                    row.style.backgroundColor = '';
                                }, 1000);
                            }
                        });
                    } else {
                        setTimeout(() => window.location.reload(), 1000);
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro interno de conexão ao atualizar chamado.', 'danger');
            });
        }

        // =========================================================================
        // MODAL DE TRAMITAÇÃO (Unificado com Histórico)
        // =========================================================================
        function abrirModalTramitacao(osId) {
            document.getElementById('lbl_tram_historico').innerHTML = 'Carregando histórico...';
            document.getElementById('modalTramitacao').style.display = 'flex';

            fetch(`/public/api/os_historico.php?os_id=${osId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const os = data.os;
                        document.getElementById('tramitacao_os_id').value = os.id;
                        document.getElementById('lbl_tram_id').innerText = '#' + os.id;
                        document.getElementById('lbl_tram_ambiente').innerText = os.ambiente;
                        document.getElementById('lbl_tram_abertura').innerText = os.data_abertura;
                        document.getElementById('lbl_tram_status').innerText = os.status;
                        document.getElementById('lbl_tram_desc').innerText = os.descricao;
                        
                        // Renderiza o histórico
                        let histHtml = '';
                        if (data.historico && data.historico.length > 0) {
                            data.historico.forEach(h => {
                                histHtml += `<div style="border-bottom: 1px solid #ddd; padding: 8px 0;">
                                    <div style="font-size: 11px; color: #888;">${h.data_formatada} - ${h.origem_nome} &rarr; ${h.status_etapa}</div>
                                    <div style="font-size: 13px; color: #444; margin-top: 4px;">${h.observacao_etapa}</div>
                                </div>`;
                            });
                        } else {
                            histHtml = 'Nenhum histórico registrado.';
                        }
                        document.getElementById('lbl_tram_historico').innerHTML = histHtml;

                        document.getElementById('nova_observacao').value = '';

                        // Lógica de exibição dos botões baseada no status e nível
                        const nivel = '<?php echo $usuarioNivel; ?>';
                        const btnTramitar = document.getElementById('btnTramitarAcao');
                        const selectExecutor = document.getElementById('div_select_executor');
                        
                        btnTramitar.style.display = 'none';
                        selectExecutor.style.display = 'none';
                        document.getElementById('nova_observacao').disabled = false;

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
                        } else {
                            document.getElementById('nova_observacao').disabled = true;
                            document.getElementById('nova_observacao').placeholder = 'Apenas leitura para este status.';
                        }
                    } else {
                        alert(data.message || 'Erro ao carregar dados da OS.');
                        fecharModalTramitacao();
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('Erro de comunicação com o servidor.');
                    fecharModalTramitacao();
                });
        }

        function fecharModalTramitacao() {
            document.getElementById('modalTramitacao').style.display = 'none';
        }

        function submeterTramitacao(event) {
            event.preventDefault();
            const form = document.getElementById('form-tramitacao');
            const formData = new URLSearchParams(new FormData(form));
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
                console.log("Payload recebido do servidor (Tramitação):", data);
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

            // Pesquisa dinâmica em tempo real para atribuir executor de manutenção
            const selectExecutor = document.getElementById('despacho_executor_id');
            const inputPesquisaExecutor = document.getElementById('pesquisar_executor');
            
            if (selectExecutor && inputPesquisaExecutor) {
                // Guarda uma cópia original das opções do select (exceto a primeira que é o placeholder)
                const optionsOriginais = Array.from(selectExecutor.options)
                    .slice(1)
                    .map(opt => ({
                        value: opt.value,
                        text: opt.text
                    }));
                
                inputPesquisaExecutor.addEventListener('input', function() {
                    const termo = this.value.toLowerCase().trim();
                    
                    // Mantém a opção padrão/placeholder
                    selectExecutor.innerHTML = '<option value="" disabled selected>Escolha o profissional designado...</option>';
                    
                    const filtrados = optionsOriginais.filter(opt => opt.text.toLowerCase().includes(termo));
                    
                    if (filtrados.length > 0) {
                        filtrados.forEach(opt => {
                            const newOpt = document.createElement('option');
                            newOpt.value = opt.value;
                            newOpt.textContent = opt.text;
                            selectExecutor.appendChild(newOpt);
                        });
                    } else {
                        const newOpt = document.createElement('option');
                        newOpt.value = "";
                        newOpt.disabled = true;
                        newOpt.textContent = "Nenhum executor correspondente";
                        selectExecutor.appendChild(newOpt);
                    }
                });
            }

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

    <!-- MODAL DE TRAMITAÇÃO / HISTÓRICO -->
    <div class="modal-fundo" id="modalTramitacao" style="display: none; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
        <div class="modal-box" style="background: #fff; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--corBorda); padding-bottom: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;">Tramitação da O.S. <span id="lbl_tram_id" style="color:var(--corBase);"></span></h3>
                <button type="button" onclick="fecharModalTramitacao()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;"><i class="bi bi-x-lg"></i></button>
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
                    <div id="lbl_tram_historico" style="background:var(--corFundo); border:1px solid var(--corBorda); padding:12px; border-radius:8px; font-size:13px; color:var(--corTxt2); min-height:60px; max-height:200px; overflow-y:auto; line-height:1.5;"></div>
                </div>

                <div class="modal-input" style="margin-bottom: 15px;">
                    <label for="nova_observacao" style="display:block; margin-bottom: 8px; font-weight: 500;">Adicionar Observação (Registro no Histórico):</label>
                    <textarea name="nova_observacao" id="nova_observacao" rows="3" placeholder="Digite uma nova observação ou relatório de serviço..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-family: inherit; resize: vertical;"></textarea>
                </div>

                <div class="modal-input" id="div_select_executor" style="display: none; margin-bottom: 15px;">
                    <label for="executor_atual_id" style="display:block; margin-bottom: 8px; font-weight: 500;">Atribuir a um Executor (Gestores):</label>
                    <select name="executor_atual_id" id="executor_atual_id" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px;">
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

    <!-- Scripts de utilidades globais e relógio em tempo real -->
    <script src="../assets/js/scripts.js" defer></script>
</body>
</html>
