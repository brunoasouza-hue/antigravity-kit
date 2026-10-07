<?php
declare(strict_types=1);
require_once __DIR__ . '/Usuario.php';
require_once __DIR__ . '/../../config/Seguranca.php';

class AdministracaoUsuario {
    public static function executar(int $atorId, string $acao, int $id, array $dados = []): int {
        $db = Database::getConnection();
        $db->beginTransaction();
        try {
            // A ordem única dos locks serializa mudanças de perfil/status e protege o último admin.
            $rows = $db->query('SELECT id,nivel_acesso,status FROM usuarios ORDER BY id FOR UPDATE')->fetchAll();
            $usuarios = array_column($rows, null, 'id');
            $ator = $usuarios[$atorId] ?? null;
            if (!$ator || $ator['status'] !== 'Ativo' || !in_array($ator['nivel_acesso'], ['Gestor','Administrador'], true)) {
                throw new DomainException('Acesso negado.');
            }
            $admin = $ator['nivel_acesso'] === 'Administrador';
            if (!in_array($acao, ['criar','editar_usuario','alterar_nivel','alterar_status','resetar_senha'], true)) {
                throw new DomainException('Ação inválida.');
            }
            if ($acao === 'resetar_senha' && !$admin) throw new DomainException('Somente Administradores podem resetar senhas.');
            $anterior = $acao === 'criar' ? null : ($usuarios[$id] ?? null);
            if ($acao !== 'criar' && !$anterior) throw new DomainException('Usuário não localizado.');
            if ($anterior && $anterior['nivel_acesso'] === 'Administrador' && !$admin) {
                throw new DomainException('Somente Administradores podem gerenciar outro Administrador.');
            }
            $nivel = $anterior['nivel_acesso'] ?? 'Solicitante';
            $status = $anterior['status'] ?? 'Ativo';
            if (in_array($acao, ['criar','editar_usuario','alterar_nivel'], true)) {
                $nivel = trim((string)($dados['nivel_acesso'] ?? ''));
                if (!in_array($nivel, ['Solicitante','Executor','Gestor','Administrador'], true)) throw new DomainException('Nível inválido.');
                if ($nivel === 'Administrador' && !$admin) throw new DomainException('Somente Administradores podem atribuir esse perfil.');
            }
            if ($acao === 'alterar_status') {
                $status = (string)($dados['status'] ?? '');
                if (!in_array($status, ['Ativo','Inativo'], true)) throw new DomainException('Status inválido.');
            }
            $ativos = count(array_filter($rows, static fn($u) => $u['nivel_acesso'] === 'Administrador' && $u['status'] === 'Ativo'));
            if ($anterior && $anterior['nivel_acesso'] === 'Administrador' && $anterior['status'] === 'Ativo'
                && ($nivel !== 'Administrador' || $status !== 'Ativo') && $ativos <= 1) {
                throw new DomainException('Não é possível remover o último administrador ativo do sistema.');
            }
            $usuario = $acao === 'criar' ? null : Usuario::buscarPorId($id);
            if ($acao === 'alterar_status' && $id === $atorId && $status === 'Inativo') {
                throw new DomainException('Você não pode desativar sua própria conta.');
            }
            if ($acao === 'resetar_senha') {
                if (!$usuario->alterarSenha(SENHA_RESET_USUARIO)) throw new RuntimeException('A senha não foi atualizada em exatamente um cadastro.');
            } elseif ($acao === 'alterar_nivel' || $acao === 'alterar_status') {
                $campo = $acao === 'alterar_nivel' ? 'nivel_acesso' : 'status';
                $stmt = $db->prepare("UPDATE usuarios SET $campo = ? WHERE id = ?");
                $stmt->execute([$acao === 'alterar_nivel' ? $nivel : $status, $id]);
            } else {
                $nome = trim((string)($dados['nome'] ?? ''));
                if ($nome === '') throw new DomainException('Nome obrigatório.');
                if ($acao === 'criar') {
                    $email = trim((string)($dados['email'] ?? ''));
                    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new DomainException('E-mail inválido.');
                    if (Usuario::buscarPorEmail($email)) throw new DomainException('E-mail já cadastrado.');
                    // Preserva a senha inicial já usada pelo cadastro; o reset tem configuração própria.
                    $usuario = new Usuario($nome, $email, 'senai123', $nivel);
                } else {
                    $usuario->setNome($nome);
                    $usuario->setNivelAcesso($nivel);
                }
                $ambientes = $dados['ambientes_vinculados'] ?? [];
                if (!is_array($ambientes)) throw new DomainException('Lista de ambientes inválida.');
                $usuario->setAmbientesVinculados(array_values(array_unique(array_filter(array_map('intval', $ambientes), static fn($v) => $v > 0))));
                if (!$usuario->salvar()) throw new RuntimeException('Não foi possível salvar o usuário.');
                $id = (int)$usuario->getId();
            }
            $stmt = $db->prepare('INSERT INTO auditoria_usuarios (ator_id,usuario_id,operacao,nivel_anterior,nivel_novo) VALUES (?,?,?,?,?)');
            $stmt->execute([$atorId,$id,$acao,$anterior['nivel_acesso'] ?? null,$nivel]);
            $db->commit();
            return $id;
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            throw $e;
        }
    }
}
