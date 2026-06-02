const http = require('http');

http.get('http://localhost:8000/public/views/preventivas.php?action=exportar_excel&data_inicio=2026-05-01&data_fim=2026-05-31', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Status:", res.statusCode);
        console.log("Headers:", res.headers);
        console.log("Data:", data);
    });
});
