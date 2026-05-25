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
            case 'alterar_nivel':
                $this->alterarNivel();
                break;
            default:
                $this->retornarResposta(false, "Ação inválida.");
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
}
