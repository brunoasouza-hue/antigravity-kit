<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Controlador de Autenticação (PHP OOP)
 */

require_once __DIR__ . '/../Models/Usuario.php';

class AuthController {
    
    public function __construct() {
        // Assegura que a sessão está ativa
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * Processa a tentativa de login de um usuário.
     *
     * @param string $email
     * @param string $senha
     * @return bool Retorna true se o login foi bem-sucedido, false caso contrário
     */
    public function login(string $email, string $senha): bool {
        $email = trim($email);
        $senha = trim($senha);

        if (empty($email) || empty($senha)) {
            $_SESSION['auth_error'] = "Preencha todos os campos obrigatórios.";
            return false;
        }

        $usuario = Usuario::autenticar($email, $senha);

        if ($usuario !== null) {
            // Login de sucesso - Define variáveis de sessão seguras
            $_SESSION['usuario_id'] = $usuario->getId();
            $_SESSION['usuario_nome'] = $usuario->getNome();
            $_SESSION['usuario_email'] = $usuario->getEmail();
            $_SESSION['usuario_nivel'] = $usuario->getNivelAcesso();
            
            // Limpa erros anteriores
            unset($_SESSION['auth_error']);
            return true;
        }

        $_SESSION['auth_error'] = "E-mail ou senha incorretos.";
        return false;
    }

    /**
     * Realiza o encerramento da sessão do usuário (Logout).
     */
    public function logout(): void {
        // Limpa todas as variáveis de sessão
        $_SESSION = [];

        // Destrói os cookies de sessão no navegador se existirem
        if (ini_get("use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        // Destrói a sessão no servidor
        session_destroy();
    }

    /**
     * Verifica se o usuário está devidamente autenticado no sistema.
     * Caso contrário, bloqueia e redireciona para a tela de login.
     */
    public static function verificarAutenticacao(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['usuario_id'])) {
            // Redireciona para o login caso tente acessar páginas internas diretamente
            header("Location: " . BASE_URL . "/public/index.php");
            exit;
        }
    }

    /**
     * Restringe a página a níveis específicos de acesso.
     * Ex: Exigir nível "Gestor" para tela de ambientes.
     *
     * @param array $niveisPermitidos Lista de níveis permitidos. Ex: ['Gestor', 'Executor']
     */
    public static function exigirNivelAcesso(array $niveisPermitidos): void {
        self::verificarAutenticacao();

        $nivelUsuario = $_SESSION['usuario_nivel'] ?? '';

        if (!in_array($nivelUsuario, $niveisPermitidos, true)) {
            // Acesso negado - Redireciona para a tela inicial Home com mensagem de erro de permissão
            $_SESSION['alerta_erro'] = "Acesso negado: Seu perfil (" . $nivelUsuario . ") não possui permissão para acessar esta área.";
            header("Location: " . BASE_URL . "/public/views/home.php");
            exit;
        }
    }
}
