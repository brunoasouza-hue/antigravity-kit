<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Classe Modelo de Ordem de Serviço (OOP)
 */

require_once __DIR__ . '/../../config/Database.php';

class OrdemServico {
    private ?int $id = null;
    private int $solicitante_id;
    private ?int $gestor_id = null;
    private ?int $executor_atual_id = null;
    private int $ambiente_id;
    private string $descricao_problema;
    private string $tipo_execucao;
    private string $status;
    private ?string $data_abertura = null;
    private ?string $data_fechamento = null;

    // Campos virtuais carregados via JOIN
    private ?string $ambiente_nome = null;
    private ?string $solicitante_nome = null;
    private ?string $gestor_nome = null;
    private ?string $executor_nome = null;

    private PDO $db;

    public function __construct(
        int $solicitante_id = 0,
        int $ambiente_id = 0,
        string $descricao_problema = '',
        string $tipo_execucao = 'Interna',
        string $status = 'Pendente',
        ?int $gestor_id = null,
        ?int $executor_atual_id = null,
        ?int $id = null,
        ?string $data_abertura = null,
        ?string $data_fechamento = null
    ) {
        $this->solicitante_id = $solicitante_id;
        $this->ambiente_id = $ambiente_id;
        $this->descricao_problema = trim($descricao_problema);
        $this->tipo_execucao = $tipo_execucao;
        $this->status = $status;
        $this->gestor_id = $gestor_id;
        $this->executor_atual_id = $executor_atual_id;
        $this->id = $id;
        $this->data_abertura = $data_abertura;
        $this->data_fechamento = $data_fechamento;
        $this->db = Database::getConnection();
    }

    // Getters e Setters
    public function getId(): ?int { return $this->id; }
    
    public function getSolicitanteId(): int { return $this->solicitante_id; }
    public function setSolicitanteId(int $id): void { $this->solicitante_id = $id; }
    
    public function getGestorId(): ?int { return $this->gestor_id; }
    public function setGestorId(?int $id): void { $this->gestor_id = $id; }
    
    public function getExecutorId(): ?int { return $this->executor_atual_id; }
    public function setExecutorId(?int $id): void { $this->executor_atual_id = $id; }
    
    public function getAmbienteId(): int { return $this->ambiente_id; }
    public function setAmbienteId(int $id): void { $this->ambiente_id = $id; }
    
    public function getDescricaoProblema(): string { return $this->descricao_problema; }
    public function setDescricaoProblema(string $descricao): void { $this->descricao_problema = trim($descricao); }
    
    public function getTipoExecucao(): string { return $this->tipo_execucao; }
    public function setTipoExecucao(string $tipo): void {
        $validos = ['Interna', 'Terceirizada'];
        if (in_array($tipo, $validos, true)) {
            $this->tipo_execucao = $tipo;
        }
    }
    
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void {
        $validos = ['Pendente', 'Em Execução', 'Aguardando Validação', 'Concluída'];
        if (in_array($status, $validos, true)) {
            $this->status = $status;
        }
    }
    
    public function getDataAbertura(): ?string { return $this->data_abertura; }
    public function getDataFechamento(): ?string { return $this->data_fechamento; }
    public function setDataFechamento(?string $data): void { $this->data_fechamento = $data; }

    // Getters e Setters dos campos virtuais
    public function getAmbienteNome(): ?string { return $this->ambiente_nome; }
    public function setAmbienteNome(?string $nome): void { $this->ambiente_nome = $nome; }
    
    public function getSolicitanteNome(): ?string { return $this->solicitante_nome; }
    public function setSolicitanteNome(?string $nome): void { $this->solicitante_nome = $nome; }
    
    public function getGestorNome(): ?string { return $this->gestor_nome; }
    public function setGestorNome(?string $nome): void { $this->gestor_nome = $nome; }
    
    public function getExecutorNome(): ?string { return $this->executor_nome; }
    public function setExecutorNome(?string $nome): void { $this->executor_nome = $nome; }

