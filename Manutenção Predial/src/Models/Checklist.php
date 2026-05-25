<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Classe Modelo de Checklist (OOP)
 */

require_once __DIR__ . '/../../config/Database.php';

class Checklist {
    private ?int $id = null;
    private int $ambiente_id;
    private int $responsavel_id;
    private string $data_inspecao;
    private string $status_tomadas;
    private string $status_forros;
    private string $status_paredes;
    private string $status_projetor;
    private string $status_tela;
    private string $status_lousa;
    private ?string $observacoes = null;
    private ?string $data_criacao = null;

    // Campos virtuais carregados via JOIN (opcionais)
    private ?string $ambiente_nome = null;
    private ?string $responsavel_nome = null;

    private PDO $db;

    public function __construct(
        int $ambiente_id = 0,
        int $responsavel_id = 0,
        string $data_inspecao = '',
        string $status_tomadas = 'Não se aplica',
        string $status_forros = 'Não se aplica',
        string $status_paredes = 'Não se aplica',
        string $status_projetor = 'Não se aplica',
        string $status_tela = 'Não se aplica',
        string $status_lousa = 'Não se aplica',
        ?string $observacoes = null,
        ?int $id = null,
        ?string $data_criacao = null
    ) {
        $this->ambiente_id = $ambiente_id;
        $this->responsavel_id = $responsavel_id;
        $this->data_inspecao = $data_inspecao;
        $this->status_tomadas = $status_tomadas;
        $this->status_forros = $status_forros;
        $this->status_paredes = $status_paredes;
        $this->status_projetor = $status_projetor;
        $this->status_tela = $status_tela;
        $this->status_lousa = $status_lousa;
        $this->observacoes = $observacoes;
        $this->id = $id;
        $this->data_criacao = $data_criacao;
        $this->db = Database::getConnection();
    }

    // Getters e Setters
    public function getId(): ?int { return $this->id; }
    public function getAmbienteId(): int { return $this->ambiente_id; }
    public function setAmbienteId(int $ambiente_id): void { $this->ambiente_id = $ambiente_id; }
    public function getResponsavelId(): int { return $this->responsavel_id; }
    public function setResponsavelId(int $responsavel_id): void { $this->responsavel_id = $responsavel_id; }
    public function getDataInspecao(): string { return $this->data_inspecao; }
    public function setDataInspecao(string $data_inspecao): void { $this->data_inspecao = trim($data_inspecao); }

    // Auxiliar de validação dos status de ativos
    private function validarStatus(string $status): string {
        $validos = ['Ok', 'Defeito', 'Não se aplica'];
        return in_array($status, $validos, true) ? $status : 'Não se aplica';
    }

    public function getStatusTomadas(): string { return $this->status_tomadas; }
    public function setStatusTomadas(string $status): void { $this->status_tomadas = $this->validarStatus($status); }
    public function getStatusForros(): string { return $this->status_forros; }
    public function setStatusForros(string $status): void { $this->status_forros = $this->validarStatus($status); }
    public function getStatusParedes(): string { return $this->status_paredes; }
    public function setStatusParedes(string $status): void { $this->status_paredes = $this->validarStatus($status); }
    public function getStatusProjetor(): string { return $this->status_projetor; }
    public function setStatusProjetor(string $status): void { $this->status_projetor = $this->validarStatus($status); }
    public function getStatusTela(): string { return $this->status_tela; }
    public function setStatusTela(string $status): void { $this->status_tela = $this->validarStatus($status); }
    public function getStatusLousa(): string { return $this->status_lousa; }
    public function setStatusLousa(string $status): void { $this->status_lousa = $this->validarStatus($status); }

    public function getObservacoes(): ?string { return $this->observacoes; }
    public function setObservacoes(?string $observacoes): void { $this->observacoes = $observacoes !== null ? trim($observacoes) : null; }
    public function getDataCriacao(): ?string { return $this->data_criacao; }

    // Getters para campos virtuais
    public function getAmbienteNome(): ?string { return $this->ambiente_nome; }
    public function setAmbienteNome(?string $nome): void { $this->ambiente_nome = $nome; }
    public function getResponsavelNome(): ?string { return $this->responsavel_nome; }
    public function setResponsavelNome(?string $nome): void { $this->responsavel_nome = $nome; }

