<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Controlador de Usuários (Administração)
 */

require_once __DIR__ . '/../Models/Usuario.php';
require_once __DIR__ . '/AuthController.php';

class UsuarioController {

    public function __construct() {
        // Exige autenticação básica
        AuthController::verificarAutenticacao();
    }

    private function isAjax(): bool {
        return (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
            || (isset($_POST['ajax']) && $_POST['ajax'] === '1');
    }

    private function retornarResposta(bool $sucesso, string $mensagem, ?array $data = null): void {
        if ($this->isAjax()) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => $sucesso, 'message' => $mensagem, 'data' => $data], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($sucesso) {
            $_SESSION['alerta_sucesso'] = $mensagem;
        } else {
            $_SESSION['alerta_erro'] = $mensagem;
        }
        header("Location: " . BASE_URL . "/public/views/usuarios.php");
        exit;
    }

    public function processarAcao(): void {
        // Exclusivo para Administrador
        AuthController::exigirNivelAcesso(['Administrador']);

        $acao = $_POST['acao'] ?? '';

        switch ($acao) {

            case 'criar':
                $this->criarUsuario();
                break;
            case 'editar_usuario':
                $this->editarUsuario();
                break;
            case 'alterar_nivel':
                $this->alterarNivel();
                break;
            case 'alterar_status':
                $this->alterarStatus();
                break;
            default:
                $this->retornarResposta(false, "Ação inválida.");
        }
    }


