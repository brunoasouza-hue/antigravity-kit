<?php
declare(strict_types=1);

/**
 * SENAI Manutenção Predial - Dashboard Gerencial Unificado
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/Controllers/AuthController.php';
require_once __DIR__ . '/../../src/Models/Ambiente.php';
require_once __DIR__ . '/../../src/Models/Checklist.php';

AuthController::verificarAutenticacao();

$usuarioNome  = $_SESSION['usuario_nome']  ?? 'Usuário';
$usuarioNivel = $_SESSION['usuario_nivel'] ?? 'Solicitante';

if (isset($_GET['logout'])) {
    $auth = new AuthController();
    $auth->logout();
    header("Location: " . BASE_URL . "/public/index.php");
    exit;
}

$dataAtual = date('d/m/Y');

// ── Conexão PDO ────────────────────────────────────────────────────────────────
$pdo = Database::getConnection();

// ── KPIs rápidos (Dinâmicos) ───────────────────────────────────────────────────
// 1. Ambientes com Falhas
$stmtAmb = $pdo->query("SELECT COUNT(DISTINCT ambiente_id) as total FROM ordens_servico WHERE status NOT IN ('Concluída', 'FINALIZADO', 'Recusada') AND ambiente_id IS NOT NULL");
$ambientes_afetados = (int) $stmtAmb->fetch(PDO::FETCH_ASSOC)['total'];

// 2. O.S. Concluídas no Mês
$stmtConc = $pdo->query("SELECT COUNT(id) as total FROM ordens_servico WHERE status IN ('Concluída', 'FINALIZADO') AND MONTH(data_abertura) = MONTH(CURRENT_DATE()) AND YEAR(data_abertura) = YEAR(CURRENT_DATE())");
$os_concluidas_mes = (int) $stmtConc->fetch(PDO::FETCH_ASSOC)['total'];

// 3. Preventivas no Mês
$stmtPrev = $pdo->query("SELECT COUNT(id) as total FROM checklists WHERE MONTH(data_inspecao) = MONTH(CURRENT_DATE()) AND YEAR(data_inspecao) = YEAR(CURRENT_DATE())");
$preventivas_mes = (int) $stmtPrev->fetch(PDO::FETCH_ASSOC)['total'];

// 4. O.S. Pendentes
$stmtPend = $pdo->query("SELECT COUNT(id) as total FROM ordens_servico WHERE status NOT IN ('Concluída', 'FINALIZADO', 'Recusada')");
$os_pendentes = (int) $stmtPend->fetch(PDO::FETCH_ASSOC)['total'];

// ── Query 1: Status das O.S. (Rosca) ─────────────────────────────────────────
$stmtStatus = $pdo->query("
    SELECT status, COUNT(*) AS total
    FROM ordens_servico
    GROUP BY status
    ORDER BY total DESC
");
$statusRows      = $stmtStatus->fetchAll(PDO::FETCH_ASSOC);
$dadosStatus     = ['labels' => [], 'data' => []];
foreach ($statusRows as $r) {
    $dadosStatus['labels'][] = $r['status'];
    $dadosStatus['data'][]   = (int)$r['total'];
}

// ── Query 2: Tendência mensal Corretiva vs Preventiva (Linha) ─────────────────
$stmtTendencia = $pdo->query("
    SELECT
        DATE_FORMAT(data_abertura, '%Y-%m') AS mes,
        SUM(CASE WHEN tipo = 'Corretivo' OR tipo IS NULL OR tipo = '' THEN 1 ELSE 0 END) AS corretivas,
        SUM(CASE WHEN tipo = 'Preventivo' THEN 1 ELSE 0 END) AS preventivas
    FROM ordens_servico
    WHERE data_abertura IS NOT NULL
    GROUP BY mes
    ORDER BY mes ASC
    LIMIT 12
");
$tendRows        = $stmtTendencia->fetchAll(PDO::FETCH_ASSOC);
$dadosTendencia  = ['labels' => [], 'corretivas' => [], 'preventivas' => []];
foreach ($tendRows as $r) {
    $dadosTendencia['labels'][]      = $r['mes'];
    $dadosTendencia['corretivas'][]  = (int)$r['corretivas'];
    $dadosTendencia['preventivas'][] = (int)$r['preventivas'];
}

// ── Query 3: Ranking crítico de ambientes (Barras Horizontais) ────────────────
$stmtRanking = $pdo->query("
    SELECT a.nome_ambiente, COUNT(os.id) AS total
    FROM ordens_servico os
    LEFT JOIN ambientes a ON os.ambiente_id = a.id
    GROUP BY os.ambiente_id, a.nome_ambiente
    ORDER BY total DESC
    LIMIT 10
");
$rankingRows    = $stmtRanking->fetchAll(PDO::FETCH_ASSOC);
$dadosRanking   = ['labels' => [], 'data' => []];
foreach ($rankingRows as $r) {
    $dadosRanking['labels'][] = $r['nome_ambiente'] ?? 'Desconhecido';
    $dadosRanking['data'][]   = (int)$r['total'];
}

// ── Query 4: Gargalo/Fluxo – Abertas vs Concluídas no mês atual (Barras duplas)
$mesAtual  = date('Y-m');
$stmtFluxo = $pdo->prepare("
    SELECT
        SUM(CASE WHEN DATE_FORMAT(data_abertura, '%Y-%m') = :mes THEN 1 ELSE 0 END) AS abertas,
        SUM(CASE WHEN (status = 'Concluída' OR status = 'FINALIZADO') AND DATE_FORMAT(data_abertura, '%Y-%m') = :mes THEN 1 ELSE 0 END) AS concluidas
    FROM ordens_servico
");
$stmtFluxo->execute([':mes' => $mesAtual]);
$fluxoRow    = $stmtFluxo->fetch(PDO::FETCH_ASSOC);
$dadosFluxo  = [
    'labels'    => ['Abertas no Mês', 'Concluídas no Mês'],
    'abertas'   => (int)($fluxoRow['abertas']   ?? 0),
    'concluidas'=> (int)($fluxoRow['concluidas'] ?? 0),
];

// ── Query 5: Carga de trabalho por executor (Barras verticais) ────────────────
$stmtCarga = $pdo->query("
    SELECT u.nome, COUNT(os.id) AS total
    FROM ordens_servico os
    LEFT JOIN usuarios u ON os.executor_atual_id = u.id
    WHERE os.status NOT IN ('Concluída', 'FINALIZADO')
      AND os.executor_atual_id IS NOT NULL
    GROUP BY os.executor_atual_id, u.nome
    ORDER BY total DESC
    LIMIT 10
");
$cargaRows  = $stmtCarga->fetchAll(PDO::FETCH_ASSOC);
$dadosCarga = ['labels' => [], 'data' => []];
foreach ($cargaRows as $r) {
    $dadosCarga['labels'][] = $r['nome'] ?? 'Desconhecido';
    $dadosCarga['data'][]   = (int)$r['total'];
}
?>
<!DOCTYPE html>
<html lang="pt-br" data-tema="claro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Gerencial - SENAI MANUTENÇÃO</title>
    <meta name="description" content="Painel gerencial unificado com KPIs, gráficos de status, tendência, ranking e fluxo de ordens de serviço do SENAI.">

    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/nav.css">
    <link rel="stylesheet" href="../assets/css/header.css">
    <link rel="stylesheet" href="../assets/css/global.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="../assets/css/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="../assets/img/favicon.ico" type="image/x-icon">

    <!-- Chart.js via CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        /* ── Grid de Gráficos ── */
        .graficos-grid {
            display: grid;
            gap: 20px;
            margin-top: 30px;
        }
        .graficos-row-top {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .graficos-row-mid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }
        .graficos-row-bot {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        @media (max-width: 900px) {
            .graficos-row-top,
            .graficos-row-bot { grid-template-columns: 1fr; }
        }
        .chart-card {
            background: var(--corFundo);
            border: 1px solid var(--corBorda);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
            transition: transform 0.2s;
        }
        .chart-card:hover { transform: translateY(-2px); }
        .chart-card h3 {
            font-size: 14px;
            font-weight: 700;
            color: var(--corTxt2);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .chart-card p {
            font-size: 12px;
            color: var(--corTxt2);
            margin-bottom: 20px;
        }
        .chart-card canvas { max-height: 280px; }
        .chart-card.tall canvas { max-height: 320px; }
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
            <a href="./home.php" class="links">
                <i class="bi bi-house-door-fill"></i> Início
            </a>

            <a href="./dashboard.php" class="ativo links">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>

            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador' || $usuarioNivel === 'Executor'): ?>
                <div class="menu-manutencao">
                    <a href="javascript:void(0)" class="links manutencao-btn" id="btn-manutencao">
                        <div>
                            <i class="bi bi-tools"></i>
                            <span>Manutenção</span>
                        </div>
                        <i class="bi bi-caret-down-fill seta"></i>
                    </a>
                    <div class="submenu" id="submenu-manutencao">
                        <a href="./corretivas.php" class="links-sub">
                            <i class="bi bi-wrench"></i> Corretiva (O.S)
                        </a>
                        <a href="./preventivas.php" class="links-sub">
                            <i class="bi bi-clock-fill"></i> Preventiva (Checklist)
                        </a>
                    </div>
                </div>
            <?php else: ?>
                <a href="./corretivas.php" class="links">
                    <i class="bi bi-wrench"></i> Solicitar Corretiva (O.S)
                </a>
            <?php endif; ?>

            <div class="menu-inspecoes">
                <a href="javascript:void(0)" class="links inspecoes-btn" id="btn-inspecoes">
                    <div>
                        <i class="bi bi-shield-fill-check"></i>
                        <span>Inspeções</span>
                    </div>
                    <i class="bi bi-caret-down-fill seta"></i>
                </a>
                <div class="submenu" id="submenu-inspecoes">
                    <a href="./inspecoes_seguranca.php" class="links-sub">
                        <i class="bi bi-plus-circle-fill"></i> Nova Inspeção
                    </a>
                    <a href="./inspecoes_seguranca.php" class="links-sub">
                        <i class="bi bi-clock-history"></i> Histórico
                    </a>
                </div>
            </div>

            <?php if ($usuarioNivel === 'Gestor' || $usuarioNivel === 'Administrador'): ?>
                <a href="./ambientes.php" class="links">
                    <i class="bi bi-building"></i> Painel de Ambientes
                </a>

                <a href="./usuarios.php" class="links">
                    <i class="bi bi-file-earmark-person-fill"></i> Painel de Usuários
                </a>

                <a href="./log.php" class="links">
                    <i class="bi bi-person-vcard"></i> Painel de Logs
                </a>
            <?php endif; ?>
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

        <!-- TÍTULO DA SEÇÃO -->
        <div style="margin-top: 30px; margin-bottom: 5px;">
            <h2 style="font-family: 'TASA Orbiter', sans-serif; font-weight: bold; color: var(--corTxt3);">Painel de Controle Predial</h2>
            <p style="color: var(--corTxt2); margin-top: 5px;">Indicadores gerenciais unificados — O.S. Corretivas, Preventivas e Ambientes.</p>
        </div>

        <!-- CARDS KPI RÁPIDOS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; width: 100%;">

            <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 22px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <div>
                    <span style="color: var(--corTxt2); font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px;">Ambientes com Falhas</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: var(--corTxt3);"><?= $ambientes_afetados ?></h1>
                </div>
                <div style="background: rgba(198,40,40,0.1); color: #C62828; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
                    <i class="bi bi-building"></i>
                </div>
            </div>

            <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 22px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <div>
                    <span style="color: var(--corTxt2); font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px;">O.S. Concluídas (Mês)</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #28a745;"><?= $os_concluidas_mes ?></h1>
                </div>
                <div style="background: rgba(40,167,69,0.1); color: #28a745; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
                    <i class="bi bi-check-circle-fill"></i>
                </div>
            </div>

            <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 22px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <div>
                    <span style="color: var(--corTxt2); font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px;">Preventivas no Mês</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #007bff;"><?= $preventivas_mes ?></h1>
                </div>
                <div style="background: rgba(0,123,255,0.1); color: #007bff; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
                    <i class="bi bi-clock-fill"></i>
                </div>
            </div>

            <div class="card-metrica" style="background: var(--corFundo); border: 1px solid var(--corBorda); border-radius: 16px; padding: 22px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <div>
                    <span style="color: var(--corTxt2); font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px;">O.S. Pendentes</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #fbc02d;"><?= $os_pendentes ?></h1>
                </div>
                <div style="background: rgba(251,192,45,0.1); color: #fbc02d; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
                    <i class="bi bi-tools"></i>
                </div>
            </div>

        </div>

        <!-- GRID DE GRÁFICOS -->
        <div class="graficos-grid">

            <!-- LINHA SUPERIOR: Rosca de Status + Carga por Executor -->
            <div class="graficos-row-top">

                <!-- Gráfico 1: Rosca de Status -->
                <div class="chart-card">
                    <h3><i class="bi bi-pie-chart-fill" style="color: #C62828; margin-right: 6px;"></i>Distribuição por Status</h3>
                    <p>Proporção de O.S. em cada estágio do fluxo</p>
                    <canvas id="graficoStatus"></canvas>
                </div>

                <!-- Gráfico 5: Carga por Executor -->
                <div class="chart-card">
                    <h3><i class="bi bi-person-gear" style="color: #00b0ff; margin-right: 6px;"></i>Carga de Trabalho</h3>
                    <p>O.S. ativas atribuídas por executor (não concluídas)</p>
                    <canvas id="graficoCarga"></canvas>
                </div>

            </div>

            <!-- LINHA CENTRAL: Tendência Mensal (largo) -->
            <div class="graficos-row-mid">
                <div class="chart-card tall">
                    <h3><i class="bi bi-graph-up-arrow" style="color: #2e7d32; margin-right: 6px;"></i>Tendência Mensal — Corretiva vs. Preventiva</h3>
                    <p>Evolução do volume de ordens de serviço ao longo dos meses</p>
                    <canvas id="graficoTendencia"></canvas>
                </div>
            </div>

            <!-- LINHA INFERIOR: Ranking Crítico + Fluxo Mensal -->
            <div class="graficos-row-bot">

                <!-- Gráfico 3: Ranking de Ambientes -->
                <div class="chart-card">
                    <h3><i class="bi bi-bar-chart-steps" style="color: #C62828; margin-right: 6px;"></i>Ranking de Ambientes Críticos</h3>
                    <p>Os 10 ambientes com maior número de O.S.</p>
                    <canvas id="graficoRanking"></canvas>
                </div>

                <!-- Gráfico 4: Fluxo Entradas vs Saídas -->
                <div class="chart-card">
                    <h3><i class="bi bi-arrow-left-right" style="color: #fbc02d; margin-right: 6px;"></i>Fluxo do Mês Atual</h3>
                    <p>O.S. abertas versus concluídas no mês corrente</p>
                    <canvas id="graficoFluxo"></canvas>
                </div>

            </div>
        </div>

    </section>

    <!-- JS Globais -->
    <script src="../assets/js/scripts.js" defer></script>

    <script>
        // ── Paleta de cores SENAI ──────────────────────────────────────────────
        const COR = {
            vermelho:  '#C62828',
            vermelhoT: 'rgba(198,40,40,0.15)',
            verde:     '#2e7d32',
            verdeT:    'rgba(46,125,50,0.15)',
            azul:      '#00b0ff',
            azulT:     'rgba(0,176,255,0.15)',
            amarelo:   '#fbc02d',
            amareloT:  'rgba(251,192,45,0.15)',
            cinza:     '#6c757d',
            cinzaT:    'rgba(108,117,125,0.15)',
            laranja:   '#e65100',
            laranjaT:  'rgba(230,81,0,0.15)',
        };

        // Dados vindos do PHP
        const dadosStatus    = <?php echo json_encode($dadosStatus, JSON_UNESCAPED_UNICODE); ?>;
        const dadosTendencia = <?php echo json_encode($dadosTendencia, JSON_UNESCAPED_UNICODE); ?>;
        const dadosRanking   = <?php echo json_encode($dadosRanking, JSON_UNESCAPED_UNICODE); ?>;
        const dadosFluxo     = <?php echo json_encode($dadosFluxo, JSON_UNESCAPED_UNICODE); ?>;
        const dadosCarga     = <?php echo json_encode($dadosCarga, JSON_UNESCAPED_UNICODE); ?>;

        // Opções globais de grid limpo
        const gridOpts = {
            color: 'rgba(128,128,128,0.12)',
        };
        const fontOpts = { size: 12, family: "'TASA Orbiter', sans-serif" };

        // ── Gráfico 1: Rosca de Status ─────────────────────────────────────────
        new Chart(document.getElementById('graficoStatus'), {
            type: 'doughnut',
            data: {
                labels: dadosStatus.labels,
                datasets: [{
                    data: dadosStatus.data,
                    backgroundColor: [
                        COR.amarelo, COR.azul, COR.verde,
                        COR.vermelho, COR.cinza, COR.laranja,
                        '#7b1fa2', '#00838f'
                    ],
                    borderWidth: 2,
                    borderColor: 'transparent',
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                cutout: '65%',
                plugins: {
                    legend: { position: 'bottom', labels: { font: fontOpts, boxWidth: 14, padding: 14 } },
                    tooltip: { callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.parsed} O.S.`
                    }}
                }
            }
        });

        // ── Gráfico 5: Barras – Carga por Executor ────────────────────────────
        new Chart(document.getElementById('graficoCarga'), {
            type: 'bar',
            data: {
                labels: dadosCarga.labels,
                datasets: [{
                    label: 'O.S. Ativas',
                    data: dadosCarga.data,
                    backgroundColor: COR.azulT,
                    borderColor: COR.azul,
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: gridOpts, ticks: { font: fontOpts, stepSize: 1 } },
                    x: { grid: { display: false }, ticks: { font: fontOpts, maxRotation: 30 } }
                }
            }
        });

        // ── Gráfico 2: Linha – Tendência Mensal ───────────────────────────────
        new Chart(document.getElementById('graficoTendencia'), {
            type: 'line',
            data: {
                labels: dadosTendencia.labels,
                datasets: [
                    {
                        label: 'Corretivas',
                        data: dadosTendencia.corretivas,
                        borderColor: COR.vermelho,
                        backgroundColor: COR.vermelhoT,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: COR.vermelho,
                    },
                    {
                        label: 'Preventivas',
                        data: dadosTendencia.preventivas,
                        borderColor: COR.verde,
                        backgroundColor: COR.verdeT,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: COR.verde,
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', labels: { font: fontOpts, boxWidth: 14 } }
                },
                scales: {
                    y: { beginAtZero: true, grid: gridOpts, ticks: { font: fontOpts, stepSize: 1 } },
                    x: { grid: { display: false }, ticks: { font: fontOpts } }
                }
            }
        });

        // ── Gráfico 3: Barras Horizontais – Ranking de Ambientes ──────────────
        new Chart(document.getElementById('graficoRanking'), {
            type: 'bar',
            data: {
                labels: dadosRanking.labels,
                datasets: [{
                    label: 'Total de O.S.',
                    data: dadosRanking.data,
                    backgroundColor: COR.vermelhoT,
                    borderColor: COR.vermelho,
                    borderWidth: 2,
                    borderRadius: 4,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: gridOpts, ticks: { font: fontOpts, stepSize: 1 } },
                    y: { grid: { display: false }, ticks: { font: { size: 11 } } }
                }
            }
        });

        // ── Gráfico 4: Barras Duplas – Fluxo do Mês ──────────────────────────
        new Chart(document.getElementById('graficoFluxo'), {
            type: 'bar',
            data: {
                labels: dadosFluxo.labels,
                datasets: [{
                    label: 'Quantidade',
                    data: [dadosFluxo.abertas, dadosFluxo.concluidas],
                    backgroundColor: [COR.amareloT, COR.verdeT],
                    borderColor: [COR.amarelo, COR.verde],
                    borderWidth: 2,
                    borderRadius: 8,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: gridOpts, ticks: { font: fontOpts, stepSize: 1 } },
                    x: { grid: { display: false }, ticks: { font: { size: 13, weight: 'bold' } } }
                }
            }
        });
    </script>
</body>
</html>
