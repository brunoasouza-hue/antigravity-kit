<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Classe Modelo de Inspeção de Quadros e Painéis (RH-064-FR009)
 */

require_once __DIR__ . '/../../config/Database.php';

class InspecaoPainel {
    private ?int $id = null;
    private ?int $inspecao_geral_id = null;
    private string $unidade;
    private string $setor;
    private string $quadro_tag;
    private string $data_inspecao;
    private int $responsavel_id;
    private ?string $observacoes = null;
    private string $itens; // Armazenado como string JSON no banco de dados
    private string $status_geral;
    private ?string $data_criacao = null;

    // Campo virtual carregado via JOIN
    private ?string $responsavel_nome = null;

    private PDO $db;

    public function __construct(
        string $unidade = 'SENAI',
        string $setor = '',
        string $quadro_tag = '',
        string $data_inspecao = '',
        int $responsavel_id = 0,
        ?string $observacoes = null,
        string $itens = '{}',
        string $status_geral = 'Conforme',
        ?int $id = null,
        ?string $data_criacao = null,
        ?int $inspecao_geral_id = null
    ) {
        $this->unidade = $unidade;
        $this->setor = $setor;
        $this->quadro_tag = $quadro_tag;
        $this->data_inspecao = $data_inspecao;
        $this->responsavel_id = $responsavel_id;
        $this->observacoes = $observacoes;
        $this->itens = $itens;
        $this->status_geral = $status_geral;
        $this->id = $id;
        $this->data_criacao = $data_criacao;
        $this->inspecao_geral_id = $inspecao_geral_id;
        $this->db = Database::getConnection();
    }

    // Getters e Setters
    public function getId(): ?int { return $this->id; }
    public function getInspecaoGeralId(): ?int { return $this->inspecao_geral_id; }
    public function setInspecaoGeralId(?int $inspecao_geral_id): void { $this->inspecao_geral_id = $inspecao_geral_id; }
    public function getUnidade(): string { return $this->unidade; }
    public function setUnidade(string $unidade): void { $this->unidade = trim($unidade); }
    public function getSetor(): string { return $this->setor; }
    public function setSetor(string $setor): void { $this->setor = trim($setor); }
    public function getQuadroTag(): string { return $this->quadro_tag; }
    public function setQuadroTag(string $quadro_tag): void { $this->quadro_tag = trim($quadro_tag); }
    public function getDataInspecao(): string { return $this->data_inspecao; }
    public function setDataInspecao(string $data_inspecao): void { $this->data_inspecao = trim($data_inspecao); }
    public function getResponsavelId(): int { return $this->responsavel_id; }
    public function setResponsavelId(int $responsavel_id): void { $this->responsavel_id = $responsavel_id; }
    public function getObservacoes(): ?string { return $this->observacoes; }
    public function setObservacoes(?string $observacoes): void { $this->observacoes = $observacoes !== null ? trim($observacoes) : null; }
    public function getItens(): string { return $this->itens; }
    public function setItens(string $itens): void { $this->itens = $itens; }
    public function getStatusGeral(): string { return $this->status_geral; }
    public function setStatusGeral(string $status_geral): void { $this->status_geral = $status_geral; }
    public function getDataCriacao(): ?string { return $this->data_criacao; }

    public function getResponsavelNome(): ?string { return $this->responsavel_nome; }
    public function setResponsavelNome(?string $nome): void { $this->responsavel_nome = $nome; }

    /**
     * Salva a inspeção no banco de dados.
     *
     * @return bool
     */
    public function salvar(): bool {
        if ($this->id !== null) {
            return $this->atualizar();
        }

        $sql = "INSERT INTO inspecoes_painel (
                    inspecao_geral_id, unidade, setor, quadro_tag, data_inspecao,
                    responsavel_id, observacoes, itens, status_geral
                ) VALUES (
                    :inspecao_geral_id, :unidade, :setor, :quadro_tag, :data_inspecao,
                    :responsavel_id, :observacoes, :itens, :status_geral
                )";
        
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([
            'inspecao_geral_id' => $this->inspecao_geral_id,
            'unidade' => $this->unidade,
            'setor' => $this->setor,
            'quadro_tag' => $this->quadro_tag,
            'data_inspecao' => $this->data_inspecao,
            'responsavel_id' => $this->responsavel_id,
            'observacoes' => $this->observacoes,
            'itens' => $this->itens,
            'status_geral' => $this->status_geral
        ]);