    /**
     * Salva o checklist no banco de dados (inserção apenas).
     *
     * @return bool
     */
    public function salvar(): bool {
        if ($this->id !== null) {
            // Checklists de inspeção são registros históricos, não devem ser atualizados após inserção.
            return false;
        }

        $sql = "INSERT INTO checklists (
                    ambiente_id, responsavel_id, data_inspecao,
                    status_tomadas, status_forros, status_paredes,
                    status_projetor, status_tela, status_lousa, observacoes
                ) VALUES (
                    :ambiente_id, :responsavel_id, :data_inspecao,
                    :status_tomadas, :status_forros, :status_paredes,
                    :status_projetor, :status_tela, :status_lousa, :observacoes
                )";
        
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([
            'ambiente_id' => $this->ambiente_id,
            'responsavel_id' => $this->responsavel_id,
            'data_inspecao' => $this->data_inspecao,
            'status_tomadas' => $this->status_tomadas,
            'status_forros' => $this->status_forros,
            'status_paredes' => $this->status_paredes,
            'status_projetor' => $this->status_projetor,
            'status_tela' => $this->status_tela,
            'status_lousa' => $this->status_lousa,
            'observacoes' => $this->observacoes
        ]);

        if ($success) {
            $this->id = (int)$this->db->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Busca um checklist por seu ID.
     *
     * @param int $id
     * @return Checklist|null
     */
    public static function buscarPorId(int $id): ?self {
        $db = Database::getConnection();
        $sql = "SELECT c.*, a.nome_ambiente AS ambiente_nome, u.nome AS responsavel_nome 
                FROM checklists c
                INNER JOIN ambientes a ON c.ambiente_id = a.id
                INNER JOIN usuarios u ON c.responsavel_id = u.id
                WHERE c.id = :id LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if ($row) {
            $c = new self(
                (int)$row['ambiente_id'],
                (int)$row['responsavel_id'],
                $row['data_inspecao'],
                $row['status_tomadas'],
                $row['status_forros'],
                $row['status_paredes'],
                $row['status_projetor'],
                $row['status_tela'],
                $row['status_lousa'],
                $row['observacoes'],
                (int)$row['id'],
                $row['data_criacao']
            );
            $c->setAmbienteNome($row['ambiente_nome']);
            $c->setResponsavelNome($row['responsavel_nome']);
            return $c;
        }

        return null;
    }

    /**
     * Lista todos os checklists cadastrados com seus relacionamentos.
     *
     * @return Checklist[]
     */
    public static function listarTodos(): array {
        $db = Database::getConnection();
        $sql = "SELECT c.*, a.nome_ambiente AS ambiente_nome, u.nome AS responsavel_nome 
                FROM checklists c
                INNER JOIN ambientes a ON c.ambiente_id = a.id
                INNER JOIN usuarios u ON c.responsavel_id = u.id
                ORDER BY c.data_inspecao DESC, c.id DESC";
        
        $stmt = $db->query($sql);
        $list = [];
        while ($row = $stmt->fetch()) {
            $c = new self(
                (int)$row['ambiente_id'],
                (int)$row['responsavel_id'],
                $row['data_inspecao'],
                $row['status_tomadas'],
                $row['status_forros'],
                $row['status_paredes'],
                $row['status_projetor'],
                $row['status_tela'],
                $row['status_lousa'],
                $row['observacoes'],
                (int)$row['id'],
                $row['data_criacao']
            );
            $c->setAmbienteNome($row['ambiente_nome']);
            $c->setResponsavelNome($row['responsavel_nome']);
            $list[] = $c;
        }

        return $list;
    }

    /**
     * Exclui o checklist do banco de dados.
     *
     * @return bool
     */
    public function excluir(): bool {
        if ($this->id === null) return false;
        $stmt = $this->db->prepare("DELETE FROM checklists WHERE id = :id");
        return $stmt->execute(['id' => $this->id]);
    }
}
