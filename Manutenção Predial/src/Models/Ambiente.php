<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Classe Modelo de Ambiente (OOP)
 */

require_once __DIR__ . '/../../config/Database.php';

class Ambiente {
    private ?int $id = null;
    private string $nome_ambiente;
    private string $status;
    private PDO $db;

    public function __construct(
        string $nome_ambiente = '',
        string $status = 'Ativo',
        ?int $id = null
    ) {
        $this->nome_ambiente = trim($nome_ambiente);
        $this->status = $status;
        $this->id = $id;
        $this->db = Database::getConnection();
    }

    // Getters e Setters
    public function getId(): ?int { return $this->id; }
    
    public function setId(int $id): void {
        $this->id = $id;
    }
    
    public function getNomeAmbiente(): string { return $this->nome_ambiente; }
    
    public function setNomeAmbiente(string $nome_ambiente): void { 
        $this->nome_ambiente = trim($nome_ambiente); 
    }
    
    public function getStatus(): string { return $this->status; }
    
    public function setStatus(string $status): void { 
        $statusValidos = ['Ativo', 'Inativo'];
        if (in_array($status, $statusValidos, true)) {
            $this->status = $status;
        }
    }

    /**
     * Valida as regras de negócio para o nome do ambiente.
     * Deve impedir nomes vazios ou o termo literal "VAZIO".
     *
     * @return bool Retorna true se for válido, ou lança exceção em caso de invalidade.
     * @throws InvalidArgumentException
     */
    public function validar(): bool {
        $nomeLimpo = strtoupper(trim($this->nome_ambiente));
        
        if ($nomeLimpo === '') {
            throw new InvalidArgumentException("O nome do ambiente não pode ser vazio.");
        }
        
        if ($nomeLimpo === 'VAZIO') {
            throw new InvalidArgumentException("O nome do ambiente não pode ser 'VAZIO'.");
        }
        
        return true;
    }

    /**
     * Salva o ambiente no banco de dados (inserção ou atualização).
     *
     * @return bool
     * @throws InvalidArgumentException
     */
    public function salvar(): bool {
        // Valida regras de negócio antes de interagir com o BD
        $this->validar();

        if ($this->id === null) {
            throw new InvalidArgumentException("O ID do ambiente é obrigatório.");
        }

        // Verifica se já existe um registro com este ID no banco
        $existe = self::buscarPorId($this->id) !== null;

        if (!$existe) {
            // Inserção
            $sql = "INSERT INTO ambientes (id, nome_ambiente, status) VALUES (:id, :nome_ambiente, :status)";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                'id' => $this->id,
                'nome_ambiente' => $this->nome_ambiente,
                'status' => $this->status
            ]);
        } else {
            // Atualização
            $sql = "UPDATE ambientes SET nome_ambiente = :nome_ambiente, status = :status WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                'nome_ambiente' => $this->nome_ambiente,
                'status' => $this->status,
                'id' => $this->id
            ]);
        }
    }

    /**
     * Inativa (ou Ativa) o ambiente logicamente no sistema (Soft Delete).
     * Ideal para manter a integridade histórica de OS e checklists vinculados.
     *
     * @param string $novoStatus 'Ativo' ou 'Inativo'
     * @return bool
     */
    public function alterarStatus(string $novoStatus): bool {
        if ($this->id === null) return false;
        
        $novoStatus = trim($novoStatus);
        if (!in_array($novoStatus, ['Ativo', 'Inativo'], true)) {
            return false;
        }

        $stmt = $this->db->prepare("UPDATE ambientes SET status = :status WHERE id = :id");
        $success = $stmt->execute([
            'status' => $novoStatus,
            'id' => $this->id
        ]);
        if ($success) {
            $this->status = $novoStatus;
            return true;
        }
        return false;
    }

    /**
     * Exclui o ambiente física e definitivamente do banco de dados (Hard Delete).
     * O 'ON DELETE CASCADE' garante que checklists e OS associadas também sejam limpos.
     *
     * @return bool
     */
    public function excluir(): bool {
        if ($this->id === null) return false;
        $stmt = $this->db->prepare("DELETE FROM ambientes WHERE id = :id");
        return $stmt->execute(['id' => $this->id]);
    }

    /**
     * Busca um ambiente pelo seu ID.
     *
     * @param int $id
     * @return Ambiente|null
     */
    public static function buscarPorId(int $id): ?self {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM ambientes WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if ($row) {
            return new self(
                $row['nome_ambiente'],
                $row['status'],
                (int)$row['id']
            );
        }
        return null;
    }

    /**
     * Lista todos os ambientes cadastrados no banco (para telas administrativas).
     *
     * @return Ambiente[]
     */
    public static function listarTodos(): array {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM ambientes ORDER BY id ASC");
        $ambientes = [];
        while ($row = $stmt->fetch()) {
            $ambientes[] = new self(
                $row['nome_ambiente'],
                $row['status'],
                (int)$row['id']
            );
        }
        return $ambientes;
    }

    /**
     * Lista apenas os ambientes que estão com status 'Ativo' (para dropdowns de criação de OS e preventivas).
     *
     * @return Ambiente[]
     */
    public static function listarAtivos(): array {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM ambientes WHERE status = 'Ativo' ORDER BY id ASC");
        $ambientes = [];
        while ($row = $stmt->fetch()) {
            $ambientes[] = new self(
                $row['nome_ambiente'],
                $row['status'],
                (int)$row['id']
            );
        }
        return $ambientes;
    }
}
