<?php
declare(strict_types=1);
require_once __DIR__ . '/../Models/AdministracaoUsuario.php';
require_once __DIR__ . '/AuthController.php';

class UsuarioController {
    public function __construct() { AuthController::verificarAutenticacao(); }
    private function isAjax(): bool {
        return strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest' || ($_POST['ajax'] ?? '') === '1';
    }
    private function retornarResposta(bool $sucesso, string $mensagem): void {
        if ($this->isAjax()) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success'=>$sucesso,'message'=>$mensagem], JSON_UNESCAPED_UNICODE);
        } else {
            $_SESSION[$sucesso ? 'alerta_sucesso' : 'alerta_erro'] = $mensagem;
            header('Location: ' . BASE_URL . '/public/views/usuarios.php');
        }
        exit;
    }
    public function processarAcao(): void {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            http_response_code(405);
            header('Allow: POST');
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success'=>false,'message'=>'Utilize POST para esta operação.']);
            exit;
        }
        if (!AuthController::temNivelAcesso(['Gestor'])) {
            http_response_code(403);
            $this->retornarResposta(false, 'Acesso negado.');
        }
        $token = $_POST['csrf_token'] ?? '';
        if (!is_string($token) || !hash_equals(AuthController::tokenCsrf(), $token)) {
            http_response_code(403);
            $this->retornarResposta(false, 'Confirmação de segurança inválida. Atualize a página.');
        }
        try {
            $acao = (string)($_POST['acao'] ?? '');
            AdministracaoUsuario::executar((int)$_SESSION['usuario_id'], $acao, (int)($_POST['id'] ?? 0), $_POST);
            $this->retornarResposta(true, $acao === 'resetar_senha' ? 'Senha redefinida com sucesso.' : 'Usuário atualizado com sucesso.');
        } catch (DomainException $e) {
            http_response_code(403);
            $this->retornarResposta(false, $e->getMessage());
        } catch (Throwable $e) {
            error_log('Falha na administração de usuários: ' . get_class($e));
            http_response_code(500);
            $this->retornarResposta(false, 'Não foi possível concluir a operação. Nenhuma alteração foi confirmada.');
        }
    }
}

// Este arquivo também é o endpoint usado pelos formulários existentes.
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    (new UsuarioController())->processarAcao();
}
