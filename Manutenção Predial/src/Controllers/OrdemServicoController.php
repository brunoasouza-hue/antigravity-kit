<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Controlador de Ordens de Serviço Corretivas (PHP OOP)
 */

require_once __DIR__ . '/../Models/OrdemServico.php';
require_once __DIR__ . '/AuthController.php';

class OrdemServicoController {

    public function __construct() {
        // Exige autenticação básica para qualquer ação de Ordem de Serviço
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
     * Ponto de entrada para processar requisições POST/GET destinadas às ordens corretivas.
     */
    public function processarAcao(): void {
        $acao = $_POST['acao'] ?? $_GET['acao'] ?? '';

        switch ($acao) {
            case 'abrir':
                $this->abrir();
                break;
            case 'despachar':
                $this->despachar();
                break;
            case 'finalizar':
                $this->finalizar();
                break;
            case 'validar':
                $this->validar();
                break;
            case 'buscar':
                $this->buscar();
                break;
        }
    }

    /**
     * Registra uma nova Ordem de Serviço (Solicitante).
     */
    private function abrir(): void {
        // Apenas Solicitantes ou Gestores podem abrir OS corretiva
        $nivelAcesso = $_SESSION['usuario_nivel'] ?? '';
        if ($nivelAcesso !== 'Solicitante' && $nivelAcesso !== 'Gestor') {
            $this->retornarResposta(false, "Acesso negado: Apenas solicitantes e gestores podem abrir ordens de serviço.");
        }

        $ambienteId = (int)($_POST['ambiente_id'] ?? 0);
        $descricaoProblema = trim($_POST['descricao_problema'] ?? '');

        // Validações básicas
        if ($ambienteId <= 0) {
            $this->retornarResposta(false, "Selecione um ambiente válido.");
        }

        if ($descricaoProblema === '') {
            $this->retornarResposta(false, "A descrição do problema é obrigatória.");
        }

        // Bloqueio estrito de preenchimentos contendo literal "VAZIO" (case-insensitive)
        if (strcasecmp($descricaoProblema, 'VAZIO') === 0) {
            $this->retornarResposta(false, "Erro: A descrição do problema não pode ser preenchida como 'VAZIO'.");
        }

        $solicitanteId = (int)$_SESSION['usuario_id'];

        try {
            $os = new OrdemServico($solicitanteId, $ambienteId, $descricaoProblema);
            
            if ($os->salvar()) {
                // Carrega dados hidratados para responder ao AJAX
                $osSalva = OrdemServico::buscarPorId($os->getId() ?? 0);
                $dataRetorno = null;
                if ($osSalva !== null) {
                    $dataRetorno = [
                        'id' => $osSalva->getId(),
                        'ambiente_nome' => $osSalva->getAmbienteNome(),
                        'solicitante_nome' => $osSalva->getSolicitanteNome(),
                        'descricao_problema' => $osSalva->getDescricaoProblema(),
                        'status' => $osSalva->getStatus(),
                        'tipo_execucao' => $osSalva->getTipoExecucao(),
                        'data_abertura' => $osSalva->getDataAbertura() ? date('d/m/Y H:i', strtotime($osSalva->getDataAbertura())) : ''
                    ];
                }
                $this->retornarResposta(true, "Ordem de serviço aberta com sucesso!", $dataRetorno);
            } else {
                $this->retornarResposta(false, "Erro ao abrir ordem de serviço. Tente novamente.");
            }
        } catch (InvalidArgumentException $e) {
            $this->retornarResposta(false, $e->getMessage());
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro no banco de dados: " . $e->getMessage());
        }
    }

    /**
     * Despacha uma ordem de serviço atribuindo executor e tipo (Gestor).
     */
    private function despachar(): void {
        $nivelAcesso = $_SESSION['usuario_nivel'] ?? '';
        if ($nivelAcesso !== 'Gestor') {
            $this->retornarResposta(false, "Acesso negado: Apenas gestores podem despachar ordens de serviço.");
        }

        $id = (int)($_POST['id'] ?? 0);
        $executorId = (int)($_POST['executor_id'] ?? 0);
        $tipoExecucao = trim($_POST['tipo_execucao'] ?? 'Interna');

        if ($id <= 0) {
            $this->retornarResposta(false, "Ordem de serviço inválida.");
        }
        if ($executorId <= 0) {
            $this->retornarResposta(false, "Selecione um executor válido.");
        }

        $os = OrdemServico::buscarPorId($id);
        if ($os === null) {
            $this->retornarResposta(false, "Ordem de serviço não encontrada.");
        }

        if ($os->getStatus() !== 'Pendente') {
            $this->retornarResposta(false, "Esta ordem de serviço já foi despachada ou está concluída.");
        }

        $gestorId = (int)$_SESSION['usuario_id'];

        try {
            if ($os->despachar($gestorId, $executorId, $tipoExecucao)) {
                $osSalva = OrdemServico::buscarPorId($id);
                $dataRetorno = null;
                if ($osSalva !== null) {
                    $dataRetorno = [
                        'id' => $osSalva->getId(),
                        'executor_nome' => $osSalva->getExecutorNome(),
                        'gestor_nome' => $osSalva->getGestorNome(),
                        'status' => $osSalva->getStatus(),
                        'tipo_execucao' => $osSalva->getTipoExecucao()
                    ];
                }
                $this->retornarResposta(true, "Ordem de serviço despachada com sucesso!", $dataRetorno);
            } else {
                $this->retornarResposta(false, "Erro ao despachar a ordem de serviço.");
            }
        } catch (InvalidArgumentException $e) {
            $this->retornarResposta(false, $e->getMessage());
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro no banco de dados: " . $e->getMessage());
        }
    }

    /**
     * Finaliza a execução de uma ordem de serviço (Executor).
     */
    private function finalizar(): void {
        $nivelAcesso = $_SESSION['usuario_nivel'] ?? '';
        if ($nivelAcesso !== 'Executor') {
            $this->retornarResposta(false, "Acesso negado: Apenas executores atribuídos podem finalizar serviços.");
        }

        $id = (int)($_POST['id'] ?? 0);
        $relato = trim($_POST['relato_conclusao'] ?? '');

        if ($id <= 0) {
            $this->retornarResposta(false, "Ordem de serviço inválida.");
        }
        if ($relato === '') {
            $this->retornarResposta(false, "O relato do término do serviço é obrigatório.");
        }

        // Banishment check
        if (strcasecmp($relato, 'VAZIO') === 0) {
            $this->retornarResposta(false, "Erro: O relato do término do serviço não pode ser preenchido como 'VAZIO'.");
        }

        $os = OrdemServico::buscarPorId($id);
        if ($os === null) {
            $this->retornarResposta(false, "Ordem de serviço não encontrada.");
        }

        // Garante que o executor atribuído é quem está logado
        if ($os->getExecutorId() !== (int)$_SESSION['usuario_id']) {
            $this->retornarResposta(false, "Acesso negado: Você não é o executor atribuído a esta ordem de serviço.");
        }

        if ($os->getStatus() !== 'Em Execução') {
            $this->retornarResposta(false, "O status desta OS não permite relato de conclusão (precisa estar 'Em Execução').");
        }

        try {
            if ($os->finalizar($relato)) {
                $osSalva = OrdemServico::buscarPorId($id);
                $dataRetorno = null;
                if ($osSalva !== null) {
                    $dataRetorno = [
                        'id' => $osSalva->getId(),
                        'descricao_problema' => $osSalva->getDescricaoProblema(),
                        'status' => $osSalva->getStatus()
                    ];
                }
                $this->retornarResposta(true, "Término de serviço registrado! Enviado para validação do solicitante.", $dataRetorno);
            } else {
                $this->retornarResposta(false, "Erro ao registrar término de serviço.");
            }
        } catch (InvalidArgumentException $e) {
            $this->retornarResposta(false, $e->getMessage());
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro no banco de dados: " . $e->getMessage());
        }
    }

    /**
     * Valida (Aprova ou Recusa) a execução da ordem de serviço (Solicitante).
     */
    private function validar(): void {
        $id = (int)($_POST['id'] ?? 0);
        $decisao = trim($_POST['decisao'] ?? ''); // 'aprovar' ou 'recusar'
        $observacoes = trim($_POST['observacoes_validacao'] ?? '');

        if ($id <= 0) {
            $this->retornarResposta(false, "Ordem de serviço inválida.");
        }
        if ($decisao !== 'aprovar' && $decisao !== 'recusar') {
            $this->retornarResposta(false, "Decisão de validação inválida.");
        }

        // Banishment check
        if (strcasecmp($observacoes, 'VAZIO') === 0) {
            $this->retornarResposta(false, "Erro: As observações não podem ser preenchidas como 'VAZIO'.");
        }

        $os = OrdemServico::buscarPorId($id);
        if ($os === null) {
            $this->retornarResposta(false, "Ordem de serviço não encontrada.");
        }

        // Garante que o solicitante original da OS é quem está logado (ou Gestor como backup auditor)
        $nivelAcesso = $_SESSION['usuario_nivel'] ?? '';
        if ($os->getSolicitanteId() !== (int)$_SESSION['usuario_id'] && $nivelAcesso !== 'Gestor') {
            $this->retornarResposta(false, "Acesso negado: Apenas o solicitante original pode validar este serviço.");
        }

        if ($os->getStatus() !== 'Aguardando Validação') {
            $this->retornarResposta(false, "Esta OS não está aguardando validação.");
        }

        $aprovado = ($decisao === 'aprovar');

        try {
            if ($os->validarOS($aprovado, $observacoes)) {
                $osSalva = OrdemServico::buscarPorId($id);
                $dataRetorno = null;
                if ($osSalva !== null) {
                    $dataRetorno = [
                        'id' => $osSalva->getId(),
                        'descricao_problema' => $osSalva->getDescricaoProblema(),
                        'status' => $osSalva->getStatus(),
                        'data_fechamento' => $osSalva->getDataFechamento() ? date('d/m/Y H:i', strtotime($osSalva->getDataFechamento())) : null
                    ];
                }
                $msg = $aprovado ? "Ordem de serviço concluída e aprovada com sucesso!" : "Serviço recusado! Retornado ao executor em execução.";
                $this->retornarResposta(true, $msg, $dataRetorno);
            } else {
                $this->retornarResposta(false, "Erro ao processar validação da ordem de serviço.");
            }
        } catch (InvalidArgumentException $e) {
            $this->retornarResposta(false, $e->getMessage());
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro no banco de dados: " . $e->getMessage());
        }
    }

    /**
     * Busca dados de uma única OS (Auxiliar AJAX).
     */
    private function buscar(): void {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->retornarResposta(false, "ID inválido.");
        }

        $os = OrdemServico::buscarPorId($id);
        if ($os === null) {
            $this->retornarResposta(false, "Ordem de serviço não encontrada.");
        }

        $this->retornarResposta(true, "OS localizada com sucesso!", [
            'id' => $os->getId(),
            'solicitante_nome' => $os->getSolicitanteNome(),
            'gestor_nome' => $os->getGestorNome(),
            'executor_nome' => $os->getExecutorNome(),
            'ambiente_nome' => $os->getAmbienteNome(),
            'descricao_problema' => $os->getDescricaoProblema(),
            'tipo_execucao' => $os->getTipoExecucao(),
            'status' => $os->getStatus(),
            'data_abertura' => $os->getDataAbertura() ? date('d/m/Y H:i', strtotime($os->getDataAbertura())) : '',
            'data_fechamento' => $os->getDataFechamento() ? date('d/m/Y H:i', strtotime($os->getDataFechamento())) : ''
        ]);
    }

    /**
     * Redireciona de volta para a tela corretiva por padrão.
     */
    private function redirecionar(): void {
        header("Location: " . BASE_URL . "/public/views/corretivas.php");
        exit;
    }
}
