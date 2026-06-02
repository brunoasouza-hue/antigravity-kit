<?php
declare(strict_types=1);
/**
 * SENAI Manutenção Predial - Tela de Gestão de Ambientes
 */
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Controllers/AmbienteController.php';

AuthController::exigirNivelAcesso(['Gestor']);

if (isset($_GET['logout'])) {
    $auth = new AuthController();
    $auth->logout();
    header("Location: " . BASE_URL . "/public/index.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['acao'])) {
    $controller = new AmbienteController();
    $controller->processarAcao();
}

$ambientes       = Ambiente::listarTodos();
usort($ambientes, fn($a, $b) => $a->getId() - $b->getId());

$alertaSucesso   = $_SESSION['alerta_sucesso'] ?? '';
$alertaErro      = $_SESSION['alerta_erro']    ?? '';
unset($_SESSION['alerta_sucesso'], $_SESSION['alerta_erro']);
$dataAtual       = date('d/m/Y');
$totalAmbientes  = count($ambientes);
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Ambientes - SENAI MANUTENÇÃO</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/modal.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="../assets/img/favicon.ico" type="image/x-icon">

    <!-- ═══════════════════════════════════════════════════════════════
         FORCE TABLE LAYOUT — Alta especificidade com !important.
         Garante que NENHUMA regra externa quebre o layout horizontal.
         ═══════════════════════════════════════════════════════════════ -->
    <style>
        /* Força display correto em todos os elementos da tabela */
        #tabelaAmbientes                           { display: table           !important; width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; }
        #tabelaAmbientes thead                     { display: table-header-group !important; }
        #tabelaAmbientes tbody                     { display: table-row-group !important; }
        #tabelaAmbientes tr                        { display: table-row       !important; }
        #tabelaAmbientes th,
        #tabelaAmbientes td                        { display: table-cell      !important; vertical-align: middle !important; }

        /* Remove qualquer herança de flex ou block que possa vir do tema */
        #tabelaAmbientes tr td > *                 { display: inline-flex; }
        #tabelaAmbientes tr td > div               { display: inline-flex !important; gap: 5px; align-items: center; justify-content: center; }

        /* Garante que o wrapper da tabela nunca quebre o overflow */
        #tabelaAmbientes-wrapper                   { overflow-x: auto !important; width: 100% !important; display: block !important; }

        /* Hover nas linhas (mantém o table-row) */
        #tabelaAmbientes tbody tr:hover            { display: table-row !important; background: rgba(0,0,0,.03); }

        /* Esconde linha quando filtrada pelo JS */
        #tabelaAmbientes tbody tr[style*="none"]   { display: none !important; }
    </style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════
     SIDEBAR
     ═══════════════════════════════════════════════════════════ -->
<nav class="sidebar">
    <div class="botao-fechar">
        <button id="fechar-nav"><i class="bi bi-arrow-left-circle-fill"></i></button>
    </div>
    <div class="div-img">
        <img src="../assets/img/senailogo2.png" alt="Logo Senai" id="senai-logo2" style="width: 80%;">
    </div>
    <div class="div-links">
        <a href="./home.php" class="links"><i class="bi bi-house-door-fill"></i> Início</a>
        <a href="./dashboard.php" class="links"><i class="bi bi-speedometer2"></i> Dashboard</a>

        <div class="menu-manutencao">
            <a href="javascript:void(0)" class="links manutencao-btn" id="btn-manutencao">
                <div><i class="bi bi-tools"></i><span>Manutenção</span></div>
                <i class="bi bi-caret-down-fill seta"></i>
            </a>
            <div class="submenu" id="submenu-manutencao">
                <a href="./corretivas.php" class="links-sub"><i class="bi bi-wrench"></i> Corretiva (O.S)</a>
                <a href="./preventivas.php" class="links-sub"><i class="bi bi-clock-fill"></i> Preventiva (Checklist)</a>
            </div>
        </div>

        <div class="menu-inspecoes">
            <a href="javascript:void(0)" class="links inspecoes-btn" id="btn-inspecoes">
                <div><i class="bi bi-shield-fill-check"></i><span>Inspeções</span></div>
                <i class="bi bi-caret-down-fill seta"></i>
            </a>
            <div class="submenu" id="submenu-inspecoes">
                <a href="./inspecoes_seguranca.php" class="links-sub"><i class="bi bi-plus-circle-fill"></i> Nova Inspeção</a>
                <a href="./inspecoes_seguranca.php" class="links-sub"><i class="bi bi-clock-history"></i> Histórico</a>
            </div>
        </div>

        <a href="./ambientes.php" class="ativo links"><i class="bi bi-building"></i> Painel de Ambientes</a>
        <a href="./usuarios.php" class="links"><i class="bi bi-file-earmark-person-fill"></i> Painel de Usuários</a>
        <a href="./log.php" class="links"><i class="bi bi-person-vcard"></i> Painel de Logs</a>
    </div>
    <div class="div-configs">
        <div>
            <button onclick="changeTheme()" id="tema"><i class="bi bi-brightness-high-fill"></i></button>
            <a href="./perfil.php" class="configs dont-rotate" title="Perfil"><i class="bi bi-person-fill"></i></a>
        </div>
        <a href="?logout=1" class="btn sair" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">
            <span>Sair</span><i class="bi bi-door-closed-fill"></i>
        </a>
    </div>
</nav>

<!-- ═══════════════════════════════════════════════════════════
     CONTEÚDO PRINCIPAL
     ═══════════════════════════════════════════════════════════ -->
<section class="sec-main">

    <!-- HEADER -->
    <div class="div-header">
        <div class="div-img-header">
            <div class="avatar"><i class="bi bi-person-badge-fill"></i></div>
            <h4 style="color:var(--corTxt3)">
                Olá, <span style="color:var(--corDestaque);"><?php echo htmlspecialchars($_SESSION['usuario_nome'] ?? 'Gestor'); ?></span>
                <small style="font-size:12px;color:var(--corTxt2);">(Gestor)</small>
            </h4>
        </div>
        <div class="div-txt-header">
            <p><i class="bi bi-calendar3"></i> <?php echo $dataAtual; ?></p>
        </div>
    </div>

    <!-- ALERTAS -->
    <?php if (!empty($alertaSucesso)): ?>
    <div style="width:90%;display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:10px;font-weight:600;font-size:.9rem;background:rgba(40,167,69,.1);border:1px solid #28a745;color:#28a745;">
        <i class="bi bi-check-circle-fill"></i><span><?php echo htmlspecialchars($alertaSucesso); ?></span>
    </div>
    <?php endif; ?>
    <?php if (!empty($alertaErro)): ?>
    <div style="width:90%;display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:10px;font-weight:600;font-size:.9rem;background:rgba(252,35,35,.1);border:1px solid #fc2323;color:#ca2525;">
        <i class="bi bi-exclamation-triangle-fill"></i><span><?php echo htmlspecialchars($alertaErro); ?></span>
    </div>
    <?php endif; ?>

    <!-- ═══════════════════════════════════════════════════════
         CARD DA TABELA — 100% INLINE STYLES, SEM CLASSES CSS
         ═══════════════════════════════════════════════════════ -->
    <div style="width:90%;background:var(--corFundo2);border-radius:12px;border:1px solid var(--corBordas);box-shadow:var(--sombra);overflow:hidden;">

        <!-- Cabeçalho do card -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--corBordas);flex-wrap:wrap;gap:12px;">
            <div style="display:flex;align-items:center;gap:10px;">
                <i class="bi bi-building" style="font-size:1.4rem;color:#fc2323;"></i>
                <h2 style="margin:0;font-size:1rem;font-weight:700;color:var(--corTxt3);">
                    Ambientes Cadastrados
                    <small id="contadorAmbientes" style="font-size:.75rem;font-weight:500;color:var(--corTxt2);margin-left:6px;">(<?php echo $totalAmbientes; ?> registros)</small>
                </h2>
            </div>

            <!-- BARRA DE PESQUISA + BOTÃO ADICIONAR -->
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <form method="GET" action="" style="display:flex;align-items:center;background:var(--corFundo);border:1px solid var(--corBordas);border-radius:8px;padding:0 12px;min-width:250px;">
                    <button type="submit" style="background:transparent;border:none;cursor:pointer;padding:0;">
                        <i class="bi bi-search" style="color:var(--corTxt2);margin-right:8px;font-size:.9rem;"></i>
                    </button>
                    <input type="text" name="search" id="buscaAmbiente" placeholder="Pesquisar ambiente (Enter)..."
                           value="<?php echo isset($_GET['search']) ? htmlspecialchars($_GET['search']) : ''; ?>"
                           style="border:none;background:transparent;width:100%;padding:9px 0;color:var(--corTxt3);outline:none;font-size:.9rem;">
                </form>
                <button onclick="abrirModalCadastro()"
                        style="background:#fc2323;color:#fff;border:none;border-radius:8px;padding:10px 18px;display:flex;align-items:center;gap:7px;cursor:pointer;font-weight:700;font-size:.9rem;white-space:nowrap;">
                    <i class="bi bi-plus-lg"></i> Adicionar Ambiente
                </button>
            </div>
        </div>

        <!-- WRAPPER COM SCROLL HORIZONTAL -->
        <div style="overflow-x:auto;width:100%;">

            <!-- ══════════════════════════════════════════════
                 TABELA — LAYOUT HORIZONTAL GARANTIDO
                 Todas as propriedades são inline para evitar
                 qualquer conflito com o CSS global.
                 ══════════════════════════════════════════════ -->
            <table id="tabelaAmbientes"
                   style="width:100%;border-collapse:collapse;table-layout:auto;display:table;">
                <thead style="display:table-header-group;">
                    <tr style="display:table-row;background:#f1f5f9;">
                        <th style="display:table-cell;padding:13px 20px;text-align:center;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#444;border-bottom:2px solid #ddd;white-space:nowrap;">
                            Nº Identificação
                        </th>
                        <th style="display:table-cell;padding:13px 20px;text-align:left;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#444;border-bottom:2px solid #ddd;white-space:nowrap;">
                            Denominação (Ambiente)
                        </th>
                        <th style="display:table-cell;padding:13px 20px;text-align:center;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#444;border-bottom:2px solid #ddd;white-space:nowrap;">
                            Família
                        </th>
                        <th style="display:table-cell;padding:13px 20px;text-align:center;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#444;border-bottom:2px solid #ddd;white-space:nowrap;">
                            Status
                        </th>
                        <th style="display:table-cell;padding:13px 20px;text-align:center;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#444;border-bottom:2px solid #ddd;white-space:nowrap;">
                            Ações
                        </th>
                    </tr>
                </thead>

                <tbody id="tabela-ambientes" style="display:table-row-group;">
                    <?php if (empty($ambientes)): ?>
                    <tr style="display:table-row;">
                        <td colspan="4" style="display:table-cell;padding:40px;text-align:center;color:#888;font-size:.95rem;">
                            Nenhum ambiente cadastrado.
                        </td>
                    </tr>
                    <?php endif; ?>
                    <?php if (!empty($ambientes)): ?>
                    <?php foreach ($ambientes as $amb): ?>
                    <tr id="row-<?php echo $amb->getId(); ?>"
                        style="display:table-row;border-bottom:1px solid #e8edf3;transition:background .15s;">
                        <!-- Nº Identificação -->
                        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;color:var(--corTxt3);font-size:.9rem;white-space:nowrap;">
                            <?php echo $amb->getId(); ?>
                        </td>
                        <!-- Denominação -->
                        <td style="display:table-cell;padding:13px 20px;text-align:left;vertical-align:middle;font-weight:700;text-transform:uppercase;color:var(--corTxt3);font-size:.9rem;">
                            <?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>
                        </td>
                        <!-- Família -->
                        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;font-weight:700;color:var(--corTxt3);font-size:.9rem;">
                            <?php echo htmlspecialchars($amb->getFamilia() ?? 'Geral'); ?>
                        </td>
                        <!-- Status -->
                        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">
                            <?php if ($amb->getStatus() === 'Ativo'): ?>
                            <span style="display:inline-flex;align-items:center;gap:5px;background:rgba(40,167,69,.12);color:#28a745;border:1px solid #28a745;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;">
                                <i class="bi bi-check2"></i> Ativo
                            </span>
                            <?php else: ?>
                            <span style="display:inline-flex;align-items:center;gap:5px;background:rgba(108,117,125,.12);color:#6c757d;border:1px solid #6c757d;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;">
                                <i class="bi bi-slash-circle"></i> Inativo
                            </span>
                            <?php endif; ?>
                        </td>
                        <!-- Ações -->
                        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">
                            <div style="display:inline-flex;gap:5px;align-items:center;justify-content:center;">
                                <button type="button" title="Editar"
                                        onclick="abrirModalEdicao(<?php echo $amb->getId(); ?>, '<?php echo addslashes($amb->getNomeAmbiente()); ?>', '<?php echo $amb->getStatus(); ?>', '<?php echo $amb->getFamilia() ?? 'Geral'; ?>')"
                                        style="width:36px;height:36px;border:none;border-radius:6px;background:#00c5ff;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button type="button" title="Excluir / Inativar"
                                        onclick="abrirModalExclusao(<?php echo $amb->getId(); ?>, '<?php echo addslashes($amb->getNomeAmbiente()); ?>')"
                                        style="width:36px;height:36px;border:none;border-radius:6px;background:#ff2323;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;">
                                    <i class="bi bi-trash"></i>
                                </button>
                                <a href="corretivas.php?ambiente_id=<?php echo $amb->getId(); ?>" title="Ordem de Serviço"
                                        style="width:36px;height:36px;border:none;border-radius:6px;background:#6f42c1;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;text-decoration:none;">
                                    <i class="bi bi-tools"></i>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

        </div><!-- /overflow-x:auto -->

        <!-- Rodapé com totalizador e Paginação -->
        <div style="padding:12px 24px;border-top:1px solid var(--corBordas);font-size:.8rem;color:var(--corTxt2);display:flex;justify-content:space-between;align-items:center;">
            <div>
                Exibindo <span id="totalVisiveis"><?php echo $totalAmbientes; ?></span> de <?php echo $totalAmbientes; ?> ambientes
            </div>
            <div id="paginacao-container">
                <!-- INJETAR_PAGINACAO -->
            </div>
        </div>

    </div><!-- /card -->

