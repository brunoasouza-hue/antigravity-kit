<?php
declare(strict_types=1);

require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Models/OrdemServico.php';
require_once __DIR__ . '/../../src/Models/Usuario.php';

// Exige autenticação
AuthController::verificarAutenticacao();

header('Content-Type: application/json; charset=utf-8');

$os_id = isset($_GET['os_id']) ? (int)$_GET['os_id'] : 0;

if ($os_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de O.S inválido.']);
    exit;
}

try {
    $db = Database::getConnection();
    
    // Busca dados da O.S. (com joins já feitos no model)
    $os = OrdemServico::buscarPorId($os_id);
    
    if (!$os) {
        echo json_encode(['success' => false, 'message' => 'O.S. não localizada.']);
        exit;
    }

    // Busca Histórico de Trâmites
    $sqlHistorico = "SELECT h.*, 
                            uo.nome as origem_nome, 
                            ud.nome as destino_nome 
                     FROM os_historico_tramites h
                     LEFT JOIN usuarios uo ON h.origem_usuario_id = uo.id
                     LEFT JOIN usuarios ud ON h.destino_usuario_id = ud.id
                     WHERE h.os_id = :os_id 
                     ORDER BY h.data_tramite ASC";
                     
    $stmt = $db->prepare($sqlHistorico);
    $stmt->execute(['os_id' => $os_id]);
    $historico = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatação de datas
    foreach ($historico as &$h) {
        $h['data_formatada'] = date('d/m/Y H:i', strtotime($h['data_tramite']));
    }

    $response = [
        'success' => true,
        'os' => [
            'id' => $os->getId(),
            'ambiente' => $os->getAmbienteNome(),
            'solicitante' => $os->getSolicitanteNome(),
            'solicitante_id' => $os->getSolicitanteId(),
            'executor_atual' => $os->getExecutorNome(),
            'executor_atual_id' => $os->getExecutorAtualId(),
            'status' => $os->getStatus(),
            'descricao' => $os->getDescricaoProblema(),
            'data_abertura' => date('d/m/Y H:i', strtotime($os->getDataAbertura() ?? ''))
        ],
        'historico' => $historico
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
