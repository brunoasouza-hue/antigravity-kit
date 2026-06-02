const fs = require('fs');
let server = fs.readFileSync('start_test_server.js', 'utf8');

server = server.replace(
    'return respondJson(false, "Opera\\xE7\\xE3o inv\\xE1lida ou rota incorreta.");',
    'console.log("FALLTHROUGH! pathname=", pathname, "acao=", postParams.acao); return respondJson(false, "Operação inválida ou rota incorreta.");'
);

if (!server.includes('function respondRedirect')) {
    server = server.replace(
        'function redirect(url) {',
        'function respondRedirect(url, params = {}) { const qs = require("querystring").stringify(params); res.writeHead(302, { Location: url + (qs ? "?" + qs : "") }); res.end(); }\n    function redirect(url) {'
    );
}

fs.writeFileSync('start_test_server.js', server);
console.log('Patched test server with respondRedirect and logging!');