    /**
     * Valida os campos da ordem de serviço.
     * Deve barrar descrições vazias ou a string literal "VAZIO" (case-insensitive).
     *
     * @return bool
     * @throws InvalidArgumentException
     */
    public function validar(): bool {
        if ($this->solicitante_id <= 0) {
            throw new InvalidArgumentException("Solicitante inválido.");
        }
        if ($this->ambiente_id <= 0) {
            throw new InvalidArgumentException("Selecione um ambiente válido.");
        }
        
        $descLimpa = strtoupper(trim($this->descricao_problema));
        if ($descLimpa === '') {
            throw new InvalidArgumentException("A descrição do problema não pode ser vazia.");
        }
        if ($descLimpa === 'VAZIO') {
            throw new InvalidArgumentException("A descrição do problema não pode ser 'VAZIO'.");
        }

        return true;
    }

    /**
     * Salva a nova ordem de serviço no banco de dados (apenas inserção inicial).
     *
     * @return bool
     */
    public function salvar(): bool {
        $this->validar();

        if ($this->id !== null) {
            return false;
        }

        $sql = "INSERT INTO ordens_servico (solicitante_id, ambiente_id, descricao_problema, status, tipo_execucao) 
                VALUES (:solicitante_id, :ambiente_id, :descricao_problema, :status, :tipo_execucao)";
        
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([
            'solicitante_id' => $this->solicitante_id,
            'ambiente_id' => $this->ambiente_id,
            'descricao_problema' => $this->descricao_problema,
            'status' => $this->status,
            'tipo_execucao' => $this->tipo_execucao
        ]);

        if ($success) {
            $this->id = (int)$this->db->lastInsertId();
            return true;
        }
        return false;
    }

    /**
     * Atualiza o despacho da ordem de serviço pelo Gestor.
     * Altera o status para "Em Execução", vincula o executor e o tipo de execução.
     *
     * @param int $gestorId
     * @param int $executorId
     * @param string $tipoExecucao
     * @return bool
     */
    public function despachar(int $gestorId, int $executorId, string $tipoExecucao): bool {
        if ($this->id === null) return false;

        $tipoExecucao = trim($tipoExecucao);
        if (!in_array($tipoExecucao, ['Interna', 'Terceirizada'], true)) {
            throw new InvalidArgumentException("Tipo de execução inválido.");
        }

        $sql = "UPDATE ordens_servico 
                SET gestor_id = :gestor_id, executor_atual_id = :executor_atual_id, tipo_execucao = :tipo_execucao, status = 'Em Execução' 
                WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([
            'gestor_id' => $gestorId,
            'executor_atual_id' => $executorId,
            'tipo_execucao' => $tipoExecucao,
            'id' => $this->id
        ]);

        if ($success) {
            $this->gestor_id = $gestorId;
            $this->executor_atual_id = $executorId;
            $this->tipo_execucao = $tipoExecucao;
            $this->status = 'Em Execução';
            return true;
        }
        return false;
    }

    /**
     * Registra o término do serviço pelo Executor.
     * Atualiza o status para "Aguardando Validação" e anexa o relato de conclusão à descrição.
     *
     * @param string $relato
     * @return bool
     */
    public function finalizar(string $relato): bool {
        if ($this->id === null) return false;

        $relato = trim($relato);
        if (strcasecmp($relato, 'VAZIO') === 0 || $relato === '') {
            throw new InvalidArgumentException("O relato de término do serviço não pode ser vazio ou 'VAZIO'.");
        }

        // Anexa o relato de conclusão do executor na descrição
        $novaDescricao = $this->descricao_problema . "\n\n[Conclusão do Executor em " . date('d/m/Y H:i') . "]: " . $relato;

        $sql = "UPDATE ordens_servico 
                SET status = 'Aguardando Validação', descricao_problema = :descricao 
                WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([
            'descricao' => $novaDescricao,
            'id' => $this->id
        ]);

        if ($success) {
            $this->descricao_problema = $novaDescricao;
            $this->status = 'Aguardando Validação';
            return true;
        }
        return false;
    }

