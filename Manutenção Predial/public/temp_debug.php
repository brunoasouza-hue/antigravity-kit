<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config/config.php';
require_once 'src/Models/OrdemServico.php';

try {
    $db = Database::getConnection();
    $sql = "SELECT os.*, amb.nome_ambiente, solic.nome AS nome_solicitante, exec.nome AS nome_executor_atual 
            FROM ordens_servico os 
            LEFT JOIN ambientes amb ON os.ambiente_id = amb.id 
            LEFT JOIN usuarios solic ON os.solicitante_id = solic.id 
            LEFT JOIN usuarios exec ON os.executor_atual_id = exec.id 
            WHERE os.tipo = 'Corretivo' OR os.tipo IS NULL OR os.tipo = '' 
            ORDER BY os.id DESC";
    $dados = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    $ordensServico = [];
    foreach ($dados as $dado) {
        $os = new OrdemServico(
            (int)($dado['ambiente_id'] ?? 0),
            (int)($dado['solicitante_id'] ?? 0),
            $dado['descricao_problema'] ?? '',
            $dado['prioridade'] ?? 'Baixa'
        );
        $os->setId($dado['id']);
        $ordensServico[] = $os;
    }
    echo "SUCCESS: " . count($ordensServico) . " records loaded.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
} catch (Error $e) {
    echo "FATAL ERROR: " . $e->getMessage();
}