</section><!-- /sec-main -->


<!-- ═══════════════════════════════════════════════════════════
     MODAL 1 — CADASTRO DE AMBIENTE
     ═══════════════════════════════════════════════════════════ -->
<div class="modal-fundo" id="adicaoAmbiente" style="display:none;">
    <div class="modal-box">
        <div class="modal-header" style="border-bottom:1px solid var(--corBordas);padding-bottom:15px;">
            <h3>Registrar Novo Ambiente</h3>
            <button onclick="fecharModal('adicaoAmbiente')"><i class="bi bi-x-lg"></i></button>
        </div>
        <form action="" method="POST" class="modal-form" id="form-cadastro" style="padding-top:15px;" onsubmit="return submeterFormCadastro(event)">
            <input type="hidden" name="acao" value="cadastrar">
            <div class="modal-input" style="margin-bottom:15px;">
                <label for="cad_id" style="font-weight:bold;display:block;margin-bottom:8px;">Código do Ambiente (ID):</label>
                <input type="number" name="id" id="cad_id" required placeholder="Ex: 20770001"
                       style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--corBordas);outline:none;background:var(--corFundo);color:var(--corTxt3);">
            </div>
            <div class="modal-input" style="margin-bottom:15px;">
                <label for="cad_nome" style="font-weight:bold;display:block;margin-bottom:8px;">Nome do Ambiente:</label>
                <input type="text" name="nome_ambiente" id="cad_nome" required placeholder="Ex: Bloco A - Sala 102"
                       style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--corBordas);outline:none;background:var(--corFundo);color:var(--corTxt3);">
                <span id="cad_erro" style="color:#fc2323;font-size:12px;display:none;margin-top:5px;font-weight:bold;"></span>
            </div>
            
            <div class="modal-input" style="margin-bottom:15px;">
                <label style="font-weight:bold;display:block;margin-bottom:8px;">Família:</label>
                <select name="familia" id="cad_familia" style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--corBordas);outline:none;background:var(--corFundo);color:var(--corTxt3);">
                    <option value="Salas de Aulas">📚 Salas de Aulas</option>
                    <option value="Laboratórios">🔬 Laboratórios</option>
                    <option value="Oficinas">⚙️ Oficinas</option>
                    <option value="Administrativos">🏢 Administrativos</option>
                    <option value="Externos">🌳 Externos</option>
                    <option value="Geral">📦 Geral</option>
                </select>
            </div>
            <div class="modal-input" style="margin-bottom:20px;">
                <label for="cad_status" style="font-weight:bold;display:block;margin-bottom:8px;">Status Inicial:</label>
                <select name="status" id="cad_status" style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--corBordas);outline:none;background:var(--corFundo);color:var(--corTxt3);">
                    <option value="Ativo" selected>Ativo</option>
                    <option value="Inativo">Inativo</option>
                </select>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--corBordas);padding-top:15px;display:flex;justify-content:flex-end;">
                <button type="submit" style="background:#fc2323;color:#fff;border:none;padding:12px 25px;border-radius:8px;font-weight:bold;cursor:pointer;">
                    Cadastrar <i class="bi bi-plus-lg"></i>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     MODAL 2 — EDIÇÃO DE AMBIENTE
     ═══════════════════════════════════════════════════════════ -->