    /**
     * Valida a OS pelo Solicitante.
     * Se "Aprovar", altera status para "Concluída" e define a data de fechamento.
     * Se "Recusar", altera status de volta para "Em Execução" e anexa a justificativa/observação.
     *
     * @param bool $aprovado
     * @param string $observacoes
     * @return bool
     */
    public function validarOS(bool $aprovado, string $observacoes = ''): bool {
        if ($this->id === null) return false;

        $observacoes = trim($observacoes);
        if (strcasecmp($observacoes, 'VAZIO') === 0) {
            throw new InvalidArgumentException("As observações não podem conter a palavra 'VAZIO'.");
        }

        if ($aprovado) {
            $sql = "UPDATE ordens_servico 
                    SET status = 'Concluída', data_fechamento = NOW() 
                    WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $success = $stmt->execute(['id' => $this->id]);
            if ($success) {
                $this->status = 'Concluída';
                $this->data_fechamento = date('Y-m-d H:i:s');
                return true;
            }
        } else {
            if ($observacoes === '') {
                throw new InvalidArgumentException("Ao recusar o serviço, é obrigatório preencher o motivo da recusa.");
            }

            // Anexa justificativa de recusa na descrição
            $novaDescricao = $this->descricao_problema . "\n\n[Recusado pelo Solicitante em " . date('d/m/Y H:i') . "]: " . $observacoes;

            $sql = "UPDATE ordens_servico 
                    SET status = 'Em Execução', descricao_problema = :descricao 
                    WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $success = $stmt->execute([
                'descricao' => $novaDescricao,
                'id' => $this->id
            ]);
            if ($success) {
                $this->descricao_problema = $novaDescricao;
                $this->status = 'Em Execução';
                return true;
            }
        }

        return false;
    }

    /**
     * Busca uma ordem de serviço por ID com relacionamentos hidratados.
     *
     * @param int $id
     * @return OrdemServico|null
     */
    public static function buscarPorId(int $id): ?self {
        $db = Database::getConnection();
        $sql = "SELECT os.*, 
                       a.nome_ambiente AS ambiente_nome,
                       us.nome AS solicitante_nome,
                       ug.nome AS gestor_nome,
                       ue.nome AS executor_nome
                FROM ordens_servico os
                INNER JOIN ambientes a ON os.ambiente_id = a.id
                INNER JOIN usuarios us ON os.solicitante_id = us.id
                LEFT JOIN usuarios ug ON os.gestor_id = ug.id
                LEFT JOIN usuarios ue ON os.executor_atual_id = ue.id
                WHERE os.id = :id 
                LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if ($row) {
            $os = new self(
                (int)$row['solicitante_id'],
                (int)$row['ambiente_id'],
                $row['descricao_problema'],
                $row['tipo_execucao'],
                $row['status'],
                $row['gestor_id'] !== null ? (int)$row['gestor_id'] : null,
                $row['executor_atual_id'] !== null ? (int)$row['executor_atual_id'] : null,
                (int)$row['id'],
                $row['data_abertura'],
                $row['data_fechamento']
            );
            $os->setAmbienteNome($row['ambiente_nome']);
            $os->setSolicitanteNome($row['solicitante_nome']);
            $os->setGestorNome($row['gestor_nome']);
            $os->setExecutorNome($row['executor_nome']);
            return $os;
        }

        return null;
    }

    /**
     * Lista as ordens de serviço abertas por um solicitante específico.
     *
     * @param int $solicitanteId
     * @return OrdemServico[]
     */
    public static function listarPorSolicitante(int $solicitanteId): array {
        $db = Database::getConnection();
        $sql = "SELECT os.*, 
                       a.nome_ambiente AS ambiente_nome,
                       us.nome AS solicitante_nome,
                       ug.nome AS gestor_nome,
                       ue.nome AS executor_nome
                FROM ordens_servico os
                INNER JOIN ambientes a ON os.ambiente_id = a.id
                INNER JOIN usuarios us ON os.solicitante_id = us.id
                LEFT JOIN usuarios ug ON os.gestor_id = ug.id
                LEFT JOIN usuarios ue ON os.executor_atual_id = ue.id
                WHERE os.solicitante_id = :solicitante_id
                ORDER BY os.id DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['solicitante_id' => $solicitanteId]);
        $lista = [];

