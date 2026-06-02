const fs = require('fs');

let code = fs.readFileSync('public/views/corretivas.php', 'utf8');

// Inject the variable definitions inside DOMContentLoaded
const fixLogic = `        document.addEventListener("DOMContentLoaded", function() {
            const currentUserId = '<?php echo $_SESSION["usuario_id"]; ?>';
            const currentUserRole = '<?php echo $usuarioNivel; ?>';
            const rows = document.querySelectorAll('.linha-tabela-os');`;

code = code.replace(
    /document\.addEventListener\("DOMContentLoaded", function\(\) {/,
    fixLogic
);

fs.writeFileSync('public/views/corretivas.php', code, 'utf8');
console.log('corretivas.php DOMContentLoaded logic patched!');