    private function criarUsuario(): void {
        $nome = trim($_POST['nome'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $nivelAcesso = trim($_POST['nivel_acesso'] ?? 'Solicitante');
        $ambientesPost = $_POST['ambientes_vinculados'] ?? [];
        
        // Ensure ambientes is an array of ints
        $ambientesVinculados = [];
        if (is_array($ambientesPost)) {
            foreach ($ambientesPost as $ambId) {
                if ((int)$ambId > 0) {
                    $ambientesVinculados[] = (int)$ambId;
                }
            }
        }

        if (empty($nome) || empty($email)) {
            $this->retornarResposta(false, "Nome e e-mail são obrigatórios.");
        }

        if (Usuario::buscarPorEmail($email) !== null) {
            $this->retornarResposta(false, "Já existe um usuário cadastrado com este e-mail.");
        }

        $usuario = new Usuario($nome, $email, "senai123", $nivelAcesso, null, null, $ambientesVinculados);

        try {
            if ($usuario->salvar()) {
                $this->retornarResposta(true, "Usuário criado com sucesso. A senha padrão é 'senai123'.");
            } else {
                $this->retornarResposta(false, "Erro ao tentar salvar o usuário no banco de dados.");
            }
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro no Banco de Dados: " . $e->getMessage());
        }
    }

    private function editarUsuario(): void {
        $id = (int)($_POST['id'] ?? 0);
        $nome = trim($_POST['nome'] ?? '');
        $nivelAcesso = trim($_POST['nivel_acesso'] ?? '');
        $ambientesPost = $_POST['ambientes_vinculados'] ?? [];

        if ($id <= 0) {
            $this->retornarResposta(false, "ID de usuário inválido.");
        }

        if (empty($nome)) {
            $this->retornarResposta(false, "O nome do usuário não pode ser vazio.");
        }

        $usuario = Usuario::buscarPorId($id);
        if ($usuario === null) {
            $this->retornarResposta(false, "Usuário não localizado no banco de dados.");
        }

        // Bloquear alteração do próprio nível se for o único admin, ou rebaixamento próprio
        if ($id === (int)$_SESSION['usuario_id'] && $nivelAcesso !== 'Administrador') {
            $this->retornarResposta(false, "Você não pode alterar seu próprio nível de acesso por segurança.");
        }

        $usuario->setNome($nome);
        
        $niveisPermitidos = ['Solicitante', 'Gestor', 'Executor', 'Administrador'];
        if (in_array($nivelAcesso, $niveisPermitidos, true)) {
            $usuario->setNivelAcesso($nivelAcesso);
        }

        // Filtra e normaliza os ambientes vinculados
        $ambientesVinculados = [];
        if (is_array($ambientesPost)) {
            foreach ($ambientesPost as $ambId) {
                if ((int)$ambId > 0) {
                    $ambientesVinculados[] = (int)$ambId;
                }
            }
        }
        $usuario->setAmbientesVinculados($ambientesVinculados);

        try {
            if ($usuario->salvar()) {
                $this->retornarResposta(true, "Dados do usuário " . $usuario->getNome() . " atualizados com sucesso!");
            } else {
                $this->retornarResposta(false, "Falha ao salvar as alterações no banco de dados.");
            }
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro de Banco de Dados: " . $e->getMessage());
        }
    }

    private function alterarNivel(): void {
        $id = (int)($_POST['id'] ?? 0);
        $novoNivel = trim($_POST['nivel_acesso'] ?? '');

        if ($id <= 0) {
            $this->retornarResposta(false, "ID de usuário inválido.");
        }

        $niveisPermitidos = ['Solicitante', 'Gestor', 'Executor', 'Administrador'];
        if (!in_array($novoNivel, $niveisPermitidos, true)) {
            $this->retornarResposta(false, "Nível de acesso selecionado é inválido.");
        }

        $usuario = Usuario::buscarPorId($id);
        if ($usuario === null) {
            $this->retornarResposta(false, "Usuário não localizado no banco de dados.");
        }

        // Bloquear alteração do próprio nível se for o único admin, mas para simplificar:
        if ($id === (int)$_SESSION['usuario_id'] && $novoNivel !== 'Administrador') {
            $this->retornarResposta(false, "Você não pode rebaixar a si mesmo (Segurança).");
        }

        $usuario->setNivelAcesso($novoNivel);
        
        try {
            if ($usuario->salvar()) {
                $this->retornarResposta(true, "Nível de acesso de " . $usuario->getNome() . " atualizado para " . $novoNivel . " com sucesso!", [
                    'id' => $usuario->getId(),
                    'nivel_acesso' => $usuario->getNivelAcesso()
                ]);
            } else {
                $this->retornarResposta(false, "Falha ao salvar as alterações no banco de dados.");
            }
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro de Banco de Dados: " . $e->getMessage());
        }
    }

    private function alterarStatus(): void {
        $id = (int)($_POST['id'] ?? 0);
        $novoStatus = trim($_POST['status'] ?? '');

        if ($id <= 0) {
            $this->retornarResposta(false, "ID de usuário inválido.");
        }

        $statusValidos = ['Ativo', 'Inativo'];
        if (!in_array($novoStatus, $statusValidos, true)) {
            $this->retornarResposta(false, "Status selecionado é inválido.");
        }

        $usuario = Usuario::buscarPorId($id);
        if ($usuario === null) {
            $this->retornarResposta(false, "Usuário não localizado no banco de dados.");
        }

        // Bloquear desativação do próprio usuário logado
        if ($id === (int)$_SESSION['usuario_id']) {
            $this->retornarResposta(false, "Você não pode desativar sua própria conta.");
        }

        $usuario->setStatus($novoStatus);
        
        try {
            if ($usuario->salvar()) {
                $msg = $novoStatus === 'Inativo' ? 'desativado' : 'ativado';
                $this->retornarResposta(true, "Usuário " . $usuario->getNome() . " " . $msg . " com sucesso!", [
                    'id' => $usuario->getId(),
                    'status' => $usuario->getStatus()
                ]);
            } else {
                $this->retornarResposta(false, "Falha ao salvar as alterações no banco de dados.");
            }
        } catch (PDOException $e) {
            $this->retornarResposta(false, "Erro de Banco de Dados: " . $e->getMessage());
        }
    }
}
