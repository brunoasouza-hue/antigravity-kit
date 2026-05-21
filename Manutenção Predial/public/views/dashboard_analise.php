<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Painel de Inteligência de Dados e Estatísticas (Gestor)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Models/Ambiente.php';
require_once __DIR__ . '/../../src/Models/Checklist.php';
require_once __DIR__ . '/../../src/Models/OrdemServico.php';

// Restringe estritamente o acesso apenas ao perfil "Gestor"
AuthController::exigirNivelAcesso(['Gestor']);

$usuarioNome = $_SESSION['usuario_nome'] ?? 'Usuário';
$usuarioNivel = $_SESSION['usuario_nivel'] ?? 'Gestor';

// Roteamento de Logout local
if (isset($_GET['logout'])) {
    $auth = new AuthController();
    $auth->logout();
    header("Location: " . BASE_URL . "/public/index.php");
    exit;
}

// Data atual formatada para exibição no cabeçalho
$dataAtual = date('d/m/Y');

// Conexão direta via Singleton para queries estatísticas otimizadas
$db = Database::getConnection();

// =========================================================================
// 1. CARDS DE RESUMO SUPERIOR
// =========================================================================
// Metric 1: Total de OS Abertas (Carga de trabalho ativa)
$qAbertas = $db->query("SELECT COUNT(*) FROM ordens_servico WHERE status IN ('Pendente', 'Em Execução', 'Aguardando Validação')");
$totalAbertas = (int)$qAbertas->fetchColumn();

// Metric 2: OS Pendentes de Despacho (status = 'Pendente')
$qPendentes = $db->query("SELECT COUNT(*) FROM ordens_servico WHERE status = 'Pendente'");
$totalPendentes = (int)$qPendentes->fetchColumn();

