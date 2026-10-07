<?php
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
AuthController::exigirNivelAcesso(['Gestor']);
$eventos = Database::getConnection()->query('SELECT l.id,l.operacao,l.data_operacao,l.nivel_anterior,l.nivel_novo,a.nome ator,u.nome usuario FROM auditoria_usuarios l JOIN usuarios a ON a.id=l.ator_id JOIN usuarios u ON u.id=l.usuario_id ORDER BY l.id DESC LIMIT 200')->fetchAll();
function escaparLog($valor): string { return htmlspecialchars((string)$valor, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Painel de Logs — SENAI</title><link rel="stylesheet" href="../assets/css/style.css"><link rel="stylesheet" href="../assets/css/global.css"></head>
<body><main style="padding:24px;width:100%;box-sizing:border-box;"><a href="usuarios.php">Voltar ao Painel de Usuários</a><h1>Painel de Logs</h1><p>Últimas 200 operações de administração de usuários.</p><div style="overflow-x:auto;"><table style="width:100%;text-align:left;"><thead><tr><th>Data/hora</th><th>Responsável</th><th>Usuário</th><th>Operação</th><th>Perfil anterior</th><th>Perfil novo</th></tr></thead><tbody>
<?php foreach ($eventos as $evento): ?><tr><?php foreach (['data_operacao','ator','usuario','operacao','nivel_anterior','nivel_novo'] as $campo): ?><td style="padding:12px;"><?= escaparLog($evento[$campo]) ?></td><?php endforeach; ?></tr><?php endforeach; ?>
<?php if (!$eventos): ?><tr><td colspan="6">Nenhuma operação registrada.</td></tr><?php endif; ?>
</tbody></table></div></main></body></html>
