<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Controlador de Checklists Preventivas (PHP OOP)
 */

require_once __DIR__ . '/../Models/Checklist.php';
require_once __DIR__ . '/AuthController.php';

class ChecklistController {

    public function __construct() {
        // Exige autenticação básica para qualquer ação de checklist
        AuthController::verificarAutenticacao();
    }

    /**
     * Auxiliar para detectar se a requisição é AJAX via cabeçalho HTTP ou parâmetro.
     */
    private function isAjax(): bool {
        return (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
            || (isset($_POST['ajax']) && $_POST['ajax'] === '1')
            || (isset($_GET['ajax']) && $_GET['ajax'] === '1');
    }

    /**
     * Envia a resposta adequada (JSON para AJAX, ou sessão + redirecionamento para padrão).
     */
    private function retornarResposta(bool $sucesso, string $mensagem, ?array $data = null): void {
        if ($this->isAjax()) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => $sucesso,
                'message' => $mensagem,
                'data' => $data
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($sucesso) {
            $_SESSION['alerta_sucesso'] = $mensagem;
        } else {
            $_SESSION['alerta_erro'] = $mensagem;
        }
        $this->redirecionar();
    }

    /**
     * Ponto de entrada para processar requisições POST/GET destinadas aos checklists.
     */
    public function processarAcao(): void {
        $acao = $_POST['acao'] ?? $_GET['acao'] ?? '';

        switch ($acao) {
            case 'cadastrar':
                $this->cadastrar();
                break;
            case 'excluir':
                $this->excluir();
                break;
        }
    }

    /**
     * Registra uma nova inspeção preventiva de sala.
     */
    private function cadastrar(): void {
        $ambienteId = (int)($_POST['ambiente_id'] ?? 0);
        $dataInspecao = trim($_POST['data_inspecao'] ?? '');
        $statusTomadas = trim($_POST['status_tomadas'] ?? 'Não se aplica');
        $statusForros = trim($_POST['status_forros'] ?? 'Não se aplica');
        $statusParedes = trim($_POST['status_paredes'] ?? 'Não se aplica');
        $statusProjetor = trim($_POST['status_projetor'] ?? 'Não se aplica');
        $statusTela = trim($_POST['status_tela'] ?? 'Não se aplica');
        $statusLousa = trim($_POST['status_lousa'] ?? 'Não se aplica');
        $observacoes = trim($_POST['observacoes'] ?? '');

        // Validações básicas
        if ($ambienteId <= 0) {
            $this->retornarResposta(false, "Selecione um ambiente válido.");
        }

        if (empty($dataInspecao)) {
            $this->retornarResposta(false, "A data da inspeção é obrigatória.");
        }

        // Validação da proibição da palavra 'VAZIO' (case-insensitive) em qualquer input
        $camposParaValidar = [
            'observacoes' => $observacoes,
            'status_tomadas' => $statusTomadas,
            'status_forros' => $statusForros,
            'status_paredes' => $statusParedes,
            'status_projetor' => $statusProjetor,
            'status_tela' => $statusTela,
            'status_lousa' => $statusLousa
        ];

        foreach ($camposParaValidar as $campo => $valor) {
            if (strcasecmp($valor, 'VAZIO') === 0) {
                $this->retornarResposta(false, "Erro: O preenchimento do campo {$campo} não pode ser 'VAZIO'.");
            }
        }

        $responsavelId = (int)$_SESSION['usuario_id'];

        try {
            $checklist = new Checklist(
                $ambienteId,
                $responsavelId,
                $dataInspecao,
                $statusTomadas,
                $statusForros,
                $statusParedes,
                $statusProjetor,
                $statusTela,
                $statusLousa,
                empty($observacoes) ? null : $observacoes
            );

            if ($checklist->salvar()) {
                // Busca o log cadastrado para retornar seus dados hidratados
                $logSalvo = Checklist::buscarPorId($checklist->getId() ?? 0);
                $dataRetorno = null;
                if ($logSalvo !== null) {
                    $dataRetorno = [
                        'id' => $logSalvo->getId(),
                        'ambiente_nome' => $logSalvo->getAmbienteNome(),
                        'responsavel_nome' => $logSalvo->getResponsavelNome(),
                        'data_inspecao' => $logSalvo->getDataInspecao(),
                        'status_tomadas' => $logSalvo->getStatusTomadas(),
                        'status_forros' => $logSalvo->getStatusForros(),
                        'status_paredes' => $logSalvo->getStatusParedes(),
                        'status_projetor' => $logSalvo->getStatusProjetor(),
                        'status_tela' => $logSalvo->getStatusTela(),
                        'status_lousa' => $logSalvo->getStatusLousa(),
                        'observacoes' => $logSalvo->getObservacoes()
                    ];
                }

                $this->retornarResposta(true, "Inspeção preventiva registrada com sucesso!", $dataRetorno);
            } else {
                $this->retornarResposta(false, "Erro ao registrar inspeção. Tente novamente.");
            }
        } catch (InvalidArgumentException $e) {
            $this->retornarResposta(false, $e->getMessage());
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro no banco de dados: " . $e->getMessage());
        }

        // TRIGGER DE AUTOMAÇÃO (Gerar O.S. Corretiva se houver defeito)
        try {
            $defeitos = [];
            if ($statusTomadas === 'Defeito') $defeitos[] = 'Tomadas';
            if ($statusForros === 'Defeito') $defeitos[] = 'Forros';
            if ($statusParedes === 'Defeito') $defeitos[] = 'Paredes';
            if ($statusProjetor === 'Defeito') $defeitos[] = 'Projetor';
            if ($statusTela === 'Defeito') $defeitos[] = 'Tela';
            if ($statusLousa === 'Defeito') $defeitos[] = 'Lousa';

            if (!empty($defeitos) && isset($checklist) && $checklist->getId() !== null) {
                // Instanciar model OrdemServico
                require_once __DIR__ . '/../Models/OrdemServico.php';
                $descricaoAutomatica = "Correção gerada automaticamente: Defeito(s) encontrado(s) em " . implode(', ', $defeitos) . ".\n\nObservações do checklist:\n" . ($observacoes ? $observacoes : "Sem observações adicionais.");
                
                $osCorretiva = new OrdemServico(
                    $responsavelId, // Solicitante será o mesmo responsável pelo checklist
                    $ambienteId,
                    $descricaoAutomatica,
                    'Interna',
                    'Pendente'
                );
                $osCorretiva->salvar();
            }
        } catch (Exception $e) {
            // Log do erro de trigger (não impede o fluxo principal)
            error_log("Erro ao gerar O.S corretiva automatizada: " . $e->getMessage());
        }
    }

    /**
     * Exclui uma inspeção preventiva de sala (Privilégio restrito a Gestores).
     */
    private function excluir(): void {
        // Apenas Gestores possuem privilégio para remover logs de manutenção/inspeção do histórico
        $nivelUsuario = $_SESSION['usuario_nivel'] ?? '';
        if ($nivelUsuario !== 'Gestor') {
            $this->retornarResposta(false, "Acesso negado: Apenas gestores podem excluir logs do histórico.");
        }

        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);

        if ($id <= 0) {
            $this->retornarResposta(false, "ID da inspeção preventiva inválido para exclusão.");
        }

        $checklist = Checklist::buscarPorId($id);
        if ($checklist === null) {
            $this->retornarResposta(false, "Registro de inspeção preventiva não encontrado.");
        }

        try {
            if ($checklist->excluir()) {
                $this->retornarResposta(true, "Registro de inspeção preventiva #{$id} removido com sucesso!", ['id' => $id]);
            } else {
                $this->retornarResposta(false, "Erro ao excluir o registro de inspeção do banco de dados.");
            }
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro no banco de dados ao excluir: " . $e->getMessage());
        }
    }

    /**
     * Redireciona de volta para a tela de gestão de preventivas.
     */
    private function redirecionar(): void {
        header("Location: " . BASE_URL . "/public/views/preventivas.php");
        exit;
    }
}
