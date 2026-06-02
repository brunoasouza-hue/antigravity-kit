const fs = require('fs');
const path = 'public/views/corretivas.php';
let html = fs.readFileSync(path, 'utf8');

// The current code in corretivas.php has:
// <?php endif; ?>
//                 <?php if (!empty($ordensServico)): ?>
//                     <?php foreach ($ordensServico as $os): ?>
// AND at the end:
//                 <?php endforeach; ?>
//             <?php endif; ?>
//         </tbody>

html = html.replace(/<\?php endif; \?>\s*<\?php if \(!empty\(\$ordensServico\)\): \?>/g, "");

html = html.replace(
    /<\?php if \(empty\(\$ordensServico\)\): \?>\s*<tr id="linha-vazia">\s*<td colspan="7" style="padding: 30px; text-align: center; color: var\(--corTxt2\);">Nenhuma ordem de serviço encontrada.<\/td>\s*<\/tr>/g,
    ""
);

// We need to clean up the extra <?php endif; ?> at the end of the foreach.
html = html.replace(/<\?php endforeach; \?>\s*<\?php endif; \?>/g, "<?php endforeach; ?>");

fs.writeFileSync(path, html);
console.log('Fixed corretivas.php by removing PHP if(!empty) conditions that break mock server.');
