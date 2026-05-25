<?php
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Models/Usuario.php';

// Proteção de Rota - Somente Administrador
AuthController::exigirNivelAcesso(['Administrador']);

// Busca dados
$usuarios = Usuario::listarTodos();

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
</head>
<body>
    <?php include __DIR__ . '/includes/header.php'; ?>
    <?php include __DIR__ . '/includes/sidebar.php'; ?>

    <main class="main-content">
        <div class="content-header">
            <div>
                <h1 style="color: var(--corBase); font-weight: 800; font-size: 28px; margin-bottom: 5px;">Gerenciamento de Usuários</h1>
                <p style="color: var(--corTxt2);">Administre os acessos e permissões dos funcionários do sistema.</p>
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
        <div class="table-container" style="background: var(--corFundo); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto;">
            <table class="table" style="width: 100%; border-collapse: collapse; min-width: 800px;">
                <thead>
                    <tr style="background: var(--corDestaque); color: #fff;">
                        <th style="padding: 15px; text-align: left; border-top-left-radius: 8px;">ID</th>
                        <th style="padding: 15px; text-align: left;">Nome / Funcionário</th>
                        <th style="padding: 15px; text-align: left;">E-mail (Login)</th>
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
</body>
</html>
