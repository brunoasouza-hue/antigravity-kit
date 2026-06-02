const fs = require('fs');
const file = 'start_test_server.js';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const newLines = `    if (filePath.endsWith('dashboard.php') || filePath.endsWith('dashboard_analise.php')) {
        // 1. dadosStatus
        const statusCount = {};
        ordensServico.forEach(os => {
            statusCount[os.status] = (statusCount[os.status] || 0) + 1;
        });
        const dadosStatusObj = { labels: Object.keys(statusCount), data: Object.values(statusCount) };
        const dadosStatus = JSON.stringify(dadosStatusObj);

        // 2. dadosTendencia
        const tendCount = {};
        ordensServico.forEach(os => {
            if (!os.data_abertura) return;
            const mes = os.data_abertura.substring(0, 7);
            if (!tendCount[mes]) tendCount[mes] = { corretivas: 0, preventivas: 0 };
            if (os.tipo === 'Preventivo') tendCount[mes].preventivas++;
            else tendCount[mes].corretivas++;
        });
        const tendKeys = Object.keys(tendCount).sort().slice(-12);
        const dadosTendenciaObj = { 
            labels: tendKeys, 
            corretivas: tendKeys.map(k => tendCount[k].corretivas),
            preventivas: tendKeys.map(k => tendCount[k].preventivas)
        };
        const dadosTendencia = JSON.stringify(dadosTendenciaObj);

        // 3. dadosRanking
        const rankCount = {};
        ordensServico.forEach(os => {
            if (os.ambiente_id) rankCount[os.ambiente_id] = (rankCount[os.ambiente_id] || 0) + 1;
        });
        const rankArray = Object.entries(rankCount).map(([id, total]) => {
            const amb = ambientes.find(a => a.id == id);
            return { nome: amb ? amb.nome_ambiente : 'Desconhecido', total };
        }).sort((a, b) => b.total - a.total).slice(0, 10);
        
        const dadosRankingObj = {
            labels: rankArray.map(r => r.nome),
            data: rankArray.map(r => r.total)
        };
        const dadosRanking = JSON.stringify(dadosRankingObj);

        // 4. dadosFluxo
        const curMes = new Date().toISOString().substring(0, 7);
        let abertasMes = 0;
        let concluidasMes = 0;
        ordensServico.forEach(os => {
            if (os.data_abertura && os.data_abertura.startsWith(curMes)) {
                abertasMes++;
                if (os.status === 'Concluída' || os.status === 'FINALIZADO') {
                    concluidasMes++;
                }
            }
        });
        const dadosFluxoObj = { labels: ['Abertas no Mês', 'Concluídas no Mês'], abertas: abertasMes, concluidas: concluidasMes };
        const dadosFluxo = JSON.stringify(dadosFluxoObj);

        // 5. dadosCarga
        const cargaCount = {};
        ordensServico.forEach(os => {
            if (os.status !== 'Concluída' && os.status !== 'FINALIZADO' && os.executor_atual_id) {
                cargaCount[os.executor_atual_id] = (cargaCount[os.executor_atual_id] || 0) + 1;
            }
        });
        const cargaArray = Object.entries(cargaCount).map(([id, total]) => {
            const us = (db.usuarios || []).find(u => u.id == id);
            return { nome: us ? us.nome : 'Desconhecido', total };
        }).sort((a, b) => b.total - a.total).slice(0, 10);
        
        const dadosCargaObj = {
            labels: cargaArray.map(c => c.nome),
            data: cargaArray.map(c => c.total)
        };
        const dadosCarga = JSON.stringify(dadosCargaObj);

        context.dadosStatus = dadosStatus;
        context.dadosTendencia = dadosTendencia;
        context.dadosRanking = dadosRanking;
        context.dadosFluxo = dadosFluxo;
        context.dadosCarga = dadosCarga;
    }`.split('\n');

const startIdx = 1171; // line 1172 (0-indexed)
const endIdx = 1234;   // line 1235 is `    }`

lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
fs.writeFileSync(file, lines.join('\n'));
console.log("Mock server context fixed with splice!");
