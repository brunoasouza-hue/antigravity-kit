<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/Database.php';

final class InspecaoMensal {
    public static function ativa(): ?array {
        $q=Database::getConnection()->query("SELECT id,data_inicio,data_fim,status,responsavel_id FROM inspecoes_mensais WHERE status='Em Andamento' ORDER BY id DESC LIMIT 1");
        $row=$q->fetch(); return $row ?: null;
    }

    public static function listarFinalizadas(): array {
        return Database::getConnection()->query("SELECT id,data_inicio,data_fim,status FROM inspecoes_mensais WHERE status='Finalizada' ORDER BY data_inicio DESC,id DESC")->fetchAll();
    }

    public static function listarTodas(): array {
        return Database::getConnection()->query(
            "SELECT id,data_inicio,data_fim,status FROM inspecoes_mensais ORDER BY id DESC"
        )->fetchAll();
    }

    public static function iniciar(int $responsavelId): int {
        $db=Database::getConnection(); $db->beginTransaction();
        try {
            $active=$db->query("SELECT id FROM inspecoes_mensais WHERE status='Em Andamento' LIMIT 1 FOR UPDATE")->fetchColumn();
            if ($active !== false) throw new DomainException('Já existe uma inspeção mensal em andamento.');
            $q=$db->prepare("INSERT INTO inspecoes_mensais (data_inicio,status,responsavel_id) VALUES (CURRENT_DATE,'Em Andamento',?)");
            $q->execute([$responsavelId]); $id=(int)$db->lastInsertId(); $db->commit(); return $id;
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack(); throw $e;
        }
    }

    public static function finalizar(int $id): bool {
        $q=Database::getConnection()->prepare("UPDATE inspecoes_mensais SET data_fim=CURRENT_DATE,status='Finalizada' WHERE id=? AND status='Em Andamento'");
        $q->execute([$id]); return $q->rowCount()===1;
    }

    public static function buscarDetalhes(int $id): ?array {
        $db=Database::getConnection(); $q=$db->prepare('SELECT id,data_inicio,data_fim,status FROM inspecoes_mensais WHERE id=?');
        $q->execute([$id]); $inspection=$q->fetch(); if(!$inspection) return null;
        $q=$db->prepare('SELECT c.id,c.ambiente_id,c.responsavel_id,c.data_inspecao,c.observacoes,
            c.status_tomadas,c.status_forros,c.status_paredes,c.status_projetor,c.status_tela,c.status_lousa,
            a.nome_ambiente AS ambiente_nome,u.nome AS responsavel_nome
            FROM checklists c JOIN ambientes a ON a.id=c.ambiente_id
            JOIN usuarios u ON u.id=c.responsavel_id
            WHERE c.inspecao_mensal_id=? ORDER BY c.data_inspecao,c.id');
        $q->execute([$id]); $checklists=$q->fetchAll();
        foreach($checklists as &$checklist) $checklist['itens_dinamicos']=Checklist::respostasDinamicas((int)$checklist['id']);
        unset($checklist);
        return ['inspecao'=>$inspection,'checklists'=>$checklists];
    }
}