        while ($row = $stmt->fetch()) {
            $os = new self(
                (int)$row['solicitante_id'],
                (int)$row['ambiente_id'],
                $row['descricao_problema'],
                $row['tipo_execucao'],
                $row['status'],
                $row['gestor_id'] !== null ? (int)$row['gestor_id'] : null,
                $row['executor_atual_id'] !== null ? (int)$row['executor_atual_id'] : null,
                (int)$row['id'],
                $row['data_abertura'],
                $row['data_fechamento']
            );
            $os->setAmbienteNome($row['ambiente_nome']);
            $os->setSolicitanteNome($row['solicitante_nome']);
            $os->setGestorNome($row['gestor_nome']);
            $os->setExecutorNome($row['executor_nome']);
            $lista[] = $os;
        }

        return $lista;
    }

    /**
     * Lista todas as ordens de serviço (para visão do Gestor).
     *
     * @return OrdemServico[]
     */
    public static function listarTodosComRelacionamentos(): array {
        $db = Database::getConnection();
        $sql = "SELECT os.*, 
                       a.nome_ambiente AS ambiente_nome,
                       us.nome AS solicitante_nome,
                       ug.nome AS gestor_nome,
                       ue.nome AS executor_nome
                FROM ordens_servico os
                INNER JOIN ambientes a ON os.ambiente_id = a.id
                INNER JOIN usuarios us ON os.solicitante_id = us.id
                LEFT JOIN usuarios ug ON os.gestor_id = ug.id
                LEFT JOIN usuarios ue ON os.executor_atual_id = ue.id
                ORDER BY os.id DESC";
        
        $stmt = $db->query($sql);
        $lista = [];

        while ($row = $stmt->fetch()) {
            $os = new self(
                (int)$row['solicitante_id'],
                (int)$row['ambiente_id'],
                $row['descricao_problema'],
                $row['tipo_execucao'],
                $row['status'],
                $row['gestor_id'] !== null ? (int)$row['gestor_id'] : null,
                $row['executor_atual_id'] !== null ? (int)$row['executor_atual_id'] : null,
                (int)$row['id'],
                $row['data_abertura'],
                $row['data_fechamento']
            );
            $os->setAmbienteNome($row['ambiente_nome']);
            $os->setSolicitanteNome($row['solicitante_nome']);
            $os->setGestorNome($row['gestor_nome']);
            $os->setExecutorNome($row['executor_nome']);
            $lista[] = $os;
        }

        return $lista;
    }

    /**
     * Lista as ordens de serviço atribuídas a um executor específico.
     *
     * @param int $executorId
     * @return OrdemServico[]
     */
    public static function listarPorExecutor(int $executorId): array {
        $db = Database::getConnection();
        $sql = "SELECT os.*, 
                       a.nome_ambiente AS ambiente_nome,
                       us.nome AS solicitante_nome,
                       ug.nome AS gestor_nome,
                       ue.nome AS executor_nome
                FROM ordens_servico os
                INNER JOIN ambientes a ON os.ambiente_id = a.id
                INNER JOIN usuarios us ON os.solicitante_id = us.id
                LEFT JOIN usuarios ug ON os.gestor_id = ug.id
                LEFT JOIN usuarios ue ON os.executor_atual_id = ue.id
                WHERE os.executor_atual_id = :executor_atual_id
                ORDER BY os.id DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['executor_atual_id' => $executorId]);
        $lista = [];

        while ($row = $stmt->fetch()) {
            $os = new self(
                (int)$row['solicitante_id'],
                (int)$row['ambiente_id'],
                $row['descricao_problema'],
                $row['tipo_execucao'],
                $row['status'],
                $row['gestor_id'] !== null ? (int)$row['gestor_id'] : null,
                $row['executor_atual_id'] !== null ? (int)$row['executor_atual_id'] : null,
                (int)$row['id'],
                $row['data_abertura'],
                $row['data_fechamento']
            );
            $os->setAmbienteNome($row['ambiente_nome']);
            $os->setSolicitanteNome($row['solicitante_nome']);
            $os->setGestorNome($row['gestor_nome']);
            $os->setExecutorNome($row['executor_nome']);
            $lista[] = $os;
        }

        return $lista;
    }
}
