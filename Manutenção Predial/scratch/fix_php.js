const fs = require('fs');
const file = 'C:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Manutenção Predial\\public\\views\\corretivas.php';
let content = fs.readFileSync(file, 'utf8');

const topPHP = `<?php
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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'tramitar_os') {
    header('Content-Type: application/json');
    try {
        $pdo = Database::getConnection();
        $pdo->beginTransaction();
        $os_id = $_POST['os_id'] ?? 0;
        $status_tramite = $_POST['status_tramite'] ?? '';
        $executor_id = $_POST['executor_id'] ?? null;
        $observacao_etapa = $_POST['observacao_etapa'] ?? '';

        $stmt = $pdo->prepare("UPDATE ordens_servico SET status = ?, executor_atual_id = ? WHERE id = ?");
        $stmt->execute([$status_tramite, $executor_id, $os_id]);

        $stmtHist = $pdo->prepare("INSERT INTO os_historico_tramites (os_id, origem_usuario_id, destino_usuario_id, status_etapa, observacao_etapa, data_tramite) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmtHist->execute([$os_id, $_SESSION['usuario_id'] ?? 1, $executor_id, $status_tramite, $observacao_etapa]);

        $pdo->commit();
        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

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

$ambientesAtivos = [];
$executores = [];

if ($usuarioNivel === 'Solicitante') {
    $ambientesAtivos = Ambiente::listarAtivos(); // para o modal de abertura
} elseif ($usuarioNivel === 'Gestor') {
    $executores = Usuario::listarPorNivel('Executor'); // para o modal de despacho
}

$db = Database::getConnection();
$sqlListagem = "SELECT os.*, amb.nome_ambiente, solic.nome AS nome_solicitante, exec.nome AS nome_executor_atual 
FROM ordens_servico os 
LEFT JOIN ambientes amb ON os.ambiente_id = amb.id 
LEFT JOIN usuarios solic ON os.solicitante_id = solic.id 
LEFT JOIN usuarios exec ON os.executor_atual_id = exec.id 
WHERE os.tipo = 'Corretivo' OR os.tipo IS NULL OR os.tipo = '' 
ORDER BY os.id DESC";
$ordens_dados = $db->query($sqlListagem)->fetchAll(PDO::FETCH_ASSOC);

$ordensServico = [];
foreach ($ordens_dados as $dado) {
    $os = new OrdemServico(
        $dado['ambiente_id'],
        $dado['solicitante_id'],
        $dado['descricao_problema'],
        $dado['prioridade']
    );
    $os->setId($dado['id']);
    $os->setStatus($dado['status']);
    $os->ambiente_nome_view = $dado['nome_ambiente'];
    $os->solicitante_nome_view = $dado['nome_solicitante'];
    $os->executor_nome_view = $dado['nome_executor_atual'];
    $ordensServico[] = $os;
}

// Data atual formatada para exibição no cabeçalho
$dataAtual = date('d/m/Y');
?>`;

const regex = /^<\?php[\s\S]*?<!DOCTYPE html>/;
content = content.replace(regex, topPHP + '\n<!DOCTYPE html>');
fs.writeFileSync(file, content);
console.log('Fixed PHP header');
