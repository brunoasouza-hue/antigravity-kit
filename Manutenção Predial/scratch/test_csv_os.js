const http = require('http');

http.get('http://localhost:8000/public/views/corretivas.php?action=exportar_os_excel&data_inicio=2020-01-01&data_fim=2099-12-31', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Status:", res.statusCode);
        console.log("Headers:", res.headers['content-disposition']);
        console.log("CSV Output:\n", data.slice(0, 500));
    });
}).on('error', err => console.error('Error:', err.message));