<div class="modal-fundo" id="edicaoAmbiente" style="display:none;">
    <div class="modal-box">
        <div class="modal-header" style="border-bottom:1px solid var(--corBordas);padding-bottom:15px;">
            <h3>Editar Ambiente</h3>
            <button onclick="fecharModal('edicaoAmbiente')"><i class="bi bi-x-lg"></i></button>
        </div>
        <form action="" method="POST" class="modal-form" id="form-edicao" style="padding-top:15px;" onsubmit="return submeterFormEdicao(event)">
            <input type="hidden" name="acao" value="editar">
            <input type="hidden" name="id" id="edit_id">
            <div class="modal-input" style="margin-bottom:15px;">
                <label for="edit_nome" style="font-weight:bold;display:block;margin-bottom:8px;">Nome do Ambiente:</label>
                <input type="text" name="nome_ambiente" id="edit_nome" required
                       style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--corBordas);outline:none;background:var(--corFundo);color:var(--corTxt3);">
                <span id="edit_erro" style="color:#fc2323;font-size:12px;display:none;margin-top:5px;font-weight:bold;"></span>
            </div>
            
            <div class="modal-input" style="margin-bottom:15px;">
                <label style="font-weight:bold;display:block;margin-bottom:8px;">Família:</label>
                <select name="familia" id="edit_familia" style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--corBordas);outline:none;background:var(--corFundo);color:var(--corTxt3);">
                    <option value="Salas de Aulas">📚 Salas de Aulas</option>
                    <option value="Laboratórios">🔬 Laboratórios</option>
                    <option value="Oficinas">⚙️ Oficinas</option>
                    <option value="Administrativos">🏢 Administrativos</option>
                    <option value="Externos">🌳 Externos</option>
                    <option value="Geral">📦 Geral</option>
                </select>
            </div>
            <div class="modal-input" style="margin-bottom:20px;">
                <label for="edit_status" style="font-weight:bold;display:block;margin-bottom:8px;">Status:</label>
                <select name="status" id="edit_status" style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--corBordas);outline:none;background:var(--corFundo);color:var(--corTxt3);">
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                </select>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--corBordas);padding-top:15px;display:flex;justify-content:flex-end;">
                <button type="submit" style="background:#fc2323;color:#fff;border:none;padding:12px 25px;border-radius:8px;font-weight:bold;cursor:pointer;">
                    Salvar <i class="bi bi-check-lg"></i>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     MODAL 3 — EXCLUSÃO INTELIGENTE
     ═══════════════════════════════════════════════════════════ -->
