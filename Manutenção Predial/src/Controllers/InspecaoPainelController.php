<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Controlador de Inspeções de Quadros e Painéis (RH-064-FR009)
 */

require_once __DIR__ . '/../Models/InspecaoPainel.php';
require_once __DIR__ . '/../Models/InspecaoGeral.php';
require_once __DIR__ . '/AuthController.php';

class InspecaoPainelController {

    public function __construct() {
        AuthController::verificarAutenticacao();
    }

    private function isAjax(): bool {
        return (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
            || (isset($_POST['ajax']) && $_POST['ajax'] === '1')
            || (isset($_GET['ajax']) && $_GET['ajax'] === '1');
    }

    private function retornarResposta(bool $sucesso, string $mensagem, ?array $data = null): void {
        if ($this->isAjax()) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => $sucesso,
                'message' => $mensagem,
                'data' => $data
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($sucesso) {
            $_SESSION['alerta_sucesso'] = $mensagem;
        } else {
            $_SESSION['alerta_erro'] = $mensagem;
        }
        header("Location: " . BASE_URL . "/public/views/inspecoes_seguranca.php");
        exit;
    }

    public function processarAcao(): void {
        $acao = $_POST['acao'] ?? $_GET['acao'] ?? '';

        switch ($acao) {
            case 'iniciar_inspecao_geral':
                $this->iniciarInspecaoGeral();
                break;
            case 'salvar_inspecao':
                $this->salvar();
                break;
            case 'encerrar_inspecao_geral':
                $this->encerrarInspecaoGeral();
                break;
            case 'buscar_detalhes_geral_ajax':
                $this->buscarDetalhesGeralAjax();
                break;
            case 'excluir':
                $this->excluir();
                break;
        }
    }

    private function salvar(): void {
        $inspecaoId = isset($_POST['inspecao_id']) && !empty($_POST['inspecao_id']) ? (int)$_POST['inspecao_id'] : null;
        $inspecaoGeralId = isset($_POST['inspecao_geral_id']) && !empty($_POST['inspecao_geral_id']) ? (int)$_POST['inspecao_geral_id'] : null;
        $unidade = trim($_POST['unidade'] ?? 'SENAI');
        $setor = trim($_POST['setor'] ?? '');
        $quadroTag = trim($_POST['quadro_tag'] ?? '');
        $dataInspecao = trim($_POST['data_inspecao'] ?? '');
        $observacoes = trim($_POST['observacoes'] ?? '');

        if (empty($setor)) {
            $this->retornarResposta(false, "O setor é obrigatório.");
        }
        if (empty($quadroTag)) {
            $this->retornarResposta(false, "A identificação/TAG do quadro é obrigatória.");
        }
        if (empty($dataInspecao)) {
            $this->retornarResposta(false, "A data da inspeção é obrigatória.");
        }

        // Validação da palavra literal "VAZIO" (case-insensitive)
        if (strcasecmp($unidade, 'VAZIO') === 0 || strcasecmp($setor, 'VAZIO') === 0 || strcasecmp($quadroTag, 'VAZIO') === 0 || strcasecmp($observacoes, 'VAZIO') === 0) {
            $this->retornarResposta(false, "Erro: Nenhum dos campos de texto pode conter a palavra 'VAZIO'.");
        }

        // Processar os 20 itens de inspeção
        $itensArr = [];
        $statusGeral = 'Conforme'; // Se houver pelo menos um 'NC', vira 'Não Conforme'

        for ($i = 1; $i <= 20; $i++) {
            $status = $_POST["item_{$i}_status"] ?? 'NA'; // C, NC, NA
            $itemData = [
                'status' => $status
            ];

            if ($status === 'NC') {
                $statusGeral = 'Não Conforme';
                $obsNc = trim($_POST["item_{$i}_obs_nc"] ?? '');
                $fotoNc = trim($_POST["item_{$i}_foto_base64"] ?? '');

                if (empty($obsNc) || empty($fotoNc)) {
                    $this->retornarResposta(false, "Erro: O item {$i} está marcado como 'Não Conforme', portanto a foto e a observação são obrigatórias.");
                }

                $itemData['obs_nc'] = $obsNc;
                $itemData['foto_nc'] = $fotoNc;
            }

            // Sub-detalhes específicos do formulário RH-064-FR009
            if ($i === 5) {
                // Advertência, Identificação, Nível Tensão
                $itemData['detalhes'] = [
                    'advertencia' => isset($_POST['item_5_adv']) ? 1 : 0,
                    'identificacao' => isset($_POST['item_5_ident']) ? 1 : 0,
                    'nivel_tensao' => isset($_POST['item_5_tensao']) ? 1 : 0
                ];
            } elseif ($i === 6) {
                // Cadeado, Chave
                $itemData['detalhes'] = [
                    'cadeado' => isset($_POST['item_6_cadeado']) ? 1 : 0,
                    'chave' => isset($_POST['item_6_chave']) ? 1 : 0
                ];
            } elseif ($i === 10) {
                // Eficientes? SIM, NÃO
                $itemData['eficiente'] = $_POST['item_10_eficiente'] ?? '';
            } elseif ($i === 11) {
                // Atualizados? SIM, NÃO
                $itemData['atualizado'] = $_POST['item_11_atualizado'] ?? '';
            } elseif ($i === 12) {
                // Localização do diagrama
                $itemData['localizacao'] = trim($_POST['item_12_localizacao'] ?? '');
            } elseif ($i === 20) {
                // Conservação, Funcional
                $itemData['detalhes'] = [
                    'conservacao' => isset($_POST['item_20_conservacao']) ? 1 : 0,
                    'funcional' => isset($_POST['item_20_funcional']) ? 1 : 0
                ];
            }

            $itensArr["item_{$i}"] = $itemData;
        }

        $responsavelId = (int)$_SESSION['usuario_id'];
        $itensJson = json_encode($itensArr, JSON_UNESCAPED_UNICODE);

        try {
            $inspecao = new InspecaoPainel(
                $unidade,
                $setor,
                $quadroTag,
                $dataInspecao,
                $responsavelId,
                empty($observacoes) ? null : $observacoes,
                $itensJson,
                $statusGeral,
                $inspecaoId,
                null,
                $inspecaoGeralId
            );

            if ($inspecao->salvar()) {
                $logSalvo = InspecaoPainel::buscarPorId($inspecao->getId() ?? 0);
                $dataRetorno = null;
                if ($logSalvo !== null) {
                    $dataRetorno = [
                        'id' => $logSalvo->getId(),
                        'unidade' => $logSalvo->getUnidade(),
                        'setor' => $logSalvo->getSetor(),
                        'quadro_tag' => $logSalvo->getQuadroTag(),
                        'data_inspecao' => $logSalvo->getDataInspecao(),
                        'responsavel_nome' => $logSalvo->getResponsavelNome(),
                        'status_geral' => $logSalvo->getStatusGeral(),
                        'observacoes' => $logSalvo->getObservacoes(),
                        'itens' => $logSalvo->getItens()
                    ];
                }

                $this->retornarResposta(true, "Inspeção de quadro elétrico registrada com sucesso!", $dataRetorno);
            } else {
                $this->retornarResposta(false, "Erro ao registrar inspeção. Tente novamente.");
            }
        } catch (Exception $e) {
            $this->retornarResposta(false, "Erro no servidor: " . $e->getMessage());
        }
    }

    private function excluir(): void {
        $nivelUsuario = $_SESSION['usuario_nivel'] ?? '';
        if ($nivelUsuario !== 'Gestor') {
            $this->retornarResposta(false, "Acesso negado: Apenas gestores podem excluir vistorias.");
        }

        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);

        if ($id <= 0) {
            $this->retornarResposta(false, "ID inválido.");
        }

        $inspecao = InspecaoGeral::buscarPorId($id);
        if ($inspecao === null) {
            $this->retornarResposta(false, "Inspeção geral não encontrada.");
        }

        try {
            if ($inspecao->excluir()) {
                $this->retornarResposta(true, "Registro de inspeção geral #{$id} removido com sucesso!", ['id' => $id]);
            } else {
                $this->retornarResposta(false, "Erro ao excluir do banco de dados.");
            }
        } catch (Exception $e) {
            $this->retornarResposta(false, "Erro ao excluir: " . $e->getMessage());
        }
    }

