<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/ItemPreventiva.php';
require_once __DIR__ . '/AuthController.php';

final class ItemPreventivaController {
    public function processarAcao(string $action): void {
        AuthController::exigirNivelAcesso(['Gestor','Administrador']);
        header('Content-Type: application/json; charset=utf-8');
        try {
            $family=trim((string)($_POST['familia'] ?? ''));
            $name=trim((string)($_POST['nome'] ?? ''));
            switch ($action) {
                case 'adicionar_item_checklist':
                    $id=ItemPreventiva::criar($family,$name);
                    $data=['id'=>$id,'nome'=>$name,'familia'=>$family]; break;
                case 'editar_item_checklist':
                    $old=trim((string)($_POST['nome_antigo'] ?? ''));
                    $id=ItemPreventiva::idAtivo($family,$old);
                    $newName=trim((string)($_POST['nome_novo'] ?? ''));
                    if ($id===null || !ItemPreventiva::renomear($id,$family,$newName)) throw new RuntimeException('Item não encontrado ou sem alteração.');
                    $data=['id'=>ItemPreventiva::idAtivo($family,$newName),'nome'=>$newName,'familia'=>$family]; break;
                case 'remover_item_checklist':
                    $id=ItemPreventiva::idAtivo($family,$name);
                    if ($id===null || !ItemPreventiva::desativar($id,$family)) throw new RuntimeException('Item não encontrado ou já desativado.');
                    $data=['id'=>$id]; break;
                default: throw new InvalidArgumentException('Ação de catálogo inválida.');
            }
            echo json_encode(['success'=>true,'message'=>'Catálogo atualizado.','data'=>$data],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        } catch (Throwable $e) {
            http_response_code($e instanceof InvalidArgumentException ? 400 : 409);
            echo json_encode(['success'=>false,'message'=>$e instanceof PDOException ? 'Não foi possível salvar: item duplicado ou conflito de banco.' : $e->getMessage()],JSON_UNESCAPED_UNICODE);
        }
        exit;
    }
}
