<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Tela de Gestão de Ambientes (PHP OOP)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Controllers/AmbienteController.php';

// Exige autenticação e privilégio de Gestor
AuthController::exigirNivelAcesso(['Gestor']);

// Roteamento de Logout local
if (isset($_GET['logout'])) {
    $auth = new AuthController();
    $auth->logout();
    header("Location: " . BASE_URL . "/public/index.php");
    exit;
}

// Processamento de Ações do Controller antes do carregamento da página
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['acao'])) {
    $controller = new AmbienteController();
    $controller->processarAcao();
}

// Busca a lista de ambientes
$ambientes = Ambiente::listarTodos();

// Filtro de pesquisa
$pesquisa = trim($_GET['search'] ?? '');
if ($pesquisa !== '') {
    $ambientes = array_filter($ambientes, function(Ambiente $a) use ($pesquisa) {
        return stripos($a->getNomeBlocoSala(), $pesquisa) !== false;
    });
}

// Consome mensagens de status de sessão
$alertaSucesso = $_SESSION['alerta_sucesso'] ?? '';
$alertaErro = $_SESSION['alerta_erro'] ?? '';
unset($_SESSION['alerta_sucesso'], $_SESSION['alerta_erro']);

// Data atual formatada para exibição no cabeçalho
$dataAtual = date('d/m/Y');
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Ambientes - SENAI MANUTENÇÃO</title>

    <!-- Estilização Base, Sidebar, Header, Modais e Bootstrap Icons -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/modal.css">
    <link rel="stylesheet" href="../assets/css/global.css">
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

            <!-- MENU AMBIENTES ATIVO -->
            <a href="./ambientes.php" class="ativo links">
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
                <h4 style="color: var(--corTxt3)">Olá, <span style="color: var(--corDestaque);"><?php echo htmlspecialchars($_SESSION['usuario_nome']); ?></span> <small style="font-size: 12px; color: var(--corTxt2);"> (Gestor)</small></h4>
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
        <div class="page-actions-bar">
            <form action="" method="GET" class="page-search-form" style="display: flex; gap: 10px; width: 100%; max-width: 600px;">
                <div class="page-search-box" style="flex-grow: 1; display: flex; align-items: center; background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 10px; padding: 0 10px;">
                    <i class="bi bi-search" style="color: var(--corTxt2); margin-right: 8px;"></i>
                    <input type="text" name="search" id="pesquisa" value="<?php echo htmlspecialchars($pesquisa); ?>" placeholder="Pesquisar Bloco ou Sala..." style="border: none; background: transparent; width: 100%; padding: 10px 0; color: var(--corTxt3); outline: none;">
                </div>
                <button type="submit" class="btn-search" style="background: var(--corBase); color: #fff; border: none; border-radius: 10px; padding: 0 20px; cursor: pointer; transition: 0.2s;">
                    Buscar
                </button>
                <?php if ($pesquisa !== ''): ?>
                    <a href="./ambientes.php" class="btn-clear" style="display: flex; align-items: center; justify-content: center; background: var(--corFundo2); border: 1px solid var(--corBorda); border-radius: 10px; padding: 0 15px; color: var(--corTxt3); text-decoration: none;">Limpar</a>
                <?php endif; ?>
            </form>
            <button class="btn-page-action" onclick="abrirModalCadastro()" style="background: var(--corBase); color: #fff; border: none; border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; font-weight: bold;">
                <i class="bi bi-plus-lg"></i> Adicionar Ambiente
            </button>
        </div>

        <!-- TABELA DE EXIBIÇÃO DE AMBIENTES -->
        <div class="tabela-bg2" style="margin-top: 20px;">
            <div class="tabela-titulo" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <i class="bi bi-building" style="font-size: 1.5rem; color: var(--corBase);"></i>
                <h2>Ambientes Cadastrados</h2>
            </div>
            <div class="tabela-wrapper" style="overflow-x: auto; background: var(--corFundo); border-radius: 12px; border: 1px solid var(--corBorda);">
                <table class="tabela-main" style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--corBorda); background: rgba(0,0,0,0.02);">
                            <th style="padding: 15px;">ID</th>
                            <th style="padding: 15px;">Nome do Bloco / Sala</th>
                            <th style="padding: 15px; text-align: center;">Status</th>
                            <th style="padding: 15px; text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-ambientes">
                        <?php if (empty($ambientes)): ?>
                            <tr id="linha-vazia">
                                <td colspan="4" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhum ambiente encontrado.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($ambientes as $amb): ?>
                                <tr id="row-<?php echo $amb->getId(); ?>" style="border-bottom: 1px solid var(--corBorda); transition: 0.2s;">
                                    <td style="padding: 15px; font-weight: bold; color: var(--corTxt2);">#<?php echo $amb->getId(); ?></td>
                                    <td style="padding: 15px; font-size: 15px; font-weight: 500; color: var(--corTxt3);" class="nome-bloco"><?php echo htmlspecialchars($amb->getNomeBlocoSala()); ?></td>
                                    <td style="padding: 15px; text-align: center;" class="status-col">
                                        <?php if ($amb->getStatus() === 'Ativo'): ?>
                                            <span style="background-color: rgba(40, 167, 69, 0.12); color: #28a745; border: 1px solid #28a745; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                                                <i class="bi bi-check2"></i> Ativo
                                            </span>
                                        <?php else: ?>
                                            <span style="background-color: rgba(108, 117, 125, 0.12); color: #6c757d; border: 1px solid #6c757d; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                                                <i class="bi bi-slash-circle"></i> Inativo
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td style="padding: 15px; text-align: center;">
                                        <div style="display: flex; gap: 8px; justify-content: center;">
                                            <!-- Editar -->
                                            <button class="btnAcao editar" type="button" title="Editar Bloco/Sala" 
                                                    onclick="abrirModalEdicao(<?php echo $amb->getId(); ?>, '<?php echo addslashes($amb->getNomeBlocoSala()); ?>', '<?php echo $amb->getStatus(); ?>')"
                                                    style="background: #007bff; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            
                                            <!-- Alternar Status (Ativar / Inativar Rápido) -->
                                            <button class="btnAcao status-toggle" type="button" 
                                                    title="<?php echo $amb->getStatus() === 'Ativo' ? 'Inativar Ambiente' : 'Ativar Ambiente'; ?>"
                                                    onclick="alternarStatus(<?php echo $amb->getId(); ?>, '<?php echo $amb->getStatus() === 'Ativo' ? 'inativar' : 'ativar'; ?>')"
                                                    style="background: <?php echo $amb->getStatus() === 'Ativo' ? '#e0a800' : '#28a745'; ?>; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center;">
                                                <i class="bi <?php echo $amb->getStatus() === 'Ativo' ? 'bi-toggle-on' : 'bi-toggle-off'; ?>" style="font-size: 1.1rem;"></i>
                                            </button>

                                            <!-- Excluir Inteligente -->
                                            <button class="btnAcao deletar" type="button" title="Excluir ou Inativar" 
                                                    onclick="abrirModalExclusao(<?php echo $amb->getId(); ?>, '<?php echo addslashes($amb->getNomeBlocoSala()); ?>')"
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

    <!-- =========================================================================
         1. MODAL DE CADASTRO DE AMBIENTE
         ========================================================================= -->
    <div class="modal-fundo" id="adicaoAmbiente" style="display: none;">
        <div class="modal-box" style="backdrop-filter: blur(20px); border: 1px solid var(--corBorda);">
            <div class="modal-header" style="border-bottom: 1px solid var(--corBorda); padding-bottom: 15px;">
                <h3>Registrar Novo Ambiente</h3>
                <button onclick="fecharModal('adicaoAmbiente')"><i class="bi bi-x-lg"></i></button>
            </div>
            
            <form action="" method="POST" class="modal-form" id="form-cadastro" style="padding-top: 15px;" onsubmit="return submeterFormCadastro(event)">
                <input type="hidden" name="acao" value="cadastrar">

                <div class="modal-input" style="margin-bottom: 15px;">
                    <label for="cad_nome" style="font-weight: bold; display: block; margin-bottom: 8px;">Nome do Bloco / Sala:</label>
                    <div class="input-wrapper">
                        <input type="text" name="nome_bloco_sala" id="cad_nome" placeholder="Ex: Bloco A - Sala 102" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none;">
                    </div>
                    <!-- Erro em tempo real JS -->
                    <span id="cad_erro" style="color: #fc2323; font-size: 12px; display: none; margin-top: 5px; font-weight: bold;"></span>
                </div>

                <div class="modal-input" style="margin-bottom: 20px;">
                    <label for="cad_status" style="font-weight: bold; display: block; margin-bottom: 8px;">Status Inicial:</label>
                    <div class="input-wrapper">
                        <select name="status" id="cad_status" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo);">
                            <option value="Ativo" selected>Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer" style="border-top: 1px solid var(--corBorda); padding-top: 15px; display: flex; justify-content: flex-end;">
                    <button type="submit" class="btn-confirmar-full confirmar" style="background: var(--corBase); color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;">
                        Cadastrar Ambiente <i class="bi bi-plus-lg"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- =========================================================================
         2. MODAL DE EDIÇÃO DE AMBIENTE
         ========================================================================= -->
    <div class="modal-fundo" id="edicaoAmbiente" style="display: none;">
        <div class="modal-box" style="backdrop-filter: blur(20px); border: 1px solid var(--corBorda);">
            <div class="modal-header" style="border-bottom: 1px solid var(--corBorda); padding-bottom: 15px;">
                <h3>Editar Ambiente</h3>
                <button onclick="fecharModal('edicaoAmbiente')"><i class="bi bi-x-lg"></i></button>
            </div>
            
            <form action="" method="POST" class="modal-form" id="form-edicao" style="padding-top: 15px;" onsubmit="return submeterFormEdicao(event)">
                <input type="hidden" name="acao" value="editar">
                <input type="hidden" name="id" id="edit_id">

                <div class="modal-input" style="margin-bottom: 15px;">
                    <label for="edit_nome" style="font-weight: bold; display: block; margin-bottom: 8px;">Nome do Bloco / Sala:</label>
                    <div class="input-wrapper">
                        <input type="text" name="nome_bloco_sala" id="edit_nome" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none;">
                    </div>
                    <!-- Erro em tempo real JS -->
                    <span id="edit_erro" style="color: #fc2323; font-size: 12px; display: none; margin-top: 5px; font-weight: bold;"></span>
                </div>

                <div class="modal-input" style="margin-bottom: 20px;">
                    <label for="edit_status" style="font-weight: bold; display: block; margin-bottom: 8px;">Status:</label>
                    <div class="input-wrapper">
                        <select name="status" id="edit_status" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--corBorda); outline: none; background: var(--corFundo);">
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer" style="border-top: 1px solid var(--corBorda); padding-top: 15px; display: flex; justify-content: flex-end;">
                    <button type="submit" class="btn-confirmar-full confirmar" style="background: var(--corBase); color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;">
                        Salvar Alterações <i class="bi bi-check-lg"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- =========================================================================
         3. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO INTELIGENTE (SOFT/HARD DELETE)
         ========================================================================= -->
    <div class="modal-fundo" id="confirmarExclusao" style="display: none;">
        <div class="modal-box" style="width: 500px; padding: 25px; border: 1px solid var(--corBorda); backdrop-filter: blur(20px);">
            <div class="modal-header" style="margin-bottom: 15px;">
                <h3 style="color: var(--corBase);"><i class="bi bi-exclamation-triangle-fill"></i> Atenção - Opções de Exclusão</h3>
                <button onclick="fecharModal('confirmarExclusao')"><i class="bi bi-x-lg"></i></button>
            </div>
            
            <div style="margin-bottom: 20px; color: var(--corTxt3); font-size: 14px; line-height: 1.5;">
                <p>Você selecionou o ambiente <strong id="del_nome_display" style="color: var(--corDestaque);"></strong>.</p>
                <p style="margin-top: 10px;">Como deseja proceder para evitar erros de chaves estrangeiras e manter seu histórico predial?</p>
                
                <div style="margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.02); border-radius: 8px; border-left: 4px solid #e0a800;">
                    <strong>Opção 1: Inativar (Seguro - Recomendado)</strong>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: var(--corTxt2);">O ambiente deixa de aceitar novos checklists ou Ordens de Serviço, mas permanece nos relatórios, logs e painéis estatísticos de anos passados.</p>
                </div>

                <div style="margin-top: 10px; padding: 12px; background: rgba(252,35,35,0.03); border-radius: 8px; border-left: 4px solid var(--corBase);">
                    <strong>Opção 2: Excluir Permanentemente (Cascade)</strong>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: var(--corTxt2);">Remove fisicamente o ambiente e apaga instantaneamente toda e qualquer Ordem de Serviço ou Checklist associados a ele no banco de dados.</p>
                </div>
            </div>

            <!-- Formulários individuais acionados via botões distintos -->
            <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                
                <!-- Formulário para Inativação Rápida -->
                <form action="" method="POST" id="form-inativar-modal" onsubmit="submeterExclusaoInteligente(event, 'inativar')">
                    <input type="hidden" name="acao" value="inativar">
                    <input type="hidden" name="id" id="del_id_inativar">
                    <button type="submit" class="btn-confirmar-full" style="width: 100%; background: #e0a800; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                        <i class="bi bi-toggle-on"></i> Apenas Inativar (Preservar Histórico)
                    </button>
                </form>

                <!-- Formulário para Exclusão Física Cascade -->
                <form action="" method="POST" id="form-excluir-modal" onsubmit="submeterExclusaoInteligente(event, 'excluir')">
                    <input type="hidden" name="acao" value="excluir">
                    <input type="hidden" name="id" id="del_id_excluir">
                    <button type="submit" class="btn-confirmar-full" style="width: 100%; background: var(--corBase); color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                        <i class="bi bi-trash-fill"></i> Excluir Definitivamente (Apagar Tudo)
                    </button>
                </form>

                <!-- Cancelar -->
                <button type="button" onclick="fecharModal('confirmarExclusao')" class="btn-confirmar-full" style="width: 100%; background: #6c757d; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                    Cancelar Ação
                </button>
            </div>
        </div>
    </div>

    <!-- JAVASCRIPT LOCAL PARA MODAIS, TOASTS GLASSMORPHIC E FETCH API (SEM REFRESH) -->
    <script>
        // Sistema Premium de Toast
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

            // Animação de Entrada
            setTimeout(() => {
                toast.style.transform = 'translateY(0)';
                toast.style.opacity = '1';
            }, 50);

            // Remoção Automática
            setTimeout(() => {
                toast.style.transform = 'translateY(-20px)';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        // Renderiza o HTML de uma linha da tabela de forma reativa
        function renderRowHtml(id, nome, status) {
            const isAtivo = status === 'Ativo';
            const statusBadge = isAtivo ? 
                `<span style="background-color: rgba(40, 167, 69, 0.12); color: #28a745; border: 1px solid #28a745; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                    <i class="bi bi-check2"></i> Ativo
                </span>` :
                `<span style="background-color: rgba(108, 117, 125, 0.12); color: #6c757d; border: 1px solid #6c757d; padding: 4px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                    <i class="bi bi-slash-circle"></i> Inativo
                </span>`;

            const toggleButton = isAtivo ?
                `<button class="btnAcao status-toggle" type="button" title="Inativar Ambiente"
                        onclick="alternarStatus(${id}, 'inativar')"
                        style="background: #e0a800; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center;">
                    <i class="bi bi-toggle-on" style="font-size: 1.1rem;"></i>
                </button>` :
                `<button class="btnAcao status-toggle" type="button" title="Ativar Ambiente"
                        onclick="alternarStatus(${id}, 'ativar')"
                        style="background: #28a745; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center;">
                    <i class="bi bi-toggle-off" style="font-size: 1.1rem;"></i>
                </button>`;

            const escapedNome = nome.replace(/'/g, "\\'").replace(/"/g, '&quot;');

            return `
                <td style="padding: 15px; font-weight: bold; color: var(--corTxt2);">#${id}</td>
                <td style="padding: 15px; font-size: 15px; font-weight: 500; color: var(--corTxt3);" class="nome-bloco">${nome}</td>
                <td style="padding: 15px; text-align: center;" class="status-col">${statusBadge}</td>
                <td style="padding: 15px; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="btnAcao editar" type="button" title="Editar Bloco/Sala" 
                                onclick="abrirModalEdicao(${id}, '${escapedNome}', '${status}')"
                                style="background: #007bff; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        
                        ${toggleButton}

                        <button class="btnAcao deletar" type="button" title="Excluir ou Inativar" 
                                onclick="abrirModalExclusao(${id}, '${escapedNome}')"
                                style="background: var(--corBase); color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        }

        // Abre o modal de cadastro
        function abrirModalCadastro() {
            document.getElementById('cad_nome').value = '';
            document.getElementById('cad_erro').style.display = 'none';
            document.getElementById('adicaoAmbiente').style.display = 'flex';
        }

        // Abre o modal de edição carregando os dados corretos da linha
        function abrirModalEdicao(id, nome, status) {
            document.getElementById('edit_id').value = id;
            document.getElementById('edit_nome').value = nome;
            document.getElementById('edit_status').value = status;
            document.getElementById('edit_erro').style.display = 'none';
            document.getElementById('edicaoAmbiente').style.display = 'flex';
        }

        // Abre o modal inteligente de exclusão/inativação
        function abrirModalExclusao(id, nome) {
            document.getElementById('del_nome_display').innerText = nome;
            document.getElementById('del_id_inativar').value = id;
            document.getElementById('del_id_excluir').value = id;
            document.getElementById('confirmarExclusao').style.display = 'flex';
        }

        // Fecha qualquer modal pelo ID
        function fecharModal(id) {
            document.getElementById(id).style.display = 'none';
        }

        // Função de validação cliente para bloquear o termo "VAZIO"
        function validarNomeAmbiente(inputId) {
            const inputElement = document.getElementById(inputId);
            const erroSpan = document.getElementById(inputId === 'cad_nome' ? 'cad_erro' : 'edit_erro');
            const valor = inputElement.value.trim();

            if (valor.toUpperCase() === 'VAZIO') {
                erroSpan.innerText = "✖ Erro: O nome do bloco/sala não pode ser 'VAZIO'.";
                erroSpan.style.display = 'block';
                inputElement.focus();
                inputElement.style.borderColor = '#fc2323';
                return false;
            }

            if (valor === '') {
                erroSpan.innerText = "✖ Erro: O nome não pode estar em branco.";
                erroSpan.style.display = 'block';
                inputElement.focus();
                inputElement.style.borderColor = '#fc2323';
                return false;
            }

            erroSpan.style.display = 'none';
            inputElement.style.borderColor = '';
            return true;
        }

        // AJAX: Submeter Cadastro de Ambiente
        function submeterFormCadastro(event) {
            event.preventDefault();
            if (!validarNomeAmbiente('cad_nome')) return false;

            const form = document.getElementById('form-cadastro');
            const formData = new FormData(form);
            formData.append('ajax', '1'); // Força detecção AJAX

            fetch(form.action || window.location.href, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    fecharModal('adicaoAmbiente');
                    
                    // Adiciona a nova linha de forma dinâmica
                    const tbody = document.getElementById('tabela-ambientes');
                    const linhaVazia = document.getElementById('linha-vazia');
                    if (linhaVazia) {
                        linhaVazia.remove();
                    }

                    const novaLinha = document.createElement('tr');
                    novaLinha.id = `row-${data.data.id}`;
                    novaLinha.style.cssText = 'border-bottom: 1px solid var(--corBorda); transition: 0.2s;';
                    novaLinha.innerHTML = renderRowHtml(data.data.id, data.data.nome_bloco_sala, data.data.status);
                    
                    // Efeito visual suave de destaque
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
                showToast('Erro interno de rede ao cadastrar.', 'danger');
            });
        }

        // AJAX: Submeter Edição de Ambiente
        function submeterFormEdicao(event) {
            event.preventDefault();
            if (!validarNomeAmbiente('edit_nome')) return false;

            const form = document.getElementById('form-edicao');
            const formData = new FormData(form);
            formData.append('ajax', '1');

            fetch(form.action || window.location.href, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    fecharModal('edicaoAmbiente');

                    // Atualiza a linha existente de forma dinâmica
                    const row = document.getElementById(`row-${data.data.id}`);
                    if (row) {
                        row.innerHTML = renderRowHtml(data.data.id, data.data.nome_bloco_sala, data.data.status);
                        row.style.backgroundColor = 'rgba(0, 123, 255, 0.08)';
                        setTimeout(() => {
                            row.style.backgroundColor = '';
                        }, 1000);
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro de comunicação ao editar.', 'danger');
            });
        }

        // AJAX: Alternar Status via Botão na Tabela
        function alternarStatus(id, acao) {
            const formData = new FormData();
            formData.append('acao', acao);
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

                    // Atualiza a linha modificada reativamente
                    const row = document.getElementById(`row-${data.data.id}`);
                    if (row) {
                        row.innerHTML = renderRowHtml(data.data.id, data.data.nome_bloco_sala, data.data.status);
                        row.style.backgroundColor = 'rgba(224, 168, 0, 0.08)';
                        setTimeout(() => {
                            row.style.backgroundColor = '';
                        }, 1000);
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao alternar status do ambiente.', 'danger');
            });
        }

        // AJAX: Inativar ou Excluir via Modais
        function submeterExclusaoInteligente(event, acao) {
            event.preventDefault();
            const form = event.currentTarget;
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
                    fecharModal('confirmarExclusao');

                    const id = data.data.id;
                    const row = document.getElementById(`row-${id}`);
                    
                    if (row) {
                        if (acao === 'excluir') {
                            // Deleta a linha da tabela com animação suave de fade out
                            row.style.opacity = '0';
                            row.style.transform = 'scale(0.95)';
                            setTimeout(() => {
                                row.remove();
                                
                                // Verifica se a tabela ficou vazia
                                const tbody = document.getElementById('tabela-ambientes');
                                if (tbody.children.length === 0) {
                                    tbody.innerHTML = `
                                        <tr id="linha-vazia">
                                            <td colspan="4" style="padding: 30px; text-align: center; color: var(--corTxt2);">Nenhum ambiente encontrado.</td>
                                        </tr>
                                    `;
                                }
                            }, 300);
                        } else {
                            // Inativação: Atualiza a linha
                            row.innerHTML = renderRowHtml(id, data.data.nome_bloco_sala, data.data.status);
                        }
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao processar exclusão/inativação.', 'danger');
            });
        }

        // Adiciona listener em tempo real para os inputs limparem os erros e verificarem VAZIO
        document.addEventListener('DOMContentLoaded', () => {
            const inputs = ['cad_nome', 'edit_nome'];
            inputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', () => {
                        const erroSpan = document.getElementById(id === 'cad_nome' ? 'cad_erro' : 'edit_erro');
                        if (el.value.trim().toUpperCase() === 'VAZIO') {
                            erroSpan.innerText = "✖ O nome do bloco/sala não pode ser 'VAZIO'.";
                            erroSpan.style.display = 'block';
                            el.style.borderColor = '#fc2323';
                        } else {
                            erroSpan.style.display = 'none';
                            el.style.borderColor = '';
                        }
                    });
                }
            });
        });
    </script>

    <!-- Arquivos adicionais de Javascript global mapeados na Fase 3 -->
    <script src="../assets/js/scripts.js" defer></script>
</body>
</html>