<div class="modal-fundo" id="confirmarExclusao" style="display:none;">
    <div class="modal-box" style="width:500px;padding:25px;">
        <div class="modal-header" style="margin-bottom:15px;">
            <h3 style="color:#fc2323;"><i class="bi bi-exclamation-triangle-fill"></i> Atenção</h3>
            <button onclick="fecharModal('confirmarExclusao')"><i class="bi bi-x-lg"></i></button>
        </div>
        <p style="color:var(--corTxt3);font-size:14px;margin-bottom:10px;">
            Ambiente: <strong id="del_nome_display" style="color:#ca2525;"></strong>
        </p>
        <div style="display:flex;flex-direction:column;gap:10px;">
            <form action="" method="POST" id="form-inativar-modal" onsubmit="submeterExclusaoInteligente(event,'inativar')">
                <input type="hidden" name="acao" value="inativar">
                <input type="hidden" name="id" id="del_id_inativar">
                <button type="submit" style="width:100%;background:#e0a800;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:bold;cursor:pointer;">
                    <i class="bi bi-toggle-on"></i> Inativar (Preservar Histórico)
                </button>
            </form>
            <form action="" method="POST" id="form-excluir-modal" onsubmit="submeterExclusaoInteligente(event,'excluir')">
                <input type="hidden" name="acao" value="excluir">
                <input type="hidden" name="id" id="del_id_excluir">
                <button type="submit" style="width:100%;background:#fc2323;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:bold;cursor:pointer;">
                    <i class="bi bi-trash-fill"></i> Excluir Permanentemente
                </button>
            </form>
            <button type="button" onclick="fecharModal('confirmarExclusao')" style="width:100%;background:#6c757d;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:bold;cursor:pointer;">
                Cancelar
            </button>
        </div>
    </div>
