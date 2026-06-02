<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Controlador de Ambientes (PHP OOP)
 */

require_once __DIR__ . '/../Models/Ambiente.php';
require_once __DIR__ . '/AuthController.php';

class AmbienteController {

    public function __construct() {
        // Apenas usuários logados e com nível 'Gestor' podem gerenciar ambientes
        AuthController::exigirNivelAcesso(['Gestor']);
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
     * Ponto de entrada para processar requisições POST/GET destinadas aos ambientes.
     */
    public function processarAcao(): void {
        $acao = $_POST['acao'] ?? $_GET['acao'] ?? '';

        switch ($acao) {
            case 'cadastrar':
                $this->cadastrar();
                break;
            case 'editar':
                $this->editar();
                break;
            case 'inativar':
                $this->alterarStatus('Inativo');
                break;
            case 'ativar':
                $this->alterarStatus('Ativo');
                break;
            case 'excluir':
                $this->excluir();
                break;
        }
    }

    /**
     * Cadastra um novo ambiente no banco.
     */
    private function cadastrar(): void {
        $id = (int)($_POST['id'] ?? 0);
        $nome = trim($_POST['nome_ambiente'] ?? '');
        $status = trim($_POST['status'] ?? 'Ativo');

        if ($id <= 0) {
            $this->retornarResposta(false, "O código (ID) do ambiente é obrigatório e deve ser numérico.");
        }

        if (empty($nome)) {
            $this->retornarResposta(false, "O nome do ambiente é obrigatório.");
        }

        if (strcasecmp($nome, 'VAZIO') === 0) {
            $this->retornarResposta(false, "Erro: O nome do ambiente não pode ser 'VAZIO'.");
        }

        try {
            $ambiente = new Ambiente($nome, $status, $id);
            if ($ambiente->salvar()) {
                $this->retornarResposta(true, "Ambiente '{$nome}' cadastrado com sucesso!", [
                    'id' => $ambiente->getId(),
                    'nome_ambiente' => $ambiente->getNomeAmbiente(),
                    'status' => $ambiente->getStatus()
                ]);
            } else {
                $this->retornarResposta(false, "Erro ao salvar o ambiente. Tente novamente.");
            }
        } catch (InvalidArgumentException $e) {
            $this->retornarResposta(false, $e->getMessage());
        } catch (PDOException $e) {
            if ($e->getCode() === '23000' || strpos($e->getMessage(), '1062') !== false) {
                $this->retornarResposta(false, "Erro: Já existe um ambiente cadastrado com o ID ou nome especificado.");
            } else {
                $this->retornarResposta(false, "Erro de banco de dados ao salvar: " . $e->getMessage());
            }
        }
    }

    /**
     * Edita o nome ou status de um ambiente existente.
     */
    private function editar(): void {
        $id = (int)($_POST['id'] ?? 0);
        $nome = trim($_POST['nome_ambiente'] ?? '');
        $status = trim($_POST['status'] ?? 'Ativo');
        $familia = trim($_POST['familia'] ?? 'Geral');

        if ($id <= 0 || empty($nome)) {
            $this->retornarResposta(false, "Dados inválidos para edição.");
        }

        if (strcasecmp($nome, 'VAZIO') === 0) {
            $this->retornarResposta(false, "Erro: O nome do ambiente não pode ser 'VAZIO'.");
        }

        $ambiente = Ambiente::buscarPorId($id);
        if ($ambiente === null) {
            $this->retornarResposta(false, "Ambiente não encontrado.");
        }

        try {
            $ambiente->setNomeAmbiente($nome);
            $ambiente->setStatus($status);
            $ambiente->setFamilia($familia);
            
            if ($ambiente->salvar()) {
                $this->retornarResposta(true, "Ambiente atualizado com sucesso!", [
                    'id' => $ambiente->getId(),
                    'nome_ambiente' => $ambiente->getNomeAmbiente(),
                    'status' => $ambiente->getStatus(),
                    'familia' => $ambiente->getFamilia()
                ]);
            } else {
                $this->retornarResposta(false, "Nenhuma alteração foi realizada.");
            }
        } catch (InvalidArgumentException $e) {
            $this->retornarResposta(false, $e->getMessage());
        } catch (PDOException $e) {
            if ($e->getCode() === '23000' || strpos($e->getMessage(), '1062') !== false) {
                $this->retornarResposta(false, "Erro: Já existe um ambiente cadastrado com o nome '{$nome}'.");
            } else {
                $this->retornarResposta(false, "Erro ao atualizar no banco de dados.");
            }
        }
    }

    /**
     * Altera o status (Ativo/Inativo) de forma segura (Soft Delete).
     *
     * @param string $novoStatus 'Ativo' ou 'Inativo'
     */
    private function alterarStatus(string $novoStatus): void {
        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);

        if ($id <= 0) {
            $this->retornarResposta(false, "ID do ambiente inválido.");
        }

        $ambiente = Ambiente::buscarPorId($id);
        if ($ambiente === null) {
            $this->retornarResposta(false, "Ambiente não encontrado.");
        }

        if ($ambiente->alterarStatus($novoStatus)) {
            $statusMsg = $novoStatus === 'Ativo' ? 'ativado' : 'inativado';
            $this->retornarResposta(true, "Ambiente '{$ambiente->getNomeAmbiente()}' {$statusMsg} com sucesso!", [
                'id' => $ambiente->getId(),
                'nome_ambiente' => $ambiente->getNomeAmbiente(),
                'status' => $ambiente->getStatus()
            ]);
        } else {
            $this->retornarResposta(false, "Erro ao alterar o status do ambiente.");
        }
    }

    /**
     * Exclui fisicamente o ambiente e limpa todas as relações via CASCADE.
     */
    private function excluir(): void {
        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);

        if ($id <= 0) {
            $this->retornarResposta(false, "ID do ambiente inválido para exclusão.");
        }

        $ambiente = Ambiente::buscarPorId($id);
        if ($ambiente === null) {
            $this->retornarResposta(false, "Ambiente não encontrado.");
        }

        $nome = $ambiente->getNomeAmbiente();
        
        if ($ambiente->excluir()) {
            $this->retornarResposta(true, "Ambiente '{$nome}' e todo seu histórico excluídos permanentemente!", [
                'id' => $id
            ]);
        } else {
            $this->retornarResposta(false, "Erro ao excluir o ambiente do banco de dados.");
        }
    }

    /**
     * Redireciona de volta para a tela de gestão de ambientes.
     */
    private function redirecionar(): void {
        header("Location: " . BASE_URL . "/public/views/ambientes.php");
        exit;
    }
}