// Metric 3: Preventivas Realizadas no Mês Corrente (checklists no mês/ano atual)
$qPreventivasMes = $db->query("
    SELECT COUNT(*) 
    FROM checklists 
    WHERE MONTH(data_inspecao) = MONTH(CURRENT_DATE()) 
      AND YEAR(data_inspecao) = YEAR(CURRENT_DATE())
");
$totalPreventivasMes = (int)$qPreventivasMes->fetchColumn();


// =========================================================================
// 2. HISTÓRICO COMPARATIVO MENSAL (ÚLTIMOS 6 MESES CHRONOLOGICAL)
// =========================================================================
$mesesNomesPt = [
    1 => 'Jan', 2 => 'Fev', 3 => 'Mar', 4 => 'Abr', 5 => 'Mai', 6 => 'Jun',
    7 => 'Jul', 8 => 'Ago', 9 => 'Set', 10 => 'Out', 11 => 'Nov', 12 => 'Dez'
];

$historico = [];
for ($i = 5; $i >= 0; $i--) {
    $time = strtotime("-$i months");
    $ano = date('Y', $time);
    $mesNum = (int)date('m', $time);
    $chave = date('Y-m', $time);
    
    $historico[$chave] = [
        'nome' => $mesesNomesPt[$mesNum] . '/' . substr($ano, 2),
        'preventivas' => 0,
        'corretivas' => 0
    ];
}

// Query Preventivas (Checklists realizados) por mês nos últimos 6 meses
$preventivasQuery = $db->query("
    SELECT DATE_FORMAT(data_inspecao, '%Y-%m') as mes, COUNT(*) as total 
    FROM checklists 
    WHERE data_inspecao >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 5 MONTH)
    GROUP BY mes
");
while ($row = $preventivasQuery->fetch()) {
    $mes = $row['mes'];
    if (isset($historico[$mes])) {
        $historico[$mes]['preventivas'] = (int)$row['total'];
    }
}

// Query Corretivas (OS abertas) por mês nos últimos 6 meses
$corretivasQuery = $db->query("
    SELECT DATE_FORMAT(data_abertura, '%Y-%m') as mes, COUNT(*) as total 
    FROM ordens_servico 
    WHERE data_abertura >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 5 MONTH)
    GROUP BY mes
");
while ($row = $corretivasQuery->fetch()) {
    $mes = $row['mes'];
    if (isset($historico[$mes])) {
        $historico[$mes]['corretivas'] = (int)$row['total'];
    }
}

// Vetores para renderização do Chart.js
$labelsMeses = [];
$dataPreventivas = [];
$dataCorretivas = [];
foreach ($historico as $dados) {
    $labelsMeses[] = $dados['nome'];
    $dataPreventivas[] = $dados['preventivas'];
    $dataCorretivas[] = $dados['corretivas'];
}


// =========================================================================
// 3. PROPORÇÃO DO TIPO DE EXECUÇÃO ("Feito na Escola" vs "Terceirizada")
// =========================================================================
$execQuery = $db->query("
    SELECT tipo_execucao, COUNT(*) as total 
    FROM ordens_servico 
    GROUP BY tipo_execucao
");
$totalInterna = 0;
$totalTerceirizada = 0;
while ($row = $execQuery->fetch()) {
    if ($row['tipo_execucao'] === 'Interna') {
        $totalInterna = (int)$row['total'];
    } elseif ($row['tipo_execucao'] === 'Terceirizada') {
        $totalTerceirizada = (int)$row['total'];
    }
}


// =========================================================================
// 4. RANKING DE AMBIENTES CRÍTICOS (Maior volume de OS Corretivas)
// =========================================================================
$rankingQuery = $db->query("
    SELECT a.nome_bloco_sala, COUNT(os.id) as total_corretivas
    FROM ambientes a
    INNER JOIN ordens_servico os ON a.id = os.ambiente_id
    GROUP BY a.id, a.nome_bloco_sala
    ORDER BY total_corretivas DESC
    LIMIT 5
");
$rankingAmbientes = [];
$maxOS = 1; // Para cálculo de proporção visual das progress bars
while ($row = $rankingQuery->fetch()) {
    $total = (int)$row['total_corretivas'];
    $rankingAmbientes[] = [
        'nome' => $row['nome_bloco_sala'],
        'total' => $total
    ];
    if ($total > $maxOS) {
        $maxOS = $total;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inteligência de Dados - SENAI MANUTENÇÃO</title>

    <script>
        // Carrega o tema do localStorage imediatamente para evitar flash de tela clara/escura
        const temaSalvo = localStorage.getItem('tema') || 'claro';
        document.documentElement.setAttribute('data-tema', temaSalvo);
    </script>

    <!-- Estilização Base, Sidebar, Header, Modais, Global e Bootstrap Icons -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="../assets/css/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="../assets/img/favicon.ico" type="image/x-icon">

    <!-- Biblioteca Chart.js carregada via CDN institucional -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        /* Estilos adicionais premium específicos para a visualização dos gráficos */
        .analytics-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 25px;
            margin-bottom: 25px;
            width: 100%;
        }

        .analytics-card {
            background: var(--corFundo);
            border: 1px solid var(--corBorda);
            border-radius: 16px;
            padding: 25px;
            box-shadow: var(--sombra);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .analytics-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.04);
        }

        .analytics-card-title {
            font-family: 'TASA Orbiter', sans-serif;
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--corTxt3);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .chart-container {
            position: relative;
            width: 100%;
            height: 320px;
        }

        .donut-container {
            height: 250px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Estilização da lista de ambientes críticos (barra de progresso premium) */
        .ranking-list {
            display: flex;
            flex-direction: column;
            gap: 18px;
            width: 100%;
        }

        .ranking-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .ranking-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            font-weight: 700;
            color: var(--corTxt3);
        }

        .ranking-name {
            color: var(--corTxt3);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ranking-badge {
            background: rgba(252, 35, 35, 0.1);
            color: var(--corBase);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 800;
        }

        .progress-bar-bg {
            background: var(--corFundo2);
            border: 1px solid var(--corBorda);
            height: 10px;
            border-radius: 5px;
            width: 100%;
            overflow: hidden;
            position: relative;
        }

        .progress-bar-fill {
            background: linear-gradient(90deg, var(--corBase) 0%, var(--corDestaque) 100%);
            height: 100%;
            border-radius: 5px;
            width: 0; /* Animado via JS */
            transition: width 1.2s cubic-bezier(0.1, 0.8, 0.3, 1);
        }

        @media (max-width: 1100px) {
            .analytics-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>

    <!-- SIDEBAR / PAINEL DE NAVEGAÇÃO -->
    <nav class="sidebar">
        <div class="botao-fechar">
            <button id="fechar-nav">
                <i class="bi bi-arrow-left-circle-fill"></i>
            </button>
        </div>

        <div class="div-img">
            <img src="../assets/img/senailogo2.png" alt="Logo Senai" id="senai-logo2" style="width: 80%;">
        </div>

        <div class="div-links">
            <a href="./dashboard.php" class="links">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>

            <!-- Submenu de Manutenção consolidado para Gestor/Executor -->
            <div class="menu-manutencao">
                <a href="javascript:void(0)" class="links manutencao-btn" id="btn-manutencao">
                    <div>
                        <i class="bi bi-tools"></i>
                        <span>Manutenção</span>
                    </div>
                    <i class="bi bi-caret-down-fill seta"></i>
                </a>
                <div class="submenu" id="submenu-manutencao">
                    <a href="./preventivas.php" class="links-sub">
                        <i class="bi bi-clock-fill"></i> Preventiva (Checklist)
                    </a>
                    <a href="./corretivas.php" class="links-sub">
                        <i class="bi bi-wrench"></i> Corretiva (O.S)
                    </a>
                </div>
            </div>

            <!-- Painéis administrativos exclusivos para o Gestor -->
            <a href="./ambientes.php" class="links">
                <i class="bi bi-building"></i> Painel de Ambientes
            </a>

            <!-- Link Análise de Dados (Ativo) -->
            <a href="./dashboard_analise.php" class="ativo links">
                <i class="bi bi-bar-chart-line-fill"></i> Análise de Dados
            </a>

            <a href="./usuarios.php" class="links">
                <i class="bi bi-file-earmark-person-fill"></i> Painel de Usuários
            </a>

            <a href="./log.php" class="links">
                <i class="bi bi-person-vcard"></i> Painel de Logs
            </a>
        </div>

        <div class="div-configs">
            <div>
                <button onclick="changeTheme()" id="tema"><i class="bi bi-brightness-high-fill"></i></button>
                
                <a href="./perfil.php" class="configs dont-rotate" title="Perfil">
                    <i class="bi bi-person-fill"></i>
                </a>
            </div>

            <a href="?logout=1" class="btn sair" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>Sair</span> <i class="bi bi-door-closed-fill"></i>
            </a>
        </div>
    </nav>

    <!-- CONTEÚDO PRINCIPAL -->
    <section class="sec-main">
        
        <!-- CABEÇALHO (HEADER) -->
        <div class="div-header">
            <div class="div-img-header">
                <div class="avatar">
                    <i class="bi bi-person-badge-fill"></i>
                </div>
                <h4 style="color: var(--corTxt3)">Olá, <span style="color: var(--corDestaque);"><?php echo htmlspecialchars($usuarioNome); ?></span> <small style="font-size: 12px; color: var(--corTxt2);"> (<?php echo htmlspecialchars($usuarioNivel); ?>)</small></h4>
            </div>
            <div class="div-txt-header">
                <p>
                    <i class="bi bi-calendar3"></i> <?php echo $dataAtual; ?>
                </p>
            </div>
        </div>

        <!-- CONTEÚDO DO DASHBOARD DE INTELIGÊNCIA -->
        <div class="dashboard-container" style="margin-top: 30px; width: 100%;">
            <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3);">Painel de Inteligência de Dados</h2>
                    <p style="color: var(--corTxt2); margin-top: 5px;">Métricas consolidadas e relatórios gráficos para controle de manutenção e identificação de anomalias.</p>
                </div>
                <!-- Botão de impressão executivo rápido -->
                <button onclick="window.print()" class="btn-page-action" style="background: var(--corFundo2); color: var(--corTxt3); border: 1px solid var(--corBorda); border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; font-weight: bold;">
                    <i class="bi bi-printer-fill"></i> Imprimir Relatório
                </button>
            </div>

            <!-- CARDS DE RESUMO SUPERIOR -->
            <div class="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <!-- Card 1: OS Abertas -->
                <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s;">
                    <div>
                        <span style="color: var(--corTxt2); font-size: 14px; font-weight: 500; display: block; margin-bottom: 5px;">Carga de OS Ativas</span>
                        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--corTxt3);"><?php echo $totalAbertas; ?></h1>
                    </div>
                    <div style="background: rgba(0, 123, 255, 0.1); color: #007bff; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        <i class="bi bi-wrench"></i>
                    </div>
                </div>

                <!-- Card 2: OS Pendentes de Despacho -->
                <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s;">
                    <div>
                        <span style="color: var(--corTxt2); font-size: 14px; font-weight: 500; display: block; margin-bottom: 5px;">OS Pendentes de Despacho</span>
                        <h1 style="font-size: 2.2rem; font-weight: 800; color: #ffc107;"><?php echo $totalPendentes; ?></h1>
                    </div>
                    <div style="background: rgba(255, 193, 7, 0.1); color: #ffc107; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        <i class="bi bi-hourglass-split"></i>
                    </div>
                </div>

                <!-- Card 3: Preventivas Realizadas -->
                <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s;">
                    <div>
                        <span style="color: var(--corTxt2); font-size: 14px; font-weight: 500; display: block; margin-bottom: 5px;">Preventivas no Mês</span>
                        <h1 style="font-size: 2.2rem; font-weight: 800; color: #28a745;"><?php echo $totalPreventivasMes; ?></h1>
                    </div>
                    <div style="background: rgba(40, 167, 69, 0.1); color: #28a745; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        <i class="bi bi-clock-fill"></i>
                    </div>
                </div>
            </div>

            <!-- GRID CENTRAL DE RELATÓRIOS GRÁFICOS (Chart.js Line & Doughnut) -->
            <div class="analytics-grid">
                
                <!-- Histórico de Manutenções (Linhas) -->
                <div class="analytics-card">
                    <div class="analytics-card-title">
                        <i class="bi bi-graph-up" style="color: var(--corBase);"></i>
                        <span>Histórico Mensal de Manutenções (Últimos 6 Meses)</span>
                    </div>
                    <div class="chart-container">
                        <canvas id="chartHistorico"></canvas>
                    </div>
                </div>

                <!-- Proporção do Tipo de Execução (Donut) -->
                <div class="analytics-card">
                    <div class="analytics-card-title">
                        <i class="bi bi-pie-chart-fill" style="color: #007bff;"></i>
                        <span>Proporção de Execução (OS)</span>
                    </div>
                    <div class="donut-container">
                        <canvas id="chartProporcao"></canvas>
                    </div>
                </div>
            </div>

            <!-- ROW DE RANKING DE AMBIENTES CRÍTICOS -->
            <div class="analytics-card" style="width: 100%; margin-bottom: 30px; display: block;">
                <div class="analytics-card-title">
                    <i class="bi bi-exclamation-triangle-fill" style="color: var(--corBase);"></i>
                    <span>Ranking de Ambientes Críticos (Salas / Blocos com maior volume de OS Corretivas)</span>
                </div>
                
                <!-- Componente de Grid Dupla: HTML Progress Bars vs Chart.js Horizontal Bars -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 15px;" class="quebraMobile">
                    
                    <!-- Lado Esquerdo: Lista com Barras de Progresso Themed -->
                    <div class="ranking-list">
                        <?php if (empty($rankingAmbientes)): ?>
                            <p style="color: var(--corTxt2); font-style: italic;">Nenhuma ocorrência de corretiva registrada para ambientes ativos.</p>
                        <?php else: ?>
                            <?php foreach ($rankingAmbientes as $idx => $item): 
                                $percentual = ($item['total'] / $maxOS) * 100;
                            ?>
                                <div class="ranking-item">
                                    <div class="ranking-info">
                                        <div class="ranking-name">
                                            <span style="color: var(--corBase); font-weight: 800;">#<?php echo $idx + 1; ?></span>
                                            <span><?php echo htmlspecialchars($item['nome']); ?></span>
                                        </div>
                                        <span class="ranking-badge"><?php echo $item['total']; ?> O.S.</span>
                                    </div>
                                    <div class="progress-bar-bg">
                                        <div class="progress-bar-fill" style="width: <?php echo $percentual; ?>%;"></div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>

                    <!-- Lado Direito: Gráfico de Barras Horizontais do Chart.js -->
                    <div style="position: relative; height: 260px;">
                        <canvas id="chartRanking"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- JS Globais -->
    <script src="../assets/js/scripts.js" defer></script>

    <!-- JS de Inicialização e Controle dos Gráficos via Chart.js CDN -->
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            // =========================================================================
            // DADOS INJETADOS DINAMICAMENTE DO PHP PARA O CHART.JS
            // =========================================================================
            const labelsMeses = <?php echo json_encode($labelsMeses); ?>;
            const dataPreventivas = <?php echo json_encode($dataPreventivas); ?>;
            const dataCorretivas = <?php echo json_encode($dataCorretivas); ?>;
            
            const totalInterna = <?php echo $totalInterna; ?>;
            const totalTerceirizada = <?php echo $totalTerceirizada; ?>;

            const rankingNomes = <?php echo json_encode(array_column($rankingAmbientes, 'nome')); ?>;
            const rankingTotais = <?php echo json_encode(array_column($rankingAmbientes, 'total')); ?>;

            // Instâncias globais das configurações gráficas
            let chartHistInstance = null;
            let chartPropInstance = null;
            let chartRankInstance = null;

            /**
             * Recupera as cores de estilo ativas do elemento raiz do documento
             * para aplicar dinamicamente nos eixos e legendas dos gráficos.
             */
            function getThemeColors() {
                const style = getComputedStyle(document.documentElement);
                return {
                    text: style.getPropertyValue('--corTxt3').trim() || '#172033',
                    textSecondary: style.getPropertyValue('--corTxt2').trim() || '#6c757d',
                    border: style.getPropertyValue('--corBordas').trim() || '#d3dce7',
                    backgroundCard: style.getPropertyValue('--corFundo').trim() || '#ffffff'
                };
            }

            /**
             * Inicializa ou reconstrói todos os gráficos respeitando o tema atual (Claro/Escuro).
             */
            function initCharts() {
                const colors = getThemeColors();

                // Destrói gráficos se já existirem (para evitar vazamentos ao trocar tema)
                if (chartHistInstance) chartHistInstance.destroy();
                if (chartPropInstance) chartPropInstance.destroy();
                if (chartRankInstance) chartRankInstance.destroy();

                // -------------------------------------------------------------
                // 1. Gráfico de Histórico Mensal (Linhas Premium)
                // -------------------------------------------------------------
                const ctxHist = document.getElementById('chartHistorico').getContext('2d');
                chartHistInstance = new Chart(ctxHist, {
                    type: 'line',
                    data: {
                        labels: labelsMeses,
                        datasets: [
                            {
                                label: 'Preventivas Realizadas',
                                data: dataPreventivas,
                                borderColor: '#28a745',
                                backgroundColor: 'rgba(40, 167, 69, 0.08)',
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 5,
                                pointBackgroundColor: '#28a745'
                            },
                            {
                                label: 'Corretivas Abertas',
                                data: dataCorretivas,
                                borderColor: '#fc2323',
                                backgroundColor: 'rgba(252, 35, 35, 0.08)',
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 5,
                                pointBackgroundColor: '#fc2323'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    color: colors.text,
                                    font: { family: 'TASA Orbiter', weight: 'bold', size: 12 }
                                }
                            },
                            tooltip: {
                                titleFont: { family: 'TASA Orbiter' },
                                bodyFont: { family: 'TASA Orbiter' }
                            }
                        },
                        scales: {
                            x: {
                                grid: { color: colors.border },
                                ticks: { color: colors.text, font: { family: 'TASA Orbiter' } }
                            },
                            y: {
                                grid: { color: colors.border },
                                ticks: { 
                                    color: colors.text, 
                                    font: { family: 'TASA Orbiter' },
                                    stepSize: 1,
                                    precision: 0 
                                }
                            }
                        }
                    }
                });

                // -------------------------------------------------------------
                // 2. Gráfico de Proporção (Doughnut Premium)
                // -------------------------------------------------------------
                const ctxProp = document.getElementById('chartProporcao').getContext('2d');
                
                // Trata o caso de não haver nenhuma ordem corretiva cadastrada
                const semDados = (totalInterna === 0 && totalTerceirizada === 0);
                const dataValues = semDados ? [1] : [totalInterna, totalTerceirizada];
                const bgColors = semDados ? [colors.border] : ['#007bff', '#fc2323'];
                const labelsProp = semDados ? ['Sem ocorrências'] : ['Interna (Na Escola)', 'Terceirizada'];

                chartPropInstance = new Chart(ctxProp, {
                    type: 'doughnut',
                    data: {
                        labels: labelsProp,
                        datasets: [{
                            data: dataValues,
                            backgroundColor: bgColors,
                            borderWidth: 2,
                            borderColor: colors.backgroundCard
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: colors.text,
                                    font: { family: 'TASA Orbiter', weight: 'bold', size: 11 },
                                    padding: 15
                                }
                            },
                            tooltip: {
                                enabled: !semDados,
                                titleFont: { family: 'TASA Orbiter' },
                                bodyFont: { family: 'TASA Orbiter' }
                            }
                        }
                    }
                });

                // -------------------------------------------------------------
                // 3. Gráfico de Ranking Crítico (Barras Horizontais)
                // -------------------------------------------------------------
                const ctxRank = document.getElementById('chartRanking').getContext('2d');
                chartRankInstance = new Chart(ctxRank, {
                    type: 'bar',
                    data: {
                        labels: rankingNomes.length > 0 ? rankingNomes : ['Sem Dados'],
                        datasets: [{
                            label: 'Ordens Corretivas',
                            data: rankingTotais.length > 0 ? rankingTotais : [0],
                            backgroundColor: 'rgba(252, 35, 35, 0.85)',
                            hoverBackgroundColor: '#fc2323',
                            borderRadius: 6,
                            borderWidth: 0,
                            barThickness: 16
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                titleFont: { family: 'TASA Orbiter' },
                                bodyFont: { family: 'TASA Orbiter' }
                            }
                        },
                        scales: {
                            x: {
                                grid: { color: colors.border },
                                ticks: { 
                                    color: colors.text, 
                                    font: { family: 'TASA Orbiter' },
                                    stepSize: 1,
                                    precision: 0 
                                }
                            },
                            y: {
                                grid: { display: false },
                                ticks: { color: colors.text, font: { family: 'TASA Orbiter', size: 11 } }
                            }
                        }
                    }
                });
            }

            // Inicialização imediata dos gráficos
            initCharts();

            // =========================================================================
            // MUTATION OBSERVER PARA ADAPTAÇÃO DINÂMICA CLARO / ESCURO
            // =========================================================================
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'data-tema') {
                        // Recarrega todos os estilos gráficos com o novo tema de forma fluida
                        setTimeout(initCharts, 80);
                    }
                });
            });

            // Registra observer no elemento root para monitorar o atributo data-tema
            observer.observe(document.documentElement, { attributes: true });
        });
    </script>
</body>
</html>
