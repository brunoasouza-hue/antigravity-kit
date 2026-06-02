const fs = require('fs');
const file = 'public/views/dashboard.php';
let data = fs.readFileSync(file, 'utf8');

const phpBlockOriginal = `// ── KPIs rápidos ──────────────────────────────────────────────────────────────
$totalAmbientes  = count(Ambiente::listarTodos());
$totalAtivos     = count(Ambiente::listarAtivos());
$totalInativos   = $totalAmbientes - $totalAtivos;
$totalChecklists = count(Checklist::listarTodos());

$dataAtual = date('d/m/Y');

// ── Conexão PDO ────────────────────────────────────────────────────────────────
$pdo = Database::getConnection();`;

const phpBlockNew = `$dataAtual = date('d/m/Y');

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
$os_pendentes = (int) $stmtPend->fetch(PDO::FETCH_ASSOC)['total'];`;

data = data.replace(phpBlockOriginal, phpBlockNew);

const card1Original = `Total de Ambientes</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: var(--corTxt3);"><?php echo $totalAmbientes; ?></h1>`;
const card1New = `Ambientes com Falhas</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: var(--corTxt3);"><?= $ambientes_afetados ?></h1>`;
data = data.replace(card1Original, card1New);

const card2Original = `Ambientes Ativos</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #28a745;"><?php echo $totalAtivos; ?></h1>`;
const card2New = `O.S. Concluídas (Mês)</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #28a745;"><?= $os_concluidas_mes ?></h1>`;
data = data.replace(card2Original, card2New);

const card3Original = `Checklists Registrados</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #007bff;"><?php echo $totalChecklists; ?></h1>`;
const card3New = `Preventivas no Mês</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #007bff;"><?= $preventivas_mes ?></h1>`;
data = data.replace(card3Original, card3New);

const card4Original = `O.S. Abertas</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #fbc02d;"><?php echo array_sum($dadosStatus['data']); ?></h1>`;
const card4New = `O.S. Pendentes</span>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #fbc02d;"><?= $os_pendentes ?></h1>`;
data = data.replace(card4Original, card4New);

fs.writeFileSync(file, data);
console.log('dashboard.php KPIs updated!');
