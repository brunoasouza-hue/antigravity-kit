const fs = require('fs');
let code = fs.readFileSync('src/Controllers/UsuarioController.php', 'utf8');

const criarLogic = `
            case 'criar':
                $this->criarUsuario();
                break;`;

code = code.replace(
    "            case 'alterar_nivel':",
    criarLogic + "\n            case 'alterar_nivel':"
);

const criarMethod = `
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
`;

code = code.replace(
    '    private function alterarNivel(): void {',
    criarMethod + '\n    private function alterarNivel(): void {'
);

fs.writeFileSync('src/Controllers/UsuarioController.php', code);
console.log('UsuarioController.php updated');
