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
        const getOpts = {
            hostname: 'localhost',
            port: 8000,
            path: '/public/views/preventivas.php',
            method: 'GET',
            headers: {
                'Cookie': sessionCookie
            }
        };
        http.request(getOpts, (res2) => {
            let data2 = '';
            res2.on('data', d => data2 += d);
            res2.on('end', () => {
                console.log("Status:", res2.statusCode);
                console.log("Length:", data2.length);
                const tbodyStart = data2.indexOf('<tbody id="tabela-historico">');
                if (tbodyStart !== -1) {
                    console.log(data2.substring(tbodyStart, data2.indexOf('</tbody>', tbodyStart) + 8));
                } else {
                    console.log("tabela-historico not found!");
                }
            });
        }).end();
    } else {
        console.log("No session cookie!");
    }
  });
});
req.write(JSON.stringify({email: 'gestor@senai.br', senha: 'senai123'}));
req.end();
