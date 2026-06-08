<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Classe Modelo de Usuário (OOP)
 */

require_once __DIR__ . '/../../config/Database.php';

class Usuario {
    private ?int $id = null;
    private string $nome;
    private string $email;
    private string $senha;
    private string $nivel_acesso;
    private ?string $data_criacao = null;
    private array $ambientes_vinculados = [];
    private string $status;
    private PDO $db;

    public function __construct(
        string $nome = '',
        string $email = '',
        string $senha = '',
        string $nivel_acesso = 'Solicitante',
        ?int $id = null,
        ?string $data_criacao = null,
        array $ambientes_vinculados = [],
        string $status = 'Ativo'
    ) {
        $this->nome = $nome;
        $this->email = $email;
        $this->senha = $senha;
        $this->nivel_acesso = $nivel_acesso;
        $this->id = $id;
        $this->data_criacao = $data_criacao;
        $this->ambientes_vinculados = $ambientes_vinculados;
        $this->status = $status;
        $this->db = Database::getConnection();
    }

    // Getters e Setters
    public function getId(): ?int { return $this->id; }
    public function getNome(): string { return $this->nome; }
    public function setNome(string $nome): void { $this->nome = trim($nome); }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): void { $this->email = strtolower(trim($email)); }
    public function getNivelAcesso(): string { return $this->nivel_acesso; }
    public function setNivelAcesso(string $nivel_acesso): void { 
        $niveisValidos = ['Solicitante', 'Gestor', 'Executor', 'Administrador'];
        if (in_array($nivel_acesso, $niveisValidos, true)) {
            $this->nivel_acesso = $nivel_acesso;
        }
    }
    public function getDataCriacao(): ?string { return $this->data_criacao; }
    public function getAmbientesVinculados(): array { return $this->ambientes_vinculados; }
    public function setAmbientesVinculados(array $ambientes): void { $this->ambientes_vinculados = $ambientes; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void {
        $statusValidos = ['Ativo', 'Inativo'];
        if (in_array($status, $statusValidos, true)) {
            $this->status = $status;
        }
    }

    /**
     * Autentica o usuário pelo e-mail e senha.
     *
     * @param string $email
     * @param string $senha
     * @return Usuario|null Retorna a instância do usuário ou null se as credenciais forem inválidas
     */
    public static function autenticar(string $email, string $senha): ?self {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => strtolower(trim($email))]);
        $row = $stmt->fetch();

        if ($row && password_verify($senha, $row['senha']) && ($row['status'] ?? 'Ativo') === 'Ativo') {
            return new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao'],
                isset($row['ambientes_vinculados']) ? (json_decode($row['ambientes_vinculados'], true) ?: []) : [],
                $row['status'] ?? 'Ativo'
            );
        }

        return null;
    }

    /**
     * Salva o usuário no banco de dados (insere ou atualiza).
     *
     * @return bool
     */
    public function salvar(): bool {
        if ($this->id === null) {
            // Inserção de novo usuário
            // Criptografa a senha antes de salvar
            $senhaHash = password_hash($this->senha, PASSWORD_DEFAULT);
            $sql = "INSERT INTO usuarios (nome, email, senha, nivel_acesso, status, ambientes_vinculados) VALUES (:nome, :email, :senha, :nivel_acesso, :status, :ambientes_vinculados)";
            $stmt = $this->db->prepare($sql);
            $success = $stmt->execute([
                'nome' => $this->nome,
                'email' => $this->email,
                'senha' => $senhaHash,
                'nivel_acesso' => $this->nivel_acesso,
                'status' => $this->status,
                'ambientes_vinculados' => json_encode($this->ambientes_vinculados)
            ]);
            if ($success) {
                $this->id = (int)$this->db->lastInsertId();
                return true;
            }
        } else {
            // Atualização de usuário existente (sem alterar a senha diretamente por aqui)
            $sql = "UPDATE usuarios SET nome = :nome, email = :email, nivel_acesso = :nivel_acesso, status = :status, ambientes_vinculados = :ambientes_vinculados WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                'nome' => $this->nome,
                'email' => $this->email,
                'nivel_acesso' => $this->nivel_acesso,
                'status' => $this->status,
                'ambientes_vinculados' => json_encode($this->ambientes_vinculados),
                'id' => $this->id
            ]);
        }
        return false;
    }

    /**
     * Altera a senha do usuário.
     *
     * @param string $novaSenha
     * @return bool
     */
    public function alterarSenha(string $novaSenha): bool {
        if ($this->id === null) return false;
        $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE usuarios SET senha = :senha WHERE id = :id");
        $success = $stmt->execute([
            'senha' => $senhaHash,
            'id' => $this->id
        ]);
        if ($success) {
            $this->senha = $senhaHash;
            return true;
        }
        return false;
    }

    /**
     * Busca um usuário pelo ID.
     *
     * @param int $id
     * @return Usuario|null
     */
    public static function buscarPorId(int $id): ?self {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if ($row) {
            return new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao'],
                isset($row['ambientes_vinculados']) ? (json_decode($row['ambientes_vinculados'], true) ?: []) : [],
                $row['status'] ?? 'Ativo'
            );
        }
        return null;
    }

    /**
     * Busca um usuário pelo e-mail.
     *
     * @param string $email
     * @return Usuario|null
     */
    public static function buscarPorEmail(string $email): ?self {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => strtolower(trim($email))]);
        $row = $stmt->fetch();

        if ($row) {
            return new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao'],
                isset($row['ambientes_vinculados']) ? (json_decode($row['ambientes_vinculados'], true) ?: []) : [],
                $row['status'] ?? 'Ativo'
            );
        }
        return null;
    }

    /**
     * Lista todos os usuários cadastrados.
     *
     * @return Usuario[]
     */
    public static function listarTodos(): array {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM usuarios ORDER BY nome ASC");
        $usuarios = [];
        while ($row = $stmt->fetch()) {
            $usuarios[] = new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao'],
                isset($row['ambientes_vinculados']) ? (json_decode($row['ambientes_vinculados'], true) ?: []) : [],
                $row['status'] ?? 'Ativo'
            );
        }
        return $usuarios;
    }

    /**
     * Lista usuários filtrando pelo seu nível de acesso.
     *
     * @param string $nivel
     * @return Usuario[]
     */
    public static function listarPorNivel(string $nivel): array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE nivel_acesso = :nivel ORDER BY nome ASC");
        $stmt->execute(['nivel' => $nivel]);
        $usuarios = [];
        while ($row = $stmt->fetch()) {
            $usuarios[] = new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao'],
                isset($row['ambientes_vinculados']) ? (json_decode($row['ambientes_vinculados'], true) ?: []) : [],
                $row['status'] ?? 'Ativo'
            );
        }
        return $usuarios;
    }

    /**
     * Exclui um usuário física e definitivamente.
     * Note que chaves estrangeiras com SET NULL/CASCADE cuidarão dos relacionamentos no banco.
     *
     * @return bool
     */
    public function excluir(): bool {
        if ($this->id === null) return false;
        $stmt = $this->db->prepare("DELETE FROM usuarios WHERE id = :id");
        return $stmt->execute(['id' => $this->id]);
    }
}
