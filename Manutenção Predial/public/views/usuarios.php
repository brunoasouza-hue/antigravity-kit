<?php
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Models/Usuario.php';
require_once __DIR__ . '/../../src/Models/Ambiente.php';

// Proteção de Rota - Administrador e Gestor
AuthController::exigirNivelAcesso(['Administrador', 'Gestor']);

// Busca dados
$usuarios = Usuario::listarTodos();
$ambientesAtivos = Ambiente::listarTodos(); // Ou listar ativos se preferir

$nivelOpcoes = ['Solicitante', 'Executor', 'Gestor', 'Administrador'];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciamento de Usuários - SENAI</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/modal.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/bootstrap-icons.min.css">
    <style>
        .badge-ambiente {
            background: rgba(0, 191, 165, 0.15);
            color: #00897b;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
            margin-right: 4px;
            margin-bottom: 4px;
        }
        .modal-novo-usuario {
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            align-items: center;
            justify-content: center;
        }
        .modal-box {
            background: #fafafa;
            border-radius: 16px;
            width: 100%;
            max-width: 500px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
        }
    </style>
</head>
<body>
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

        <a href="./ambientes.php" class="links"><i class="bi bi-building"></i> Painel de Ambientes</a>
        <a href="./usuarios.php" class="ativo links"><i class="bi bi-file-earmark-person-fill"></i> Painel de Usuários</a>
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
    

    <section class="sec-main">
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

    
        <div class="content-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h1 style="color: var(--corBase); font-weight: 800; font-size: 28px; margin-bottom: 5px;">Gerenciamento de Usuários</h1>
                <p style="color: var(--corTxt2);">Administre acessos, cadastre novos funcionários e vincule a ambientes.</p>
            </div>
            
            <div style="display: flex; gap: 15px; align-items: center;">
                <input type="text" id="search-usuario" placeholder="🔍 Pesquisar usuário..." onkeyup="filtrarUsuariosTabela()" style="width: 300px; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14px;">
                <button onclick="document.getElementById('modalNovoUsuario').style.display='flex';" style="background: var(--corDestaque); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; white-space: nowrap;">
                    <i class="bi bi-person-plus-fill"></i> NOVO USUÁRIO
                </button>
            </div>
        </div>

        <?php if (isset($_SESSION['alerta_sucesso'])): ?>
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: bold;">
                <i class="bi bi-check-circle"></i> <?php echo htmlspecialchars($_SESSION['alerta_sucesso']); unset($_SESSION['alerta_sucesso']); ?>
            </div>
        <?php endif; ?>
        <?php if (isset($_SESSION['alerta_erro'])): ?>
            <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: bold;">
                <i class="bi bi-exclamation-triangle"></i> <?php echo htmlspecialchars($_SESSION['alerta_erro']); unset($_SESSION['alerta_erro']); ?>
            </div>
        <?php endif; ?>

        <!-- Tabela de Usuários -->
        
        
        <div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto; min-height: 380px;">
            <table class="table" style="width: 100%; border-collapse: collapse; min-width: 1000px;">
                <thead>
                    <tr style="background: var(--corDestaque); color: #fff;">
                        <th style="padding: 15px; text-align: left; border-top-left-radius: 8px;">ID</th>
                        <th style="padding: 15px; text-align: left;">Nome / Funcionário</th>
                        <th style="padding: 15px; text-align: left;">E-mail (Login)</th>
                        <th style="padding: 15px; text-align: left;">Ambientes Vinculados</th>
                        <th style="padding: 15px; text-align: left;">Nível de Acesso</th>
                        <th style="padding: 15px; text-align: center; border-top-right-radius: 8px;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($usuarios as $u): ?>
                    <tr style="border-bottom: 1px solid var(--corBorda); <?php echo $u->getStatus() === 'Inativo' ? 'opacity: 0.6;' : ''; ?>">
                        <td style="padding: 15px; color: var(--corTxt2);">#<?php echo $u->getId(); ?></td>
                        <td style="padding: 15px; font-weight: 600; color: var(--corTxt1);">
                            <?php echo htmlspecialchars($u->getNome()); ?>
                            <?php if ($u->getStatus() === 'Inativo'): ?>
                                <span style="background: rgba(220, 53, 69, 0.1); color: #dc3545; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; font-weight: normal; vertical-align: middle; border: 1px solid rgba(220, 53, 69, 0.2);"><i class="bi bi-person-x-fill"></i> Inativo</span>
                            <?php endif; ?>
                        </td>
                        <td style="padding: 15px; color: var(--corTxt2);"><?php echo htmlspecialchars($u->getEmail()); ?></td>
                        <td style="padding: 15px; max-width: 250px;">
                            <?php 
                                $vinculos = $u->getAmbientesVinculados(); 
                                if (empty($vinculos)): 
                            ?>
                                <span style="color: #aaa; font-style: italic; font-size: 13px;">Nenhum vínculo</span>
                            <?php 
                                else: 
                                    foreach ($vinculos as $vId):
                                        $ambNome = "Desconhecido (#$vId)";
                                        foreach ($ambientesAtivos as $a) {
                                            if ($a->getId() == $vId) {
                                                $ambNome = $a->getNomeAmbiente();
                                                break;
                                            }
                                        }
                            ?>
                                <span class="badge-ambiente"><?php echo htmlspecialchars($ambNome); ?></span>
                            <?php 
                                    endforeach;
                                endif; 
                            ?>
                        </td>
                        <td style="padding: 15px;">
                            <span style="font-weight: 500;"><?php echo htmlspecialchars($u->getNivelAcesso()); ?></span>
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                                <?php $vinculosArr = $u->getAmbientesVinculados(); ?>
                                <button onclick="abrirModalEditar(<?php echo $u->getId(); ?>, '<?php echo addslashes($u->getNome()); ?>', '<?php echo addslashes($u->getNivelAcesso()); ?>', [<?php echo implode(',', $vinculosArr ?: []); ?>])" 
                                    style="background: var(--corDestaque); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-size: 13px;">
                                    <i class="bi bi-pencil-square"></i> Editar
                                </button>
                                <?php if ($u->getId() !== $_SESSION['usuario_id']): ?>
                                    <?php if ($u->getStatus() === 'Ativo'): ?>
                                        <button onclick="alterarStatusUsuario(<?php echo $u->getId(); ?>, 'Inativo')" 
                                            style="background: #dc3545; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-size: 13px;">
                                            <i class="bi bi-person-x-fill"></i> Desativar
                                        </button>
                                    <?php else: ?>
                                        <button onclick="alterarStatusUsuario(<?php echo $u->getId(); ?>, 'Ativo')" 
                                            style="background: #28a745; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-size: 13px;">
                                            <i class="bi bi-person-check-fill"></i> Ativar
                                        </button>
                                    <?php endif; ?>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Modal Novo Usuário -->
    <div class="modal-novo-usuario" id="modalNovoUsuario">
        <div class="modal-box">
            <button type="button" onclick="document.getElementById('modalNovoUsuario').style.display='none'" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;"><i class="bi bi-x-lg"></i></button>
            <h2 style="margin: 0 0 20px 0; color: var(--corBase); font-size: 22px;">Cadastrar Novo Usuário</h2>
            <p style="font-size: 13px; color: #666; margin-bottom: 20px;">A senha padrão para novos usuários será <strong>senai123</strong>. Eles poderão alterá-la futuramente.</p>
            
            <form action="../../src/Controllers/UsuarioController.php" method="POST">
                <input type="hidden" name="acao" value="criar">
                
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Nome Completo:</label>
                    <input type="text" name="nome" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">E-mail Corporativo:</label>
                    <input type="email" name="email" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Nível de Acesso:</label>
                    <select name="nivel_acesso" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff;">
                        
                            <option value="Solicitante">Solicitante</option>
                            <option value="Executor">Executor</option>
                            <option value="Gestor">Gestor</option>
                            <?php if (isset($_SESSION['usuario_nivel']) && $_SESSION['usuario_nivel'] === 'Administrador'): ?>
                            <option value="Administrador">Administrador</option>
                            <?php endif; ?>

                    </select>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Vincular Ambientes (Opcional):</label>
                    <p style="font-size: 11px; color: #888; margin-top: 0; margin-bottom: 8px;">Pressione Ctrl (ou Cmd) para selecionar múltiplos ambientes.</p>
                    <select name="ambientes_vinculados[]" multiple style="width: 100%; height: 120px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; font-size: 13px;">
                        <?php foreach ($ambientesAtivos as $amb): ?>
                            <option value="<?php echo $amb->getId(); ?>">
                                #<?php echo $amb->getId(); ?> - <?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <button type="submit" style="width: 100%; background: #00bfa5; color: white; border: none; padding: 14px; border-radius: 25px; font-weight: bold; font-size: 15px; cursor: pointer;"><i class="bi bi-check2-circle"></i> CADASTRAR E SALVAR</button>
            </form>
        </div>
    </div>
    
    <!-- Modal Editar Usuario -->
    <div class="modal-novo-usuario" id="modalEditarUsuario">
        <div class="modal-box">
            <button type="button" onclick="document.getElementById('modalEditarUsuario').style.display='none'" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;"><i class="bi bi-x-lg"></i></button>
            <h2 style="margin: 0 0 20px 0; color: var(--corBase); font-size: 22px;">Editar Usuário</h2>
            <form action="../../src/Controllers/UsuarioController.php" method="POST">
                <input type="hidden" name="acao" value="editar_usuario">
                <input type="hidden" name="id" id="edit-user-id" value="">
                
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Nome do Usuário:</label>
                    <input type="text" name="nome" id="edit-user-name" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; box-sizing: border-box; color: var(--corTxt3);">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Nível de Acesso:</label>
                    <select name="nivel_acesso" id="edit-nivel-acesso" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff;">
                        
                            <option value="Solicitante">Solicitante</option>
                            <option value="Executor">Executor</option>
                            <option value="Gestor">Gestor</option>
                            <?php if (isset($_SESSION['usuario_nivel']) && $_SESSION['usuario_nivel'] === 'Administrador'): ?>
                            <option value="Administrador">Administrador</option>
                            <?php endif; ?>

                    </select>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px; font-size: 14px;">Ambientes Vinculados:</label>
                    <div style="margin-bottom: 10px;">
                        <input type="text" id="search-ambiente" placeholder="🔍 Buscar ambiente..." onkeyup="filtrarAmbientesModal()" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 8px; outline: none; font-size: 13px;">
                        <div style="display: flex; gap: 10px;">
                        <select id="select-add-ambiente" style="flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 8px; outline: none; background: #fff; font-size: 13px;">
                            <?php foreach ($ambientesAtivos as $amb): ?>
                                <option value="<?php echo $amb->getId(); ?>" data-nome="<?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>">
                                    #<?php echo $amb->getId(); ?> - <?php echo htmlspecialchars($amb->getNomeAmbiente()); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <button type="button" onclick="adicionarAmbiente()" style="background: var(--corDestaque); color: #fff; border: none; border-radius: 8px; padding: 0 15px; font-weight: bold; cursor: pointer; transition: 0.2s;"><i class="bi bi-plus-circle"></i> Adicionar</button>
                    </div>
                    
                    <div id="lista-ambientes-vinculados" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; border: 1px dashed #ccc; border-radius: 8px; min-height: 50px; background: #fafafa;">
                        <!-- Badges -->
                    </div>
                    
                    <div id="hidden-inputs-ambientes">
                        <!-- Inputs -->
                    </div>
                </div>
                
                <button type="submit" style="width: 100%; background: #00bfa5; color: white; border: none; padding: 14px; border-radius: 25px; font-weight: bold; font-size: 15px; cursor: pointer;"><i class="bi bi-check2-circle"></i> SALVAR ALTERAÇÕES</button>
            </form>
        </div>
    </div>
    
    <script>
    function filtrarUsuariosTabela() {
        const input = document.getElementById('search-usuario').value.toLowerCase();
        const trs = document.querySelectorAll('table tbody tr');
        trs.forEach(tr => {
            const text = tr.innerText.toLowerCase();
            tr.style.display = text.includes(input) ? '' : 'none';
        });
    }

    function filtrarAmbientesModal() {
        const input = document.getElementById('search-ambiente').value.toLowerCase();
        const select = document.getElementById('select-add-ambiente');
        for (let i = 0; i < select.options.length; i++) {
            const txt = select.options[i].text.toLowerCase();
            select.options[i].style.display = txt.includes(input) ? '' : 'none';
        }
    }

    let ambientesSelecionados = [];

    function atualizarListaAmbientes() {
        const divLista = document.getElementById('lista-ambientes-vinculados');
        const divInputs = document.getElementById('hidden-inputs-ambientes');
        
        divLista.innerHTML = '';
        divInputs.innerHTML = '';
        
        if (ambientesSelecionados.length === 0) {
            divLista.innerHTML = '<span style="color: #999; font-size: 13px; font-style: italic;">Nenhum ambiente selecionado.</span>';
            return;
        }
        
        ambientesSelecionados.forEach(amb => {
            const badge = document.createElement('div');
            badge.style.cssText = "background: #e1f5fe; color: #0277bd; border: 1px solid #81d4fa; padding: 5px 12px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 6px; font-weight: 500;";
            badge.innerHTML = `
                #${amb.id} - ${amb.nome}
                <i class="bi bi-x-circle-fill" style="cursor: pointer; color: #0288d1; margin-left: 5px;" onclick="removerAmbiente(${amb.id})" title="Remover"></i>
            `;
            divLista.appendChild(badge);
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'ambientes_vinculados[]';
            input.value = amb.id;
            divInputs.appendChild(input);
        });
    }

    function adicionarAmbiente() {
        const select = document.getElementById('select-add-ambiente');
        const selectedOption = select.options[select.selectedIndex];
        
        if (!selectedOption.value) return;
        
        const id = parseInt(selectedOption.value);
        const nome = selectedOption.getAttribute('data-nome');
        
        if (!ambientesSelecionados.find(a => a.id === id)) {
            ambientesSelecionados.push({ id, nome });
            atualizarListaAmbientes();
        }
        
        select.value = ""; 
    }

    function removerAmbiente(id) {
        ambientesSelecionados = ambientesSelecionados.filter(a => a.id !== id);
        atualizarListaAmbientes();
    }

    function abrirModalEditar(id, nome, nivel, vinculos) {
        document.getElementById('edit-user-id').value = id;
        document.getElementById('edit-user-name').value = nome;
        document.getElementById('edit-nivel-acesso').value = nivel;
        
        ambientesSelecionados = [];
        const selectBox = document.getElementById('select-add-ambiente');
        
        vinculos.forEach(vId => {
            for(let i = 0; i < selectBox.options.length; i++) {
                if (parseInt(selectBox.options[i].value) === vId) {
                    ambientesSelecionados.push({ 
                        id: vId, 
                        nome: selectBox.options[i].getAttribute('data-nome') 
                    });
                    break;
                }
            }
        });
        
        atualizarListaAmbientes();
        document.getElementById('modalEditarUsuario').style.display = 'flex';
    }

    function alterarStatusUsuario(id, status) {
        const msg = status === 'Inativo' ? 'desativar' : 'ativar';
        if (confirm(`Tem certeza que deseja ${msg} este usuário?`)) {
            document.getElementById('status-user-id').value = id;
            document.getElementById('status-user-value').value = status;
            document.getElementById('form-status-usuario').submit();
        }
    }
    </script>

    <form id="form-status-usuario" action="../../src/Controllers/UsuarioController.php" method="POST" style="display:none;">
        <input type="hidden" name="acao" value="alterar_status">
        <input type="hidden" name="id" id="status-user-id" value="">
        <input type="hidden" name="status" id="status-user-value" value="">
    </form>

    <script src="../assets/js/scripts.js" defer></script>
</body>
</html>