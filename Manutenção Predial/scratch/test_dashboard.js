// Test dashboard rendering and chart data injection
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/public/views/dashboard.php',
    method: 'GET',
    headers: {
        'Cookie': 'PHPSESSID=mock_gestor; usuario_nivel=Gestor; usuario_nome=Admin'
    }
};

http.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);

        // Check for Chart.js
        console.log('Chart.js imported:', data.includes('chart.js') ? '✅' : '❌');

        // Check for canvas elements
        const canvases = ['graficoStatus', 'graficoCarga', 'graficoTendencia', 'graficoRanking', 'graficoFluxo'];
        canvases.forEach(id => {
            console.log(`Canvas #${id}:`, data.includes(`id="${id}"`) ? '✅' : '❌');
        });

        // Check for JSON data
        const dataVars = ['dadosStatus', 'dadosTendencia', 'dadosRanking', 'dadosFluxo', 'dadosCarga'];
        dataVars.forEach(v => {
            const present = data.includes(`const ${v} =`);
            const notNull = !data.includes(`const ${v} = null`);
            console.log(`var ${v}:`, present ? (notNull ? '✅ (has data)' : '⚠️ null') : '❌ missing');
        });

        // Extract a snippet of dadosStatus
        const statusMatch = data.match(/const dadosStatus = (.+?);/);
        if (statusMatch) {
            console.log('\ndadosStatus value:', statusMatch[1].substring(0, 200));
        }
    });
}).on('error', err => console.error('HTTP Error:', err.message));