</div>


<!-- ═══════════════════════════════════════════════════════════
     JAVASCRIPT
     ═══════════════════════════════════════════════════════════ -->
<script>
/* ── BUSCA EM TEMPO REAL (keyup) ─────────────────────────────────── */
function filtrarAmbientes(termo) {
    const t     = termo.toLowerCase().trim();
    const rows  = document.querySelectorAll('#tabela-ambientes tr[id^="row-"]');
    let visivel = 0;

    rows.forEach(row => {
        const id   = row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
        const nome = row.cells[1] ? row.cells[1].textContent.toLowerCase() : '';
        const ok   = t === '' || id.includes(t) || nome.includes(t);
        row.style.display = ok ? '' : 'none';
        if (ok) visivel++;
    });

    const el = document.getElementById('totalVisiveis');
    if (el) el.textContent = visivel;
}

/* ── TOAST ───────────────────────────────────────────────────────── */
function showToast(msg, tipo) {
    const c = document.getElementById('_tc') || (() => {
        const d = document.createElement('div');
        d.id = '_tc';
        d.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
        document.body.appendChild(d);
        return d;
    })();
    const t = document.createElement('div');
    t.style.cssText = `pointer-events:auto;background:${tipo==='success'?'rgba(40,167,69,.93)':'rgba(220,38,38,.93)'};color:#fff;padding:13px 20px;border-radius:10px;backdrop-filter:blur(8px);font-weight:600;display:flex;align-items:center;gap:9px;box-shadow:0 6px 24px rgba(0,0,0,.18);transform:translateY(-16px);opacity:0;transition:all .3s cubic-bezier(.68,-.55,.265,1.55);`;
    t.innerHTML = `<i class="bi bi-${tipo==='success'?'check-circle-fill':'exclamation-triangle-fill'}" style="font-size:1.1rem;"></i><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.transform='translateY(0)'; t.style.opacity='1'; }, 30);
    setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 3500);
}

/* ── RENDER ROW (AJAX reactive) ──────────────────────────────────── */
function renderRowHtml(id, nome, status, familia = 'Geral') {
    const isAtivo = status === 'Ativo';
    const badge = isAtivo
        ? `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(40,167,69,.12);color:#28a745;border:1px solid #28a745;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-check2"></i> Ativo</span>`
        : `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(108,117,125,.12);color:#6c757d;border:1px solid #6c757d;padding:4px 13px;border-radius:8px;font-weight:700;font-size:.75rem;"><i class="bi bi-slash-circle"></i> Inativo</span>`;
    const n = nome.replace(/'/g,"\\\'").replace(/"/g,'&quot;');
    const tog = isAtivo ? 'inativar' : 'ativar';
    const tip = isAtivo ? 'Inativar' : 'Ativar';
    const BTN = 'width:36px;height:36px;border:none;border-radius:6px;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;transition:opacity .2s;';
    return `
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">${id}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:left;vertical-align:middle;font-weight:700;text-transform:uppercase;">${nome}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;font-weight:700;color:var(--corTxt3);font-size:.9rem;">${familia}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">${badge}</td>
        <td style="display:table-cell;padding:13px 20px;text-align:center;vertical-align:middle;white-space:nowrap;">
            <div style="display:inline-flex;gap:5px;align-items:center;">
                <button type="button" style="${BTN}background:#00c5ff;" title="Editar" onclick="abrirModalEdicao(${id},'${n}','${status}', '${familia}')"><i class="bi bi-pencil-square"></i></button>
                <button type="button" style="${BTN}background:#ff2323;" title="Excluir" onclick="abrirModalExclusao(${id},'${n}')"><i class="bi bi-trash"></i></button>
                <a href="corretivas.php?ambiente_id=${id}" style="${BTN}background:#6f42c1;text-decoration:none;" title="Ordem de Serviço"><i class="bi bi-tools"></i></a>
            </div>
        </td>`;
}

/* ── MODAIS ──────────────────────────────────────────────────────── */
function abrirModalCadastro() {
    ['cad_id','cad_nome'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    document.getElementById('cad_erro').style.display='none';
    document.getElementById('adicaoAmbiente').style.display='flex';
}
function abrirModalEdicao(id, nome, status, familia = 'Geral') {
    document.getElementById('edit_id').value     = id;
    document.getElementById('edit_nome').value   = nome;
    document.getElementById('edit_status').value = status;
    document.getElementById('edit_familia').value = familia;
    document.getElementById('edit_erro').style.display='none';
    document.getElementById('edicaoAmbiente').style.display='flex';
}
function abrirModalExclusao(id, nome) {
    document.getElementById('del_nome_display').innerText = nome;
    document.getElementById('del_id_inativar').value = id;
    document.getElementById('del_id_excluir').value  = id;
    document.getElementById('confirmarExclusao').style.display='flex';
}
function fecharModal(id) { document.getElementById(id).style.display='none'; }

/* ── VALIDAÇÃO ───────────────────────────────────────────────────── */
function validar(inputId) {
    const el  = document.getElementById(inputId);
    const err = document.getElementById(inputId==='cad_nome'?'cad_erro':'edit_erro');
    if (!el.value.trim()) { err.innerText='✖ Nome obrigatório.'; err.style.display='block'; el.focus(); return false; }
    if (el.value.trim().toUpperCase()==='VAZIO') { err.innerText="✖ Nome não pode ser 'VAZIO'."; err.style.display='block'; el.focus(); return false; }
    err.style.display='none'; return true;
}

/* ── AJAX: CADASTRAR ─────────────────────────────────────────────── */
function submeterFormCadastro(e) {
    e.preventDefault();
    if (!validar('cad_nome')) return false;
    const fd = new URLSearchParams(new FormData(document.getElementById('form-cadastro')));
    fd.append('ajax','1');
    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: fd
    })
    .then(r=>r.json()).then(d=>{
        if (d.success) {
            showToast(d.message,'success'); fecharModal('adicaoAmbiente');
            const tbody = document.getElementById('tabela-ambientes');
            const vazia = document.getElementById('linha-vazia');
            if (vazia) vazia.remove();
            const tr = document.createElement('tr');
            tr.id = `row-${d.data.id}`;
            tr.style.cssText='display:table-row;border-bottom:1px solid #e8edf3;';
            tr.innerHTML = renderRowHtml(d.data.id, d.data.nome_ambiente, d.data.status, d.data.familia);
            tr.style.background='rgba(40,167,69,.07)';
            const rows = [...tbody.querySelectorAll('tr[id^="row-"]')];
            const after = rows.find(r=>parseInt(r.id.replace('row-',''))>d.data.id);
            after ? tbody.insertBefore(tr,after) : tbody.appendChild(tr);
            setTimeout(()=>{tr.style.background='';},900);
            atualizarContador();
        } else { showToast(d.message,'danger'); }
    }).catch(()=>showToast('Erro de rede.','danger'));
}

