const http = require('http');

const reqOpts = {
  hostname: 'localhost',
  port: 8000,
  path: '/public/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(reqOpts, (res) => {
  res.on('data', () => {});
  res.on('end', () => {
    const sessionCookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : null;
    if (sessionCookie) {
        const bodyStr = new URLSearchParams({ acao: 'buscar_historico_detalhes', ajax: '1', inspecao_id: '1' }).toString();
        const postOpts = {
            hostname: 'localhost',
            port: 8000,
            path: '/public/views/preventivas.php',
            method: 'POST',
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Length': Buffer.byteLength(bodyStr)
            }
        };
        const req2 = http.request(postOpts, (res2) => {
            let data2 = '';
            res2.on('data', d => data2 += d);
            res2.on('end', () => {
                console.log("Status:", res2.statusCode);
                console.log("Data:", data2);
            });
        });
        req2.write(bodyStr);
        req2.end();
    } else {
        console.log("No session cookie!");
    }
  });
});
req.write(JSON.stringify({email: 'gestor@senai.br', senha: 'senai123'}));
req.end();
