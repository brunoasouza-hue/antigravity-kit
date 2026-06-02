const fs = require('fs');

// Patch corretivas.php
let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

const fixLogic = `        document.addEventListener("DOMContentLoaded", function() {
            const currentUserId = '<?php echo $_SESSION["usuario_id"]; ?>';
            const currentUserRole = '<?php echo $_SESSION["usuario_nivel"]; ?>';
            const rows = document.querySelectorAll('.linha-tabela-os');`;

code = code.replace(
    /document\.addEventListener\("DOMContentLoaded", function\(\) \{\s*const currentUserId = '[^']+';\s*const currentUserRole = '[^']*';\s*const rows = document\.querySelectorAll\('\.linha-tabela-os'\);/,
    fixLogic
);

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');

// Patch start_test_server.js
let serverCode = fs.readFileSync('start_test_server.js', 'utf8');

const regexVars = `        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\['usuario_id'\\]\\s*;?\\s*\\?>/g, val: context.usuarioId },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\["usuario_id"\\]\\s*;?\\s*\\?>/g, val: context.usuarioId },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\['usuario_nivel'\\]\\s*;?\\s*\\?>/g, val: context.usuarioNivel },
        { regex: /<\\?php\\s+echo\\s+\\$_SESSION\\["usuario_nivel"\\]\\s*;?\\s*\\?>/g, val: context.usuarioNivel },`;

serverCode = serverCode.replace(
    /\{ regex: \/<\?php\\s\+echo\\s\+\$_SESSION\['usuario_id'\]\\s\*;\\?\\s\*\\\?>\/g, val: context\.usuarioId \},\s*\{ regex: \/<\?php\\s\+echo\\s\+\$_SESSION\["usuario_id"\]\\s\*;\\?\\s\*\\\?>\/g, val: context\.usuarioId \},/,
    regexVars
);

fs.writeFileSync('start_test_server.js', serverCode, 'utf8');

console.log('Fixed session level injection!');