/* ── AJAX: EDITAR ────────────────────────────────────────────────── */
function submeterFormEdicao(e) {
    e.preventDefault();
    if (!validar('edit_nome')) return false;
    const fd = new URLSearchParams(new FormData(document.getElementById('form-edicao')));
    fd.append('ajax','1');
    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: fd
    })
    .then(r=>r.json()).then(d=>{
        if (d.success) {
            showToast(d.message,'success'); fecharModal('edicaoAmbiente');
            const row = document.getElementById(`row-${d.data.id}`);
            if (row) { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status,d.data.familia); row.style.background='rgba(0,123,255,.07)'; setTimeout(()=>{row.style.background='';},900); }
        } else { showToast(d.message,'danger'); }
    }).catch(()=>showToast('Erro de rede.','danger'));
}

/* ── AJAX: ALTERNAR STATUS ───────────────────────────────────────── */
function alternarStatus(id, acao) {
    const fd = new FormData();
    fd.append('acao',acao); fd.append('id',id); fd.append('ajax','1');
    fetch(window.location.href, {method:'POST',headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },body:fd})
    .then(r=>r.json()).then(d=>{
        if (d.success) {
            showToast(d.message,'success');
            const row = document.getElementById(`row-${d.data.id}`);
            if (row) { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status,d.data.familia); row.style.background='rgba(224,168,0,.08)'; setTimeout(()=>{row.style.background='';},900); }
        } else { showToast(d.message,'danger'); }
    }).catch(()=>showToast('Erro de rede.','danger'));
}