        if ($success) {
            $this->id = (int)$this->db->lastInsertId();
            return true;
        }

        return false;
    }

    public function atualizar(): bool {
        $sql = "UPDATE inspecoes_painel SET 
                    inspecao_geral_id = :inspecao_geral_id,
                    unidade = :unidade, 
                    setor = :setor, 
                    quadro_tag = :quadro_tag,
                    data_inspecao = :data_inspecao, 
                    responsavel_id = :responsavel_id, 
                    observacoes = :observacoes,
                    itens = :itens, 
                    status_geral = :status_geral
                WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id' => $this->id,
            'inspecao_geral_id' => $this->inspecao_geral_id,
            'unidade' => $this->unidade,
            'setor' => $this->setor,
            'quadro_tag' => $this->quadro_tag,
            'data_inspecao' => $this->data_inspecao,
            'responsavel_id' => $this->responsavel_id,
            'observacoes' => $this->observacoes,
            'itens' => $this->itens,
            'status_geral' => $this->status_geral
        ]);
    }

    /**
     * Busca uma inspeção por seu ID.
     *
     * @param int $id
     * @return InspecaoPainel|null
     */
    public static function buscarPorId(int $id): ?self {
        $db = Database::getConnection();
        $sql = "SELECT ip.*, u.nome AS responsavel_nome 
                FROM inspecoes_painel ip
                INNER JOIN usuarios u ON ip.responsavel_id = u.id
                WHERE ip.id = :id LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if ($row) {
            $ins = new self(
                $row['unidade'],
                $row['setor'],
                $row['quadro_tag'],
                $row['data_inspecao'],
                (int)$row['responsavel_id'],
                $row['observacoes'],
                $row['itens'],
                $row['status_geral'],
                (int)$row['id'],
                $row['data_criacao'],
                $row['inspecao_geral_id'] !== null ? (int)$row['inspecao_geral_id'] : null
            );
            $ins->setResponsavelNome($row['responsavel_nome']);
            return $ins;
        }

        return null;
    }

    /**
     * Lista todas as vistorias cadastradas.
     *
     * @return InspecaoPainel[]
     */
    public static function listarTodas(): array {
        $db = Database::getConnection();
        $sql = "SELECT ip.*, u.nome AS responsavel_nome 
                FROM inspecoes_painel ip
                INNER JOIN usuarios u ON ip.responsavel_id = u.id
                ORDER BY ip.data_inspecao DESC, ip.id DESC";
        
        $stmt = $db->query($sql);
        $list = [];
        while ($row = $stmt->fetch()) {
            $ins = new self(
                $row['unidade'],
                $row['setor'],
                $row['quadro_tag'],
                $row['data_inspecao'],
                (int)$row['responsavel_id'],
                $row['observacoes'],
                $row['itens'],
                $row['status_geral'],
                (int)$row['id'],
                $row['data_criacao'],
                $row['inspecao_geral_id'] !== null ? (int)$row['inspecao_geral_id'] : null
            );
            $ins->setResponsavelNome($row['responsavel_nome']);
            $list[] = $ins;
        }

        return $list;
    }

    /**
     * Exclui a inspeção do banco de dados.
     *
     * @return bool
     */
    public function excluir(): bool {
        if ($this->id === null) return false;
        $stmt = $this->db->prepare("DELETE FROM inspecoes_painel WHERE id = :id");
        return $stmt->execute(['id' => $this->id]);
    }
}