    private function iniciarInspecaoGeral(): void {
        $unidade = trim($_POST['unidade'] ?? 'SENAI');
        $dataInspecao = trim($_POST['data_inspecao'] ?? '');
        $responsavelId = (int)$_SESSION['usuario_id'];

        if (empty($dataInspecao)) {
            $this->retornarResposta(false, "A data de inspeção é obrigatória.");
        }

        // Verifica se há alguma ativa
        $ativa = InspecaoGeral::buscarAtiva();
        if ($ativa !== null) {
            $this->retornarResposta(false, "Já existe uma inspeção geral em andamento.");
        }

        try {
            $geral = new InspecaoGeral($unidade, $dataInspecao, $responsavelId);
            if ($geral->salvar()) {
                $logSalvo = InspecaoGeral::buscarPorId($geral->getId() ?? 0);
                $dataRetorno = null;
                if ($logSalvo !== null) {
                    $dataRetorno = [
                        'id' => $logSalvo->getId(),
                        'unidade' => $logSalvo->getUnidade(),
                        'data_inspecao' => $logSalvo->getDataInspecao(),
                        'responsavel_nome' => $logSalvo->getResponsavelNome(),
                        'status' => $logSalvo->getStatus()
                    ];
                }
                $this->retornarResposta(true, "Inspeção Geral iniciada com sucesso!", $dataRetorno);
            } else {
                $this->retornarResposta(false, "Erro ao iniciar inspeção geral.");
            }
        } catch (Exception $e) {
            $this->retornarResposta(false, "Erro: " . $e->getMessage());
        }
    }

