<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Classe Modelo de Inspeção Geral (Sessão de Inspeções)
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/InspecaoPainel.php';

class InspecaoGeral {
    private ?int $id = null;
    private string $unidade;
    private string $data_inspecao;
    private int $responsavel_id;
    private ?string $observacoes = null;
    private string $status; // 'Em Andamento', 'Encerrada'
    private ?string $data_criacao = null;

    // Campo virtual carregado via JOIN
    private ?string $responsavel_nome = null;

    private PDO $db;

    public function __construct(
        string $unidade = 'SENAI',
        string $data_inspecao = '',
        int $responsavel_id = 0,
        ?string $observacoes = null,
        string $status = 'Em Andamento',
        ?int $id = null,
        ?string $data_criacao = null
    ) {
        $this->unidade = $unidade;
        $this->data_inspecao = $data_inspecao;
        $this->responsavel_id = $responsavel_id;
        $this->observacoes = $observacoes;
        $this->status = $status;
        $this->id = $id;
        $this->data_criacao = $data_criacao;
        $this->db = Database::getConnection();
    }

    // Getters e Setters
    public function getId(): ?int { return $this->id; }
    public function getUnidade(): string { return $this->unidade; }
    public function setUnidade(string $unidade): void { $this->unidade = trim($unidade); }
    public function getDataInspecao(): string { return $this->data_inspecao; }
    public function setDataInspecao(string $data_inspecao): void { $this->data_inspecao = trim($data_inspecao); }
    public function getResponsavelId(): int { return $this->responsavel_id; }
    public function setResponsavelId(int $responsavel_id): void { $this->responsavel_id = $responsavel_id; }
    public function getObservacoes(): ?string { return $this->observacoes; }
    public function setObservacoes(?string $observacoes): void { $this->observacoes = $observacoes !== null ? trim($observacoes) : null; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void { $this->status = $status; }
    public function getDataCriacao(): ?string { return $this->data_criacao; }

    public function getResponsavelNome(): ?string { return $this->responsavel_nome; }
    public function setResponsavelNome(?string $nome): void { $this->responsavel_nome = $nome; }

    /**
     * Salva a inspeção geral no banco de dados.
     *
     * @return bool
     */
    public function salvar(): bool {
        if ($this->id !== null) {
            return $this->atualizar();
        }

        $sql = "INSERT INTO inspecoes_geral (
                    unidade, data_inspecao, responsavel_id, observacoes, status
                ) VALUES (
                    :unidade, :data_inspecao, :responsavel_id, :observacoes, :status
                )";
        
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([
            'unidade' => $this->unidade,
            'data_inspecao' => $this->data_inspecao,
            'responsavel_id' => $this->responsavel_id,
            'observacoes' => $this->observacoes,
            'status' => $this->status
        ]);

        if ($success) {
            $this->id = (int)$this->db->lastInsertId();
            return true;
        }

        return false;
    }

    public function atualizar(): bool {
        $sql = "UPDATE inspecoes_geral SET 
                    unidade = :unidade, 
                    data_inspecao = :data_inspecao, 
                    responsavel_id = :responsavel_id, 
                    observacoes = :observacoes,
                    status = :status
                WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id' => $this->id,
            'unidade' => $this->unidade,
            'data_inspecao' => $this->data_inspecao,
            'responsavel_id' => $this->responsavel_id,
            'observacoes' => $this->observacoes,
            'status' => $this->status
        ]);
    }

    /**
     * Busca uma inspeção geral por seu ID.
     *
     * @param int $id
     * @return InspecaoGeral|null
     */
    public static function buscarPorId(int $id): ?self {
        $db = Database::getConnection();
        $sql = "SELECT ig.*, u.nome AS responsavel_nome 
                FROM inspecoes_geral ig
                INNER JOIN usuarios u ON ig.responsavel_id = u.id
                WHERE ig.id = :id LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if ($row) {
            $ins = new self(
                $row['unidade'],
                $row['data_inspecao'],
                (int)$row['responsavel_id'],
                $row['observacoes'],
                $row['status'],
                (int)$row['id'],
                $row['data_criacao']
            );
            $ins->setResponsavelNome($row['responsavel_nome']);
            return $ins;
        }

        return null;
    }

    /**
     * Busca a inspeção geral atualmente em andamento.
     *
     * @return InspecaoGeral|null
     */
    public static function buscarAtiva(): ?self {
        $db = Database::getConnection();
        $sql = "SELECT ig.*, u.nome AS responsavel_nome 
                FROM inspecoes_geral ig
                INNER JOIN usuarios u ON ig.responsavel_id = u.id
                WHERE ig.status = 'Em Andamento' 
                ORDER BY ig.id DESC LIMIT 1";
        
        $stmt = $db->query($sql);
        $row = $stmt->fetch();

        if ($row) {
            $ins = new self(
                $row['unidade'],
                $row['data_inspecao'],
                (int)$row['responsavel_id'],
                $row['observacoes'],
                $row['status'],
                (int)$row['id'],
                $row['data_criacao']
            );
            $ins->setResponsavelNome($row['responsavel_nome']);
            return $ins;
        }

        return null;
    }

    /**
     * Lista todas as sessões de inspeções gerais finalizadas.
     *
     * @return InspecaoGeral[]
     */
    public static function listarTodas(): array {
        $db = Database::getConnection();
        $sql = "SELECT ig.*, u.nome AS responsavel_nome 
                FROM inspecoes_geral ig
                INNER JOIN usuarios u ON ig.responsavel_id = u.id
                ORDER BY ig.data_inspecao DESC, ig.id DESC";
        
        $stmt = $db->query($sql);
        $list = [];
        while ($row = $stmt->fetch()) {
            $ins = new self(
                $row['unidade'],
                $row['data_inspecao'],
                (int)$row['responsavel_id'],
                $row['observacoes'],
                $row['status'],
                (int)$row['id'],
                $row['data_criacao']
            );
            $ins->setResponsavelNome($row['responsavel_nome']);
            $list[] = $ins;
        }

        return $list;
    }

    /**
     * Busca as inspeções de painel vinculadas a esta sessão.
     *
     * @return InspecaoPainel[]
     */
    public function buscarItensPainel(): array {
        if ($this->id === null) return [];
        
        $db = Database::getConnection();
        $sql = "SELECT ip.*, u.nome AS responsavel_nome 
                FROM inspecoes_painel ip
                INNER JOIN usuarios u ON ip.responsavel_id = u.id
                WHERE ip.inspecao_geral_id = :inspecao_geral_id
                ORDER BY ip.id ASC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['inspecao_geral_id' => $this->id]);
        
        $list = [];
        while ($row = $stmt->fetch()) {
            $ins = new InspecaoPainel(
                $row['unidade'],
                $row['setor'],
                $row['quadro_tag'],
                $row['data_inspecao'],
                (int)$row['responsavel_id'],
                $row['observacoes'],
                $row['itens'],
                $row['status_geral'],
                (int)$row['id'],
                $row['data_criacao']
            );
            $ins->setResponsavelNome($row['responsavel_nome']);
            $list[] = $ins;
        }

        return $list;
    }

    /**
     * Exclui a inspeção geral e todas as sub-inspeções vinculadas (via CASCADE).
     *
     * @return bool
     */
    public function excluir(): bool {
        if ($this->id === null) return false;
        $stmt = $this->db->prepare("DELETE FROM inspecoes_geral WHERE id = :id");
        return $stmt->execute(['id' => $this->id]);
    }
}
