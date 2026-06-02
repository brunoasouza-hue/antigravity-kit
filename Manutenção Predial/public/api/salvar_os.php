<?php
// public/api/salvar_os.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';
session_start();

// Verifica se a sessão do usuário/Gestor existe
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['sucesso' => false, 'erro' => 'Sessão expirada. Faça login novamente.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['sucesso' => false, 'erro' => 'Método inválido.']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $pdo->beginTransaction();

    // Captura dos dados com Sanitização
    $ambiente_id    = filter_input(INPUT_POST, 'ambiente_id', FILTER_VALIDATE_INT);
    $prioridade     = filter_input(INPUT_POST, 'prioridade', FILTER_SANITIZE_STRING);
    $descricao      = trim($_POST['descricao_problema'] ?? '');
    $solicitante_id = $_SESSION['usuario_id']; // O Gestor logado

    // Validação estrita
    if (!$ambiente_id || empty($prioridade) || empty($descricao)) {
        throw new Exception('Por favor, preencha todos os campos obrigatórios corretamente.');
    }

    // Executa o INSERT na Tabela Principal (ordens_servico)
    $sqlOS = "INSERT INTO ordens_servico 
              (ambiente_id, solicitante_id, descricao_problema, tipo_execucao, status, prioridade, data_abertura) 
              VALUES (:ambiente_id, :solicitante_id, :descricao, 'Interna', 'Pendente', :prioridade, NOW())";
              
    $stmtOS = $pdo->prepare($sqlOS);
    $stmtOS->execute([
        ':ambiente_id'    => $ambiente_id,
        ':solicitante_id' => $solicitante_id,
        ':descricao'      => $descricao,
        ':prioridade'     => $prioridade
    ]);

    // Pega o ID gerado da nova O.S.
    $os_id = $pdo->lastInsertId();

    // Executa o INSERT no Histórico de Trâmites (Gatilho Inicial)
    $sqlHist = "INSERT INTO os_historico_tramites 
                (os_id, origem_usuario_id, status_etapa, observacao_etapa, data_tramite) 
                VALUES (:os_id, :origem_id, 'Abertura Oficial', :observacao, NOW())";
                
    $stmtHist = $pdo->prepare($sqlHist);
    $observacao = "Ordem de Serviço registrada via painel gerencial. Prioridade definida como: " . $prioridade;
    
    $stmtHist->execute([
        ':os_id'      => $os_id,
        ':origem_id'  => $solicitante_id,
        ':observacao' => $observacao
    ]);

    // Confirma a gravação de ambas as tabelas
    $pdo->commit();

    echo json_encode(['sucesso' => true, 'mensagem' => 'O.S. #' . $os_id . ' gravada com sucesso!']);

} catch (Exception $e) {
    // Se ocorrer qualquer erro, desfaz TUDO (Rollback) para evitar banco quebrado
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
}
?>