/* ── AJAX: EXCLUSÃO INTELIGENTE ──────────────────────────────────── */
function submeterExclusaoInteligente(e, acao) {
    e.preventDefault();
    const fd = new URLSearchParams(new FormData(e.currentTarget));
    fd.append('ajax','1');
    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: fd
    })
    .then(r=>r.json()).then(d=>{
        if (d.success) {
            showToast(d.message,'success'); fecharModal('confirmarExclusao');
            const row = document.getElementById(`row-${d.data.id}`);
            if (row) {
                if (acao==='excluir') {
                    row.style.opacity='0'; row.style.transform='scale(.95)';
                    setTimeout(()=>{ row.remove(); atualizarContador();
                        const tbody=document.getElementById('tabela-ambientes');
                        if(!tbody.querySelector('tr[id^="row-"]')) {
                            tbody.innerHTML='<tr id="linha-vazia" style="display:table-row;"><td colspan="4" style="display:table-cell;padding:40px;text-align:center;color:#888;">Nenhum ambiente cadastrado.</td></tr>';
                        }
                    },300);
                } else { row.innerHTML=renderRowHtml(d.data.id,d.data.nome_ambiente,d.data.status,d.data.familia); }
            }
        } else { showToast(d.message,'danger'); }
    }).catch(()=>showToast('Erro de rede.','danger'));
}

/* ── CONTADOR ────────────────────────────────────────────────────── */
function atualizarContador() {
    const total = document.querySelectorAll('#tabela-ambientes tr[id^="row-"]').length;
    const el = document.getElementById('totalVisiveis');
    if (el) el.textContent = total;
    const c = document.getElementById('contadorAmbientes');
    if (c) c.textContent = `(${total} registros)`;
}

/* ── VALIDAÇÃO TEMPO REAL ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    ['cad_nome','edit_nome'].forEach(id => {
        const el  = document.getElementById(id);
        const err = document.getElementById(id==='cad_nome'?'cad_erro':'edit_erro');
        if (!el) return;
        el.addEventListener('input', () => {
            if (el.value.trim().toUpperCase()==='VAZIO') { err.innerText="✖ Nome não pode ser 'VAZIO'."; err.style.display='block'; el.style.borderColor='#fc2323'; }
            else { err.style.display='none'; el.style.borderColor=''; }
        });
    });
});
</script>

<script src="../assets/js/scripts.js" defer></script>
</body>
</html>
