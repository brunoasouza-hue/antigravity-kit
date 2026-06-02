const http = require('http');

const postData = new URLSearchParams({ email: 'bruno.souza@escola.com', senha: 'senai123' }).toString();
const req = http.request({
    hostname: 'localhost',
    port: 8000,
    path: '/public/views/login.php',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': postData.length }
}, res => {
    const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
    http.get({
        hostname: 'localhost', port: 8000, path: '/public/views/corretivas.php', headers: { 'Cookie': cookie }
    }, res2 => {
        let d=''; res2.on('data', c=>d+=c);
        res2.on('end', () => {
            console.log("currentUserRole/Id:");
            console.log(d.split('\\n').filter(l => l.includes('currentUserRole') || l.includes('currentUserId')).join('\\n'));
            console.log("TR OS 74:");
            console.log(d.split('\\n').filter(l => l.includes('74')).join('\\n'));
        });
    });
});
req.write(postData);
req.end();
