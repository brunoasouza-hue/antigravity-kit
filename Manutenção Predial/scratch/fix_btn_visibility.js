const fs = require('fs');
let server = fs.readFileSync('start_test_server.js', 'utf8');

const targetStr = `style="background: var(--corPrimaria); color: #fff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 5px;"`;
const replacementStr = `style="background: #0d6efd; color: #ffffff; font-weight: bold; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(13,110,253,0.3);"`;

if(server.includes(targetStr)) {
    server = server.replace(targetStr, replacementStr);
    fs.writeFileSync('start_test_server.js', server);
    console.log('Fixed Editar button visibility in start_test_server.js!');
} else {
    console.log('Could not find targetStr!');
}
