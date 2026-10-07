<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/Database.php';

final class ItemPreventiva {
    private const FAMILIAS = ['Salas de Aulas','Laboratórios','Oficinas','Administrativos','Externos','Geral'];

    public static function familias(): array { return self::FAMILIAS; }

    public static function listar(bool $incluirInativos = false): array {
        $sql = 'SELECT id,familia,nome,ativo,ordem FROM itens_preventiva';
        if (!$incluirInativos) $sql .= ' WHERE ativo=1';
        $sql .= ' ORDER BY familia,ordem,nome';
        return Database::getConnection()->query($sql)->fetchAll();
    }

    public static function porFamilia(string $familia, bool $incluirInativos = false): array {
        $sql = 'SELECT id,familia,nome,ativo,ordem FROM itens_preventiva WHERE familia=:familia';
        if (!$incluirInativos) $sql .= ' AND ativo=1';
        $sql .= ' ORDER BY ordem,nome';
        $q=Database::getConnection()->prepare($sql); $q->execute(['familia'=>$familia]); return $q->fetchAll();
    }

    public static function criar(string $family, string $name): int {
        self::validar($family,$name);
        $q=Database::getConnection()->prepare('INSERT INTO itens_preventiva (familia,nome) VALUES (?,?)');
        $q->execute([$family,$name]); return (int)Database::getConnection()->lastInsertId();
    }

    public static function renomear(int $id, string $family, string $name): bool {
        self::validar($family,$name);
        $db=Database::getConnection();
        $db->beginTransaction();
        try {
            $q=$db->prepare('SELECT id FROM itens_preventiva WHERE id=? AND familia=? AND ativo=1 FOR UPDATE');
            $q->execute([$id,$family]);
            if (!$q->fetchColumn()) { $db->rollBack(); return false; }
            $q=$db->prepare('INSERT INTO itens_preventiva (familia,nome,ativo,ordem) SELECT familia,?,1,ordem FROM itens_preventiva WHERE id=?');
            $q->execute([$name,$id]);
            $q=$db->prepare('UPDATE itens_preventiva SET ativo=0 WHERE id=? AND familia=?');
            $q->execute([$id,$family]);
            $db->commit();
            return true;
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            throw $e;
        }
    }

    public static function desativar(int $id, string $family): bool {
        $q=Database::getConnection()->prepare('UPDATE itens_preventiva SET ativo=0 WHERE id=? AND familia=? AND ativo=1');
        $q->execute([$id,$family]); return $q->rowCount() > 0;
    }

    public static function idAtivo(string $family, string $name): ?int {
        $q=Database::getConnection()->prepare('SELECT id FROM itens_preventiva WHERE familia=? AND nome=? AND ativo=1 LIMIT 1');
        $q->execute([$family,$name]); $id=$q->fetchColumn(); return $id === false ? null : (int)$id;
    }

    private static function validar(string $family,string $name): void {
        if (!in_array($family,self::FAMILIAS,true)) throw new InvalidArgumentException('Família preventiva inválida.');
        $name=trim($name);
        if ($name === '' || mb_strlen($name,'UTF-8') > 255 || strcasecmp($name,'VAZIO')===0) throw new InvalidArgumentException('Nome do item inválido.');
    }
}
