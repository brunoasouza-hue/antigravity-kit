<?php
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) { session_start(); }

// Substitua pela sua inclusão real de banco de dados se necessário
try {
    $pdo = new PDO("mysql:host=localhost;dbname=manutencao_predial;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Erro de conexão: ' . $e->getMessage()]);
    exit;
}

try {
    $ambiente_id = $_POST['ambiente_id'] ?? null;
    $prioridade = $_POST['prioridade'] ?? null;
    $descricao = $_POST['descricao_problema'] ?? null;
    $solicitante_id = $_SESSION['usuario_id'] ?? 1; // Padrão 1 para testes caso sessão suma

    if (!$ambiente_id || !$prioridade || !$descricao) {
        throw new Exception("Campos obrigatórios ausentes.");
    }

    $pdo->beginTransaction();

    // Insert na tabela de Ordens de Serviço
    $sql = "INSERT INTO ordens_servico (ambiente_id, solicitante_id, descricao_problema, prioridade, status, data_abertura) 
            VALUES (:ambiente_id, :solicitante_id, :descricao, :prioridade, 'Aberta', NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':ambiente_id' => $ambiente_id,
        ':solicitante_id' => $solicitante_id,
        ':descricao' => $descricao,
        ':prioridade' => $prioridade
    ]);

    $os_id = $pdo->lastInsertId();

    // Insert na tabela de histórico de trâmites
    $sqlHist = "INSERT INTO os_historico_tramites (os_id, origem_usuario_id, status_etapa, observacao_etapa, data_tramite) 
                VALUES (:os_id, :solicitante_id, 'Aberta', 'Ordem de serviço aberta pelo painel.', NOW())";
    $stmtHist = $pdo->prepare($sqlHist);
    $stmtHist->execute([':os_id' => $os_id, ':solicitante_id' => $solicitante_id]);

    $pdo->commit();
    echo json_encode(['sucesso' => true, 'mensagem' => 'OS gravada com sucesso!']);
} catch (Exception $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
}
exit;