    private function encerrarInspecaoGeral(): void {
        $id = (int)($_POST['inspecao_geral_id'] ?? 0);
        $observacoes = trim($_POST['observacoes'] ?? '');

        if ($id <= 0) {
            $this->retornarResposta(false, "ID da inspeção geral inválido.");
        }

        $geral = InspecaoGeral::buscarPorId($id);
        if ($geral === null) {
            $this->retornarResposta(false, "Inspeção geral não localizada.");
        }

        $geral->setStatus('Encerrada');
        $geral->setObservacoes(empty($observacoes) ? null : $observacoes);

        try {
            if ($geral->salvar()) {
                $this->retornarResposta(true, "Inspeção Geral encerrada com sucesso!");
            } else {
                $this->retornarResposta(false, "Erro ao encerrar inspeção geral.");
            }
        } catch (Exception $e) {
            $this->retornarResposta(false, "Erro: " . $e->getMessage());
        }
    }

    private function buscarDetalhesGeralAjax(): void {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            $this->retornarResposta(false, "ID inválido.");
        }

        $geral = InspecaoGeral::buscarPorId($id);
        if ($geral === null) {
            $this->retornarResposta(false, "Inspeção geral não encontrada.");
        }

        $setores = $geral->buscarItensPainel();
        
        $setoresData = [];
        foreach ($setores as $setor) {
            $setoresData[] = [
                'id' => $setor->getId(),
                'unidade' => $setor->getUnidade(),
                'setor' => $setor->getSetor(),
                'quadro_tag' => $setor->getQuadroTag(),
                'data_inspecao' => $setor->getDataInspecao(),
                'responsavel_nome' => $setor->getResponsavelNome(),
                'status_geral' => $setor->getStatusGeral(),
                'observacoes' => $setor->getObservacoes(),
                'itens' => $setor->getItens()
            ];
        }

        $data = [
            'geral' => [
                'id' => $geral->getId(),
                'unidade' => $geral->getUnidade(),
                'data_inspecao' => $geral->getDataInspecao(),
                'responsavel_nome' => $geral->getResponsavelNome(),
                'observacoes' => $geral->getObservacoes(),
                'status' => $geral->getStatus()
            ],
            'setores' => $setoresData
        ];

        $this->retornarResposta(true, "Dados carregados com sucesso!", $data);
    }
}
