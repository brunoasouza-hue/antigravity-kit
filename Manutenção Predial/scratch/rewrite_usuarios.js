const fs = require('fs');

const phpCode = `<?php
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Models/Usuario.php';
require_once __DIR__ . '/../../src/Models/Ambiente.php';

// Proteção de Rota - Somente Administrador
AuthController::exigirNivelAcesso(['Administrador']);

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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
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
    <?php include __DIR__ . '/includes/header.php'; ?>
    <?php include __DIR__ . '/includes/sidebar.php'; ?>

    <main class="main-content">
        <div class="content-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h1 style="color: var(--corBase); font-weight: 800; font-size: 28px; margin-bottom: 5px;">Gerenciamento de Usuários</h1>
                <p style="color: var(--corTxt2);">Administre acessos, cadastre novos funcionários e vincule a ambientes.</p>
            </div>
            <button onclick="document.getElementById('modalNovoUsuario').style.display='flex';" style="background: var(--corDestaque); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <i class="bi bi-person-plus-fill"></i> NOVO USUÁRIO
            </button>
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
        <div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto;">
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
                    <tr style="border-bottom: 1px solid var(--corBorda);">
                        <td style="padding: 15px; color: var(--corTxt2);">#<?php echo $u->getId(); ?></td>
                        <td style="padding: 15px; font-weight: 600; color: var(--corTxt1);"><?php echo htmlspecialchars($u->getNome()); ?></td>
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
                            <form action="../../src/Controllers/UsuarioController.php" method="POST" style="display:flex; gap:10px; align-items:center;">
                                <input type="hidden" name="acao" value="alterar_nivel">
                                <input type="hidden" name="id" value="<?php echo $u->getId(); ?>">
                                <select name="nivel_acesso" style="padding: 8px; border-radius: 6px; border: 1px solid var(--corBorda); outline: none; background: #fff; width: 140px;">
                                    <?php foreach ($nivelOpcoes as $op): ?>
                                        <option value="<?php echo $op; ?>" <?php echo $u->getNivelAcesso() === $op ? 'selected' : ''; ?>><?php echo $op; ?></option>
                                    <?php endforeach; ?>
                                </select>
                                <button type="submit" title="Atualizar Nível" style="background: var(--corDestaque); color: #fff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;"><i class="bi bi-save"></i> Atualizar</button>
                            </form>
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            <span class="badge" style="background: rgba(108,117,125,0.1); color: #6c757d; padding: 5px 10px; border-radius: 12px; font-size: 12px;"><i class="bi bi-shield-lock"></i> Cadastrado</span>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

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
                        <?php foreach ($nivelOpcoes as $op): ?>
                            <option value="<?php echo $op; ?>"><?php echo $op; ?></option>
                        <?php endforeach; ?>
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
</body>
</html>`;

fs.writeFileSync('public/views/usuarios.php', phpCode);
console.log('usuarios.php replaced successfully');
